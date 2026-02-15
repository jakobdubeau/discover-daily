"use client";
import { useState } from "react";
import HeroSection from "../components/HeroSection";
import Playlist from "../components/Playlist";

export default function Home() {

  const [showPlaylist, setShowPlaylist] = useState(false);
  const [transitioning, setTransitioning] = useState(false)

  const goToPlaylist = () => {
    setTransitioning(true)
    setTimeout(() => {
      setShowPlaylist(true)
      setTransitioning(false)
    }, 200)
  }

  const goBack = () => {
    setTransitioning(true)
    setTimeout(() => {
      setShowPlaylist(false)
      setTransitioning(false)
    }, 200)
  }

  const connectSpotify = () => {
    window.location.href = "/api/spotify/login";
  }

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/spotify/me")

      if (res.ok) {
        goToPlaylist()
      }
      else {
        connectSpotify()
      }
    }
    catch (e) {
      connectSpotify()
    }
  }

  return (
    <div
      className={`flex flex-col flex-1 transition-opacity duration-200 ease-out ${
        transitioning ? "opacity-0" : "opacity-100"
      }`}
    >
      {!showPlaylist ? (
        <HeroSection onGen={handleCreate} />
      ) : (
        <Playlist onBack={goBack} />
      )}
    </div>
  );
}
