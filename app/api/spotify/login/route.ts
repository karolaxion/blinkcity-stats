import { NextResponse } from "next/server";

export async function GET() {

  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;

  const redirectUri = "https://blinkcity-stats.vercel.app/callback";

  const scope = "user-read-recently-played";

  const authUrl =
    "https://accounts.spotify.com/authorize?" +
    new URLSearchParams({
      response_type: "code",
      client_id: clientId!,
      scope: scope,
      redirect_uri: redirectUri,
      show_dialog: "true"
    }).toString();

  return NextResponse.redirect(authUrl);

}