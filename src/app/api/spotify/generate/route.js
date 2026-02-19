import { cookies } from 'next/headers';
import {
    fetchMe,
    fetchTopTracks,
    fetchTopArtists,
    fetchRecentTracks,
    searchTracks,
    createPlaylist,
    addTracks
} from '@/lib/spotifyApi';

import {
    searchArtist,
    fetchSimilarArtists
} from '@/lib/appleMusicApi';

import {
    removeDuplicates,
    countRecentPlays,
    filterByRecentPlays,
    mixTaste
} from '@/lib/playlistRules';

export const dynamic = 'force-dynamic'

export async function POST() {

    const cookieStore = await cookies()
    const token = cookieStore.get("spotify_access_token")?.value
    
    if (!token) {
        return new Response("No access token", { status: 401 })
    }

    try {

        // get user id
        const me = await fetchMe(token)
        const userId = me?.id
        if (!userId) {
            return new Response("Missing user id", { status: 400 })
        }

        // fetch all spotify data in parallel
        const [top, topShort, topMedium, recent] = await Promise.all([
            fetchTopTracks(token, { time_range: "short_term", limit: 50 }),
            fetchTopArtists(token, { time_range: "short_term", limit: 50 }),
            fetchTopArtists(token, { time_range: "medium_term", limit: 50 }),
            fetchRecentTracks(token, { limit: 50 }),
        ])

        const topTracks = top?.items || []
        const shortArtists = topShort?.items || []
        const mediumArtists = topMedium?.items || []
        const recentTracks = recent?.items || []

        // combine both for filtering (all known artists)
        const seenNames = new Set()
        const topArtists = [...shortArtists, ...mediumArtists].filter(a => {
            const name = a.name.toLowerCase()
            if (seenNames.has(name)) return false
            seenNames.add(name)
            return true
        })

        // make sure enough top artists to use for seeds
        if (shortArtists.length < 10) {
            return new Response("Not enough listening history yet", { status: 400 })
        }

        // randomly pick seeds from each pool for variety between generations
        const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)
        const closeSeeds = shuffle(shortArtists.slice(0, 15)).slice(0, 8)
        const exploreSeeds = shuffle(mediumArtists.slice(5, 25)).slice(0, 8)

        const closeRelated = []
        const exploreRelated = []

        // find similar artists via apple music for each seed
        const findSimilarForArtist = async (artist) => {
            const searchData = await searchArtist(artist.name)
            const appleId = searchData?.results?.artists?.data?.[0]?.id
            if (!appleId) return []

            const similarData = await fetchSimilarArtists(appleId)
            const similar = similarData?.data || []
            return similar.map(a => ({ name: a.attributes?.name }))
        }

        const [closeResults, exploreResults] = await Promise.all([
            Promise.allSettled(closeSeeds.map(findSimilarForArtist)),
            Promise.allSettled(exploreSeeds.map(findSimilarForArtist)),
        ])

        const closeFailed = closeResults.filter(r => r.status === "rejected")
        const exploreFailed = exploreResults.filter(r => r.status === "rejected")
        console.log(`Apple Music: close ${closeResults.length - closeFailed.length}/${closeResults.length} ok, explore ${exploreResults.length - exploreFailed.length}/${exploreResults.length} ok`)
        if (closeFailed[0]) console.error("Sample error:", closeFailed[0].reason?.message || closeFailed[0].reason)

        for (const r of closeResults) if (r.status === "fulfilled") closeRelated.push(...r.value)
        for (const r of exploreResults) if (r.status === "fulfilled") exploreRelated.push(...r.value)

        // remove duplicate related artists, remove users top artists (by name since apple music ids differ from spotify)
        const topArtistNames = new Set(topArtists.map(a => a.name.toLowerCase()))
        const removeDuplicateArtists = (artists) => {
            const seen = new Set()
            return artists.filter(a => {
                const name = a.name?.toLowerCase()
                if (!name || topArtistNames.has(name) || seen.has(name)) return false
                seen.add(name)
                return true
            })
        }

        const closeArtists = removeDuplicateArtists(closeRelated).slice(0, 15)
        const exploreArtists = removeDuplicateArtists(exploreRelated).slice(0, 15)

        // search for tracks by each related artist (parallelized)
        const searchArtistTracks = async (artist) => {
            const data = await searchTracks(token, `artist:${artist.name}`, { limit: 10 })
            const items = data?.tracks?.items || []
            return items.map(t => ({
                id: t.id,
                uri: t.uri,
                name: t.name,
                artists: (t.artists || []).map(a => ({ name: a.name, id: a.id })),
            }))
        }

        const [closeTrackResults, exploreTrackResults] = await Promise.all([
            Promise.allSettled(closeArtists.map(searchArtistTracks)),
            Promise.allSettled(exploreArtists.map(searchArtistTracks)),
        ])

        let closeCandidates = closeTrackResults.filter(r => r.status === "fulfilled").flatMap(r => r.value)
        let exploreCandidates = exploreTrackResults.filter(r => r.status === "fulfilled").flatMap(r => r.value)

        closeCandidates = removeDuplicates(closeCandidates, topArtists)
        exploreCandidates = removeDuplicates(exploreCandidates, topArtists)

        // get recent counts of recently played tracks
        const recentCounts = countRecentPlays(recentTracks)

        // filter by recently played so we get more new songs
        closeCandidates = filterByRecentPlays(closeCandidates, recentCounts, { threshold: 3 })
        exploreCandidates = filterByRecentPlays(exploreCandidates, recentCounts, { threshold: 3 })

        // later
        // liked songs filter
        // past gens filter
        // artist repeat limit filter
        
        let finalTracks = mixTaste({
            closeTracks: closeCandidates,
            exploreTracks: exploreCandidates,
            total: 20,
            closeRatio: 0.5,
        })

        console.log(`Pipeline: closeRelated=${closeRelated.length} exploreRelated=${exploreRelated.length} closeArtists=${closeArtists.length} exploreArtists=${exploreArtists.length} closeCandidates=${closeCandidates.length} exploreCandidates=${exploreCandidates.length} final=${finalTracks.length}`)

        if (finalTracks.length < 10) {
            return new Response("Not enough tracks after filtering", { status: 400 })
        }

        const today = new Date().toISOString().slice(0, 10)
        const playlistName = `Discover Daily - ${today}`

        const created = await createPlaylist(token, {
            name: playlistName,
            isPublic: false,
            description: "Generated by Discover Daily"
        })

        const playlistId = created?.id
        const playlistUrl = created?.external_urls?.spotify

        if (!playlistId) {
            return new Response("Failed to create playlist", { status: 400 })
        }

        // spotify add tracks endpoint needs uris from tracks
        const uris = finalTracks.map(track => track?.uri).filter(Boolean)
        await addTracks(token, playlistId, uris)

        // db logging of generated playlist can go here later

        return Response.json({
            playlist: { id: playlistId, url: playlistUrl, name: created?.name },
            tracks: finalTracks.map(track => ({
                id: track.id,
                uri: track.uri,
                name: track.name,
                artists: (track.artists || []).map(artist => artist.name),
        })),
    },
    { status: 200 }
)
    } catch (error) {
        return new Response(String(error.message), { status: 500 })
    }
}