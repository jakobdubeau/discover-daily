import "server-only"
import { generateDeveloperToken } from "./appleMusicAuth"

const APPLE_MUSIC_API_BASE = "https://api.music.apple.com"

async function appleMusicFetch(endpoint) {
    const token = generateDeveloperToken()

    const res = await fetch(`${APPLE_MUSIC_API_BASE}${endpoint}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    })

    if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(text || `Apple Music API request failed (${res.status})`)
    }

    return res.json()
}

export function searchArtist(artistName) {
    const params = new URLSearchParams({ term: artistName, types: "artists", limit: "1" })
    return appleMusicFetch(`/v1/catalog/us/search?${params}`)
}

export function fetchSimilarArtists(artistId) {
    return appleMusicFetch(`/v1/catalog/us/artists/${artistId}/view/similar-artists`)
}
