"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function TestReferralPage() {
  const [referrerName, setReferrerName] = useState("")
  const [referralLink, setReferralLink] = useState("")
  const [referrerInfo, setReferrerInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const generateReferralLink = () => {
    if (!referrerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a referrer name",
        variant: "destructive",
      })
      return
    }

    const link = `${window.location.origin}/${encodeURIComponent(referrerName.trim())}`
    setReferralLink(link)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const validateReferrer = async () => {
    if (!referrerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a referrer name",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/referral/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ referrerName: referrerName.trim() }),
      })

      const data = await response.json()

      if (response.ok && data.valid) {
        setReferrerInfo(data.referrer)
        toast({
          title: data.isAthlete ? "Valid Athlete Referrer" : "Valid Referrer",
          description: `${data.referrer.name} is a valid referrer${data.isAthlete ? ' (registered athlete)' : ' (any name allowed)'}`,
        })
      } else {
        setReferrerInfo(null)
        toast({
          title: "Invalid Referrer",
          description: data.error || "Referrer not found",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate referrer",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const testReferralFlow = () => {
    // Store a test referrer in localStorage
    localStorage.setItem("prologue_referrer", referrerName.trim())
    toast({
      title: "Test Referral Stored",
      description: "Referrer stored in localStorage. Try signing up now!",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Referral System Test</h1>
          <p className="text-gray-600">Test the referral system functionality</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Referrer Validation */}
          <Card>
            <CardHeader>
              <CardTitle>Validate Referrer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="referrer-name">Referrer Name</Label>
                <Input
                  id="referrer-name"
                  value={referrerName}
                  onChange={(e) => setReferrerName(e.target.value)}
                  placeholder="Enter athlete name"
                />
              </div>
              <Button onClick={validateReferrer} disabled={loading}>
                {loading ? "Validating..." : "Validate Referrer"}
              </Button>

              {referrerInfo && (
                <div className="border rounded-lg p-4 bg-green-50">
                  <h3 className="font-semibold text-green-800 mb-2">Valid Referrer</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Name:</span>
                      <span className="text-sm">{referrerInfo.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Type:</span>
                      <Badge variant={referrerInfo.totalReferrals > 0 ? "default" : "secondary"}>
                        {referrerInfo.totalReferrals > 0 ? "Registered Athlete" : "Any Name"}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Sport:</span>
                      <span className="text-sm">{referrerInfo.sport}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Total Referrals:</span>
                      <Badge variant="secondary">{referrerInfo.totalReferrals}</Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generate Referral Link */}
          <Card>
            <CardHeader>
              <CardTitle>Generate Referral Link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={generateReferralLink} disabled={!referrerName.trim()}>
                Generate Link
              </Button>

              {referralLink && (
                <div className="space-y-2">
                  <Label>Referral Link</Label>
                  <div className="flex items-center space-x-2">
                    <Input value={referralLink} readOnly />
                    <Button size="sm" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => window.open(referralLink, '_blank')}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Test Referral Flow */}
        <Card>
          <CardHeader>
            <CardTitle>Test Referral Flow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              This will simulate storing a referrer in localStorage and test the referral flow.
            </p>
            <Button onClick={testReferralFlow} disabled={!referrerName.trim()}>
              Test Referral Flow
            </Button>
            <div className="text-xs text-gray-500">
              <p>Steps to test:</p>
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>Enter a valid referrer name above</li>
                <li>Click "Test Referral Flow" to store the referrer</li>
                <li>Go to the signup page and create a new account</li>
                <li>Check the user's profile for the referrer field</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Current localStorage Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current localStorage Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Stored Referrer:</span>
                <span className="text-sm">
                  {typeof window !== 'undefined' ? localStorage.getItem("prologue_referrer") || "None" : "None"}
                </span>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  localStorage.removeItem("prologue_referrer")
                  toast({
                    title: "Cleared",
                    description: "Referrer cleared from localStorage",
                  })
                }}
              >
                Clear Referrer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 