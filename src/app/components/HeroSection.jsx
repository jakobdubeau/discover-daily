"use client"
import React from 'react'
import { motion } from "framer-motion"

const HeroSection = () => {
  return (
    <section className="lg:py-16">
        <div>
            <motion.h1
                // parents switches from hidden > show, children w matching variants animate one by one
                initial="hidden"
                animate="show"
                variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.045 } }, // each child starts 45ms after previous
                }}
                className="text-7xl font-extrabold text-[#1DB954]"
            >
                {"Discover Daily".split("").map((ch, i) => ( //convert string into array of chars, loop and map each char to index (for key) and char
                    <motion.span
                        // turns each letter into it's own animated object
                        key={i}
                        className="inline-block"
                        variants={{ // defines what to do when parent enters state
                            hidden: { opacity: 0, y: 20 },
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
        </div>
    </section>
  )
}

export default HeroSection