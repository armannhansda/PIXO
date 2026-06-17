import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { generateToken } from "@/lib/auth-utils";
import { generateUsername } from "@/server/trpc/routers/auth";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=MissingCode", req.url));
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Missing GitHub OAuth credentials in environment." }, { status: 500 });
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      return NextResponse.redirect(new URL("/login?error=GitHubTokenError", req.url));
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch user profile from GitHub
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const githubUser = await userRes.json();

    // 3. Fetch user emails from GitHub (since email might be private in profile)
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const emails = await emailsRes.json();
    const primaryEmailObj = emails.find((e: any) => e.primary) || emails[0];
    const email = primaryEmailObj?.email;

    if (!email) {
      return NextResponse.redirect(new URL("/login?error=NoEmailFromGitHub", req.url));
    }

    const database = db();

    // 4. Find or Create User
    const existingUser = await database.query.users.findFirst({
      where: eq(users.email, email),
    });

    let foundUser = existingUser;

    if (!existingUser) {
      const gName = githubUser.name || githubUser.login || email.split("@")[0];
      const newUser = await database
        .insert(users)
        .values({
          name: gName,
          username: await generateUsername(database, gName, email),
          email,
          profileImage: githubUser.avatar_url || null,
          role: "author",
          isActive: true,
        })
        .returning();
      foundUser = newUser[0];
    } else {
      if (!foundUser!.isActive) {
        return NextResponse.redirect(new URL("/login?error=AccountDeactivated", req.url));
      }
      if (!foundUser!.username) {
        const newUsername = await generateUsername(database, foundUser!.name, foundUser!.email);
        await database
          .update(users)
          .set({ username: newUsername })
          .where(eq(users.id, foundUser!.id));
        foundUser!.username = newUsername;
      }
    }

    // 5. Generate Session Token & Set Cookie
    const token = generateToken({
      id: String(foundUser!.id),
      email: foundUser!.email,
      name: foundUser!.name || undefined,
      permissions: ["posts:create", "posts:update", "posts:delete"],
      roles: ["author"],
    });

    const cookieStore = await cookies();
    cookieStore.set("session-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.redirect(new URL("/dashboard", req.url));
  } catch (error) {
    console.error("GitHub OAuth Error:", error);
    return NextResponse.redirect(new URL("/login?error=OAuthFailed", req.url));
  }
}
