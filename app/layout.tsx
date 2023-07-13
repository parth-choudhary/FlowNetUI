import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import 'rsuite/dist/rsuite.min.css';
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Flow AI',
  description: 'Created by Xtremes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
