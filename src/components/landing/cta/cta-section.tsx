"use client"

import { useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { gsap } from "gsap"
import { ArrowRight, Shield, Sparkles } from "lucide-react"
import Link from "next/link"
import { MagneticButton } from "@/components/animation/magnetic-button"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return

    const ctx = gsap.context(() => {
      gsap.to(".cta-orb-1", {
        y: -30,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      })
      gsap.to(".cta-orb-2", {
        y: 20,
        x: 20,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        delay: 1,
      })
    })

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-24 sm:py-32"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="cta-orb-1 absolute -left-20 -top-20 h-80 w-80 rounded-full bg-primary/20 blur-[120px]" />
        <div className="cta-orb-2 absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-primary/15 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            Start transforming your classroom today
          </div>

          <h2 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Ready to modernize your{" "}
            <span className="text-primary">
              software projects
            </span>
            ?
          </h2>

          <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
            Join hundreds of institutions already using DevTrack to manage, track, and evaluate student
            software projects.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <MagneticButton as="a" href="/register">
              <span className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30">
                Get Started Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </MagneticButton>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              Sign In
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary" />
              Free forever plan
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary" />
              SOC 2 compliant
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
