import React from 'react'

const SpotifyEmbed = ({ playlistId, height = 700 }) => {

    if (!playlistId) {
        return null
    }

  return (
    <iframe
        src={`https://open.spotify.com/embed/playlist/${playlistId}`}
        width="100%"
        height={height}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        className="rounded-xl border border-white/10"
    />
  )
}

export default SpotifyEmbed