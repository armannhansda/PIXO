import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { generateToken } from "@/lib/auth-utils";
import { generateUsername } from "@/server/trpc/routers/auth";
import { OAuth2Client } from "google-auth-library";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=MissingCode", req.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Missing Google OAuth credentials in environment." }, { status: 500 });
  }

  try {
    const oAuth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);

    // 1. Exchange code for access token and id token
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    if (!tokens.id_token) {
       return NextResponse.redirect(new URL("/login?error=GoogleNoIdToken", req.url));
    }

    // 2. Verify and decode ID token
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.redirect(new URL("/login?error=GoogleInvalidToken", req.url));
    }

    const email = payload.email;

    const database = db();

    // 3. Find or Create User
    const existingUser = await database.query.users.findFirst({
      where: eq(users.email, email),
    });

    let foundUser = existingUser;

    if (!existingUser) {
      const gName = payload.name || email.split("@")[0];
      const newUser = await database
        .insert(users)
        .values({
          name: gName,
          username: await generateUsername(database, gName, email),
          email,
          profileImage: payload.picture || null,
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

    // 4. Generate Session Token & Set Cookie
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
    console.error("Google OAuth Error:", error);
    return NextResponse.redirect(new URL("/login?error=OAuthFailed", req.url));
  }
}
