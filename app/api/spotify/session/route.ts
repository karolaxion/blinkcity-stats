import { NextResponse } from "next/server";

export async function POST(req: Request) {

  const body = await req.json();
  const code = body.code;

  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  const redirectUri = "http://127.0.0.1:3000/callback";

  const params = new URLSearchParams();

  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", redirectUri);
  params.append("client_id", clientId!);
  params.append("client_secret", clientSecret!);

  const tokenResponse = await fetch(
    "https://accounts.spotify.com/api/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    }
  );

  const tokenData = await tokenResponse.json();

  const accessToken = tokenData.access_token;

  const profileResponse = await fetch(
    "https://api.spotify.com/v1/me",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const profile = await profileResponse.json();

  return NextResponse.json({
    success: true,
    spotify_id: profile.id,
  });

}