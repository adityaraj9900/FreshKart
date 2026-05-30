import { Suspense } from 'react'
import HomeClient from './home/HomeClient'

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><div className="text-6xl mb-4 animate-bounce">🛒</div><div className="text-gray-500 font-semibold">Loading FreshKart...</div></div></div>}>
      <HomeClient />
    </Suspense>
  )
}
