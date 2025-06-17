"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Award, TrendingUp, Play, Zap, Target, Flame } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState, useCallback, useRef } from "react"

interface PrologueLandingProps {
  onLoginClick?: () => void
  onSignUpClick?: () => void
}

export default function PrologueLanding({ onLoginClick, onSignUpClick }: PrologueLandingProps) {
  const [scrollY, setScrollY] = useState(0)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [scrollDirection, setScrollDirection] = useState<"down" | "up">("down")
  const observerRef = useRef<IntersectionObserver>()
  const heroRef = useRef<HTMLElement>(null)

  // Enhanced scroll handler with direction detection
  const handleScroll = useCallback(() => {
    if (typeof window !== "undefined") {
      const currentScrollY = window.scrollY

      // Determine scroll direction
      if (Math.abs(currentScrollY - lastScrollY) > 1) {
        setScrollDirection(currentScrollY > lastScrollY ? "down" : "up")
        setLastScrollY(currentScrollY)
      }

      setScrollY(currentScrollY)

      // Hero parallax effect
      if (heroRef.current) {
        const heroHeight = heroRef.current.offsetHeight
        const scrollProgress = Math.min(currentScrollY / heroHeight, 1)
        const parallaxOffset = scrollProgress * 50 // Adjust parallax intensity

        // Apply parallax to hero background elements
        const heroBackground = heroRef.current.querySelector(".athletic-hero::before") as HTMLElement
        const heroBackgroundAfter = heroRef.current.querySelector(".athletic-hero::after") as HTMLElement

        // Use CSS custom properties for smooth parallax
        heroRef.current.style.setProperty("--parallax-y", `${parallaxOffset}px`)

        // Apply transform to the hero section itself for subtle movement
        heroRef.current.style.transform = `translateY(${parallaxOffset * 0.3}px)`
      }
    }
  }, [lastScrollY])

  useEffect(() => {
    // Simple page load
    const handlePageLoad = () => {
      setTimeout(() => {
        document.body.classList.add("page-loaded")
      }, 100)
    }

    if (document.readyState === "complete") {
      handlePageLoad()
    } else {
      window.addEventListener("load", handlePageLoad)
    }

    // Enhanced intersection observer with bidirectional animations
    const observerOptions: IntersectionObserverInit = {
      threshold: [0, 0.1, 0.5],
      rootMargin: "0px 0px -50px 0px",
    }

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const element = entry.target as HTMLElement

        if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
          // Element is entering viewport
          element.classList.remove("out-view")
          element.classList.add("in-view")
        } else if (!entry.isIntersecting) {
          // Element is leaving viewport - apply reverse animation based on scroll direction
          element.classList.remove("in-view")
          element.classList.add("out-view")
        }
      })
    }, observerOptions)

    // Observe all scroll trigger elements
    const scrollElements = document.querySelectorAll(".scroll-trigger")
    scrollElements.forEach((el) => {
      observerRef.current?.observe(el)
    })

    // Enhanced scroll listener with throttling
    let ticking = false
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", throttledScroll, { passive: true })

    return () => {
      window.removeEventListener("load", handlePageLoad)
      window.removeEventListener("scroll", throttledScroll)
      if (observerRef.current) {
        scrollElements.forEach((el) => observerRef.current?.unobserve(el))
        observerRef.current.disconnect()
      }
    }
  }, [handleScroll])

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }, [])

  // Simple scroll progress calculation
  const scrollProgress = Math.min(
    (scrollY /
      Math.max(
        (typeof document !== "undefined" ? document.documentElement.scrollHeight : 0) -
          (typeof window !== "undefined" ? window.innerHeight : 0),
        1,
      )) *
      100,
    100,
  )

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden">
      {/* Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-prologue-electric via-purple-500 to-prologue-fire z-50 scroll-progress"
        style={{
          width: `${scrollProgress}%`,
          opacity: scrollProgress > 0 ? 1 : 0,
          transition: "opacity 0.3s ease-out",
        }}
      />

      {/* Header */}
      <header
        className="px-6 lg:px-8 h-16 flex items-center justify-between backdrop-blur-md border-b border-gray-700/50 fixed top-0 left-0 right-0 z-40"
        style={{
          backgroundColor: scrollY > 50 ? "rgba(15, 23, 42, 0.95)" : "rgba(15, 23, 42, 0.8)",
          transition: "background-color 0.3s ease-out",
          boxShadow: scrollY > 50 ? "0 10px 15px -3px rgba(0, 0, 0, 0.3)" : "none",
        }}
      >
        {/* Left Side - Logo and Brand */}
        <div className="flex items-center">
          <button onClick={scrollToTop} className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-8 h-8 relative transition-transform group-hover:scale-110">
              <Image
                src="/prologue-main-logo.png"
                alt="PROLOGUE"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-athletic font-bold text-white group-hover:text-prologue-electric transition-colors tracking-wider">
              PROLOGUE
            </span>
          </button>
        </div>

        {/* Mobile Navigation - Always visible */}
        <div className="flex md:hidden items-center space-x-3">
          <button
            onClick={onLoginClick}
            className="text-xs font-athletic font-medium text-gray-300 hover:text-prologue-electric transition-all duration-300 tracking-wide px-2 py-1"
          >
            LOG IN
          </button>
          <Button
            size="sm"
            onClick={onSignUpClick}
            className="bg-gradient-to-r from-prologue-electric to-prologue-fire hover:from-prologue-blue hover:to-prologue-orange text-white px-3 py-1 text-xs rounded-none font-athletic font-bold tracking-wider hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-transparent hover:border-white/20"
          >
            SIGN UP
          </Button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="#mentors"
            className="text-sm font-athletic font-medium text-gray-300 hover:text-prologue-electric transition-all duration-300 hover:scale-105 tracking-wide"
          >
            VIEW MENTORS
          </Link>
          <Link
            href="#for-creators"
            className="text-sm font-athletic font-medium text-gray-300 hover:text-prologue-electric transition-all duration-300 hover:scale-105 tracking-wide"
          >
            FOR CREATORS
          </Link>
          <button
            onClick={onLoginClick}
            className="text-sm font-athletic font-medium text-gray-300 hover:text-prologue-electric transition-all duration-300 hover:scale-105 tracking-wide"
          >
            LOG IN
          </button>
          <Button
            size="sm"
            onClick={onSignUpClick}
            className="bg-gradient-to-r from-prologue-electric to-prologue-fire hover:from-prologue-blue hover:to-prologue-orange text-white px-6 py-2 rounded-none font-athletic font-bold tracking-wider hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-transparent hover:border-white/20"
          >
            SIGN UP
          </Button>
        </nav>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section with Parallax */}
        <section
          ref={heroRef}
          className="athletic-hero py-20 lg:py-32 relative overflow-hidden hero-section"
          style={{
            transition: "transform 0.1s ease-out",
          }}
        >
          {/* Dynamic Athletic Background with Parallax */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-prologue-blue via-slate-800 to-prologue-orange opacity-90"
            style={{
              transform: `translateY(calc(var(--parallax-y, 0px) * 0.5))`,
              transition: "transform 0.1s ease-out",
            }}
          ></div>
          <div
            className="absolute inset-0 bg-gradient-to-r from-prologue-electric/20 via-transparent to-prologue-fire/20"
            style={{
              transform: `translateY(calc(var(--parallax-y, 0px) * 0.3))`,
              transition: "transform 0.1s ease-out",
            }}
          ></div>

          {/* Diagonal Energy Lines with Parallax */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full">
              <div
                className="absolute top-10 -left-20 w-96 h-2 bg-gradient-to-r from-transparent via-prologue-electric/30 to-transparent rotate-12 animate-pulse"
                style={{
                  transform: `translateY(calc(var(--parallax-y, 0px) * 0.7))`,
                  transition: "transform 0.1s ease-out",
                }}
              ></div>
              <div
                className="absolute top-32 -right-20 w-80 h-1 bg-gradient-to-r from-transparent via-prologue-fire/40 to-transparent -rotate-12 animate-pulse animation-delay-1000"
                style={{
                  transform: `translateY(calc(var(--parallax-y, 0px) * 0.4))`,
                  transition: "transform 0.1s ease-out",
                }}
              ></div>
              <div
                className="absolute bottom-20 -left-32 w-72 h-1.5 bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-6 animate-pulse animation-delay-500"
                style={{
                  transform: `translateY(calc(var(--parallax-y, 0px) * 0.6))`,
                  transition: "transform 0.1s ease-out",
                }}
              ></div>
            </div>
          </div>

          <div className="container mx-auto px-6 lg:px-8 relative z-10">
            <div className="max-w-6xl mx-auto">
              {/* Centered Athletic Layout */}
              <div className="text-center space-y-8">
                {/* Main Athletic Headline */}
                <div className="space-y-4">
                  <h1 className="text-5xl lg:text-8xl font-athletic font-black text-white leading-none tracking-tight hero-title">
                    {/* "TRAIN WITH" and "CHAMPIONS" load together */}
                    <span className="block hero-line-1">TRAIN WITH</span>
                    <span className="block text-prologue-electric hero-line-2">CHAMPIONS</span>
                    {/* "BECOME ONE" loads after */}
                    <span className="block text-prologue-fire hero-line-3">BECOME ONE</span>
                  </h1>
                </div>

                <div className="max-w-4xl mx-auto hero-subtitle">
                  <p className="text-lg lg:text-xl text-gray-300 font-body font-medium leading-relaxed">
                    Transform your game with coaching from top college athletes—because greatness is built, not born.
                  </p>
                </div>

                {/* Single CTA Button */}
                <div className="flex justify-center items-center pt-4 hero-cta">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-prologue-electric to-prologue-fire hover:from-prologue-blue hover:to-prologue-orange text-white px-10 py-6 text-lg font-athletic font-bold tracking-wider shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 group rounded-none border-2 border-transparent hover:border-white/30"
                  >
                    START TRAINING NOW
                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Athletic Accent Elements with Parallax */}
          <div
            className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-prologue-fire/10 to-transparent rounded-full blur-3xl"
            style={{
              transform: `translateY(calc(var(--parallax-y, 0px) * 0.2))`,
              transition: "transform 0.1s ease-out",
            }}
          ></div>
          <div
            className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-prologue-electric/10 to-transparent rounded-full blur-3xl"
            style={{
              transform: `translateY(calc(var(--parallax-y, 0px) * 0.4))`,
              transition: "transform 0.1s ease-out",
            }}
          ></div>
        </section>

        {/* Rest of the sections... */}
        {/* I'll continue with the rest of the sections in the next edit */}
      </main>
    </div>
  )
} 