"use client"

import { motion } from "framer-motion"
import { BookOpen } from "lucide-react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

export default function LoadingPage() {
  const reducedMotion = useReducedMotion()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <motion.div
          initial={reducedMotion ? { opacity: 1 } : { scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="rounded-full bg-gradient-to-br from-primary to-primary/70 p-4 shadow-lg">
            <BookOpen className="h-8 w-8 text-primary-foreground" />
          </div>
        </motion.div>

        <motion.div
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-xl font-semibold">DevTrack</h2>
          <p className="text-sm text-muted-foreground mt-1">Loading your dashboard...</p>
        </motion.div>

        <div className="relative h-1.5 w-48 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary/40 via-primary to-primary/40"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full bg-primary"
              initial={reducedMotion ? { opacity: 0.4 } : { opacity: 0.4, scale: 0.8 }}
              animate={reducedMotion ? { opacity: 0.4 } : { opacity: 1, scale: 1 }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
                repeatType: "reverse",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
