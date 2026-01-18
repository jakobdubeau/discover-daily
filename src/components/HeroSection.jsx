"use client"
import React, { useState } from 'react';
import { motion } from "framer-motion";
import Footer from './Footer';

const HeroSection = ({ onGen }) => {

  return (
    <section className="xl:py-8 flex flex-col flex-1 mt-24">
      <div className="flex-1">
        <div className="max-w-5xl mx-auto">
          <motion.h1
            // parents switches from hidden > show, children w matching variants animate one by one
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.045 } }, // each child starts 45ms after previous
            }}
            className="flex justify-center text-8xl font-semibold text-[#1DB954] tracking-tight"
          >
            {"discover daily".split("").map((ch, i) => ( //convert string into array of chars, loop and map each char to index (for key) and char
              <motion.span
                // turns each letter into it's own animated object
                key={i}
                className="inline-block"
                variants={{ // defines what to do when parent enters state
                  hidden: { opacity: 0, y: 25 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      type: "spring",
                      stiffness: 500,
                      damping: 16,
                      mass: 0.7,
                    }
                  }
                }} // handles spaces
              >
                {ch === " " ? "\u00A0" : ch}
              </motion.span>
            ))}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.9,
              duration: 0.7,
              ease: "easeOut"
            }}
            className="flex justify-center mt-8 font-light text-2xl text-[#ADB7BE] leading-relaxed"
          >
            discover weekly, minus the wait
          </motion.p>
        </div>
        <button
          onClick={onGen}
          className="flex mt-14 mx-auto px-9 py-4 rounded-full bg-[#1DB954] hover:bg-[#189A45] text-black font-bold cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95">
          Create Playlist
        </button>
      </div>
      <div className="mt-auto lg:pb-3 xl:pb-0">
        <Footer />
      </div>
    </section>
  )
}

export default HeroSection