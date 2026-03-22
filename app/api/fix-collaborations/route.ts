import { supabase } from "@/lib/supabase"
import { fandomCollaborations } from "@/lib/fandomCollaborations"

export async function GET() {

  for (const collab of fandomCollaborations) {

    const originalArtist = collab.originalArtist.toUpperCase()
    const track = collab.track.toUpperCase()
    const fandomArtist = collab.fandomArtist

    await supabase
      .from("streams")
      .update({
        artist_name: fandomArtist
      })
      .ilike("artist_name", `%${originalArtist}%`)
      .ilike("track_name", `%${track}%`)

  }

  return Response.json({
    success: true,
    message: "Collaborations fixed"
  })

}