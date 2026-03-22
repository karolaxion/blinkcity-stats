import crypto from "crypto"

const API_KEY = process.env.NEXT_PUBLIC_LASTFM_API_KEY!
const API_SECRET = process.env.LASTFM_API_SECRET!

export async function getSession(token: string) {

  const signature = crypto
    .createHash("md5")
    .update(`api_key${API_KEY}methodauth.getSessiontoken${token}${API_SECRET}`)
    .digest("hex")

  const url =
    `https://ws.audioscrobbler.com/2.0/?method=auth.getSession` +
    `&api_key=${API_KEY}` +
    `&token=${token}` +
    `&api_sig=${signature}` +
    `&format=json`

  const res = await fetch(url)
  const data = await res.json()

  return data
}


// NUEVA FUNCIÓN ↓↓↓

export async function getRecentTracks(username: string, page = 1) {

  const url =
    `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks` +
    `&user=${username}` +
    `&api_key=${API_KEY}` +
    `&limit=200` +
    `&page=${page}` +
    `&format=json`

  const res = await fetch(url)

  const data = await res.json()

  return data?.recenttracks?.track || []
}