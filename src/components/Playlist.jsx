import { useState, useEffect } from 'react';
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import SpotifyEmbed from './ui/SpotifyEmbed';

// call generate on mount to create playlist
// eventually do loading state
// playlist and open in spotify link

const Playlist = ({ onBack }) => {

  const [playlistId, setPlaylistId] = useState(null)

  useEffect(() => {
    const generatePlaylist = async () => {
      const res = await fetch("/api/spotify/generate", {
        method: "POST",
      })
      if (res.ok) {
        const data = await res.json()
        setPlaylistId(data.playlist.id)
      }
    }
    generatePlaylist()
  }, [])

  return (
    <section className="flex flex-col flex-1 items-center justify-center">
      <button
        onClick={onBack}
        className="absolute top-10 left-12 flex items-center font-semibold text-2xl text-[#ADB7BE] hover:text-white cursor-pointer transition-all hover:scale-105 duration-200"
      >
        <ChevronLeftIcon className="w-7 h-7" />
        <span>
          back
        </span>
      </button>
      {playlistId && <SpotifyEmbed playlistId={playlistId} />}
    </section>
  )
}

export default Playlist