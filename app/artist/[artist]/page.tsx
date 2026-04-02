"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { artistTheme } from "@/lib/artistTheme"
import { spotifyArtists } from "@/lib/spotifyArtists"
import { getArtistImage } from "@/lib/spotify"

export default function ArtistPage() {

  const params = useParams()
  const artistName = String(params.artist).toLowerCase()

  const normalizedArtist =
    artistName === "rose" ? "ROSÉ" : artistName.toUpperCase()

  const theme = artistTheme[artistName] || artistTheme["blackpink"]

  const [streams,setStreams] = useState<any[]>([])
  const [artistImage,setArtistImage] = useState<string|null>(null)

  // 🔥 NUEVO RANGE COMPLETO
  const [range,setRange] = useState<"all"|"today"|"yesterday"|"week"|"last_week"|"month"|"last_month">("all")

  // ======================
  // 🔥 LOAD DATA
  // ======================

  async function loadData(){

  let allData: any[] = []
  let from = 0
  let to = 999

  while (true) {
    const { data } = await supabase
      .from("streams")
      .select(`
        *,
        users ( lastfm_username )
      `)
      .range(from, to)

    if (!data || data.length === 0) break

    allData = [...allData, ...data]

    from += 1000
    to += 1000
  }

  setStreams(allData)

    const artistKey = artistName as keyof typeof spotifyArtists
    const artistId = spotifyArtists[artistKey]?.id

    let img = null

    if (artistId) {
      img = await getArtistImage(artistName)
    }

    if (!img) {
      img =
        allStreams.find((s:any)=>
          s.artist_name.toUpperCase().includes(normalizedArtist)
        )?.artist_image || null
    }

    setArtistImage(img)
  }

  useEffect(()=>{
    loadData()
  },[])

  // ======================
  // 🔥 FILTRO FECHA (FIXED)
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
  // 🔥 FILTRO ARTISTA
  // ======================

  const artistStreams = filteredStreams.filter(stream => {

    const artistUpper = stream.artist_name.toUpperCase()

    if (artistName === "rose") {
      return artistUpper.includes("ROSÉ") || artistUpper.includes("ROSE")
    }

    return artistUpper.includes(artistName.toUpperCase())

  })

  // ======================
  // 🔥 BANNER
  // ======================

  const bannerPosition: Record<string,string> = {
    BLACKPINK: "center 45%",
    JENNIE: "center 50%",
    ROSÉ: "center 15%",
    JISOO: "center 25%",
    LISA: "center 32%"
  }

  const backgroundPosition =
    bannerPosition[normalizedArtist] || "center 30%"

  // ======================
  // 🔥 COUNTS
  // ======================

  const songCounts: Record<string, number> = {}
  const userCounts: Record<string, number> = {}

  artistStreams.forEach((stream) => {

    songCounts[stream.track_name] =
      (songCounts[stream.track_name] || 0) + 1

    const username = stream.users?.lastfm_username

    if (!username) return

    userCounts[username] =
      (userCounts[username] || 0) + 1

  })

  const topSongs = Object.entries(songCounts)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,20)

  const topUsers = Object.entries(userCounts)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,20)

  // ======================

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
              color: theme.color
            }}
          >
            {normalizedArtist}
          </h1>

        </div>

      </div>

      {/* 🔥 BOTONES */}

      <div style={{display:"flex",flexDirection:"column",gap:"8px",marginBottom:"20px"}}>

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

      {/* CONTENT */}

      <div
        style={{
          display:"grid",
          gridTemplateColumns:"1fr 1fr",
          gap:"20px"
        }}
      >

        {/* TOP SONGS */}

        <div>

          <h2>Top Songs</h2>

          {topSongs.map(([song,plays]:any,index:number)=>{

            const stream = artistStreams.find(
              s=>s.track_name===song
            )

            return(

              <div key={song} style={{
                display:"flex",
                alignItems:"center",
                gap:"10px",
                background:"#111",
                padding:"12px",
                borderRadius:"12px",
                marginTop:"10px"
              }}>

                <b>{index+1}</b>

                {stream?.album_image &&(
                  <img src={stream.album_image} width="50" height="50" style={{borderRadius:"6px"}}/>
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

          {topUsers.map(([user,plays]:any,index:number)=>(

            <div key={user} style={{
              background:"#111",
              padding:"12px",
              borderRadius:"12px",
              marginTop:"10px"
            }}>

              <b>{index+1}</b>{" "}

              <span style={{color: theme.color}}>
                {user}
              </span>

              {" — "}
              {plays} Streams

            </div>

          ))}

        </div>

      </div>

    </div>
  )
}