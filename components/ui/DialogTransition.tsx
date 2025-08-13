"use client"

import * as React from "react"
import { motion } from "framer-motion"

interface DialogTransitionProps {
  children: React.ReactNode
}

export function DialogTransition({ children }: DialogTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -20 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 30,
        }
      }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
    >
      {children}
    </motion.div>
  )
}
