import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {

  const body = await request.json()
  const username = body.username

  if (!username) {
    return Response.json({ error: "username missing" })
  }

  // buscar usuario
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .ilike("lastfm_username", username)
    .single()

  if (!user) {
    return Response.json({ error: "user not found" })
  }

  // 🔥 crear job
  await supabase
    .from("sync_jobs")
    .insert({
      user_id: user.id,
      status: "pending"
    })

  return Response.json({ success: true })

}