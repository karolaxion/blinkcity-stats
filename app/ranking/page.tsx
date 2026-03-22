export const revalidate = 300

import { supabase } from "@/lib/supabase"

const ARTISTS = [
  "BLACKPINK",
  "JENNIE",
  "ROSÉ",
  "JISOO",
  "LISA"
]

export default async function RankingPage() {

  const { data: streams } = await supabase
    .from("streams")
    .select(`
      artist_name,
      track_name,
      album_image,
      users (
        lastfm_username
      )
    `)

  return (

    <div>

      <h1>Fandom Ranking</h1>

      {ARTISTS.map((artist) => {

        const artistStreams = streams?.filter(s =>
          s.artist_name.toUpperCase().includes(artist)
        )

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
          .slice(0,5)

        const topUsers = Object.entries(userCounts)
          .sort((a,b)=>b[1]-a[1])
          .slice(0,5)

        return (

          <div key={artist} style={{ marginTop: "60px" }}>

            <h2>{artist}</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "60px",
                marginTop: "20px"
              }}
            >

              {/* TOP SONGS */}

              <div>

                <h3>Top Songs</h3>

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
                        padding:"10px",
                        borderRadius:"8px",
                        marginTop:"10px"
                      }}
                    >

                      <b style={{ width:"20px" }}>
                        {index+1}
                      </b>

                      {stream?.album_image && (

                        <img
                          src={stream.album_image}
                          width="50"
                          height="50"
                          style={{ borderRadius:"6px" }}
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

                <h3>Top Fans</h3>

                {topUsers.map(([user,plays],index)=>{

                  return(

                    <div
                      key={user}
                      style={{
                        background:"#111",
                        padding:"10px",
                        borderRadius:"8px",
                        marginTop:"10px"
                      }}
                    >

                      <b>{index+1}</b>{" "}

                      <a
                        href={`/user/${user}`}
                        style={{
                          color:"#ff2e93",
                          textDecoration:"none",
                          marginLeft:"5px"
                        }}
                      >
                        {user}
                      </a>

                      {" — "}
                      {plays} Streams

                    </div>

                  )

                })}

              </div>

            </div>

          </div>

        )

      })}

    </div>

  )
}