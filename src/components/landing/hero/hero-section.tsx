"use client"

import { useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowRight, Play } from "lucide-react"
import Link from "next/link"
import { MagneticButton } from "@/components/animation/magnetic-button"
import { SpotlightEffect } from "@/components/animation/spotlight-effect"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { HERO_CONTENT } from "@/constants/landing"

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const glitchRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      tl.fromTo(
        Array.from(headlineRef.current?.querySelectorAll(".hero-word") ?? []),
        { y: 80, opacity: 0, rotateX: -45 },
        { y: 0, opacity: 1, rotateX: 0, duration: 1, stagger: 0.12, ease: "back.out(1.7)" }
      )
        .fromTo(
          subtitleRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          "-=0.4"
        )
        .fromTo(
          Array.from(ctaRef.current?.querySelectorAll(".hero-cta") ?? []),
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.15 },
          "-=0.3"
        )
        .fromTo(
          previewRef.current,
          { y: 80, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power4.out" },
          "-=0.4"
        )

      if (glitchRef.current) {
        gsap.to(glitchRef.current, {
          opacity: 0.06,
          duration: 0.3,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
        })
      }

      gsap.to(".hero-float-1", {
        y: -20,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      })

      gsap.to(".hero-float-2", {
        y: 15,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        delay: 1,
      })

      gsap.to(".hero-float-3", {
        y: -10,
        x: 10,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        delay: 0.5,
      })
    })

    return () => ctx.revert()
  }, [reducedMotion])

  const headline = HERO_CONTENT.title.split("\n")

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex min-h-screen items-center overflow-hidden pt-24"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          ref={glitchRef}
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--primary) / 0.08) 2px, hsl(var(--primary) / 0.08) 4px)",
            backgroundSize: "100% 4px",
          }}
        />
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute left-1/3 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary" />
            {HERO_CONTENT.badge}
          </motion.div>

          <h1
            ref={headlineRef}
            className="mb-6 text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
          >
            {headline.map((line, i) => (
              <span key={i} className="block">
                {line.split(" ").map((word, j) => (
                  <span
                    key={`${i}-${j}`}
                    className="hero-word mr-[0.3em] inline-block"
                    style={{ perspective: "1000px" }}
                  >
                    {word === "Project" || word === "Academia" ? (
                      <span className="text-primary">
                        {word}
                      </span>
                    ) : (
                      word
                    )}
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <p
            ref={subtitleRef}
            className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            {HERO_CONTENT.subtitle}
          </p>

          <div ref={ctaRef} className="flex flex-wrap items-center justify-center gap-4">
            <div className="hero-cta">
              <MagneticButton as="a" href="/register">
                <span className="group relative inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30">
                  {HERO_CONTENT.primaryCta.label}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </MagneticButton>
            </div>

            <div className="hero-cta">
              <MagneticButton>
                <span
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-base font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-white/10"
                  onClick={() => {
                    document
                      .querySelector("#dashboard-showcase")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  <Play className="h-4 w-4" />
                  {HERO_CONTENT.secondaryCta.label}
                </span>
              </MagneticButton>
            </div>
          </div>
        </div>

        <div ref={previewRef} className="relative mt-20">
          <div className="hero-float-1 absolute -left-4 -top-4 z-10 hidden rounded-lg border border-white/10 bg-background/80 px-3 py-2 text-xs backdrop-blur-xl lg:block">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">12 active projects</span>
            </div>
          </div>

          <div className="hero-float-2 absolute -bottom-4 -right-4 z-10 hidden rounded-lg border border-white/10 bg-background/80 px-3 py-2 text-xs backdrop-blur-xl lg:block">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">98% completion rate</span>
            </div>
          </div>

          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] shadow-2xl backdrop-blur-sm">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="ml-2 text-xs text-muted-foreground">DevTrack Dashboard</span>
            </div>

            <div className="grid grid-cols-4 gap-px bg-white/5">
              <div className="col-span-1 border-r border-white/5 bg-white/[0.02] p-4">
                <div className="mb-4 h-2 w-20 rounded bg-white/10" />
                <div className="space-y-3">
                  {["Projects", "Teams", "Analytics", "Settings"].map((item) => (
                    <div
                      key={item}
                      className="h-2 rounded bg-white/10"
                      style={{ width: `${60 + Math.random() * 30}%` }}
                    />
                  ))}
                </div>
              </div>
              <div className="col-span-3 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="h-3 w-32 rounded bg-white/10" />
                  <div className="h-6 w-20 rounded-lg bg-primary/20" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
                    >
                      <div className="mb-2 h-2 w-16 rounded bg-white/10" />
                      <div className="mb-1 h-6 w-12 rounded bg-primary/20" />
                      <div className="h-2 w-24 rounded bg-white/5" />
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <div className="mb-2 h-2 w-20 rounded bg-white/10" />
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((d) => (
                        <div
                          key={d}
                          className="h-8 flex-1 rounded-sm bg-primary/20"
                          style={{ height: `${20 + Math.random() * 30}px` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <div className="mb-2 h-2 w-16 rounded bg-white/10" />
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/20" />
                      <div className="flex-1 space-y-1">
                        <div className="h-2 w-24 rounded bg-white/10" />
                        <div className="h-2 w-16 rounded bg-white/5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <SpotlightEffect size={400} opacity={0.08} />
        </div>

        <div className="mt-16 text-center">
          <p className="mb-6 text-xs uppercase tracking-widest text-muted-foreground">
            Trusted by leading institutions
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
            {HERO_CONTENT.trustedBy.map((institution) => (
              <span
                key={institution.name}
                className="text-sm font-semibold tracking-wide text-foreground"
              >
                {institution.logo}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
