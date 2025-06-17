import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BankAccountForm } from './bank-account-form'
import { auth } from '@/lib/firebase'

export function AthleteSettings({ onBackToDashboard }: { onBackToDashboard: () => void }) {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSaveBankDetails = async (bankDetails: {
    accountHolderName: string
    accountNumber: string
    routingNumber: string
    accountType: 'checking' | 'savings'
  }) => {
    try {
      const idToken = await auth.currentUser?.getIdToken()
      if (!idToken) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/athlete/save-bank-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(bankDetails)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save bank details')
      }

      setSuccess('Bank account details saved successfully')
      setError('')
    } catch (err: any) {
      setError(err.message)
      setSuccess('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Athlete Settings</h1>
          <button
            onClick={onBackToDashboard}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600">{success}</p>
          </div>
        )}

        <BankAccountForm onSave={handleSaveBankDetails} />
      </div>
    </div>
  )
} 