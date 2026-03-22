import { NextResponse } from "next/server";

export async function GET(request: Request) {

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
  const redirectUri = "http://127.0.0.1:3000/callback";

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: code!,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret
  });

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  const data = await res.json();

  return NextResponse.json(data);

}