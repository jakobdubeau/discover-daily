import { cookies } from 'next/headers';
import {
    fetchMe,
    fetchTopTracks,
    fetchRecentTracks,
    fetchRecommendations,
    createPlaylist,
    addTracks
} from '@/lib/spotifyApi';

import {
    removeDuplicateTracks,
    countRecentPlays,
    filterByRecentPlays,
    pickSeedTracks,
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

        const me = await fetchMe(token)
        const userId = me?.id
        
        if (!userId) {
            return new Response("Missing user id", { status: 400 })
        }

        const top = await fetchTopTracks(token, { time_range: "medium_term", limit: 50 })
        const topTracks = top?.items || []

        const recent = await fetchRecentTracks(token, { limit: 50 })
        const recentTracks = recent?.items || []


        // build seeds

        // get rec pools for a and b close and explore

        // recent counts and filter





    } catch (error) {
        return new Response(String(error.message), { status: 500 })
    }
}