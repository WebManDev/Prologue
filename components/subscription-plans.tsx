"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Check } from "lucide-react"

interface SubscriptionPlansProps {
  onSelectPlan: (plan: 'basic' | 'pro' | 'premium') => void
  selectedPlan?: 'basic' | 'pro' | 'premium'
  isLoading?: boolean
  prices?: {
    basic?: number
    pro?: number
    premium?: number
  }
}

export function SubscriptionPlans({ onSelectPlan, selectedPlan, isLoading, prices }: SubscriptionPlansProps) {
  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: prices?.basic ?? 4.99,
      description: 'Perfect for getting started',
      features: [
        'Access to basic training content',
        'Monthly Q&A session',
        'Basic progress tracking',
        'Community forum access'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: prices?.pro ?? 9.99,
      description: 'For serious athletes',
      features: [
        'Everything in Basic',
        'Weekly video feedback',
        'Personalized training plans',
        'Priority support',
        'Advanced analytics'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: prices?.premium ?? 19.99,
      description: 'Elite level coaching',
      features: [
        'Everything in Pro',
        '1-on-1 coaching sessions',
        'Custom workout programs',
        'Nutrition planning',
        '24/7 priority support',
        'Exclusive content access'
      ]
    }
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <Card 
          key={plan.id}
          className={`relative ${
            selectedPlan === plan.id 
              ? 'border-blue-500 shadow-lg' 
              : 'hover:border-blue-300 transition-colors'
          }`}
        >
          {selectedPlan === plan.id && (
            <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1">
              <Check className="h-4 w-4" />
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">${plan.price}</span>
              <span className="text-gray-500">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={selectedPlan === plan.id ? "default" : "outline"}
              onClick={() => onSelectPlan(plan.id as 'basic' | 'pro' | 'premium')}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
} 