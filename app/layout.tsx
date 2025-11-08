import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Automated Data Entry System',
  description: 'Production-grade data entry system with OCR and AI capabilities',
  keywords: ['OCR', 'AI', 'Data Entry', 'Document Processing', 'Automation'],
  authors: [{ name: 'Your Organization' }],
  robots: 'noindex, nofollow', // Change in production
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
