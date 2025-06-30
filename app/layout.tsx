import type { Metadata } from 'next'
import './globals.css'
import { MemberNotificationProvider } from '@/contexts/member-notification-context'
import { MemberSubscriptionProvider } from '@/contexts/member-subscription-context'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <MemberNotificationProvider>
          <MemberSubscriptionProvider>
            {children}
          </MemberSubscriptionProvider>
        </MemberNotificationProvider>
      </body>
    </html>
  )
}
