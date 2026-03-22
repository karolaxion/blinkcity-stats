import { getSession } from "@/lib/lastfm"
import { supabase } from "@/lib/supabase"
import { redirect } from "next/navigation"

export default async function LastfmCallback({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {

  const params = await searchParams
  const token = params.token

  if (!token) {
    return (
      <main style={{ padding: "40px" }}>
        <h1>Error</h1>
        <p>No token recibido</p>
      </main>
    )
  }

  const sessionData = await getSession(token)
  const username = sessionData?.session?.name

  if (username) {

    await supabase
      .from("users")
      .upsert(
        { lastfm_username: username },
        { onConflict: "lastfm_username" }
      )

  }

  redirect("/profile")
}