export const SPOTIFY_API_BASE = "https://api.spotify.com/v1"

export async function spotifyFetch(token, endpoint, options = {}) {

    if (!token) {
        throw new Error("Missing Spotify access token")
    }

    const res = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...(options.headers || {}),
        },
        cache: "no-store",
    })

    if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(text || `Spotify API request failed (${res.status})`)
    }

    if (res.status === 204) {
        return null
    }

    return res.json()
}

// endpoint helpers

export function fetchMe(token) {
    return spotifyFetch(token, "/me")
}

export function fetchTopTracks(token, { time_range = "short_term", limit = 50 } = {}) {
  const params = new URLSearchParams({ time_range, limit: String(limit) });
  return spotifyFetch(token, `/me/top/tracks?${params}`);
}

// recently playeds

// fetch recs

// create playlist

// add tracks