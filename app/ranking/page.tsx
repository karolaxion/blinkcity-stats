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
  const [rankingUsers,setRankingUsers] = useState<any[]>([])
  const [rankingSongs,setRankingSongs] = useState<any[]>([])
  const [musicMetadata,setMusicMetadata] = useState<any[]>([]) // 🔥 NUEVO
  const [range,setRange] = useState<"all"|"today"|"yesterday"|"week"|"last_week"|"month"|"last_month">("all")

  // ======================
  // 🔥 cargar ranking tables
  // ======================

  async function loadRanking() {
    const { data: users } = await supabase.from("ranking_users").select("*")
    const { data: songs } = await supabase.from("ranking_songs").select("*")
    const { data: meta } = await supabase.from("music_metadata").select("*") // 🔥 NUEVO

    setRankingUsers(users || [])
    setRankingSongs(songs || [])
    setMusicMetadata(meta || []) // 🔥 NUEVO
  }

  // ======================
  // 🔥 cargar streams + guardar ranking + metadata
  // ======================

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
          artist_image,
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

    // ======================
    // 🔥 GUARDAR METADATA (NUEVO)
    // ======================

    for (const s of allData) {

  if (!s.track_name || !s.artist_name) continue

  const artistUpper = s.artist_name.toUpperCase()

  const isValidArtist = ARTISTS.some(a =>
    artistUpper.includes(a)
  )

  if (!isValidArtist) continue

  const { data: exists } = await supabase
  .from("music_metadata")
  .select("*")
  .eq("artist", s.artist_name)
  .eq("track_name", s.track_name)
  .single()

if (!exists) {

  await supabase.from("music_metadata").insert({
    artist: s.artist_name,
    track_name: s.track_name,
    album_image: s.album_image,
    artist_image: s.artist_image
  })

} else {

  // 🔥 SI YA EXISTE PERO NO TIENE IMAGEN → ACTUALIZAR
  if (!exists.album_image && s.album_image) {

    await supabase.from("music_metadata")
      .update({
        album_image: s.album_image
      })
      .eq("artist", s.artist_name)
      .eq("track_name", s.track_name)

  }

}

    const today = new Date().toISOString().split("T")[0]

    for (const artist of ARTISTS) {

      const artistStreams = allData.filter(s =>
        s.artist_name.toUpperCase().includes(artist)
      )

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

      for (const [song, plays] of Object.entries(songCounts)) {
        await supabase.from("ranking_songs").upsert({
          artist,
          track_name: song,
          date: today,
          total_streams: plays
        }, {
          onConflict: "artist,track_name,date"
        })
      }

      for (const [user, plays] of Object.entries(userCounts)) {
        await supabase.from("ranking_users").upsert({
          artist,
          username: user,
          date: today,
          total_streams: plays
        }, {
          onConflict: "artist,username,date"
        })
      }
    }
  }

  useEffect(() => {

    async function init() {
      await loadData()
      await loadRanking()
    }

    init()

    const interval = setInterval(async () => {
      await loadData()
      await loadRanking()
    }, 10 * 60 * 1000)

    return () => clearInterval(interval)

  }, [])

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
  }

  if(range === "month"){
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
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

      {/* BOTONES */}
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

      {ARTISTS.map((artist) => {

        let topSongs: any[] = []
        let topUsers: any[] = []
        let artistStreams: any[] = []

        if (range === "today") {

          artistStreams = filteredStreams.filter(s =>
            s.artist_name.toUpperCase().includes(artist)
          )

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

          topSongs = Object.entries(songCounts)
            .sort((a,b)=>b[1]-a[1])
            .slice(0,5)

          topUsers = Object.entries(userCounts)
            .sort((a,b)=>b[1]-a[1])
            .slice(0,5)

        } else {

          const startStr = startDate.toISOString().split("T")[0]

          const artistUsers = rankingUsers.filter(u =>
            u.artist === artist &&
            u.date >= startStr
          )

          const artistSongs = rankingSongs.filter(s =>
            s.artist === artist &&
            s.date >= startStr
          )

          const userMap: Record<string, number> = {}
          const songMap: Record<string, number> = {}

          artistUsers.forEach(u => {
            userMap[u.username] = (userMap[u.username] || 0) + u.total_streams
          })

          artistSongs.forEach(s => {
            songMap[s.track_name] = (songMap[s.track_name] || 0) + s.total_streams
          })

          topUsers = Object.entries(userMap)
            .sort((a,b)=>b[1]-a[1])
            .slice(0,5)

          topSongs = Object.entries(songMap)
            .sort((a,b)=>b[1]-a[1])
            .slice(0,5)
        }

        return (
          <div key={artist} style={{ marginTop: "60px" }}>
            <h2>{artist}</h2>

            <div style={{
              display: "grid",
              gridTemplateColumns:"1fr 1fr",
              gap:"20px",
              marginTop: "20px"
            }}>

              <div>
                <h3>Top Songs</h3>

                {topSongs.map(([song,plays],index)=>{

                  // 🔥 USAR METADATA
                  const meta = musicMetadata.find(
                    m => m.track_name === song && m.artist.toUpperCase().includes(artist)
                  )

                  return(
                    <div key={song} style={{
                      display:"flex",
                      alignItems:"center",
                      gap:"10px",
                      background:"#111",
                      padding:"10px",
                      borderRadius:"8px",
                      marginTop:"10px"
                    }}>
                      <b style={{ width:"20px" }}>{index+1}</b>

                      {meta?.album_image && (
                        <img src={meta.album_image} width="50" height="50" style={{ borderRadius:"6px" }}/>
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

              <div>
                <h3>Top Fans</h3>

                {topUsers.map(([user,plays],index)=>(
                  <div key={user} style={{
                    background:"#111",
                    padding:"10px",
                    borderRadius:"8px",
                    marginTop:"10px"
                  }}>
                    <b>{index+1}</b>{" "}
                    <span style={{ color:"#ff2e93", marginLeft:"5px" }}>
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
      })}

    </div>
  )
}