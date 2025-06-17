import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield } from "lucide-react"

interface BankAccountFormProps {
  onSave: (bankDetails: {
    accountHolderName: string
    accountNumber: string
    routingNumber: string
    accountType: 'checking' | 'savings'
  }) => Promise<void>
}

export function BankAccountForm({ onSave }: BankAccountFormProps) {
  const [accountHolderName, setAccountHolderName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [routingNumber, setRoutingNumber] = useState('')
  const [accountType, setAccountType] = useState<'checking' | 'savings'>('checking')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Basic validation
      if (!accountHolderName || !accountNumber || !routingNumber) {
        throw new Error('All fields are required')
      }

      // Validate routing number (must be 9 digits)
      if (!/^\d{9}$/.test(routingNumber)) {
        throw new Error('Routing number must be 9 digits')
      }

      // Validate account number (must be 4-17 digits)
      if (!/^\d{4,17}$/.test(accountNumber)) {
        throw new Error('Account number must be between 4 and 17 digits')
      }

      await onSave({
        accountHolderName,
        accountNumber,
        routingNumber,
        accountType
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Account Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="accountHolderName">Account Holder Name</Label>
            <Input
              id="accountHolderName"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              type="password"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="123456789"
              required
            />
          </div>

          <div>
            <Label htmlFor="routingNumber">Routing Number</Label>
            <Input
              id="routingNumber"
              value={routingNumber}
              onChange={(e) => setRoutingNumber(e.target.value)}
              placeholder="123456789"
              required
            />
          </div>

          <div>
            <Label htmlFor="accountType">Account Type</Label>
            <select
              id="accountType"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value as 'checking' | 'savings')}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Shield className="h-4 w-4" />
            <span>Your bank information is encrypted and stored securely</span>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Saving...' : 'Save Bank Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 