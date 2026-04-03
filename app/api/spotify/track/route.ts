import { NextResponse } from "next/server"

let accessToken = ""
let tokenExpires = 0

async function getSpotifyToken() {

  if (Date.now() < tokenExpires) return accessToken

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic " + Buffer.from(
        process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
      ).toString("base64")
    },
    body: "grant_type=client_credentials"
  })

  const data = await res.json()

  accessToken = data.access_token
  tokenExpires = Date.now() + data.expires_in * 1000

  return accessToken
}

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url)

  const track = searchParams.get("track")
  const artist = searchParams.get("artist")

  if (!track || !artist) {
    return NextResponse.json({ image: null })
  }

  const token = await getSpotifyToken()

  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(track + " " + artist)}&type=track&limit=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  const data = await res.json()

  const image = data?.tracks?.items?.[0]?.album?.images?.[0]?.url || null

  return NextResponse.json({ image })
}