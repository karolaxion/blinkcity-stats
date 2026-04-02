"use client"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function ProfilePage() {
  
  if (typeof window === "undefined") {
    return null
  }

  const params = useSearchParams()
  
  const usernameFromUrl = params.get("username")
  const usernameFromStorage =
    typeof window !== "undefined"
    ? localStorage.getItem("lastfm_user")
    : null

  const username = usernameFromUrl || usernameFromStorage
  const router = useRouter()

  const [user,setUser] = useState<any>(null)
  const [streams,setStreams] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)

  const [modalOpen,setModalOpen] = useState(false)
  const [range,setRange] = useState<"today"|"yesterday"|"week"|"last_week"|"month"|"last_month"|"all">("today")

  async function loadProfile() {
    if (!username) return
    const { data: user } = await supabase.from("users").select("*").eq("lastfm_username", username).single()
    if (!user) return
    setUser(user)

    // cargar cache de stats
    const { data: cached } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (cached) {
      setStats(cached)
      setStreams(cached.streams ?? []) // opcional, según estructura
    }

    sync() // actualizar en segundo plano
  }

  async function sync() {
    if (!user) return
    await sync100()
    const newTotals = calculateTotals(streams) // <- pasa streams
    await supabase.from("user_stats").upsert({
      user_id: user.id,
      ...newTotals
    })
    setStats(newTotals)
  }

  async function sync100() {
    if (!user) return
    try {
      await fetch(`/api/sync?username=${user.lastfm_username}&mode=100`)
      // no loadProfile() aquí
      await sync() // o si prefieres solo recargar streams en local
    } catch (e) {
      console.error("Sync100 error", e)
    }
  }

  useEffect(()=>{
    if(!user) return
    if(streams.length === 0){
      sync()
    }
  },[user])

  if (!username) return <div>Loading...</div>
  if(!user) return <div>Loading profile...</div>
  if(user && streams.length === 0){
    return <div>Actualizando datos en segundo plano... Esto puede tardar unos minutos.</div>
  }

  // ======================
  // MODAL LOGIC (FIXED)
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
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    endDate = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  if(range === "all"){
    startDate = new Date(0)
    endDate = new Date()
  }

  const modalStreams = streams.filter((s:any)=>{
    const date = new Date(s.played_at)
    return date >= startDate && date < endDate
  })

  const modalSongCounts:any = {}
  const modalArtistCounts:any = {}

  modalStreams.forEach((s:any)=>{
    const artist = s.artist_name.toUpperCase()
    const key = `${artist} — ${s.track_name}`

    modalSongCounts[key] = (modalSongCounts[key]||0)+1
    modalArtistCounts[artist] = (modalArtistCounts[artist]||0)+1
  })

  const modalTopSongs = Object.entries(modalSongCounts)
    .sort((a:any,b:any)=>b[1]-a[1])
    .slice(0,5)

  const modalTopArtists = Object.entries(modalArtistCounts)
    .sort((a:any,b:any)=>b[1]-a[1])
    .slice(0,5)

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