// remove dupes
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
export function countRecentPlays(recentTracks) {
    // map is basically python dict
    const counts = new Map()

    for (const track of recentTracks) {
        counts.set(track.id, (counts.get(track.id) || 0) + 1)
    }

    return counts
}

// filter with the recent plays
export function filterByRecentPlays(tracks, recentPlays, { threshold = 3 } = {}) {
    // filter creates new array with items that pass conditions
    return tracks.filter(track => (recentPlays.get(track.id) || 0) <= threshold)
}

// pick seeds from top tracks
export function pickSeedTracks(topTracks, { start = 0, count = 5 } = {}) {
    const seeds = []

    // while less seeds than count and within bounds of topTracks
    for (let i = start; i < start + count && i < topTracks.length; i++) {
        seeds.push(topTracks[i].id)
    }
    return seeds
}

// pick unique, making sure duplicate tracks aren't picked from exploitation/exploration pools
export function pickUniqueTracks(tracks, count, usedIds) {
    const uniqueTracks = tracks.filter(track => !usedIds.has(track.id))
    return uniqueTracks.slice(0, count)
}

// returns exploitation and exploration arrays