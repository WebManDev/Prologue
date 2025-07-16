"use client"
import { X, Phone, Mail, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ContactPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function ContactPopup({ isOpen, onClose }: ContactPopupProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Popup Content */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-prologue-electric/30 shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative p-6 border-b border-slate-700/50">
          <div className="absolute inset-0 bg-gradient-to-r from-prologue-electric/10 to-prologue-fire/10" />
          <div className="relative flex items-center justify-between">
            <h2 className="text-2xl font-athletic font-black text-white tracking-wider">CONTACT US</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-slate-700/50 transition-all duration-300 rounded-none p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Phone */}
          <div className="flex items-center space-x-4 group">
            <div className="w-12 h-12 bg-gradient-to-r from-prologue-electric to-purple-600 rounded-none flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-athletic font-medium text-gray-400 tracking-wide">PHONE</p>
              <a
                href="tel:501-800-7673"
                className="text-lg font-athletic font-bold text-white hover:text-prologue-electric transition-colors duration-300"
              >
                501-800-7673
              </a>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center space-x-4 group">
            <div className="w-12 h-12 bg-gradient-to-r from-prologue-fire to-red-500 rounded-none flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-athletic font-medium text-gray-400 tracking-wide">EMAIL</p>
              <a
                href="mailto:PROLOGUEHQ@GMAIL.COM"
                className="text-lg font-athletic font-bold text-white hover:text-prologue-electric transition-colors duration-300 break-all"
              >
                PROLOGUEHQ@GMAIL.COM
              </a>
            </div>
          </div>

          {/* Hours */}
          <div className="flex items-center space-x-4 group">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-500 rounded-none flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-athletic font-medium text-gray-400 tracking-wide">HOURS</p>
              <p className="text-lg font-athletic font-bold text-white">24/7 SUPPORT</p>
            </div>
          </div>

          {/* Response Time */}
          <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-none">
            <p className="text-sm font-athletic font-medium text-prologue-electric mb-2 tracking-wide">RESPONSE TIME</p>
            <p className="text-sm text-gray-300 font-body">
              We typically respond within 24 hours. For urgent matters, please call directly.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700/50 bg-slate-800/30">
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-prologue-electric to-prologue-fire hover:from-prologue-blue hover:to-prologue-orange text-white font-athletic font-bold tracking-wider transition-all duration-300 hover:scale-105 rounded-none"
          >
            CLOSE
          </Button>
        </div>
      </div>
    </div>
  )
} 