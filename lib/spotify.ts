const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!

let cachedToken: string | null = null
let tokenExpires = 0

export async function getAccessToken() {

  // 🔥 usar token cacheado si aún sirve
  if (cachedToken && Date.now() < tokenExpires) {
    return cachedToken
  }

  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  const data = await res.json()

  if (!data.access_token) {
    console.error("SPOTIFY TOKEN ERROR:", data)
    return null
  }

  // 🔥 guardar token en memoria (1 hora)
  cachedToken = data.access_token
  tokenExpires = Date.now() + (data.expires_in - 60) * 1000

  return cachedToken
}

export async function searchTrack(track: string, artist: string) {

  const token = await getAccessToken()
  if (!token) return null

  const query = encodeURIComponent(`track:${track} artist:${artist}`)

  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  const data = await res.json()

  const item = data.tracks?.items?.[0]

  if (!item) return null

  return {
    id: item.id,
    albumImage: item.album.images?.[0]?.url || null,
    albumName: item.album.name,
  }
}

export async function getArtistImage(artist: string) {

  const token = await getAccessToken()
  if (!token) return null

  const query = encodeURIComponent(artist)

  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${query}&type=artist&limit=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  const data = await res.json()

  const item = data.artists?.items?.[0]

  if (!item) return null

  return item.images?.[0]?.url || null
}