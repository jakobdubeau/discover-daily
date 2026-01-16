"use client"
import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const About = ({ open, onClose }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            className="w-full h-2.5/3 max-w-md rounded-2xl border border-white/10 bg-[#0E0E0E] p-2 text-white shadow-xl"
            initial={{ y: 14, scale: 0.95, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 14, scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5">
              <h2 className="text-xl font-semibold tracking-tight">
                About{" "}
				<span className="text-[#1DB954]">discover daily</span>
              </h2>

              <button
                onClick={onClose}
                className="grid h-7 w-9 text-xl place-items-center rounded-full text-[#ADB7BE] hover:text-white cursor-pointer transition-all hover:scale-105 duration-200"
              >
                ✕
              </button>
            </div>

            <div className="h-px w-full bg-slate-200/20" />

            <div className="px-6 py-5 text-[13px] sm:text-sm leading-relaxed text-[#ADB7BE] space-y-4">
              <p className="text-[#ADB7BE]">
                <span className="font-semibold text-white">discover daily</span> is a
                playlist generator that lets you create personalized playlists of new music we know you'll love
              </p>

              <p>
                Inspired by Spotify's discover weekly, it aims to make new music discovery easy, for when you get bored of your usuals.
              </p>

              <div className="space-y-1">
                <h3 className="font-normal text-white">How it works</h3>
                <ul className="ml-4 list-disc space-y-1">
                  <li>Looks at your top + recent listening</li>
                  <li>Uses Spotify's recommendation algorithm</li>
                  <li>Filters songs you've overplayed recently</li>
                </ul>
              </div>

              <div className="space-y-1">
                <h3 className="font-normal text-white">Data</h3>
                <p>
                  Your Spotify data is used only to generate playlists. You can
                  disconnect anytime.
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="font-normal text-white">Brand usage</h3>
                <p>
                  This is an unofficial, fan-made project for educational /
                  personal use and is not endorsed by Spotify.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default About
