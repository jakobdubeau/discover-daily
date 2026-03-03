const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY
const RAPIDAPI_HOST = "spotify81.p.rapidapi.com"

async function rapidApiFetch(endpoint) {
    const res = await fetch(`https://${RAPIDAPI_HOST}${endpoint}`, {
        headers: {
            "x-rapidapi-host": RAPIDAPI_HOST,
            "x-rapidapi-key": RAPIDAPI_KEY,
        },
        cache: "no-store",
    })
    if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(`RapidAPI ${endpoint} failed (${res.status}): ${text.slice(0, 200)}`)
    }
    return res.json()
}

// get recommended tracks from a seed track
// calls seed_to_playlist, then fetches the radio playlist's tracks
// returns array of { id, uri, name, artists: [{ name, id }] }
export async function fetchSeedRecommendations(seedUri) {
    // step 1: get radio playlist URI
    const data = await rapidApiFetch(`/seed_to_playlist?uri=${encodeURIComponent(seedUri)}`)
    const playlistUri = data?.mediaItems?.[0]?.uri
    if (!playlistUri) throw new Error("seed_to_playlist returned no playlist URI")

    // step 2: fetch tracks from the radio playlist
    const playlistId = playlistUri.replace("spotify:playlist:", "")
    const contents = await rapidApiFetch(`/playlist_tracks?id=${playlistId}&offset=0&limit=100`)
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
