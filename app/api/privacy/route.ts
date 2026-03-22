import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {

  const { username, is_public } = await request.json()

  const { data, error } = await supabase
    .from("users")
    .update({ is_public })
    .eq("lastfm_username", username)

  if (error) {
    return Response.json({ success: false })
  }

  return Response.json({ success: true })
}