"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeftIcon } from "@heroicons/react/24/solid"
import SpotifyEmbed from "../../components/ui/SpotifyEmbed"

export default function Home() {

  const router = useRouter()
  const [playlistId, setPlaylistId] = useState(null)

  useEffect(() => {
    const generatePlaylist = async () => {
			const auth = await fetch("/api/spotify/me")
			if (!auth.ok) {
				router.push("/")
				return
			}
			
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
    <section className="flex flex-col flex-1 items-center">
      <Link
        href="/"
        className="absolute top-4 md:top-10 left-2 md:left-12 flex items-center font-semibold text-2xl text-[#ADB7BE] hover:text-white cursor-pointer transition-all hover:scale-105 duration-200"
      >
        <ChevronLeftIcon className="w-7 h-7" />
        <span>back</span>
      </Link>
      {playlistId && <SpotifyEmbed playlistId={playlistId} />}
    </section>
  )
}