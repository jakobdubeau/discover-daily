import React from 'react';
import { ChevronLeftIcon } from "@heroicons/react/24/solid";

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