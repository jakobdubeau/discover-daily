export const SPOTIFY_API_BASE = "https://api.spotify.com/v1"

// endpoint attaches to end of base url
// options are methods, headers, body, etc.
export async function spotifyFetch(token, endpoint, options = {}) {

    if (!token) {
        throw new Error("Missing Spotify access token")
    }

    // ... is spread operator, take all properties of options and copy them here
    // basically removes the options container so fetch can read the contents directly
    const res = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
            ...(typeof options.body === "string" ? { "Content-Type": "application/json" } : {}),
            ...(options.headers || {}),
        },
        cache: "no-store",
    })

    if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(text || `Spotify API request failed (${res.status})`)
    }

    // successful but no body
    if (res.status === 204) {
        return null
    }

    return res.json()
}

// endpoint helpers

export function fetchMe(token) {
    return spotifyFetch(token, "/me")
}

// second param is object, pull out those w destructuring, set default values and empty default
// ex url endpoint: /me/top/tracks?time_range=short_term&limit=50
export function fetchTopTracks(token, { time_range = "short_term", limit = 50 } = {}) {
  const params = new URLSearchParams({ time_range, limit: String(limit) })
  return spotifyFetch(token, `/me/top/tracks?${params}`)
}

export function fetchRecentTracks(token, { limit = 50 } = {}) {
    const params = new URLSearchParams({ limit: String(limit) })
    return spotifyFetch(token, `/me/player/recently-played?${params}`)
}

export function fetchRecommendations(token, { seed_tracks = [], limit = 100 } = {}) {
    if (seed_tracks.length === 0) {
        throw new Error("At least one seed track is required")
    }
    // extract first 5 elements from seed_tracks,  then join with comma into single string
    const seeds = seed_tracks.slice(0,5).join(",")
    const params = new URLSearchParams({ seed_tracks: seeds, limit: String(limit)})
    return spotifyFetch(token, `/recommendations?${params}`)
}

export function createPlaylist(token, { name, isPublic = false, description = "" }) {
    return spotifyFetch(token, `/me/playlists`, {
        method: "POST",
        body: JSON.stringify({
            name,
            public: isPublic,
            description,
        })
    })
}

export function addTracks(token, playlistId, uris) {
    return spotifyFetch(token, `/playlists/${playlistId}/items`, {
        method: "POST",
        body: JSON.stringify({
            uris
        })
    })
}