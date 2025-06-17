"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Award, TrendingUp, Play, Zap, Target, Flame } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState, useCallback, useRef } from "react"

interface PrologueLandingProps {
  onLogin: () => void
  onSignUp: () => void
}

export default function PrologueLanding({ onLogin, onSignUp }: PrologueLandingProps) {
  // ... rest of your component code ...
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden">
      {/* ... header section ... */}
      <header>
        {/* ... other header content ... */}
        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center space-x-3">
          <button
            onClick={onLogin}
            className="text-xs font-athletic font-medium text-gray-300 hover:text-prologue-electric transition-all duration-300 tracking-wide px-2 py-1"
          >
            LOG IN
          </button>
          <Button
            size="sm"
            onClick={onSignUp}
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
            onClick={onLogin}
            className="text-sm font-athletic font-medium text-gray-300 hover:text-prologue-electric transition-all duration-300 hover:scale-105 tracking-wide"
          >
            LOG IN
          </button>
          <Button
            size="sm"
            onClick={onSignUp}
            className="bg-gradient-to-r from-prologue-electric to-prologue-fire hover:from-prologue-blue hover:to-prologue-orange text-white px-6 py-2 rounded-none font-athletic font-bold tracking-wider hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-transparent hover:border-white/20"
          >
            SIGN UP
          </Button>
        </nav>
      </header>
      {/* ... rest of your component JSX ... */}
    </div>
  )
} 