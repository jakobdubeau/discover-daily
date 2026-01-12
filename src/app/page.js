"use client";
import { useState } from "react";
import HeroSection from "../components/HeroSection";
import Playlist from "../components/Playlist";
import { UserIcon } from "@heroicons/react/24/outline";

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

  return (
    <main className="flex min-h-screen flex-col bg-black bg-[radial-gradient(#2a2030_1px,transparent_1px)] bg-size-[16px_16px]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.25)_75%)] pointer-events-none"></div>
      <div className="container mt-24 mx-auto px-12 pt-4 flex flex-col flex-1">
        <button
          className="absolute right-12 top-10 text-[#ADB7BE] hover:text-white cursor-pointer transition-all hover:scale-105 duration-200"
        >
          <UserIcon className="w-7 h-7 stroke-2"/>
        </button>
        <div
          className={`flex flex-col flex-1 transition-opacity duration-200 ease-out ${
            transitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          {!showPlaylist ? (
            <HeroSection onGen={goToPlaylist} /> 
          ) : (
            <Playlist onBack={goBack} />
          )}
        </div>
      </div>
    </main>
  );
}
