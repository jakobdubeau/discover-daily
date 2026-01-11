"use client"
import React from 'react'
import { useState } from 'react'

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
          Recommendations
        </button>
        <button
          className="text-[#ADB7BE] hover:text-white cursor-pointer"
        >
          Contact
        </button>
      </div>
      <p className="text-xs text-neutral-500">
        ©2026 discover daily
      </p>
    </section>
  )
}

export default Footer