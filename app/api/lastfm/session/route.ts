import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(request: Request) {

  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  const apiKey = process.env.NEXT_PUBLIC_LASTFM_API_KEY!;
  const secret = process.env.LASTFM_API_SECRET!;

  if (!token) {
    return NextResponse.json({ error: "no token" });
  }

  const method = "auth.getSession";

  const signature = crypto
    .createHash("md5")
    .update(`api_key${apiKey}method${method}token${token}${secret}`)
    .digest("hex");

  const url =
    "https://ws.audioscrobbler.com/2.0/?" +
    new URLSearchParams({
      method: "auth.getSession",
      api_key: apiKey,
      token: token,
      api_sig: signature,
      format: "json"
    });

  const res = await fetch(url);
  const data = await res.json();

  return NextResponse.json(data);

}