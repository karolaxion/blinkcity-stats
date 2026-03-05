import { NextResponse } from "next/server";

export async function GET() {

  const apiKey = process.env.NEXT_PUBLIC_LASTFM_API_KEY;

  const callback = "https://blinkcity-stats.vercel.app/api/lastfm/callback";

  const url =
    `https://www.last.fm/api/auth/?api_key=${apiKey}&cb=${callback}`;

  return NextResponse.redirect(url);

}