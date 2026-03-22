import { supabase } from "@/lib/supabase"
import { getRecentTracks } from "@/lib/lastfm"
import { searchTrack, getArtistImage } from "@/lib/spotify"
import { detectFandomArtist } from "@/lib/fandomDetector"

export async function GET() {

  // 🔥 1. buscar job pendiente
  const { data: job } = await supabase
    .from("sync_jobs")
    .select("*")
    .eq("status", "pending")
    .limit(1)
    .maybeSingle()

  if (!job) {
    return Response.json({ message: "no jobs" })
  }

  // 🔥 2. marcar como processing
  await supabase
    .from("sync_jobs")
    .update({ status: "processing" })
    .eq("id", job.id)

  // 🔥 3. obtener usuario
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", job.user_id)
    .single()

  if (!user) {
    return Response.json({ error: "user not found" })
  }

  // 🔥 4. traer tracks (últimos 50 por ahora)
  const tracks = await getRecentTracks(user.lastfm_username, 1)

  for (const track of tracks) {

    if (!track.date) continue

    let artist = track.artist["#text"]
    const name = track.name

    const fandomArtist = detectFandomArtist(artist, name)
    if (fandomArtist) artist = fandomArtist

    artist = artist.toUpperCase()

    const playedAt = new Date(Number(track.date.uts) * 1000)

    // evitar duplicados
    const { data: exists } = await supabase
      .from("streams")
      .select("id")
      .eq("user_id", user.id)
      .eq("played_at", playedAt)
      .maybeSingle()

    if (exists) continue

    // spotify cache
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

  // 🔥 5. marcar como done
  await supabase
    .from("sync_jobs")
    .update({ status: "done" })
    .eq("id", job.id)

  return Response.json({ success: true })

}