const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!

async function getAccessToken() {

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

  return data.access_token
}

export async function searchTrack(track: string, artist: string) {

  const token = await getAccessToken()

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
    id: item.id, // ← agregado para guardar spotify_track_id
    albumImage: item.album.images?.[0]?.url || null,
    albumName: item.album.name,
  }
}

export async function getArtistImage(artist: string) {

  const token = await getAccessToken()

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