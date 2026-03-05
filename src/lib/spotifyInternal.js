const RAPIDAPI_HOST = "spotify81.p.rapidapi.com"

async function rapidApiFetch(endpoint, apiKey) {
    const res = await fetch(`https://${RAPIDAPI_HOST}${endpoint}`, {
        headers: {
            "x-rapidapi-host": RAPIDAPI_HOST,
            "x-rapidapi-key": apiKey,
        },
        cache: "no-store",
    })
    if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(`RapidAPI ${endpoint} failed (${res.status}): ${text.slice(0, 200)}`)
    }
    return res.json()
}

// step 1: get radio playlist ID from a seed track
export async function fetchRadioPlaylistId(seedUri, apiKey) {
    const data = await rapidApiFetch(`/seed_to_playlist?uri=${encodeURIComponent(seedUri)}`, apiKey)
    const playlistUri = data?.mediaItems?.[0]?.uri
    if (!playlistUri) throw new Error("seed_to_playlist returned no playlist URI")
    return playlistUri.replace("spotify:playlist:", "")
}

// step 2: fetch tracks from a radio playlist
// returns array of { id, uri, name, artists: [{ name, id }] }
export async function fetchPlaylistTracks(playlistId, apiKey) {
    const contents = await rapidApiFetch(`/playlist_tracks?id=${playlistId}&offset=0&limit=100`, apiKey)
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

// convenience: both steps with a single key (used for single-key fallback)
export async function fetchSeedRecommendations(seedUri, apiKey) {
    const playlistId = await fetchRadioPlaylistId(seedUri, apiKey)
    return fetchPlaylistTracks(playlistId, apiKey)
}
