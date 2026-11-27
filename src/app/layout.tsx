import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: 'FreshKart | Groceries delivered in 10 minutes',
  description: 'Order fresh vegetables, fruits, dairy, staples and everyday essentials online with fast delivery and transparent prices.',
}

export const viewport: Viewport = {
  themeColor: '#0c9547',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans">
        <Providers>
          {children}
          <Toaster
            position="bottom-center"
            toastOptions={{
              duration: 2500,
              style: { fontSize: '14px', borderRadius: '12px', background: '#111827', color: '#fff', padding: '10px 14px' },
              success: { iconTheme: { primary: '#43bf7f', secondary: '#111827' } },
              error: { iconTheme: { primary: '#f87171', secondary: '#111827' } },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
