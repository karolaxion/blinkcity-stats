import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Username requerido" },
      { status: 400 }
    );
  }

  const apiKey = process.env.NEXT_PUBLIC_LASTFM_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "API key no configurada" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json&limit=50`
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Error consultando Last.fm" },
      { status: 500 }
    );
  }
}