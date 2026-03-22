import { NextResponse } from "next/server";

export async function GET() {

  const apiKey = process.env.NEXT_PUBLIC_LASTFM_API_KEY;

  const callback = "http://127.0.0.1:3000/lastfm-callback";

  const url =
    "https://www.last.fm/api/auth?" +
    new URLSearchParams({
      api_key: apiKey!,
      cb: callback
    }).toString();

  return NextResponse.redirect(url);

}