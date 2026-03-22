import { supabase } from "@/lib/supabase"

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {

  const { username } = await params

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("lastfm_username", username)
    .single()

  if (!user) {
    return (
      <main style={{ padding: "40px" }}>
        <h1>User not found</h1>
      </main>
    )
  }

  const { data: streams } = await supabase
    .from("streams")
    .select("*")
    .eq("user_id", user.id)

  const songCounts: Record<string, number> = {}
  const artistCounts: Record<string, number> = {}

  streams?.forEach((stream) => {

    const songKey = `${stream.artist_name} — ${stream.track_name}`
    songCounts[songKey] = (songCounts[songKey] || 0) + 1

    const artistKey = stream.artist_name
    artistCounts[artistKey] = (artistCounts[artistKey] || 0) + 1

  })

  const topSongs = Object.entries(songCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  const topArtists = Object.entries(artistCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>

      <h1>{username}</h1>

      <p>Total Streams: {streams?.length || 0}</p>

      <h2 style={{ marginTop: "40px" }}>Top Songs</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

        {topSongs.map(([song, plays]) => {

          const stream = streams?.find(s =>
            `${s.artist_name} — ${s.track_name}` === song
          )

          return (
            <div
              key={song}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "#111",
                color: "white",
                padding: "8px",
                borderRadius: "8px",
                width: "300px"
              }}
            >

              {stream?.album_image && (
                <img
                  src={stream.album_image}
                  width="40"
                  height="40"
                  style={{ borderRadius: "6px" }}
                />
              )}

              <div>
                <div>{song}</div>
                <div style={{ fontSize: "12px", opacity: 0.7 }}>
                  {plays} Streams
                </div>
              </div>

            </div>
          )

        })}

      </div>

      <h2 style={{ marginTop: "40px" }}>Top Artists</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

        {topArtists.map(([artist, plays]) => {

          const stream = streams?.find(s =>
            s.artist_name === artist
          )

          return (
            <div
              key={artist}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "#111",
                color: "white",
                padding: "8px",
                borderRadius: "8px",
                width: "300px"
              }}
            >

              {stream?.artist_image && (
                <img
                  src={stream.artist_image}
                  width="40"
                  height="40"
                  style={{ borderRadius: "50%" }}
                />
              )}

              <div>
                <div>{artist}</div>
                <div style={{ fontSize: "12px", opacity: 0.7 }}>
                  {plays} Streams
                </div>
              </div>

            </div>
          )

        })}

      </div>

    </main>
  )
}