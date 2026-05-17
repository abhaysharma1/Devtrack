"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"
import { GlowingCard } from "@/components/animation/glowing-card"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { TESTIMONIALS } from "@/constants/landing"
import { staggerContainer, staggerItem } from "@/lib/animation"

export function TestimonialsSection() {
  const reducedMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <section id="testimonials" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            Trusted by educators
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Loved by{" "}
                        <span className="text-primary">
              professors
            </span> {" "}
            and students
          </h2>
          <p className="text-lg text-muted-foreground">
            Hear from the institutions that use DevTrack to transform their software engineering programs.
          </p>
        </motion.div>

        <motion.div
          ref={containerRef}
          variants={!reducedMotion ? staggerContainer : undefined}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {TESTIMONIALS.map((testimonial, i) => (
            <motion.div
              key={`${testimonial.author}-${i}`}
              variants={!reducedMotion ? staggerItem : undefined}
            >
              <GlowingCard className="flex h-full flex-col">
                <Quote className="mb-4 h-6 w-6 text-primary/50" />
                <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-muted-foreground/30 text-muted-foreground/30" />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  <p className="text-xs text-primary/60">{testimonial.institution}</p>
                </div>
              </GlowingCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
