// future improvements:
// filter out liked songs
// filter out songs in playlists
// ***filter out songs in past generated playlists very strictly, maybe do after db integration
// ***limit artist repeats

// remove duplicate tracks based on id
// goal: want generated playlist to have 30 unique songs
export function removeDuplicates(tracks, topArtists) {
    const topArtistIds = new Set(topArtists.map(a => a.id))

    const seenTracks = new Set()
    const seenArtists = new Set()
    const filteredTracks = []

    for (const track of tracks) {
        if (seenTracks.has(track.id)) continue

        const artistIds = track.artists.map(a => a?.id).filter(Boolean)

        if (artistIds.some(id => topArtistIds.has(id))) continue
        
        if (artistIds.some(id => seenArtists.has(id))) continue

        // keep it
        seenTracks.add(track.id)
        artistIds.forEach(id => seenArtists.add(id))
        filteredTracks.push(track)
    }

    return filteredTracks
}

// check recently played song counts
// goal: don't want to recommend songs the user has been playing a lot recently
export function countRecentPlays(recentTracks) {
    // map is basically python dict
    const counts = new Map()

    for (const item of recentTracks) {
        const id = item?.track?.id
        counts.set(id, (counts.get(id) || 0) + 1)
    }

    return counts
}

// filter out songs that were recently played more than threshold times
export function filterByRecentPlays(tracks, recentPlays, { threshold = 3 } = {}) {
    // filter creates new array with items that pass conditions
    return tracks.filter(track => (recentPlays.get(track.id) || 0) <= threshold)
}

// pick seeds from top tracks, for spotifys recommendation endpoint
// goal: good seeds for spotifys recommendation system
export function pickSeedTracks(topTracks, { start = 0, count = 5 } = {}) {
    const seeds = []

    // while less seeds than count and within bounds of topTracks
    for (let i = start; i < start + count && i < topTracks.length; i++) {
        seeds.push(topTracks[i].id)
    }
    return seeds
}

// pick unique tracks for final playlist, making sure duplicate tracks aren't picked from exploitation/exploration pools
// goal: close and explore won't both add the same track
export function pickUniqueTracks(tracks, count, usedIds) {
    const uniqueTracks = tracks.filter(track => !usedIds.has(track.id))
    return uniqueTracks.slice(0, count)
}

// mix close and explore tracks into final playlist
// goal: final playlist has a good balance of exploitation and exploration (close and explore), 70/30 split
export function mixTaste({
    closeTracks,
    exploreTracks,
    total = 30,
    closeRatio = 0.7,
}) {
    const closeCount = Math.round(total * closeRatio)
    const exploreCount = total - closeCount

    const used = new Set()

    const closeSelection = pickUniqueTracks(closeTracks, closeCount, used)
    closeSelection.forEach(track => used.add(track.id))

    const exploreSelection = pickUniqueTracks(exploreTracks, exploreCount, used)
    exploreSelection.forEach(track => used.add(track.id))

    // shuffle close and explore together
    const finalTracks = [...closeSelection, ...exploreSelection]
    finalTracks.sort(() => Math.random() - 0.5)

    return finalTracks
}