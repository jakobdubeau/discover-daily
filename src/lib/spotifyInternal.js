import { getInternalToken, getClientToken } from "./spotifyTokens"

// fetch related artists via internal GraphQL
// returns array of { id, name, uri }
export async function fetchRelatedArtists(artistId) {
    const token = await getInternalToken()
    const clientToken = await getClientToken()

    const res = await fetch("https://api-partner.spotify.com/pathfinder/v2/query", {
        method: "POST",
        headers: {
            authorization: `Bearer ${token}`,
            "client-token": clientToken,
            "content-type": "application/json;charset=UTF-8",
            "app-platform": "WebPlayer",
        },
        body: JSON.stringify({
            variables: { uri: `spotify:artist:${artistId}` },
            operationName: "queryArtistRelated",
            extensions: {
                persistedQuery: {
                    version: 1,
                    sha256Hash: "3d031d6cb22a2aa7c8d203d49b49df731f58b1e2799cc38d9876d58771aa66f3",
                },
            },
        }),
        cache: "no-store",
    })

    if (!res.ok) {
        const body = await res.text().catch(() => "")
        console.error(`Related artists failed (${res.status}):`, body.slice(0, 300))
        throw new Error(`Related artists request failed (${res.status})`)
    }

    const data = await res.json()
    const items = data?.data?.artistUnion?.relatedContent?.relatedArtists?.items || []

    return items.map(item => ({
        id: item.id,
        name: item.profile?.name,
        uri: item.uri,
    }))
}

// get recommended tracks from a seed track
// calls seed_to_playlist, gets radio playlist URI, fetches playlist contents
// returns array of { id, uri, name, artists: [{ name, id }] }
export async function fetchSeedRecommendations(seedUri) {
    const token = await getInternalToken()

    // get radio playlist URI from seed
    const res = await fetch(
        `https://spclient.wg.spotify.com/inspiredby-mix/v2/seed_to_playlist/${seedUri}?response-format=json`,
        {
            headers: {
                authorization: `Bearer ${token}`,
                "app-platform": "WebPlayer",
                accept: "application/json",
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

    // fetch the radio playlist's tracks
    const contents = await fetchPlaylistContents(playlistUri)
    const items = contents?.data?.playlistV2?.content?.items || []

    return items.map(item => {
        const track = item?.itemV2?.data
        if (!track?.uri) return null
        return {
            id: track.uri.replace("spotify:track:", ""),
            uri: track.uri,
            name: track.name,
            artists: (track.artists?.items || []).map(a => ({
                name: a?.profile?.name,
                id: a?.uri?.replace("spotify:artist:", ""),
            })),
        }
    }).filter(Boolean)
}

// fetch playlist contents via internal GraphQL
// playlistUri format: "spotify:playlist:37i9dQZF1E8QHlsuPQvLAd"

export async function fetchPlaylistContents(playlistUri) {
    const token = await getInternalToken()
    const clientToken = await getClientToken()

    const res = await fetch("https://api-partner.spotify.com/pathfinder/v2/query", {
        method: "POST",
        headers: {
            authorization: `Bearer ${token}`,
            "client-token": clientToken,
            "content-type": "application/json;charset=UTF-8",
            "app-platform": "WebPlayer",
        },
        body: JSON.stringify({
            variables: { uri: playlistUri, offset: 0, limit: 50 },
            operationName: "fetchPlaylistContents",
            extensions: {
                persistedQuery: {
                    version: 1,
                    sha256Hash: "7982b11e21535cd2594badc40030b745671b61a1fa66766e569d45e6364f3422",
                },
            },
        }),
        cache: "no-store",
    })

    if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(`fetchPlaylistContents failed (${res.status}): ${body.slice(0, 200)}`)
    }

    return res.json()
}
