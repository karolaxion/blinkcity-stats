import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {

  const { searchParams } = new URL(request.url)
  const username = searchParams.get("username")

  if (!username) {
    return Response.json({
      user: null,
      streams: []
    })
  }

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .ilike("lastfm_username", username)
    .single()

  if (!user) {
    return Response.json({
      user: null,
      streams: []
    })
  }

  const { data: streams } = await supabase
    .from("streams")
    .select("*")
    .eq("user_id", user.id)
    .order("played_at", { ascending: false })

  return Response.json({
    user,
    streams: streams || []
  })
}