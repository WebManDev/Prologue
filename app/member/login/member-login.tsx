"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function MemberLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Member login:", formData)
    // Redirect to member dashboard instead of staying on login page
    router.push("/member-dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-800 to-blue-800 relative overflow-hidden">
      {/* Header */}
      <header className="px-6 lg:px-8 h-16 flex items-center justify-between backdrop-blur-md border-b border-gray-700/50 relative z-10">
        <Link href="/" className="flex items-center space-x-3 group cursor-pointer">
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
        </Link>

        <Link href="/login" className="flex items-center space-x-2 text-gray-300 hover:text-white group">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">BACK</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 lg:px-8 py-12 relative z-10">
        <div className="max-w-md w-full">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome Back, Member!</h1>
              <p className="text-lg text-gray-600">Sign in to continue training</p>
            </div>

            {/* Google Sign In */}
            <div className="mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 rounded-xl border-2 hover:bg-gray-50 flex items-center justify-center space-x-3"
                onClick={() => console.log("Google sign in for member")}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-medium text-gray-700">Continue with Google</span>
              </Button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="h-12 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  className="h-12 rounded-xl"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold"
              >
                SIGN IN
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="text-center pt-4">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/signup/member" className="text-blue-500 hover:text-blue-600 font-medium">
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
} 