import { fandomCollaborations } from "./fandomCollaborations"

export function detectFandomArtist(artist: string, track: string) {

  const a = artist.toUpperCase()
  const t = track.toUpperCase()

  const text = `${a} ${t}`

  // prioridad a integrantes si aparecen en título

  if (text.includes("JENNIE")) {
    return "JENNIE"
  }

  if (text.includes("ROSÉ") || text.includes("ROSE")) {
    return "ROSÉ"
  }

  if (text.includes("JISOO")) {
    return "JISOO"
  }

  if (text.includes("LISA")) {
    return "LISA"
  }

  // revisar colaboraciones definidas manualmente

  const collab = fandomCollaborations.find(c =>
    a.includes(c.originalArtist) && t.includes(c.track)
  )

  if (collab) {
    return collab.fandomArtist
  }

  // grupo al final

  if (text.includes("BLACKPINK")) {
    return "BLACKPINK"
  }

  return null
}