import { NextResponse } from "next/server";

export async function GET() {

  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;

  const redirectUri =
    "https://blinkcity-stats.vercel.app/api/spotify/callback";

  const scope = "user-read-recently-played";

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId!,
    scope,
    redirect_uri: redirectUri,
  });

  const url =
    "https://accounts.spotify.com/authorize?" + params.toString();

  return NextResponse.redirect(url);
}