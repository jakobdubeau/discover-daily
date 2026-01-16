import React from 'react';
import { ChevronLeftIcon } from "@heroicons/react/24/solid";

// call generate on mount to create playlist
// eventually do loading state
// playlist and open in spotify link

const Playlist = ({ onBack }) => {
  return (
    <section>
      <button
        onClick={onBack}
        className="absolute top-11 left-12 flex items-center font-semibold text-2xl text-[#ADB7BE] hover:text-white cursor-pointer transition-all hover:scale-105 duration-200"
      >
        <ChevronLeftIcon className="w-7 h-7" />
        <span>
          back
        </span>
      </button>
    </section>
  )
}

export default Playlist