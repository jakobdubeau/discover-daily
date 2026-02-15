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
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0E0E0E] text-white shadow-xl"
            initial={{ y: 50, opacity: 0, rotate: -3 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 30, opacity: 0, rotate: 2 }}
            transition={{ type: "spring", damping: 20, stiffness: 250 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-9 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-[11px] text-white/40 tracking-widest uppercase mb-2">
                    About
                  </p>
                  <h2 className="text-3xl font-bold tracking-tight text-[#1DB954]">
                    discover daily
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="font-mono text-sm text-white/40 hover:text-white cursor-pointer transition-all duration-200"
                >
                  [close]
                </button>
              </div>

              <div className="space-y-6">
                <p className="text-base leading-relaxed text-white/70">
                  for when you've worn out your favorites and need something new to fall in love with.
                </p>

                <div className="font-mono text-sm text-white/50 space-y-3 border-l-2 border-white/20 pl-5">
                  <p>→ reads your listening history</p>
                  <p>→ finds songs that fit</p>
                  <p>→ skips what you've overplayed</p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                <div className="font-mono text-[11px] text-white/30 uppercase tracking-wider leading-relaxed">
                  <p>your data stays yours</p>
                  <p>not affiliated w/ spotify</p>
                </div>
                <p className="font-mono text-[11px] text-white/20">v1.0</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default About
