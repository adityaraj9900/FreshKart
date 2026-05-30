import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "FreshKart - India's Fastest Grocery Delivery | 10 Min",
  description: 'Order fresh groceries online. Delivered in 10 minutes! Best prices on vegetables, fruits, dairy, snacks and more across India.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { fontSize: '14px', fontFamily: 'Inter, sans-serif' },
              success: { iconTheme: { primary: '#0C9547', secondary: '#fff' } },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
