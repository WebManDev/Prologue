import type { Metadata } from 'next'
import './globals.css'
import { MemberNotificationProvider } from '@/contexts/member-notification-context'
import { MemberSubscriptionProvider } from '@/contexts/member-subscription-context'
import { NotificationProvider } from '@/contexts/notification-context'
import { AdvancedNotificationProvider } from '@/contexts/advanced-notification-context'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'Prologue | Home',
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
        <NotificationProvider>
          <AdvancedNotificationProvider>
            <MemberNotificationProvider>
              <MemberSubscriptionProvider>
                {children}
              </MemberSubscriptionProvider>
            </MemberNotificationProvider>
          </AdvancedNotificationProvider>
        </NotificationProvider>
        <Toaster />
      </body>
    </html>
  )
}
