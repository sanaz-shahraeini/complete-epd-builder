import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@/styles/global.css'
import { Providers } from '../providers'
import { getServerSession } from 'next-auth'
import { nextAuthOptions } from './api/auth/[...nextauth]/route'
import { getMessages, unstable_setRequestLocale } from 'next-intl/server'
import { Toaster } from "@/components/ui/toaster"
import { locales, defaultLocale } from '../../i18n/navigation'
import '@radix-ui/themes/styles.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EPD Builder',
  description: 'Create and manage Environmental Product Declarations',
}

// Generate static params for all supported locales
export function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}

export default async function RootLayout({
  children,
  params: { locale = defaultLocale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // Enable static rendering for this layout
  unstable_setRequestLocale(locale);
  
  // Ensure locale is supported
  const safeLocale = locales.includes(locale as any) ? locale : defaultLocale;
  
  const session = await getServerSession(nextAuthOptions);
  const messages = await getMessages();

  return (
    <html lang={safeLocale} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <Providers 
          session={session} 
          messages={messages}
          locale={safeLocale}
        >
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
