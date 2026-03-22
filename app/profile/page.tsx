"use client"

import PrivacyButton from "@/components/PrivacyButton"
import SyncButton from "@/components/SyncButton"
import { useEffect, useState } from "react"

export default function ProfilePage() {

  const [user,setUser] = useState<any>(null)
  const [streams,setStreams] = useState<any[]>([])
  const [isPublic,setIsPublic] = useState(true)

  async function loadProfile(){

    const res = await fetch("/api/profile")
    const data = await res.json()

    setUser(data.user)
    setStreams(data.streams)

  }

  // sync automático (se mantiene)
  async function sync(){

    if(!user) return

    // 🔥 NUEVO: crear job en cola
    await fetch("/api/create-sync-job", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: user.lastfm_username
      })
    })

    try{
      await fetch(`/api/sync?username=${user.lastfm_username}`)

      if(streams.length === 0){
        await loadProfile()
      }

    }catch(e){
      console.error("Sync error", e)
    }

  }

  useEffect(()=>{
    loadProfile()
  },[])

  // ✅ FIX: evitar doble sync
  useEffect(()=>{

    if(!user) return

    if(streams.length === 0){
      sync()
    }

  },[user])

  // ✅ PASO 2
  if(!user) return <div>Loading profile...</div>

  if(user && streams.length === 0){
    return <div>Importing your listening history...</div>
  }

  const songCounts:any = {}
  const artistCounts:any = {}

  const FANDOM_ARTISTS = [
    "BLACKPINK",
    "JENNIE",
    "ROSÉ",
    "JISOO",
    "LISA"
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

    const songKey = `${fandomArtist} — ${s.track_name}`
    songCounts[songKey] = (songCounts[songKey]||0)+1

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

      <div
        style={{
          display:"flex",
          justifyContent:"space-between",
          alignItems:"center"
        }}
      >

        <div>

          <h1 style={{margin:0}}>
            {user.lastfm_username}
          </h1>

          <p style={{opacity:.6}}>
            {streams.length} Streams
          </p>

        </div>

        <a
          href="/ranking"
          style={{
            background:"#ff2e93",
            padding:"10px 18px",
            borderRadius:"8px",
            color:"white",
            textDecoration:"none",
            fontWeight:"bold"
          }}
        >
          View Ranking
        </a>

      </div>

      {/* TOPS */}

      <div
        style={{
          display:"grid",
          gridTemplateColumns:"1fr 1fr",
          gap:"60px",
          marginTop:"40px"
        }}
      >

        <div>

          <h2>Top Songs</h2>

          {topSongs.map(([song,plays]:any,index:number)=>{

            const stream = streams.find(
              (s:any)=>`${s.artist_name.toUpperCase().includes("BLACKPINK") ? "BLACKPINK" : s.artist_name.toUpperCase()} — ${s.track_name}`===song
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

        <div>

          <h2>Top Artists</h2>

          {topArtists.map(([artist,plays]:any,index:number)=>{

            const stream = streams.find(
              (s:any)=>s.artist_name.toUpperCase().includes(artist)
            )

            return(

              <div
                key={artist}
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

                {stream?.artist_image &&(

                  <img
                    src={stream.artist_image}
                    width="50"
                    height="50"
                    style={{borderRadius:"50%"}}
                  />

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

      <div
        style={{
          marginTop:"30px",
          display:"flex",
          gap:"12px"
        }}
      >

        <a
          href="/"
          style={{
            padding:"10px 18px",
            background:"#111",
            color:"white",
            borderRadius:"8px",
            textDecoration:"none"
          }}
        >
          Logout
        </a>

      </div>

    </div>

  )

}