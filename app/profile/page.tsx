"use client"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function ProfilePage() {
  if (typeof window === "undefined") return null

  const params = useSearchParams()
  const usernameFromUrl = params.get("username")
  const usernameFromStorage = localStorage.getItem("lastfm_user")
  const username = usernameFromUrl || usernameFromStorage
  const router = useRouter()

  useEffect(() => {
    if (!usernameFromUrl && usernameFromStorage) {
      router.replace(`/profile?username=${usernameFromStorage}`)
    }
  }, [usernameFromUrl])

  const [user, setUser] = useState<any>(null)
  const [streams, setStreams] = useState<any[]>([])
  const [dailyStats, setDailyStats] = useState<any[]>([])
  const [songDailyStats, setSongDailyStats] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [range, setRange] = useState<"today"|"yesterday"|"week"|"last_week"|"month"|"last_month"|"all">("today")

  async function loadProfile() {
    if (!username) return

    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("lastfm_username", username)
      .single()

    if (!userData) return

    setUser(userData)

    const { data: userStreams } = await supabase
      .from("streams")
      .select("*")
      .eq("user_id", userData.id)
      .order("played_at", { ascending: false })

    setStreams(userStreams ?? [])

    const todayLocal = new Date()
    const yyyy = todayLocal.getFullYear()
    const mm = String(todayLocal.getMonth()+1).padStart(2,"0")
    const dd = String(todayLocal.getDate()).padStart(2,"0")
    const today = `${yyyy}-${mm}-${dd}`

    // DAILY TOTAL
    const todayCount = (userStreams ?? []).filter((s:any)=>{
      const d = new Date(s.played_at)
      const local = new Date(d.getTime() - d.getTimezoneOffset()*60000)
        .toISOString()
        .split("T")[0]

      return local === today
    }).length

    await supabase.from("user_daily_stats").upsert({
      user_id: userData.id,
      date: today,
      total_streams: todayCount
    }, {
      onConflict: "user_id,date"
    })

    // SONG DAILY
    const songMap: Record<string, number> = {}

    ;(userStreams ?? []).forEach((s:any)=>{
      const d = new Date(s.played_at)

      const local = new Date(d.getTime() - d.getTimezoneOffset()*60000)
        .toISOString()
        .split("T")[0]

      if (local !== today) return

      const key = `${s.artist_name}|||${s.track_name}`
      songMap[key] = (songMap[key] || 0) + 1
    })

    for (const key in songMap) {
      const [artist, track] = key.split("|||")

      await supabase.from("user_song_daily_stats").upsert({
        user_id: userData.id,
        date: today,
        artist,
        track_name: track,
        total_streams: songMap[key]
      }, {
        onConflict: "user_id,date,artist,track_name"
      })
    }

    const { data: stats } = await supabase
      .from("user_daily_stats")
      .select("*")
      .eq("user_id", userData.id)

    setDailyStats(stats || [])

    const { data: songStats } = await supabase
      .from("user_song_daily_stats")
      .select("*")
      .eq("user_id", userData.id)

    setSongDailyStats(songStats || [])

    sync(userData)
  }

  async function sync(currentUser:any) {
    if (!currentUser) return

    await fetch(`/api/sync?username=${currentUser.lastfm_username}&mode=100`)

    const { data: userStreams } = await supabase
      .from("streams")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("played_at", { ascending: false })

    setStreams(userStreams ?? [])
  }

  async function sync100() {
    if (!user) return
    await sync(user)
  }

  useEffect(() => {
    if (!username) return
    loadProfile()
  }, [username])

  if (!username) return <div>Loading...</div>
  if (!user) return <div>Loading profile...</div>

  // ======================
  // FECHAS
  // ======================

  const now = new Date()
  let startDate = new Date(0)
  let endDate = new Date()

  if(range === "today"){
    startDate = new Date()
    startDate.setHours(0,0,0,0)
    endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 1)
  }

  if(range === "yesterday"){
    startDate = new Date()
    startDate.setDate(startDate.getDate() - 1)
    startDate.setHours(0,0,0,0)
    endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 1)
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

  if(range === "all"){
    startDate = new Date(0)
  }

  // ======================
  // TOPS (FIX FINAL)
  // ======================

  let modalTopSongs:any[] = []
  let modalTopArtists:any[] = []

  if (range === "today") {

    const modalStreams = streams.filter((s:any)=>{
      const date = new Date(s.played_at)
      return date >= startDate && date < endDate
    })

    const songCounts:any = {}
    const artistCounts:any = {}

    modalStreams.forEach((s:any)=>{
      const artist = s.artist_name.toUpperCase()
      const key = `${artist} — ${s.track_name}`

      songCounts[key] = (songCounts[key]||0)+1
      artistCounts[artist] = (artistCounts[artist]||0)+1
    })

    modalTopSongs = Object.entries(songCounts)
      .sort((a:any,b:any)=>b[1]-a[1])
      .slice(0,5)

    modalTopArtists = Object.entries(artistCounts)
      .sort((a:any,b:any)=>b[1]-a[1])
      .slice(0,5)

  } else {

    const startStr = startDate.toISOString().split("T")[0]

    const filtered = songDailyStats.filter((s:any)=> s.date >= startStr)

    const songCounts:any = {}
    const artistCounts:any = {}

    filtered.forEach((s:any)=>{
      const key = `${s.artist} — ${s.track_name}`

      songCounts[key] = (songCounts[key] || 0) + s.total_streams
      artistCounts[s.artist] = (artistCounts[s.artist] || 0) + s.total_streams
    })

    modalTopSongs = Object.entries(songCounts)
      .sort((a:any,b:any)=>b[1]-a[1])
      .slice(0,5)

    modalTopArtists = Object.entries(artistCounts)
      .sort((a:any,b:any)=>b[1]-a[1])
      .slice(0,5)
  }

  // ======================
  // NORMAL STATS
  // ======================

  const songCounts:any = {}
  const artistCounts:any = {}

  const FANDOM_ARTISTS = [
    "BLACKPINK","JENNIE","ROSÉ","JISOO","LISA"
  ]

  streams.forEach((s:any)=>{

    let artistUpper = s.artist_name.toUpperCase()

    if(artistUpper === "ROSE"){
      artistUpper = "ROSÉ"
    }

    let fandomArtist:any = null

    for(const artist of FANDOM_ARTISTS){
      if(artistUpper.includes(artist)){
        fandomArtist = artist
      }
      if(artist === "ROSÉ" && artistUpper.includes("ROSE")){
        fandomArtist = "ROSÉ"
      }
    }

    if(!fandomArtist) return

    const key = `${fandomArtist} — ${s.track_name}`

    songCounts[key] = (songCounts[key]||0)+1
    artistCounts[fandomArtist] = (artistCounts[fandomArtist]||0)+1
  })

  const topSongs = Object.entries(songCounts)
    .sort((a:any,b:any)=>b[1]-a[1])
    .slice(0,10)

  const topArtists = Object.entries(artistCounts)
    .sort((a:any,b:any)=>b[1]-a[1])
    .slice(0,10)

  return(

    <div style={{padding:"40px"}}>

      {/* HEADER */}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>

        <div>
          <h1 style={{margin:0}}>{user.lastfm_username}</h1>
          <p style={{opacity:.6}}>{streams.length} Streams</p>
        </div>

        <a href="/ranking" style={{
          background:"#ff2e93",
          padding:"10px 18px",
          borderRadius:"8px",
          color:"white",
          textDecoration:"none",
          fontWeight:"bold"
        }}>
          View Ranking
        </a>

      </div>

      {/* MENSAJE DE ACTUALIZACIÓN SI NO HAY STREAMS */}
      {streams.length === 0 && (
        <div style={{
          background: "#ff2e93",
          color: "white",
          padding: "10px",
          borderRadius: "8px",
          marginTop: "20px",
          textAlign: "center"
        }}>
          Actualizando datos en segundo plano... Esto puede tardar unos minutos.
        </div>
      )}

      {/* BOTONES */}

      <div style={{display:"flex",flexDirection:"column",gap:"8px",marginTop:"20px"}}>

        <div style={{display:"flex",gap:"10px"}}>
          <button onClick={()=>{setRange("today");setModalOpen(true)}} style={{background:range==="today"?"#ff2e93":"#111",color:"white"}}>Today</button>
          <button onClick={()=>{setRange("yesterday");setModalOpen(true)}} style={{background:range==="yesterday"?"#ff2e93":"#111",color:"white"}}>Yesterday</button>
        </div>

        <div style={{display:"flex",gap:"10px"}}>
          <button onClick={()=>{setRange("week");setModalOpen(true)}} style={{background:range==="week"?"#ff2e93":"#111",color:"white"}}>This Week</button>
          <button onClick={()=>{setRange("last_week");setModalOpen(true)}} style={{background:range==="last_week"?"#ff2e93":"#111",color:"white"}}>Last Week</button>
        </div>

        <div style={{display:"flex",gap:"10px"}}>
          <button onClick={()=>{setRange("month");setModalOpen(true)}} style={{background:range==="month"?"#ff2e93":"#111",color:"white"}}>This Month</button>
          <button onClick={()=>{setRange("last_month");setModalOpen(true)}} style={{background:range==="last_month"?"#ff2e93":"#111",color:"white"}}>Last Month</button>
        </div>

        <div>
          <button onClick={()=>{setRange("all");setModalOpen(true)}} style={{background:range==="all"?"#ff2e93":"#111",color:"white"}}>All</button>
        </div>

      </div>

      {/* TOPS */}

      <div style={{
        display:"grid",
        gridTemplateColumns:"1fr 1fr",
        gap:"20px",
        marginTop:"40px"
      }}>

        <div>
          <h2>Top Songs</h2>

          {topSongs.map(([song,plays]:any,index:number)=>{

            const stream = streams.find(
              (s:any)=>`${s.artist_name.toUpperCase()} — ${s.track_name}`===song
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

        <div>
          <h2>Top Artists</h2>

          {topArtists.map(([artist,plays]:any,index:number)=>{

            const stream = streams.find(
              (s:any)=>s.artist_name.toUpperCase().includes(artist)
            )

            return(
              <div key={artist} style={{
                display:"flex",
                alignItems:"center",
                gap:"10px",
                background:"#111",
                padding:"12px",
                borderRadius:"12px",
                marginTop:"10px"
              }}>
                <b>{index+1}</b>

                {stream?.artist_image &&(
                  <img src={stream.artist_image} width="50" height="50" style={{borderRadius:"50%"}}/>
                )}

                <div>
                  <div>{artist}</div>
                  <div style={{fontSize:"12px",opacity:.6}}>
                    {plays} Streams
                  </div>
                </div>

              </div>
            )
          })}
        </div>

      </div>

      {/* BUTTONS */}

      <div style={{marginTop:"30px",display:"flex",gap:"12px"}}>

        <button onClick={sync100} style={{
          padding:"10px 18px",
          background:"#ff2e93",
          color:"white",
          borderRadius:"8px",
          border:"none",
          cursor:"pointer",
          fontWeight:"bold"
        }}>
          Load last 100 scrobbles
        </button>

        <a href="/" style={{
          padding:"10px 18px",
          background:"#111",
          color:"white",
          borderRadius:"8px",
          textDecoration:"none"
        }}>
          Logout
        </a>

      </div>

      {/* MODAL */}

      {modalOpen && (

        <div style={{
          position:"fixed",
          top:0,left:0,
          width:"100%",height:"100%",
          background:"rgba(0,0,0,0.7)",
          display:"flex",
          justifyContent:"center",
          alignItems:"center",
          zIndex:1000
        }}>

          <div style={{
            background:"#111",
            padding:"20px",
            borderRadius:"12px",
            width:"90%",
            maxWidth:"600px",
            maxHeight:"90%",
            overflowY:"auto"
          }}>

            <h2>
              {range==="today" && "Today"}
              {range==="yesterday" && "Yesterday"}
              {range==="week" && "This Week"}
              {range==="last_week" && "Last Week"}
              {range==="month" && "This Month"}
              {range==="last_month" && "Last Month"}
              {range==="all" && "All Time"}
            </h2>

            <div style={{
              display:"grid",
              gridTemplateColumns:"1fr 1fr",
              gap:"20px",
              marginTop:"20px"
            }}>

              <div>
                <h3>Top Songs</h3>

                {modalTopSongs.map(([song,plays]:any,index:number)=>{

                  const stream = streams.find(
                    (s:any)=>`${s.artist_name.toUpperCase()} — ${s.track_name}`===song
                  )

                  return(
                    <div key={song} style={{
                      display:"flex",
                      alignItems:"center",
                      gap:"10px",
                      background:"#1a1a1a",
                      padding:"10px",
                      borderRadius:"10px",
                      marginTop:"10px"
                    }}>
                      <b>{index+1}</b>

                      {stream?.album_image &&(
                        <img src={stream.album_image} width="45" height="45" style={{borderRadius:"6px"}}/>
                      )}

                      <div>
                        <div style={{fontSize:"13px"}}>{song}</div>
                        <div style={{fontSize:"11px",opacity:.6}}>
                          {plays} streams
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div>
                <h3>Top Artists</h3>

                {modalTopArtists.map(([artist,plays]:any,index:number)=>{

                  const stream = streams.find(
                    (s:any)=>s.artist_name.toUpperCase() === artist
                  )

                  return(
                    <div key={artist} style={{
                      display:"flex",
                      alignItems:"center",
                      gap:"10px",
                      background:"#1a1a1a",
                      padding:"10px",
                      borderRadius:"10px",
                      marginTop:"10px"
                    }}>
                      <b>{index+1}</b>

                      {stream?.artist_image &&(
                        <img src={stream.artist_image} width="45" height="45" style={{borderRadius:"50%"}}/>
                      )}

                      <div>
                        <div>{artist}</div>
                        <div style={{fontSize:"11px",opacity:.6}}>
                          {plays} streams
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

            </div>

            <button onClick={()=>setModalOpen(false)} style={{
              marginTop:"20px",
              width:"100%",
              padding:"10px",
              background:"#ff2e93",
              border:"none",
              borderRadius:"8px",
              color:"white",
              fontWeight:"bold"
            }}>
              Close
            </button>

          </div>

        </div>

      )}

    </div>
  )
}

function calculateTotals(streams: any[]) {
  const totalStreams = streams.length
  const uniqueArtists = new Set(streams.map((s:any)=>s.artist_name)).size

  const artistCounts:any = {}
  streams.forEach((s:any) => {
    const artist = (s.artist_name ?? "").toUpperCase()
    if (!artist) return
    artistCounts[artist] = (artistCounts[artist] || 0) + 1
  })

  const [topArtist] = Object.entries(artistCounts)
    .sort((a:any,b:any)=> b[1]-a[1])

  return {
    total_streams: totalStreams,
    unique_artists: uniqueArtists,
    top_artist: topArtist ? topArtist[0] : null,
    updated_at: new Date().toISOString()
  }
}