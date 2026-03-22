export const revalidate = 300

import { supabase } from "@/lib/supabase"
import { artistTheme } from "@/lib/artistTheme"
import { spotifyArtists } from "@/lib/spotifyArtists"
import { getArtistImage } from "@/lib/spotify"

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ artist: string }>
}) {

  const { artist } = await params
  const artistName = artist.toLowerCase()

  const normalizedArtist =
  artistName === "rose" ? "ROSÉ" : artistName.toUpperCase()

  const theme = artistTheme[artistName] || artistTheme["blackpink"]

  const { data: streams } = await supabase
    .from("streams")
    .select(`
      *,
      users (
        lastfm_username
      )
    `)

  const artistStreams = streams?.filter(stream => {

    const artistUpper = stream.artist_name.toUpperCase()

    if (artistName === "rose") {
      return artistUpper.includes("ROSÉ") || artistUpper.includes("ROSE")
    }

    return artistUpper.includes(artistName.toUpperCase())

  })

const artistId = spotifyArtists[artistName]?.id

let artistImage = null

if (artistId) {
  artistImage = await getArtistImage(artistName)
}

if (!artistImage) {
  artistImage =
    artistStreams?.find(s => s.artist_image)?.artist_image || null
}

  // posiciones personalizadas para centrar caras
  const bannerPosition: Record<string,string> = {
    BLACKPINK: "center 45%",
    JENNIE: "center 50%",
    ROSÉ: "center 15%",
    JISOO: "center 25%",
    LISA: "center 32%"
  }

  const backgroundPosition =
    bannerPosition[normalizedArtist] || "center 30%"

  const songCounts: Record<string, number> = {}
  const userCounts: Record<string, number> = {}

  artistStreams?.forEach((stream) => {

    songCounts[stream.track_name] =
      (songCounts[stream.track_name] || 0) + 1

    const username = stream.users?.lastfm_username || "Unknown"

    userCounts[username] =
      (userCounts[username] || 0) + 1

  })

  const topSongs = Object.entries(songCounts)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,20)

  const topUsers = Object.entries(userCounts)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,10)

  return(

    <div>

      {/* BANNER */}

      <div
        style={{
          height: "300px",
          borderRadius: "14px",
          overflow: "hidden",
          position: "relative",
          marginBottom: "40px",
          backgroundImage: `url(${artistImage})`,
          backgroundSize: "cover",
          backgroundPosition: backgroundPosition
        }}
      >

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0.8))"
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "30px",
            left: "40px"
          }}
        >

          <h1
            style={{
              fontSize: "46px",
              margin: 0,
              color: theme.color,
              textShadow: "0 4px 20px rgba(0,0,0,0.8)"
            }}
          >
            {artistName.toUpperCase()}
          </h1>

        </div>

      </div>

      {/* CONTENT */}

      <div
        style={{
          display:"grid",
          gridTemplateColumns:"1fr 1fr",
          gap:"60px"
        }}
      >

        {/* TOP SONGS */}

        <div>

          <h2>Top Songs</h2>

          {topSongs.map(([song,plays],index)=>{

            const stream = artistStreams?.find(
              s=>s.track_name===song
            )

            return(

              <div
                key={song}
                style={{
                  display:"flex",
                  alignItems:"center",
                  gap:"10px",
                  background:"#111",
                  padding:"12px",
                  borderRadius:"12px",
                  marginTop:"10px"
                }}
              >

                <b>{index+1}</b>

                {stream?.album_image &&(

                  <img
                    src={stream.album_image}
                    width="50"
                    height="50"
                    style={{borderRadius:"6px"}}
                  />

                )}

                <div>

                  <div>{song}</div>

                  <div style={{fontSize:"12px",opacity:.6}}>
                    {plays} Streams
                  </div>

                </div>

              </div>

            )

          })}

        </div>

        {/* TOP FANS */}

        <div>

          <h2>Top Fans</h2>

          {topUsers.map(([user,plays],index)=>(

            <div
              key={user}
              style={{
                background:"#111",
                padding:"12px",
                borderRadius:"12px",
                marginTop:"10px"
              }}
            >

              <b>{index+1}</b>{" "}

              <a
                href={`/user/${user}`}
                style={{
                  color: theme.color,
                  textDecoration:"none"
                }}
              >
                {user}
              </a>

              {" — "}
              {plays} Streams

            </div>

          ))}

        </div>

      </div>

    </div>

  )
}