import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_LASTFM_API_KEY!;
  const apiSecret = process.env.LASTFM_API_SECRET!;

  const apiSig = crypto
    .createHash("md5")
    .update(
      `api_key${apiKey}methodauth.getSessiontoken${token}${apiSecret}`
    )
    .digest("hex");

  const url = `https://ws.audioscrobbler.com/2.0/?method=auth.getSession&api_key=${apiKey}&token=${token}&api_sig=${apiSig}&format=json`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.session) {
    return NextResponse.json(
      { error: "Failed to get session" },
      { status: 400 }
    );
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Obtener usuario autenticado desde cookies
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const jwt = authHeader.replace("Bearer ", "");

  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(jwt);

  if (!user) {
    return NextResponse.json({ error: "Invalid user" }, { status: 401 });
  }

  // 🔥 ACTUALIZA PROFILE DESDE BACKEND
  await supabaseAdmin
    .from("profiles")
    .update({
      lastfm_username: data.session.name,
    })
    .eq("id", user.id);

  return NextResponse.json({
    success: true,
  });
}