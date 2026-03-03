import { fetchPlaylistTracks } from "./spotifyApi"

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY
const RAPIDAPI_HOST = "spotify81.p.rapidapi.com"

// get recommended tracks from a seed track via RapidAPI seed_to_playlist
// then fetch the radio playlist's tracks via the official Spotify API
// returns array of { id, uri, name, artists: [{ name, id }] }
export async function fetchSeedRecommendations(seedUri, token) {
    // step 1: get radio playlist URI from RapidAPI
    const res = await fetch(
        `https://${RAPIDAPI_HOST}/seed_to_playlist?uri=${encodeURIComponent(seedUri)}`,
        {
            headers: {
                "x-rapidapi-host": RAPIDAPI_HOST,
                "x-rapidapi-key": RAPIDAPI_KEY,
            },
            cache: "no-store",
        }
    )

    if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(`seed_to_playlist failed (${res.status}): ${text.slice(0, 200)}`)
    }

    const data = await res.json()
    const playlistUri = data?.mediaItems?.[0]?.uri
    if (!playlistUri) throw new Error("seed_to_playlist returned no playlist URI")

    // step 2: fetch tracks via official Spotify API
    const playlistId = playlistUri.replace("spotify:playlist:", "")
    const contents = await fetchPlaylistTracks(token, playlistId)
    const items = contents?.items || []

    return items.map(item => {
        const track = item?.track
        if (!track?.uri) return null
        return {
            id: track.uri.replace("spotify:track:", ""),
            uri: track.uri,
            name: track.name,
            artists: (track.artists || []).map(a => ({
                name: a.name,
                id: a.uri?.replace("spotify:artist:", "") || a.id,
            })),
        }
    }).filter(Boolean)
}
