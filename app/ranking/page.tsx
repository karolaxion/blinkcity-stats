"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

const ARTISTS = [
  "BLACKPINK",
  "JENNIE",
  "ROSÉ",
  "JISOO",
  "LISA"
]

export default function RankingPage() {

  const [streams,setStreams] = useState<any[]>([])
  const [range,setRange] = useState<"all"|"today"|"yesterday"|"week"|"last_week"|"month"|"last_month">("all")

  // 🔥 cargar data
  async function loadData() {
  let allData: any[] = []
  let from = 0
  let to = 999

  while (true) {
    const { data } = await supabase
      .from("streams")
      .select(`
        artist_name,
        track_name,
        album_image,
        played_at,
        users (
          lastfm_username
        )
      `)
      .range(from, to)

    if (!data || data.length === 0) break

    allData = [...allData, ...data]

    from += 1000
    to += 1000
  }

  setStreams(allData)
}

  useEffect(() => {
    loadData(); // Carga inicial
    const interval = setInterval(loadData, 10 * 60 * 1000); // 10 minutos
    return () => clearInterval(interval); // Limpia al desmontar
  }, []);

  // ======================
  // 🔥 FILTRO POR FECHA
  // ======================

  const now = new Date()

  let startDate = new Date(0)
  let endDate = new Date()

  if(range === "today"){
    startDate = new Date()
    startDate.setHours(0,0,0,0)
    endDate = new Date(startDate)
    endDate.setDate(endDate.getDate()+1)
  }

  if(range === "yesterday"){
    startDate = new Date()
    startDate.setDate(startDate.getDate()-1)
    startDate.setHours(0,0,0,0)
    endDate = new Date(startDate)
    endDate.setDate(endDate.getDate()+1)
  }

  if(range === "week"){
    const day = now.getDay()
    startDate = new Date(now)
    startDate.setDate(now.getDate() - day)
    startDate.setHours(0,0,0,0)
    endDate = new Date()
  }

  if(range === "last_week"){
    const day = now.getDay()
    endDate = new Date(now)
    endDate.setDate(now.getDate() - day)
    endDate.setHours(0,0,0,0)
    startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - 7)
  }

  if(range === "month"){
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    endDate = new Date()
  }

  if(range === "last_month"){
    startDate = new Date(now.getFullYear(), now.getMonth()-1, 1)
    endDate = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  const filteredStreams = streams.filter(s=>{
    if(range === "all") return true
    const date = new Date(s.played_at)
    return date >= startDate && date < endDate
  })

  // ======================

  return (
    <div style={{padding:"40px"}}>
      <h1>Fandom Ranking</h1>

      {/* 🔥 BOTONES */}
      <div style={{display:"flex",flexDirection:"column",gap:"8px",marginTop:"20px"}}>
        <div style={{display:"flex",gap:"10px"}}>
          <button onClick={()=>setRange("all")}>All</button>
          <button onClick={()=>setRange("today")}>Today</button>
          <button onClick={()=>setRange("yesterday")}>Yesterday</button>
        </div>

        <div style={{display:"flex",gap:"10px"}}>
          <button onClick={()=>setRange("week")}>This Week</button>
          <button onClick={()=>setRange("last_week")}>Last Week</button>
        </div>

        <div style={{display:"flex",gap:"10px"}}>
          <button onClick={()=>setRange("month")}>This Month</button>
          <button onClick={()=>setRange("last_month")}>Last Month</button>
        </div>
      </div>

      {/* ====================== */}

      {ARTISTS.map((artist) => {

        const artistStreams = filteredStreams.filter(s =>
          s.artist_name.toUpperCase().includes(artist)
        )

        const songCounts: Record<string, number> = {}
        const userCounts: Record<string, number> = {}

        artistStreams.forEach((stream) => {

          songCounts[stream.track_name] =
            (songCounts[stream.track_name] || 0) + 1

          const username = stream.users?.lastfm_username
          if (!username) return // 👈 ignora streams sin usuario

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
                gridTemplateColumns:"1fr 1fr",
                gap:"20px",
                marginTop: "20px"
              }}
            >

              {/* TOP SONGS */}

              <div>

                <h3>Top Songs</h3>

                {topSongs.map(([song,plays],index)=>{

                  const stream = artistStreams.find(
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

                      <span
                        style={{
                          color:"#ff2e93",
                          marginLeft:"5px"
                        }}
                      >
                        {user}
                      </span>

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