"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export default function TermsOfService() {
  const [showContactDialog, setShowContactDialog] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Contact Dialog */}
      {showContactDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowContactDialog(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
            <div className="text-center">
              <h3 className="text-2xl font-athletic font-bold text-slate-900 mb-6 tracking-wide">
                CONTACT INFORMATION
              </h3>
              <div className="space-y-4 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-prologue-electric rounded-none flex items-center justify-center">
                    <span className="text-white text-sm font-bold">📞</span>
                  </div>
                  <div>
                    <p className="font-athletic font-medium text-slate-900">Phone</p>
                    <p className="text-slate-600">501-800-7673</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-prologue-fire rounded-none flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✉️</span>
                  </div>
                  <div>
                    <p className="font-athletic font-medium text-slate-900">Email</p>
                    <p className="text-slate-600">PROLOGUEHQ@GMAIL.COM</p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Button
                  onClick={() => setShowContactDialog(false)}
                  className="bg-gradient-to-r from-prologue-electric to-prologue-fire text-white px-8 py-2 font-athletic font-bold tracking-wider rounded-none hover:scale-105 transition-all duration-300"
                >
                  CLOSE
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="px-6 lg:px-8 h-16 flex items-center justify-between backdrop-blur-md border-b border-gray-700/50 bg-slate-900/95">
        {/* Left Side - Logo and Brand */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-3 group cursor-pointer">
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
          </Link>
        </div>

        {/* Back Button */}
        <Link href="/">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-600 text-gray-300 hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-all duration-300 font-athletic font-medium tracking-wide rounded-none bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            BACK TO HOME
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 lg:px-8 py-12 max-w-4xl">
        <div className="bg-white/5 backdrop-blur-sm rounded-none p-8 lg:p-12 border border-gray-700/50">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl lg:text-5xl font-athletic font-black text-white mb-4 tracking-tight">
              TERMS OF SERVICE
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-prologue-electric to-prologue-fire mx-auto mb-6"></div>
            <p className="text-lg text-gray-300 font-body">Effective Date: July 8, 2025</p>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            <div className="text-gray-300 font-body leading-relaxed space-y-8">
              <p className="text-xl mb-8">
                Welcome to PROLOGUE. Please read these Terms of Service ("Terms") carefully before accessing or using
                our platform. These Terms form a legally binding agreement between you ("User" or "Creator") and
                PROLOGUE, Inc. ("PROLOGUE," "we," "us," or "our"). By accessing or using our website, mobile
                application, or services (collectively, the "Platform"), you acknowledge that you have read, understood,
                and agree to be bound by these Terms.
              </p>

              <section>
                <h2 className="text-2xl font-athletic font-bold text-white mb-4 tracking-wide">1. Overview</h2>
                <p>
                  PROLOGUE is a platform that enables athletes to monetize their knowledge, training experience, and
                  journey through subscription-based courses, personalized feedback, and educational content. These
                  Terms govern your use of the Platform and any content, products, or services offered by PROLOGUE.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-athletic font-bold text-white mb-4 tracking-wide">
                  2. Account Eligibility and Conduct
                </h2>
                <p className="mb-4">
                  You must be at least 13 years of age to register and use PROLOGUE. If you are under 18, you may only
                  use the Platform with the consent of a parent or legal guardian. You are responsible for maintaining
                  the confidentiality of your account and all activities conducted under it.
                </p>
                <p className="mb-4">
                  You agree to use the Platform only for lawful purposes and in accordance with these Terms. You will
                  not:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Impersonate any person or misrepresent your identity.</li>
                  <li>
                    Post, share, or promote any content that is illegal, harmful, hateful, defamatory, or otherwise
                    objectionable.
                  </li>
                  <li>Infringe on any third-party intellectual property rights.</li>
                  <li>Attempt to disrupt or interfere with the integrity or performance of the Platform.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-athletic font-bold text-white mb-4 tracking-wide">
                  3. Creator Compensation and Revenue Share
                </h2>
                <p>
                  Creators on PROLOGUE earn revenue through user subscriptions and purchases. PROLOGUE retains the right
                  to modify the revenue share percentage at any time, with reasonable notice. We are committed to fair
                  compensation, but reserve the discretion to adjust our pricing and payment model to ensure
                  sustainability and continued innovation.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-athletic font-bold text-white mb-4 tracking-wide">
                  4. Content Ownership and License
                </h2>
                <p className="mb-4">
                  Creators retain ownership of the content they upload but grant PROLOGUE a non-exclusive, royalty-free,
                  worldwide license to host, distribute, and promote that content on the Platform. By submitting
                  content, you affirm that you have the legal right to do so and that it does not violate any
                  third-party rights.
                </p>
                <p>
                  We reserve the right to remove any content or terminate accounts that violate these Terms or for any
                  other reason at our sole discretion, with or without notice.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-athletic font-bold text-white mb-4 tracking-wide">5. Termination</h2>
                <p>
                  PROLOGUE may suspend or terminate your access to the Platform at any time for any reason, including
                  but not limited to violations of these Terms, fraudulent activity, or misuse of the Platform. Upon
                  termination, you forfeit access to any subscriptions, content, or earnings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-athletic font-bold text-white mb-4 tracking-wide">
                  6. Modifications to the Platform
                </h2>
                <p>
                  We may update, modify, or discontinue the Platform or any of its features at any time, without
                  liability. This includes changes to pricing, payment models, and creator policies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-athletic font-bold text-white mb-4 tracking-wide">
                  7. Disclaimers and Limitation of Liability
                </h2>
                <p className="mb-4">
                  The Platform is provided "as is" and "as available" without warranties of any kind. PROLOGUE disclaims
                  all warranties, express or implied, including fitness for a particular purpose and non-infringement.
                </p>
                <p>
                  Under no circumstances shall PROLOGUE or its affiliates be liable for any indirect, incidental, or
                  consequential damages arising out of your use of the Platform. Our total liability to you shall not
                  exceed $100.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-athletic font-bold text-white mb-4 tracking-wide">8. Indemnification</h2>
                <p>
                  You agree to indemnify and hold harmless PROLOGUE, its affiliates, officers, and employees from any
                  claims, liabilities, damages, or expenses (including legal fees) arising out of your use of the
                  Platform, your content, or your violation of these Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-athletic font-bold text-white mb-4 tracking-wide">9. Privacy</h2>
                <p>
                  We collect and use data as described in our Privacy Policy. By using PROLOGUE, you consent to such
                  data collection and usage.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-athletic font-bold text-white mb-4 tracking-wide">
                  10. Governing Law and Dispute Resolution
                </h2>
                <p>
                  These Terms shall be governed by the laws of the State of Arkansas. Any dispute arising from these
                  Terms will be subject to binding arbitration in Little Rock, Arkansas, in accordance with the rules of
                  the American Arbitration Association.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-athletic font-bold text-white mb-4 tracking-wide">11. Changes to Terms</h2>
                <p>
                  We may revise these Terms at any time. Continued use of the Platform constitutes acceptance of the
                  updated Terms. It is your responsibility to review these Terms periodically.
                </p>
              </section>

              {/* Final Acknowledgment */}
              <section className="pt-8 border-t border-gray-700/50">
                <p className="text-lg text-gray-300 mb-6">
                  By using PROLOGUE, you acknowledge that you have read and understood these Terms and agree to be bound
                  by them.
                </p>
                <div className="text-center">
                  <p className="text-xl font-athletic font-bold text-white mb-2">PROLOGUE, Inc.</p>
                  <p className="text-lg text-prologue-electric font-athletic font-medium italic">
                    "Where Every Athlete's Story Begins"
                  </p>
                </div>
              </section>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="mt-12 pt-8 border-t border-gray-700/50 text-center">
            <p className="text-gray-400 mb-6 font-body">Have questions about our Terms of Service?</p>
            <Button
              variant="outline"
              size="lg"
              className="border-prologue-electric text-prologue-electric hover:bg-prologue-electric hover:text-white transition-all duration-300 font-athletic font-medium tracking-wide rounded-none bg-transparent"
              onClick={() => setShowContactDialog(true)}
            >
              CONTACT US
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
} 