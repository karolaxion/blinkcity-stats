import { supabase } from "@/lib/supabase"

export async function GET() {

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
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