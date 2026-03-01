import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    const redirectUri =
      process.env.NODE_ENV === "production"
        ? "https://blinkcity-stats.vercel.app/callback"
        : "http://127.0.0.1:3000/callback";

    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirectUri);

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!data.access_token) {
      return NextResponse.json(
        { error: "No se pudo obtener access token" },
        { status: 400 }
      );
    }

    // Obtener perfil del usuario
    const profileRes = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
      },
    });

    const profile = await profileRes.json();

    const user = {
      id: profile.id,
      name: profile.display_name,
      image: profile.images?.[0]?.url || null,
    };

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: "Error obteniendo token" },
      { status: 500 }
    );
  }
}