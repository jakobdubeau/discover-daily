"use client";
import React from 'react';
import { useState } from 'react';
import Link from 'next/link';

const Footer = () => {

  const [aboutOpen, setAboutOpen] = useState(false)

  return (
    <section className="w-full flex flex-col items-center gap-3 text-sm">
      <div className="flex flex-row gap-4">
        <button
          onClick={() => setAboutOpen(true)}
          className="text-[#ADB7BE] hover:text-white cursor-pointer"
        >
          About
        </button>
        <button
          className="text-[#ADB7BE] hover:text-white cursor-pointer"
        >
          My Favourites
        </button>
        <button
          className="text-[#ADB7BE] hover:text-white cursor-pointer"
        >
          Contact
        </button>
      </div>
      <p className="text-xs text-neutral-500">
        ©2026 discover daily. Made with ♥ by {""}
        <Link
            href="https://github.com/jakobdubeau"
            target="_blank"
            rel="noopener noreferrer"
        >
            <button className="hover:text-white transition-colors duration-200 cursor-pointer">
                jakobdubeau
            </button>
        </Link>
      </p>
    </section>
  )
}

export default Footer