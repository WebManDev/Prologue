type CheckoutResponse = {
  url: string
  checkoutId: string
}

type CheckoutError = {
  error: string
  details?: any[]
  checkoutId?: string
  message?: string
}

export async function createCheckout(data: {
  variantId: string
  email: string
  name: string
}): Promise<CheckoutResponse> {
  const response = await fetch('/api/lemonsqueezy/create-checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Failed to create checkout')
  }

  return result
}

export function redirectToCheckout(url: string) {
  // Store the current URL in sessionStorage before redirecting
  sessionStorage.setItem('checkoutReturnUrl', window.location.href)
  
  // Redirect to the checkout URL
  window.location.href = url
}

export function getCheckoutReturnUrl(): string | null {
  return sessionStorage.getItem('checkoutReturnUrl')
}

export function clearCheckoutReturnUrl() {
  sessionStorage.removeItem('checkoutReturnUrl')
} 