"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign, Save, Loader2, AlertCircle, TrendingUp } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { getAuth } from "firebase/auth"

const MAX_CHANGES = 2;
const WINDOW_DAYS = 14;
const WINDOW_MS = WINDOW_DAYS * 24 * 60 * 60 * 1000;

interface AthletePricingManagerProps {
  athleteData: {
    email: string
    firstName: string
    lastName: string
  }
}

export function AthletePricingManager({ athleteData }: AthletePricingManagerProps) {
  const [pricing, setPricing] = useState({
    basic: 4.99,
    pro: 9.99,
    premium: 19.99,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastPricingUpdate, setLastPricingUpdate] = useState<string | null>(null)
  const [pricingChangeHistory, setPricingChangeHistory] = useState<string[]>([])
  const [cooldownError, setCooldownError] = useState<string | null>(null)
  const [changesLeft, setChangesLeft] = useState<number>(MAX_CHANGES)
  const [nextChangeAllowed, setNextChangeAllowed] = useState<string | null>(null)

  // Load athlete's current pricing and change history
  useEffect(() => {
    const loadPricing = async () => {
      try {
        const auth = getAuth()
        const user = auth.currentUser
        if (!user) return

        const idToken = await user.getIdToken()
        const response = await fetch('/api/athlete/profile', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.pricing) {
            setPricing({
              basic: data.pricing.basic || 4.99,
              pro: data.pricing.pro || 9.99,
              premium: data.pricing.premium || 19.99,
            })
          }
          if (data.lastPricingUpdate) {
            setLastPricingUpdate(data.lastPricingUpdate)
          }
          if (data.pricingChangeHistory) {
            setPricingChangeHistory(data.pricingChangeHistory)
          }
        }
      } catch (error) {
        console.error('Error loading pricing:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPricing()
  }, [])

  // Cooldown logic for 2 changes per 14 days
  useEffect(() => {
    if (!pricingChangeHistory || pricingChangeHistory.length === 0) {
      setCooldownError(null)
      setChangesLeft(MAX_CHANGES)
      setNextChangeAllowed(null)
      return
    }
    const now = Date.now()
    const recent = pricingChangeHistory.filter(ts => now - new Date(ts).getTime() < WINDOW_MS)
    setChangesLeft(MAX_CHANGES - recent.length)
    setPricingChangeHistory(recent)
    if (recent.length >= MAX_CHANGES) {
      // Find when the next change will be allowed
      const oldest = new Date(recent[0]).getTime()
      const msUntilNext = WINDOW_MS - (now - oldest)
      const daysUntilNext = Math.ceil(msUntilNext / (24 * 60 * 60 * 1000))
      setCooldownError(`You can only change your pricing twice every 14 days. Please try again in ${daysUntilNext} day(s).`)
      setNextChangeAllowed(new Date(now + msUntilNext).toLocaleString())
    } else {
      setCooldownError(null)
      setNextChangeAllowed(null)
    }
  }, [pricingChangeHistory])

  // Frontend validation
  let validationError: string | null = null
  if (pricing.basic < 4.99) {
    validationError = "Basic tier must be at least $4.99"
  } else if (pricing.pro <= pricing.basic) {
    validationError = "Pro tier must be greater than Basic tier"
  } else if (pricing.premium <= pricing.pro) {
    validationError = "Premium tier must be greater than Pro tier"
  }

  const handleSavePricing = async () => {
    setIsSaving(true)
    setError(null)

    try {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) {
        throw new Error('User not authenticated')
      }

      const idToken = await user.getIdToken()

      const response = await fetch('/api/athlete/save-pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ pricing }),
      })

      const data = await response.json()
      if (!response.ok) {
        setChangesLeft(data.changesLeft ?? 0)
        setNextChangeAllowed(data.nextChangeAllowed ?? null)
        throw new Error(data.error || 'Failed to save pricing')
      }
      setLastPricingUpdate(data.lastPricingUpdate || new Date().toISOString())
      setPricingChangeHistory(data.pricingChangeHistory || [])
      setChangesLeft(data.changesLeft ?? MAX_CHANGES)
      setNextChangeAllowed(data.nextChangeAllowed ?? null)
      toast({
        title: "Pricing Updated",
        description: "Your subscription pricing has been saved successfully.",
        duration: 3000,
      })
    } catch (error: any) {
      console.error('Error saving pricing:', error)
      setError(error.message || 'Failed to save pricing')
      toast({
        title: "Error",
        description: error.message || 'Failed to save pricing',
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePriceChange = (tier: 'basic' | 'pro' | 'premium', value: string) => {
    let numValue = parseFloat(value)
    if (tier === 'basic' && numValue < 4.99) numValue = 4.99
    if (isNaN(numValue)) numValue = 0
    setPricing(prev => ({
      ...prev,
      [tier]: numValue
    }))
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>Subscription Pricing</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Loading pricing...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          <span>Subscription Pricing</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Set your monthly subscription prices for different tiers. These prices will be visible to potential subscribers.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {(error || validationError || cooldownError) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600">{error || validationError || cooldownError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Basic Tier */}
          <div className="space-y-3">
            <Label htmlFor="basic-price" className="text-base font-semibold">
              Basic Tier
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                $
              </span>
              <Input
                id="basic-price"
                type="number"
                step="0.01"
                min="4.99"
                max="50"
                value={pricing.basic}
                onChange={(e) => handlePriceChange('basic', e.target.value)}
                className="pl-8"
                placeholder="4.99"
              />
            </div>
            <p className="text-xs text-gray-500">
              Access to basic content, monthly Q&A, community access
            </p>
          </div>

          {/* Pro Tier */}
          <div className="space-y-3">
            <Label htmlFor="pro-price" className="text-base font-semibold">
              Pro Tier
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                $
              </span>
              <Input
                id="pro-price"
                type="number"
                step="0.01"
                min={pricing.basic + 0.01}
                max="100"
                value={pricing.pro}
                onChange={(e) => handlePriceChange('pro', e.target.value)}
                className="pl-8"
                placeholder="9.99"
              />
            </div>
            <p className="text-xs text-gray-500">
              Weekly video feedback, personalized training, priority support
            </p>
          </div>

          {/* Premium Tier */}
          <div className="space-y-3">
            <Label htmlFor="premium-price" className="text-base font-semibold">
              Premium Tier
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                $
              </span>
              <Input
                id="premium-price"
                type="number"
                step="0.01"
                min={pricing.pro + 0.01}
                max="200"
                value={pricing.premium}
                onChange={(e) => handlePriceChange('premium', e.target.value)}
                className="pl-8"
                placeholder="19.99"
              />
            </div>
            <p className="text-xs text-gray-500">
              1-on-1 coaching, custom programs, nutrition planning, 24/7 support
            </p>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <h4 className="font-semibold text-green-800">Current Pricing Summary</h4>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-gray-900">Basic</div>
              <div className="text-green-600 font-semibold">${pricing.basic.toFixed(2)}/mo</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900">Pro</div>
              <div className="text-blue-600 font-semibold">${pricing.pro.toFixed(2)}/mo</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900">Premium</div>
              <div className="text-purple-600 font-semibold">${pricing.premium.toFixed(2)}/mo</div>
            </div>
          </div>
        </div>

        {/* Change Limit Info */}
        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="font-medium text-blue-800 mb-1">Change Limit</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• You have <b>{changesLeft}</b> pricing change(s) left in this 14-day window.</li>
                {nextChangeAllowed && (
                  <li>• Next change allowed: <b>{nextChangeAllowed}</b></li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Pricing Guidelines */}
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="font-medium text-amber-800 mb-1">Pricing Guidelines</h5>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Basic tier must be at least $4.99</li>
                <li>• Pro tier must be greater than Basic</li>
                <li>• Premium tier must be greater than Pro</li>
                <li>• You can only change prices <b>twice every 14 days</b></li>
                <li>• Consider your expertise, content quality, and market rates</li>
                <li>• You can adjust prices anytime, but changes affect new subscribers only</li>
              </ul>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSavePricing}
          className="w-full bg-prologue-electric hover:bg-prologue-blue"
          disabled={isSaving || !!validationError || !!cooldownError}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving Pricing...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Pricing
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
} 