"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import MobileLayout from "@/components/mobile/mobile-layout"
import { useMemberNotifications } from "@/contexts/member-notification-context"
import { useEffect, useState, Suspense } from "react"
import { SubscriptionCheckout } from "@/components/subscription-checkout"
import { CREATORS } from "@/lib/creators"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

const subscriptionTiers = [
  {
    name: "Basic",
    price: 4.99,
    features: ["Access to free content", "Limited community access", "Email support", "Monthly newsletter"],
    buttonText: "Choose Basic",
    description: "Perfect for getting started with creator content.",
  },
  {
    name: "Pro",
    price: 29.99,
    features: [
      "Access to all premium content",
      "Direct messaging with creator",
      "Personalized training plans (limited)",
      "Priority email support",
      "Exclusive community forums",
      "Early access to new content",
    ],
    buttonText: "Choose Pro",
    highlight: true,
    description: "Unlock full access to exclusive content and direct interaction.",
  },
  {
    name: "Premium",
    price: 49.99,
    features: [
      "Access to all premium content",
      "Direct messaging with creator",
      "Personalized training plans (full)",
      "24/7 chat support",
      "Exclusive community forums",
      "Early access to new content",
      "Monthly Q&A sessions",
      "1-on-1 video call (1/month)",
    ],
    buttonText: "Choose Premium",
    description: "The ultimate experience with personalized coaching and exclusive benefits.",
  },
]

function MemberSubscriptionPlansContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const athleteId = searchParams ? searchParams.get("athleteId") : null
  const { toast } = useToast()
  const { isMobile, isTablet } = useMobileDetection()
  const { unreadMessagesCount, unreadNotificationsCount } = useMemberNotifications()
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | 'premium' | null>(null)
  const [athlete, setAthlete] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  // TODO: Replace with real member info from auth context
  const memberEmail = "testuser@email.com"
  const memberName = "Test User"

  useEffect(() => {
    async function fetchAthlete() {
      if (!athleteId) return setLoading(false)
      // Try static creators first
      let found = CREATORS.find(a => a.id === athleteId)
      if (found) {
        setAthlete(found)
        setLoading(false)
        return
      }
      // Try Firebase
      try {
        const docRef = doc(db, "athletes", athleteId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setAthlete({ id: docSnap.id, ...docSnap.data() })
        } else {
          setAthlete(null)
        }
      } catch {
        setAthlete(null)
      }
      setLoading(false)
    }
    fetchAthlete()
  }, [athleteId])

  const handleChoosePlan = (planName: string) => {
    setSelectedPlan(planName as 'basic' | 'pro' | 'premium')
  }
  const handleBackToPlans = () => {
    setSelectedPlan(null)
  }
  const handleCheckoutSuccess = () => {
    toast({
      title: "Subscription Successful!",
      description: `Thank you for subscribing to ${athlete?.name}'s ${selectedPlan} plan.`,
      duration: 4000,
    })
    setSelectedPlan(null)
    // Optionally redirect or refresh
  }

  const MainContent = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
      <main className="max-w-6xl mx-auto px-4 lg:px-6 py-8 pb-20 lg:pb-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Subscription Plan</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select the plan that best fits your needs to unlock exclusive content and personalized coaching from your
            favorite creators.
          </p>
        </div>
        {/* Plan cards should be directly below the heading/description */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 text-lg">Loading...</div>
        ) : !athlete ? (
          <div className="text-center py-20 text-red-500 text-lg">Athlete not found.</div>
        ) : selectedPlan ? (
          <div className="max-w-lg mx-auto">
            <Button variant="outline" className="mb-6" onClick={handleBackToPlans}>
              &larr; Back to plans
            </Button>
            {/* Add selected plan text above the plan card */}
            <div className="text-center font-semibold text-lg mb-4">Selected Plan: {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}</div>
            {(() => {
              const tier = subscriptionTiers.find(t => t.name.toLowerCase() === selectedPlan)
              if (!tier) return null
              return (
                <Card className={`mb-8 p-6 rounded-2xl shadow-lg border-2 ${tier.highlight ? "border-prologue-electric" : "border-gray-200"}`}>
                  <CardHeader className="pb-4">
                    <CardTitle className={`text-2xl font-bold ${tier.highlight ? "text-prologue-electric" : "text-gray-900"}`}>{tier.name}</CardTitle>
                    <p className="text-gray-500 text-sm">{tier.description}</p>
                    <div className="text-4xl font-extrabold text-gray-900 mt-4">
                      ${tier.price}
                      <span className="text-lg font-medium text-gray-500">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-gray-700 mb-2">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })()}
            <SubscriptionCheckout
              athlete={{
                ...athlete,
                pricing: athlete.pricing || {
                  basic: 4.99,
                  pro: 29.99,
                  premium: 49.99,
                },
              }}
              members={{
                id: "temp-member-id", // TODO: Replace with actual member ID from auth
                name: memberName,
                email: memberEmail,
              }}
              onSuccess={handleCheckoutSuccess}
              onCancel={handleBackToPlans}
              selectedPlan={selectedPlan}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {subscriptionTiers.map((tier) => (
              <Card
                key={tier.name}
                className={`flex flex-col justify-between p-6 rounded-2xl shadow-lg transition-all duration-300 ${
                  tier.highlight ? "border-2 border-prologue-electric scale-105" : "border border-gray-200"
                }`}
              >
                <CardHeader className="pb-4">
                  <CardTitle
                    className={`text-2xl font-bold ${tier.highlight ? "text-prologue-electric" : "text-gray-900"}`}
                  >
                    {tier.name}
                  </CardTitle>
                  <p className="text-gray-500 text-sm">{tier.description}</p>
                  <div className="text-4xl font-extrabold text-gray-900 mt-4">
                    ${tier.price}
                    <span className="text-lg font-medium text-gray-500">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <ul className="space-y-3 text-gray-700 mb-8">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleChoosePlan(tier.name.toLowerCase())}
                    className={`w-full py-3 text-lg font-semibold transition-all duration-200 ${
                      tier.highlight
                        ? "bg-prologue-electric hover:bg-prologue-blue text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                    }`}
                  >
                    {tier.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )

  if (isMobile || isTablet) {
    return (
      <MobileLayout
        userType="member"
        currentPath="/member-subscription-plans"
        showBottomNav={true}
        unreadNotifications={unreadNotificationsCount}
        unreadMessages={unreadMessagesCount}
        hasNewContent={false}
      >
        <MainContent />
      </MobileLayout>
    )
  }

  return <MainContent />
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-prologue-electric mx-auto mb-4"></div>
        <p className="text-gray-600">Loading subscription plans...</p>
      </div>
    </div>
  )
}

export default function MemberSubscriptionPlansPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MemberSubscriptionPlansContent />
    </Suspense>
  )
} 