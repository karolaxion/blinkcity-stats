import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect("http://127.0.0.1:3000/profile");
  }

  const apiKey = process.env.NEXT_PUBLIC_LASTFM_API_KEY;
  const secret = process.env.LASTFM_API_SECRET;

  const signature = require("crypto")
    .createHash("md5")
    .update(
      `api_key${apiKey}methodauth.getSessiontoken${token}${secret}`
    )
    .digest("hex");

  const response = await fetch(
    `https://ws.audioscrobbler.com/2.0/?method=auth.getSession&api_key=${apiKey}&token=${token}&api_sig=${signature}&format=json`
  );

  const data = await response.json();

  const username = data.session?.name;

  if (!username) {
    return NextResponse.redirect("http://127.0.0.1:3000/profile");
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {

    await supabase
      .from("profiles")
      .update({
        lastfm_username: username
      })
      .eq("id", user.id);

  }

  return NextResponse.redirect("http://127.0.0.1:3000/profile");

}