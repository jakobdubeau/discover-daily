// remove duplicate tracks based on id
// goal: want generated playlist to have 30 unique songs
export function removeDuplicateTracks(tracks) {
    const seen = new Set()
    const uniqueTracks = []

    for (const track of tracks) {
        if (!seen.has(track.id)) {
            seen.add(track.id)
            uniqueTracks.push(track)
        }
    }

    return uniqueTracks
}

// check recently played song counts
// goal: don't want to recommend songs the user has been playing a lot recently
export function countRecentPlays(recentTracks) {
    // map is basically python dict
    const counts = new Map()

    for (const track of recentTracks) {
        counts.set(item.track.id, (counts.get(item.track.id) || 0) + 1)
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

    return [...closeSelection, ...exploreSelection]
}