"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  CheckCircle,
  Crown,
  Star,
  Zap,
  Shield,
  ArrowLeft,
  CreditCard,
  Lock,
  Sparkles,
  Heart,
  Trophy,
  Globe,
  Smartphone,
  User,
  X,
} from "lucide-react"
import Link from "next/link"
import { useMobileDetection } from "@/hooks/use-mobile-detection"
import MobileLayout from "@/components/mobile/mobile-layout"
import { useMemberNotifications } from "@/contexts/member-notification-context"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { SubscriptionCheckout } from "@/components/subscription-checkout"

const subscriptionPlans = [
  {
    id: "basic",
    name: "Basic",
    price: 9.99,
    description: "Perfect for getting started with creator content.",
    features: [
      "Access to free content",
      "Limited community access",
      "Email support",
      "Monthly newsletter",
    ],
    color: "blue",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 29.99,
    description: "Unlock full access to exclusive content and direct interaction.",
    features: [
      "All Basic features",
      "Access to all premium content",
      "Direct messaging with creator",
      "Personalized training plans (limited)",
      "Priority email support",
      "Exclusive community forums",
      "Early access to new content",
    ],
    color: "purple",
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 49.99,
    description: "The ultimate experience with personalized coaching and exclusive benefits.",
    features: [
      "All Pro features",
      "Personalized training plans (full)",
      "24/7 chat support",
      "Monthly Q&A sessions",
      "1-on-1 video call (1/month)",
    ],
    color: "gold",
    popular: false,
  },
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "College Tennis Player",
    avatar: "/placeholder.svg?height=60&width=60",
    rating: 5,
    text: "Prologue transformed my training routine. The personalized coaching and premium content helped me improve my serve by 40%!",
    plan: "Pro",
  },
  {
    name: "Mike Rodriguez",
    role: "Basketball Coach",
    avatar: "/placeholder.svg?height=60&width=60",
    rating: 5,
    text: "The Elite plan gives me everything I need to coach my team effectively. The analytics and video tools are game-changers.",
    plan: "Elite",
  },
  {
    name: "Emma Chen",
    role: "Swimming Enthusiast",
    avatar: "/placeholder.svg?height=60&width=60",
    rating: 5,
    text: "Started with the Starter plan and loved it so much I upgraded to Pro. The community and content quality are outstanding.",
    plan: "Pro",
  },
]

const faqs = [
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period.",
  },
  {
    question: "Do you offer a free trial?",
    answer: "Yes! We offer a 14-day free trial for all plans. No credit card required to start your trial.",
  },
  {
    question: "Can I switch between plans?",
    answer:
      "You can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades, or at the next billing cycle for downgrades.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay.",
  },
  {
    question: "Is there a student discount?",
    answer:
      "Yes! Students get 50% off any plan with a valid student ID. Contact our support team to apply the discount.",
  },
  {
    question: "Can I share my account with teammates?",
    answer:
      "Each subscription is for individual use. However, our Elite plan includes team features and multi-user access options.",
  },
]

export default function SubscribePage() {
  const { isMobile, isTablet } = useMobileDetection()
  const { unreadMessagesCount, unreadNotificationsCount } = useMemberNotifications()
  const [selectedPlan, setSelectedPlan] = useState("pro")
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [athlete, setAthlete] = useState<any>(null)
  const [member, setMember] = useState<any>(null)
  const [loadingAthlete, setLoadingAthlete] = useState(true)
  const [memberEmail, setMemberEmail] = useState("")
  const [memberName, setMemberName] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  const params = useParams()
  const router = useRouter()
  const athleteId = Array.isArray(params?.id) ? params.id[0] : params?.id

  useEffect(() => {
    async function fetchAthlete() {
      if (!athleteId) return
      setLoadingAthlete(true)
      try {
        const athleteRef = doc(db, "athletes", athleteId)
        const athleteSnap = await getDoc(athleteRef)
        if (athleteSnap.exists()) {
          setAthlete({ id: athleteId, ...athleteSnap.data() })
        } else {
          setAthlete({ id: athleteId }) // fallback
        }
      } catch (e) {
        setAthlete({ id: athleteId })
      }
      setLoadingAthlete(false)
    }
    fetchAthlete()
  }, [athleteId])

  useEffect(() => {
    async function fetchMember() {
      if (auth.currentUser) {
        const memberRef = doc(db, "members", auth.currentUser.uid);
        const memberSnap = await getDoc(memberRef);
        if (memberSnap.exists()) {
          const data = memberSnap.data();
          const memberData = {
            id: auth.currentUser.uid,
            name: data.firstName || data.name || "",
            email: data.email || "",
            subscriptions: data.subscriptions || {}
          };
          setMember(memberData);
          
          // Check if already subscribed to this athlete
          const subscribedToAthlete = athleteId && memberData.subscriptions && 
            memberData.subscriptions[athleteId] && 
            memberData.subscriptions[athleteId].status === "active";
          setIsSubscribed(!!subscribedToAthlete);
        }
      }
    }
    fetchMember();
  }, [auth.currentUser, athleteId]);

  useEffect(() => {
    if (auth.currentUser) {
      setMemberEmail(auth.currentUser.email || "")
      setMemberName(auth.currentUser.displayName || "")
    }
  }, [auth.currentUser])

  const selectedPlanData = subscriptionPlans.find((plan) => plan.id === selectedPlan)
  const yearlyDiscount = 0.2 // 20% discount for yearly billing

  const calculatePrice = (price: number) => {
    if (billingCycle === "yearly") {
      return (price * 12 * (1 - yearlyDiscount)).toFixed(2)
    }
    return price.toFixed(2)
  }

  const calculateMonthlyPrice = (price: number) => {
    if (billingCycle === "yearly") {
      return (price * (1 - yearlyDiscount)).toFixed(2)
    }
    return price.toFixed(2)
  }

  const handlePromoCode = () => {
    if (promoCode.toLowerCase() === "welcome20") {
      setPromoApplied(true)
    }
  }

  const MainContent = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/member-home">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <img src="/prologue-logo-new.png" alt="Prologue" className="h-8" />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8 pb-20 lg:pb-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-prologue-electric to-prologue-blue text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Limited Time Offer - Save up to 40%</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Unlock Your
            <span className="bg-gradient-to-r from-prologue-electric to-prologue-blue bg-clip-text text-transparent">
              {" "}
              Athletic Potential
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Join thousands of athletes who are transforming their performance with personalized coaching, premium
            content, and cutting-edge training tools.
          </p>

          {/* Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-prologue-electric">50K+</div>
              <div className="text-sm text-gray-600">Active Athletes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-prologue-electric">1,200+</div>
              <div className="text-sm text-gray-600">Expert Coaches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-prologue-electric">4.9/5</div>
              <div className="text-sm text-gray-600">User Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-prologue-electric">95%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-12">
          <div className="bg-white rounded-lg p-1 border border-gray-200">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === "monthly" ? "bg-prologue-electric text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all relative ${
                  billingCycle === "yearly" ? "bg-prologue-electric text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Yearly
                <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs">Save 20%</Badge>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {subscriptionPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? "border-2 border-prologue-electric shadow-lg scale-105"
                  : selectedPlan === plan.id
                    ? "border-2 border-prologue-blue"
                    : "border border-gray-200 hover:border-gray-300"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-prologue-electric text-white px-4 py-1">
                    <Crown className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="mb-4">
                  <div
                    className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                      plan.color === "purple"
                        ? "bg-purple-100"
                        : "bg-yellow-100"
                    }`}
                  >
                    {plan.color === "purple" && <Crown className="h-8 w-8 text-purple-600" />}
                    {plan.color === "gold" && <Trophy className="h-8 w-8 text-yellow-600" />}
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                <p className="text-gray-600 mt-2">{plan.description}</p>

                <div className="mt-6">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-4xl font-bold text-gray-900">${calculateMonthlyPrice(plan.price)}</span>
                    <div className="text-left">
                      <div className="text-sm text-gray-500">{billingCycle === "monthly" ? "/month" : "/month"}</div>
                      {billingCycle === "yearly" && <div className="text-xs text-green-600">billed yearly</div>}
                    </div>
                  </div>

                  {billingCycle === "yearly" && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-500 line-through">${(plan.price * 12).toFixed(2)}/year</span>
                      <span className="text-sm text-green-600 ml-2 font-medium">
                        Save ${(plan.price * 12 * yearlyDiscount).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => {
                    setSelectedPlan(plan.id)
                    setCheckoutOpen(true)
                  }}
                  className={`w-full transition-all duration-200 ${
                    plan.popular
                      ? "bg-prologue-electric hover:bg-prologue-blue text-white"
                      : "bg-gray-900 hover:bg-gray-800 text-white"
                  }`}
                  disabled={isSubscribed}
                >
                  {isSubscribed ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Already Subscribed
                    </>
                  ) : plan.popular ? (
                    <>
                      <Crown className="h-4 w-4 mr-2" />
                      Start Free Trial
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Get Started
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <span className="text-xs text-gray-500">14-day free trial • No credit card required</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-gray-900">Compare All Features</CardTitle>
            <p className="text-center text-gray-600">See what's included in each plan</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-medium text-gray-900">Features</th>
                    <th className="text-center py-4 px-4 font-medium text-gray-900">Pro</th>
                    <th className="text-center py-4 px-4 font-medium text-gray-900">Elite</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-4 px-4 text-gray-700">Basic training content</td>
                    <td className="py-4 px-4 text-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-gray-700">Premium content access</td>
                    <td className="py-4 px-4 text-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-gray-700">1-on-1 coaching sessions</td>
                    <td className="py-4 px-4 text-center text-gray-700">2/month</td>
                    <td className="py-4 px-4 text-center text-gray-700">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-gray-700">Video analysis tools</td>
                    <td className="py-4 px-4 text-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-gray-700">Personal performance coach</td>
                    <td className="py-4 px-4 text-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-gray-700">API access</td>
                    <td className="py-4 px-4 text-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Testimonials */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Loved by Athletes Worldwide</h2>
            <p className="text-xl text-gray-600">See what our community has to say about their transformation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border border-gray-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                      <User className="w-full h-full text-gray-500 p-2" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {testimonial.plan} Plan
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-gray-900">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{faq.question}</h3>
                      <div className={`transform transition-transform ${expandedFaq === index ? "rotate-180" : ""}`}>
                        <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                  {expandedFaq === index && (
                    <div className="px-4 pb-4">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trust & Security */}
        <div className="text-center mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Trusted & Secure</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-sm text-gray-600">256-bit SSL encryption</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Global Access</h3>
              <p className="text-sm text-gray-600">Available worldwide</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <Smartphone className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Mobile Ready</h3>
              <p className="text-sm text-gray-600">iOS & Android apps</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                <Heart className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Money Back</h3>
              <p className="text-sm text-gray-600">30-day guarantee</p>
            </div>
          </div>
        </div>
      </main>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">Complete Your Subscription</DialogTitle>
          </DialogHeader>

          {loadingAthlete ? (
            <div className="text-center py-8">Loading athlete info...</div>
          ) : athlete && member ? (
            <SubscriptionCheckout
              athlete={athlete}
              members={member}
              onSuccess={() => { 
                setCheckoutOpen(false)
                router.push("/member-dashboard")
              }}
              onCancel={() => setCheckoutOpen(false)}
              selectedPlan={selectedPlan as 'basic' | 'pro' | 'premium'}
            />
          ) : (
            <div className="text-center py-8 text-red-500">Unable to load athlete or user info.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )

  if (isMobile || isTablet) {
    return (
      <MobileLayout
        userType="member"
        currentPath="/subscribe"
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