// future improvements:
// filter out liked songs
// filter out songs in playlists
// ***filter out songs in past generated playlists very strictly, maybe do after db integration

// remove duplicate tracks based on id

export function removeDuplicates(tracks, topArtists) {
    const topArtistIds = new Set(topArtists.map(a => a.id))

    const seenTracks = new Set()
    const seenArtists = new Set()
    const finalTracks = []

    for (const track of tracks) {
        if (seenTracks.has(track.id)) continue

        const artistIds = track.artists.map(a => a?.id).filter(Boolean)

        if (artistIds.some(id => topArtistIds.has(id))) continue
        
        if (artistIds.some(id => seenArtists.has(id))) continue

        // keep it
        seenTracks.add(track.id)
        artistIds.forEach(id => seenArtists.add(id))
        finalTracks.push(track)
    }

    return finalTracks
}

// check recently played song counts

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

// pick seeds with 1 per artist for diverse radios
export function pickSeeds(tracks, sliceStart, sliceEnd, count) {
    const pool = shuffle(tracks.slice(sliceStart, sliceEnd))
    const seeds = []
    const seenArtistIds = new Set()
    for (const track of pool) {
        const artistId = track.artists?.[0]?.id
        if (artistId && seenArtistIds.has(artistId)) continue
        if (artistId) seenArtistIds.add(artistId)
        seeds.push(track)
        if (seeds.length >= count) break
    }
    return seeds
}

// pick unique tracks, making sure duplicate tracks aren't picked from close/explore pools

function pickUniqueTracks(tracks, count, usedIds) {
    const uniqueTracks = tracks.filter(track => !usedIds.has(track.id))
    return uniqueTracks.slice(0, count)
}

// mix close and explore tracks into final playlist

export function mixTaste({ closeTracks, exploreTracks, total = 20, closeRatio = 0.75, }) {
    const closeCount = Math.round(total * closeRatio)
    const exploreCount = total - closeCount

    const used = new Set()

    const closeSelection = pickUniqueTracks(closeTracks, closeCount, used)
    closeSelection.forEach(track => used.add(track.id))

    const exploreSelection = pickUniqueTracks(exploreTracks, exploreCount, used)
    exploreSelection.forEach(track => used.add(track.id))

    // shuffle close and explore together
    return shuffle([...closeSelection, ...exploreSelection])
}

// fisher-yates shuffle, unbiased random ordering

export function shuffle(arr) {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}