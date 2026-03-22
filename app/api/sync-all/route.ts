import { supabase } from "@/lib/supabase"

export async function GET() {

  const { data: users } = await supabase
    .from("users")
    .select("lastfm_username")

  if (!users) {
    return Response.json({ error: "no users" })
  }

  for (const user of users) {

    try {

      await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/sync?username=${user.lastfm_username}`
      )

    } catch (err) {

      console.log("sync error", user.lastfm_username)

    }

  }

  return Response.json({
    success: true,
    users: users.length
  })

}