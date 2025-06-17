"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Award, TrendingUp, Play, Zap, Target, Flame } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState, useCallback, useRef } from "react"

interface PrologueLandingProps {
  onLoginClick: () => void
  onSignUpClick: () => void
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
            onClick={onSignUpClick}
            size="sm"
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
            onClick={onSignUpClick}
            size="sm"
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

        {/* Angled Divider */}
        <section className="relative h-16 lg:h-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-prologue-blue via-slate-800 to-prologue-orange transform -skew-y-2 origin-top-left"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-prologue-electric/20 via-transparent to-prologue-fire/20 transform -skew-y-1 origin-top-right"></div>
        </section>

        {/* Enhanced Feature Points */}
        <section className="py-16 bg-gradient-to-br from-slate-100 via-white to-gray-50 relative">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto px-6 lg:px-8 relative z-10">
            {/* Left-Aligned Header */}
            <div className="max-w-6xl mx-auto mb-12 scroll-trigger">
              <h2 className="text-3xl lg:text-4xl font-athletic font-black text-slate-900 mb-4 tracking-tight">
                THE PROLOGUE ADVANTAGE
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-prologue-electric to-prologue-fire mb-8"></div>
            </div>

            <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 stagger-cards">
              <div className="flex items-start space-x-4 text-slate-800 bg-white/80 backdrop-blur-sm rounded-none p-6 border-l-4 border-prologue-electric shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group scroll-trigger">
                <div className="flex-shrink-0">
                  <Target className="h-8 w-8 text-prologue-electric group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h3 className="font-athletic font-bold text-lg mb-2 tracking-wide">ELITE COLLEGE ATHLETES</h3>
                  <p className="text-sm font-body text-slate-600">
                    Train with college athletes who've performed on the biggest stages
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 text-slate-800 bg-white/80 backdrop-blur-sm rounded-none p-6 border-l-4 border-prologue-fire shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group scroll-trigger">
                <div className="flex-shrink-0">
                  <Flame className="h-8 w-8 text-prologue-fire group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h3 className="font-athletic font-bold text-lg mb-2 tracking-wide">EXPERT MENTORSHIP</h3>
                  <p className="text-sm font-body text-slate-600">Get personalized coaching from proven athletes</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 text-slate-800 bg-white/80 backdrop-blur-sm rounded-none p-6 border-l-4 border-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group scroll-trigger">
                <div className="flex-shrink-0">
                  <Zap className="h-8 w-8 text-purple-600 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h3 className="font-athletic font-bold text-lg mb-2 tracking-wide">CHAMPIONSHIP MINDSET</h3>
                  <p className="text-sm font-body text-slate-600">
                    Build the skills and mentality that separate top performers from the rest
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Angled Divider */}
        <section className="relative h-16 lg:h-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-white to-slate-100 transform skew-y-2 origin-bottom-left"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-prologue-electric/10 to-prologue-fire/10 transform skew-y-1 origin-bottom-right"></div>
        </section>

        {/* Trust Indicators Section */}
        <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
          {/* Athletic Background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-prologue-electric/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-prologue-fire/10 to-red-400/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
          </div>

          <div className="container mx-auto px-6 lg:px-8 relative z-10">
            {/* Left-Aligned Header */}
            <div className="max-w-6xl mx-auto mb-16 scroll-trigger">
              <h2 className="text-4xl lg:text-5xl font-athletic font-black text-white mb-4 tracking-tight">
                PROVEN RESULTS
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-prologue-electric to-prologue-fire mb-8"></div>
              <p className="text-xl text-gray-300 font-body max-w-3xl">
                Join thousands of athletes who've elevated their game with elite-level training
              </p>
            </div>

            <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 lg:gap-12 stagger-cards">
              {/* Trust Box 1 */}
              <div className="bg-white/5 backdrop-blur-sm rounded-none p-8 text-left space-y-6 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:-translate-y-2 group border-l-4 border-prologue-electric scroll-trigger">
                <div className="w-16 h-16 bg-gradient-to-r from-prologue-electric to-purple-600 rounded-none flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-athletic font-bold text-white mb-2 tracking-wide">500+</h3>
                  <p className="text-gray-300 font-body">Elite universities and athletes trust our platform</p>
                </div>
              </div>

              {/* Trust Box 2 */}
              <div className="bg-white/5 backdrop-blur-sm rounded-none p-8 text-left space-y-6 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:-translate-y-2 group border-l-4 border-prologue-fire scroll-trigger">
                <div className="w-16 h-16 bg-gradient-to-r from-prologue-fire to-red-500 rounded-none flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-athletic font-bold text-white mb-2 tracking-wide">ALL SPORTS</h3>
                  <p className="text-gray-300 font-body">Every NCAA sport represented by elite athletes</p>
                </div>
              </div>

              {/* Trust Box 3 */}
              <div className="bg-white/5 backdrop-blur-sm rounded-none p-8 text-left space-y-6 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:-translate-y-2 group border-l-4 border-purple-600 scroll-trigger">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-500 rounded-none flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-athletic font-bold text-white mb-2 tracking-wide">10K+</h3>
                  <p className="text-gray-300 font-body">Students already dominating their competition</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Angled Divider */}
        <section className="relative h-16 lg:h-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 transform -skew-y-2 origin-top-left"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-prologue-electric/20 to-prologue-fire/20 transform -skew-y-1 origin-top-right"></div>
        </section>

        {/* How PROLOGUE Works Section */}
        <section className="py-20 lg:py-28 bg-gradient-to-br from-white via-gray-50 to-slate-100 relative overflow-hidden">
          <div className="container mx-auto px-6 lg:px-8 relative z-10">
            {/* Centered Header */}
            <div className="text-center mb-20 scroll-trigger">
              <h2 className="text-5xl lg:text-6xl font-athletic font-black text-slate-900 mb-6 tracking-tight">
                HOW <span className="text-prologue-electric">PROLOGUE</span> WORKS
              </h2>
              <div className="w-32 h-1.5 bg-gradient-to-r from-prologue-electric to-prologue-fire mx-auto mb-8"></div>
              <p className="text-xl lg:text-2xl text-slate-700 max-w-4xl mx-auto font-body font-medium">
                Three simple steps to unlock your athletic potential.
              </p>
            </div>

            {/* Simplified Steps Grid */}
            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12 lg:gap-16 stagger-steps">
              {/* Step 1 */}
              <div className="text-center group scroll-trigger">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-prologue-electric to-purple-600 rounded-none flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110">
                    <span className="text-2xl font-athletic font-black text-white">01</span>
                  </div>
                </div>
                <h3 className="text-2xl lg:text-3xl font-athletic font-black text-slate-900 mb-4 tracking-wide">
                  CHOOSE YOUR MENTOR
                </h3>
                <p className="text-lg text-slate-600 font-body leading-relaxed">
                  Browse our elite roster of college athletes and expert coaches. Find the mentor who matches your sport
                  and goals.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center group scroll-trigger">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-prologue-fire to-red-500 rounded-none flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110">
                    <span className="text-2xl font-athletic font-black text-white">02</span>
                  </div>
                </div>
                <h3 className="text-2xl lg:text-3xl font-athletic font-black text-slate-900 mb-4 tracking-wide">
                  GET ELITE COACHING
                </h3>
                <p className="text-lg text-slate-600 font-body leading-relaxed">
                  Receive personalized feedback on technique, strategy, and mental game from proven athletes.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center group scroll-trigger">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-500 rounded-none flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110">
                    <span className="text-2xl font-athletic font-black text-white">03</span>
                  </div>
                </div>
                <h3 className="text-2xl lg:text-3xl font-athletic font-black text-slate-900 mb-4 tracking-wide">
                  DOMINATE YOUR SPORT
                </h3>
                <p className="text-lg text-slate-600 font-body leading-relaxed">
                  Apply elite-level training to elevate your performance and achieve your athletic goals.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center mt-20 scroll-trigger">
              <Button
                size="lg"
                className="bg-gradient-to-r from-prologue-electric via-purple-600 to-prologue-fire hover:from-prologue-blue hover:via-purple-700 hover:to-prologue-orange text-white px-16 py-6 text-xl font-athletic font-black tracking-wider shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 group relative overflow-hidden rounded-none border-2 border-transparent hover:border-white/30"
              >
                <span className="relative z-10">START DOMINATING NOW</span>
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Button>
            </div>
          </div>
        </section>

        {/* Video/Image Section */}
        <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
          {/* Athletic background elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-prologue-electric/20 to-purple-400/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-prologue-fire/20 to-red-400/20 rounded-full blur-2xl animate-pulse animation-delay-1000"></div>
          </div>

          <div className="container mx-auto px-6 lg:px-8 relative z-10">
            <div className="max-w-6xl mx-auto scroll-trigger">
              {/* Left-Aligned Header */}
              <div className="mb-12">
                <h2 className="text-4xl lg:text-5xl font-athletic font-black text-white mb-4 tracking-tight">
                  SEE THE DIFFERENCE
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-prologue-electric to-prologue-fire mb-6"></div>
                <p className="text-lg font-body text-gray-300 max-w-2xl">
                  Watch how our elite mentors transform athletes into winners through personalized training and proven
                  strategies.
                </p>
              </div>

              <div className="relative group">
                <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-700 rounded-none overflow-hidden shadow-2xl group-hover:shadow-3xl transition-all duration-500 hover:scale-105 border-l-4 border-prologue-electric">
                  <Image
                    src="/placeholder.svg?height=600&width=800"
                    alt="Elite athletes training with PROLOGUE mentors"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Enhanced Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-all duration-300">
                    <button className="w-24 h-24 bg-gradient-to-r from-prologue-electric to-prologue-fire hover:from-prologue-blue hover:to-prologue-orange rounded-none flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-125 border-2 border-white/30">
                      <Play className="h-10 w-10 text-white ml-1" fill="currentColor" />
                    </button>
                  </div>
                </div>

                {/* Athletic decorative elements */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-prologue-electric rounded-none opacity-80"></div>
                <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-prologue-fire rounded-none opacity-60"></div>
                <div className="absolute top-1/2 -right-8 w-4 h-4 bg-purple-500 rotate-45 opacity-70"></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden border-t-4 border-prologue-electric">
        {/* Athletic background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-prologue-electric/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-prologue-fire/10 to-red-400/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        </div>

        {/* Main Footer CTA Section */}
        <section className="py-20 lg:py-32 relative z-10">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-6xl mx-auto text-left space-y-8 scroll-trigger">
              {/* PROLOGUE Logo */}
              <div className="flex items-center mb-8 group">
                <button onClick={scrollToTop} className="flex items-center space-x-3">
                  <div className="w-10 h-10 relative group-hover:scale-110 transition-transform">
                    <Image
                      src="/prologue-logo.png"
                      alt="PROLOGUE"
                      width={40}
                      height={40}
                      className="w-full h-full object-contain brightness-0 invert"
                    />
                  </div>
                  <span className="text-3xl font-athletic font-black text-white group-hover:text-prologue-electric transition-colors tracking-wider">
                    PROLOGUE
                  </span>
                </button>
              </div>

              {/* Main CTA Headline */}
              <h2 className="text-5xl lg:text-6xl font-athletic font-black text-white leading-tight tracking-tight">
                DON'T JUST PLAY THE GAME
                <br />
                <span className="text-prologue-electric">DEFINE IT</span>
              </h2>

              {/* Subtitle */}
              <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl font-body">
                Share your story, inspire the next generation, and build your athletic legacy.
              </p>

              {/* CTA Button */}
              <div className="pt-8">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-prologue-electric to-prologue-fire hover:from-prologue-blue hover:to-prologue-orange text-white px-12 py-6 text-lg font-athletic font-black tracking-wider rounded-none shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 group border-2 border-transparent hover:border-white/30"
                >
                  JOIN PROLOGUE NOW
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Footer */}
        <div className="border-t border-slate-700/50 backdrop-blur-sm relative z-10">
          <div className="container mx-auto px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              {/* Left Side - Logo and Tagline */}
              <div className="flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-4 group">
                <button onClick={scrollToTop} className="flex items-center space-x-2">
                  <div className="w-6 h-6 relative group-hover:scale-110 transition-transform">
                    <Image
                      src="/prologue-logo.png"
                      alt="PROLOGUE"
                      width={24}
                      height={24}
                      className="w-full h-full object-contain brightness-0 invert"
                    />
                  </div>
                  <span className="text-lg font-athletic font-bold text-white group-hover:text-prologue-electric transition-colors tracking-wider">
                    PROLOGUE
                  </span>
                </button>
                <span className="text-gray-400 text-sm font-athletic tracking-wide">FOR ATHLETES. BY ATHLETES.</span>
              </div>

              {/* Center - Navigation Links */}
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-8">
                {/* Mobile-only navigation */}
                <div className="flex md:hidden items-center space-x-6 mb-2">
                  <Link
                    href="#mentors"
                    className="text-gray-300 hover:text-white text-sm font-athletic font-medium tracking-wide transition-all duration-300 hover:scale-105"
                  >
                    VIEW MENTORS
                  </Link>
                  <Link
                    href="#for-creators"
                    className="text-gray-300 hover:text-white text-sm font-athletic font-medium tracking-wide transition-all duration-300 hover:scale-105"
                  >
                    FOR CREATORS
                  </Link>
                </div>

                {/* Standard footer links */}
                <div className="flex items-center space-x-6 md:space-x-8">
                  <Link
                    href="#signup"
                    className="text-gray-300 hover:text-white text-sm font-athletic font-medium tracking-wide transition-all duration-300 hover:scale-105"
                  >
                    SIGN UP
                  </Link>
                  <Link
                    href="#terms"
                    className="text-gray-300 hover:text-white text-sm font-athletic font-medium tracking-wide transition-all duration-300 hover:scale-105"
                  >
                    TERMS
                  </Link>
                  <Link
                    href="#privacy"
                    className="text-gray-300 hover:text-white text-sm font-athletic font-medium tracking-wide transition-all duration-300 hover:scale-105"
                  >
                    PRIVACY
                  </Link>
                </div>
              </div>

              {/* Right Side - Copyright and Contact */}
              <div className="flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-4">
                <span className="text-gray-400 text-sm font-body">© 2025 PROLOGUE. All rights reserved.</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-gray-300 hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-all duration-300 hover:scale-105 font-athletic font-medium tracking-wide rounded-none"
                >
                  CONTACT US
                </Button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 