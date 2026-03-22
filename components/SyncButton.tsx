"use client"

import { useState } from "react"

export default function SyncButton({ username }: { username: string }) {

  const [syncing,setSyncing] = useState(false)

  async function syncStreams(){

    setSyncing(true)

    await fetch(`/api/sync?username=${username}`)

    setSyncing(false)

    location.reload()

  }

  return(

    <button
      onClick={syncStreams}
      style={{
        padding:"10px 18px",
        background:"#ff2e93",
        color:"white",
        border:"none",
        borderRadius:"8px"
      }}
    >
      {syncing ? "Updating..." : "Update Streams"}
    </button>

  )

}