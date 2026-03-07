import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      "https://blinkcity-stats.vercel.app"
    );
  }

  console.log("Spotify code:", code);

  return NextResponse.redirect(
    "https://blinkcity-stats.vercel.app/profile"
  );
}