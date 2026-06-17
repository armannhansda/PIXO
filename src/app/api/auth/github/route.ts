import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/auth/github/callback`;

  if (!clientId) {
    return NextResponse.json({ error: "Missing GITHUB_CLIENT_ID" }, { status: 500 });
  }

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
  
  return NextResponse.redirect(githubAuthUrl);
}
