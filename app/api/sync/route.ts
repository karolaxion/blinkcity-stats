import { supabase } from "@/lib/supabase"
import { getRecentTracks } from "@/lib/lastfm"
import { searchTrack, getArtistImage } from "@/lib/spotify"
import { detectFandomArtist } from "@/lib/fandomDetector"

export async function GET(request: Request) {

  const { searchParams } = new URL(request.url)
  const username = searchParams.get("username")
  const mode = searchParams.get("mode") // 👈 NUEVO

  if (!username) {
    return Response.json({ error: "username missing" })
  }

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .ilike("lastfm_username", username)
    .single()

  if (!user) {
    return Response.json({ error: "user not found" })
  }

  // 🔥 detectar si es primer sync
  const { data: stats } = await supabase
    .from("user_stats")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle()

  const isFirstSync = !stats

  // =====================================
  // OBTENER TRACKS
  // =====================================

  let tracks: any[] = []

  // 🔥 NUEVO: BOTÓN DE 100 SCROBBLES
  if (mode === "100") {

    for (let page = 1; page <= 2; page++) {

      const pageTracks = await getRecentTracks(username, page)

      if (!pageTracks || pageTracks.length === 0) break

      tracks = tracks.concat(pageTracks)
    }

  } else if (!isFirstSync) {

    // sync rápido (últimos 50)
    tracks = await getRecentTracks(username, 1)

  } else {

    // FULL SYNC automático
    const maxPages = 200

    for (let page = 1; page <= maxPages; page++) {

      const pageTracks = await getRecentTracks(username, page)

      if (!pageTracks || pageTracks.length === 0) break

      tracks = tracks.concat(pageTracks)

    }

  }

  // =====================================
  // EVITAR DUPLICADOS (OPTIMIZADO)
  // =====================================

  const { data: existingStreams } = await supabase
    .from("streams")
    .select("played_at")
    .eq("user_id", user.id)
    .order("played_at", { ascending: false })
    .limit(500)

  const existingPlayedAt = new Set(
    existingStreams?.map(s => new Date(s.played_at).getTime())
  )

  // =====================================
  // PROCESAR TRACKS
  // =====================================

  for (const track of tracks) {

    if (!track.date) continue

    let artist = track.artist["#text"]
    const name = track.name

    const fandomArtist = detectFandomArtist(artist, name)

    if (fandomArtist) {
      artist = fandomArtist
    }

    artist = artist.toUpperCase()

    const playedAt = new Date(Number(track.date.uts) * 1000)
    const playedTimestamp = playedAt.getTime()

    if (existingPlayedAt.has(playedTimestamp)) {
      continue
    }

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

      await supabase
        .from("spotify_cache")
        .insert({
          artist_name: artist,
          track_name: name,
          album_name: albumName,
          album_image: albumImage,
          artist_image: artistImage
        })

    }

    await supabase
      .from("streams")
      .insert({
        user_id: user.id,
        artist_name: artist,
        track_name: name,
        album_name: albumName,
        album_image: albumImage,
        artist_image: artistImage,
        played_at: playedAt
      })

  }

  // =====================================
  // ACTUALIZAR USER_STATS
  // =====================================

  const { data: userStreams } = await supabase
    .from("streams")
    .select("artist_name, track_name")
    .eq("user_id", user.id)

  const songCounts: any = {}
  const artistCounts: any = {}

  userStreams?.forEach((s:any)=>{

    const songKey = `${s.artist_name} — ${s.track_name}`
    songCounts[songKey] = (songCounts[songKey]||0)+1

    artistCounts[s.artist_name] = (artistCounts[s.artist_name]||0)+1

  })

  const topSongs = Object.entries(songCounts)
    .sort((a:any,b:any)=>b[1]-a[1])
    .slice(0,10)

  const topArtists = Object.entries(artistCounts)
    .sort((a:any,b:any)=>b[1]-a[1])
    .slice(0,10)

  await supabase
    .from("user_stats")
    .upsert({
      user_id: user.id,
      total_streams: userStreams?.length || 0,
      top_songs: topSongs,
      top_artists: topArtists,
      updated_at: new Date()
    })

  return Response.json({ success: true })

}