"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft, Play, Tablet, Users, DollarSign, Video, Star, Check } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState, useCallback, useRef } from "react"

export default function ForCreatorsPage() {
  const [scrollY, setScrollY] = useState(0)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [scrollDirection, setScrollDirection] = useState<"down" | "up">("down")
  const observerRef = useRef<IntersectionObserver | null>(null)
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
                src="/Prologue LOGO-1.png"
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

        {/* Right Side - Back to Home */}
        <Link
          href="/"
          className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-300 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium tracking-wide">BACK TO HOME</span>
        </Link>
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
                    <span className="block hero-line-1">HELP TRAIN THE</span>
                    <span className="block text-prologue-electric hero-line-2">NEXT GENERATION</span>
                  </h1>
                </div>

                <div className="max-w-4xl mx-auto hero-subtitle">
                  <p className="text-lg lg:text-xl text-gray-300 font-body font-medium leading-relaxed">
                    Share your expertise, build your brand, and create lasting impact while earning from your athletic
                    knowledge.
                  </p>
                </div>

                {/* Single CTA Button */}
                <div className="flex justify-center items-center pt-4 hero-cta">
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-prologue-electric to-prologue-fire hover:from-prologue-blue hover:to-prologue-orange text-white px-10 py-6 text-lg font-athletic font-bold tracking-wider shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 group rounded-none border-2 border-transparent hover:border-white/30"
                    >
                      BEGIN NOW
                      <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </Link>
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

        {/* How It Works Section */}
        <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-100 via-white to-gray-50 relative">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto px-6 lg:px-8 relative z-10">
            {/* Centered Header */}
            <div className="text-center mb-20 scroll-trigger">
              <h2 className="text-5xl lg:text-6xl font-athletic font-black text-slate-900 mb-6 tracking-tight">
                HOW IT WORKS
              </h2>
              <div className="w-32 h-1.5 bg-gradient-to-r from-prologue-electric to-prologue-fire mx-auto mb-8"></div>
            </div>

            {/* Steps Grid */}
            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12 lg:gap-16 stagger-steps">
              {/* Step 1 */}
              <div className="text-center group scroll-trigger">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-prologue-electric to-purple-600 rounded-none flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110">
                    <Tablet className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl lg:text-3xl font-athletic font-black text-slate-900 mb-4 tracking-wide">
                  CREATE YOUR COURSE
                </h3>
                <p className="text-lg text-slate-600 font-body leading-relaxed">
                  Share your expertise through video, written content, and interactive tools. Build training programs
                  that reflect your journey — from the drills that shaped you to the lessons that got you noticed.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center group scroll-trigger">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-prologue-fire to-red-500 rounded-none flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110">
                    <Play className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl lg:text-3xl font-athletic font-black text-slate-900 mb-4 tracking-wide">
                  GET PAID FOR YOUR EXPERTISE
                </h3>
                <p className="text-lg text-slate-600 font-body leading-relaxed">
                  Earn money when athletes access your content, subscribe to your channel, and purchase your training
                  plans.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center group scroll-trigger">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-500 rounded-none flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl lg:text-3xl font-athletic font-black text-slate-900 mb-4 tracking-wide">
                  MENTOR FUTURE ATHLETES
                </h3>
                <p className="text-lg text-slate-600 font-body leading-relaxed">
                  Guide the next generation with personalized feedback, video reviews, and community engagement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Angled Divider */}
        <section className="relative h-16 lg:h-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-white to-slate-100 transform skew-y-2 origin-bottom-left"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-prologue-electric/10 to-prologue-fire/10 transform skew-y-1 origin-bottom-right"></div>
        </section>

        {/* How Athletes Make Money Section */}
        <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
          <div className="container mx-auto px-6 lg:px-8 relative z-10">
            {/* Centered Header */}
            <div className="text-center mb-20 scroll-trigger">
              <h2 className="text-5xl lg:text-6xl font-athletic font-black text-white mb-6 tracking-tight">
                HOW ATHLETES MAKE MONEY
              </h2>
              <div className="w-32 h-1.5 bg-gradient-to-r from-prologue-electric to-prologue-fire mx-auto mb-8"></div>
            </div>

            {/* Revenue Streams Grid */}
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 stagger-cards">
              {/* Subscriptions */}
              <div className="bg-white/5 backdrop-blur-sm rounded-none p-8 text-center space-y-6 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:-translate-y-2 group border-l-4 border-prologue-electric scroll-trigger">
                <div className="w-16 h-16 bg-gradient-to-r from-prologue-electric to-purple-600 rounded-none flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-athletic font-bold text-white mb-3 tracking-wide">SUBSCRIPTIONS</h3>
                  <p className="text-gray-300 font-body text-sm leading-relaxed">
                    Earn recurring revenue from fans subscribing to your exclusive content and training programs.
                  </p>
                </div>
              </div>

              {/* Video Reviews */}
              <div className="bg-white/5 backdrop-blur-sm rounded-none p-8 text-center space-y-6 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:-translate-y-2 group border-l-4 border-prologue-fire scroll-trigger">
                <div className="w-16 h-16 bg-gradient-to-r from-prologue-fire to-red-500 rounded-none flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Video className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-athletic font-bold text-white mb-3 tracking-wide">VIDEO REVIEWS</h3>
                  <p className="text-gray-300 font-body text-sm leading-relaxed">
                    Get paid for reviewing practice videos and providing personalized feedback to aspiring athletes.
                  </p>
                </div>
              </div>

              {/* Training Plans */}
              <div className="bg-white/5 backdrop-blur-sm rounded-none p-8 text-center space-y-6 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:-translate-y-2 group border-l-4 border-purple-600 scroll-trigger">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-500 rounded-none flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Tablet className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-athletic font-bold text-white mb-3 tracking-wide">TRAINING PLANS</h3>
                  <p className="text-gray-300 font-body text-sm leading-relaxed">
                    Sell specialized workout plans and training regimens based on your personal journey and expertise.
                  </p>
                </div>
              </div>

              {/* Merchandise */}
              <div className="bg-white/5 backdrop-blur-sm rounded-none p-8 text-center space-y-6 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:-translate-y-2 group border-l-4 border-yellow-500 scroll-trigger">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-none flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-athletic font-bold text-white mb-3 tracking-wide">MERCHANDISE</h3>
                  <p className="text-gray-300 font-body text-sm leading-relaxed">
                    Create and sell branded apparel and products to further monetize your personal brand.
                  </p>
                </div>
              </div>
            </div>

            {/* Take Control of Your NIL */}
            <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-sm rounded-none p-8 border-l-4 border-prologue-electric scroll-trigger">
              <h3 className="text-3xl font-athletic font-black text-white mb-4 tracking-wide">
                TAKE CONTROL OF YOUR NIL
              </h3>
              <p className="text-lg text-gray-300 font-body leading-relaxed">
                On Prologue, you own your content and your community. We provide the platform, tools, and support to
                help you monetize your knowledge and experience effectively.
              </p>
            </div>
          </div>
        </section>

        {/* Angled Divider */}
        <section className="relative h-16 lg:h-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 transform -skew-y-2 origin-top-left"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-prologue-electric/20 to-prologue-fire/20 transform -skew-y-1 origin-top-right"></div>
        </section>

        {/* Who It's For Section */}
        <section className="py-20 lg:py-28 bg-gradient-to-br from-white via-gray-50 to-slate-100 relative overflow-hidden">
          <div className="container mx-auto px-6 lg:px-8 relative z-10">
            {/* Centered Header */}
            <div className="text-center mb-20 scroll-trigger">
              <h2 className="text-5xl lg:text-6xl font-athletic font-black text-slate-900 mb-6 tracking-tight">
                WHO IT'S FOR
              </h2>
              <div className="w-32 h-1.5 bg-gradient-to-r from-prologue-electric to-prologue-fire mx-auto mb-8"></div>
            </div>

            {/* Target Athletes */}
            <div className="max-w-6xl mx-auto mb-16 scroll-trigger">
              <h3 className="text-3xl font-athletic font-black text-slate-900 mb-8 tracking-wide">TARGET ATHLETES:</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-none p-6 border-l-4 border-prologue-electric shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <h4 className="text-xl font-athletic font-bold text-slate-900 mb-3 tracking-wide">
                    COLLEGE ATHLETES
                  </h4>
                  <p className="text-slate-600 font-body">
                    Leveraging NIL opportunities and building your personal brand
                  </p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-none p-6 border-l-4 border-prologue-fire shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <h4 className="text-xl font-athletic font-bold text-slate-900 mb-3 tracking-wide">PRO ATHLETES</h4>
                  <p className="text-slate-600 font-body">Sharing your journey and expanding your impact</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-none p-6 border-l-4 border-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <h4 className="text-xl font-athletic font-bold text-slate-900 mb-3 tracking-wide">
                    SEMI-PRO ATHLETES
                  </h4>
                  <p className="text-slate-600 font-body">Building your brand and creating new revenue streams</p>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="max-w-4xl mx-auto scroll-trigger">
              <h3 className="text-3xl font-athletic font-black text-slate-900 mb-8 tracking-wide">BENEFITS:</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-prologue-electric rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-lg text-slate-700 font-body">Control your brand and narrative</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-prologue-electric rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-lg text-slate-700 font-body">Build sustainable income from your expertise</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-prologue-electric rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-lg text-slate-700 font-body">Give back to the sports community</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-prologue-electric rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-lg text-slate-700 font-body">Create impact beyond your playing career</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center mt-20 scroll-trigger">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-prologue-electric via-purple-600 to-prologue-fire hover:from-prologue-blue hover:via-purple-700 hover:to-prologue-orange text-white px-16 py-6 text-xl font-athletic font-black tracking-wider shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 group relative overflow-hidden rounded-none border-2 border-transparent hover:border-white/30"
                >
                  <span className="relative z-10">SIGN UP NOW</span>
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Button>
              </Link>
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
                      src="/Prologue LOGO-1.png"
                      alt="PROLOGUE"
                      width={40}
                      height={40}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-3xl font-athletic font-black text-white group-hover:text-prologue-electric transition-colors tracking-wider">
                    PROLOGUE
                  </span>
                </button>
              </div>

              {/* Main CTA Headline */}
              <h2 className="text-5xl lg:text-6xl font-athletic font-black text-white leading-tight tracking-tight">
                START YOUR COACHING
                <br />
                <span className="text-prologue-electric">LEGACY TODAY</span>
              </h2>

              {/* Subtitle */}
              <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl font-body">
                Share your story, inspire the next generation, and build your athletic legacy.
              </p>

              {/* CTA Button */}
              <div className="pt-8">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-prologue-electric to-prologue-fire hover:from-prologue-blue hover:to-prologue-orange text-white px-12 py-6 text-lg font-athletic font-black tracking-wider rounded-none shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 group border-2 border-transparent hover:border-white/30"
                  >
                    JOIN PROLOGUE NOW
                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </Link>
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
                      src="/Prologue LOGO-1.png"
                      alt="PROLOGUE"
                      width={24}
                      height={24}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-lg font-athletic font-bold text-white group-hover:text-prologue-electric transition-colors tracking-wider">
                    PROLOGUE
                  </span>
                </button>
                <span className="text-gray-400 text-sm font-athletic tracking-wide">FOR ATHLETES. BY ATHLETES.</span>
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
