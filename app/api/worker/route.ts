import { supabase } from "@/lib/supabase"
import { getRecentTracks } from "@/lib/lastfm"
import { searchTrack, getArtistImage } from "@/lib/spotify"
import { detectFandomArtist } from "@/lib/fandomDetector"

export async function GET() {

  const { data: jobs } = await supabase
    .from("sync_jobs")
    .select("*")
    .eq("status", "pending")
    .limit(5)

  if (!jobs || jobs.length === 0) {
    return Response.json({ message: "no jobs" })
  }

  for (const job of jobs) {

    try {

      // 🔥 marcar processing
      await supabase
        .from("sync_jobs")
        .update({ status: "processing" })
        .eq("id", job.id)

      const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("id", job.user_id)
        .single()

      if (!user) throw new Error("user not found")

      const tracks = await getRecentTracks(user.lastfm_username, 1)

      for (const track of tracks) {

        if (!track.date) continue

        let artist = track.artist["#text"]
        const name = track.name

        const fandomArtist = detectFandomArtist(artist, name)
        if (fandomArtist) artist = fandomArtist

        artist = artist.toUpperCase()

        const playedAt = new Date(Number(track.date.uts) * 1000)

        const { data: exists } = await supabase
          .from("streams")
          .select("id")
          .eq("user_id", user.id)
          .eq("played_at", playedAt)
          .maybeSingle()

        if (exists) continue

        let albumName = null
        let albumImage = null
        let artistImage = null

        const { data: cache } = await supabase
          .from("spotify_cache")
          .select("*")
          .eq("artist_name", artist)
          .eq("track_name", name)
          .maybeSingle()

        if (cache) {
          albumName = cache.album_name
          albumImage = cache.album_image
          artistImage = cache.artist_image
        } else {
          const spotifyTrack = await searchTrack(name, artist)
          const spotifyArtistImage = await getArtistImage(artist)

          albumName = spotifyTrack?.albumName || null
          albumImage = spotifyTrack?.albumImage || null
          artistImage = spotifyArtistImage || null

          await supabase.from("spotify_cache").insert({
            artist_name: artist,
            track_name: name,
            album_name: albumName,
            album_image: albumImage,
            artist_image: artistImage
          })
        }

        await supabase.from("streams").insert({
          user_id: user.id,
          artist_name: artist,
          track_name: name,
          album_name: albumName,
          album_image: albumImage,
          artist_image: artistImage,
          played_at: playedAt
        })

      }

      // ✅ marcar done
      await supabase
        .from("sync_jobs")
        .update({ status: "done" })
        .eq("id", job.id)

    } catch (error) {

      console.error("Worker error:", error)

      // ❌ marcar failed
      await supabase
        .from("sync_jobs")
        .update({ status: "failed" })
        .eq("id", job.id)

    }

  }

  return Response.json({ success: true })

}