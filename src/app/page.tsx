import { Suspense } from 'react'
import HomeClient from './home/HomeClient'

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-600" aria-label="Loading" />
        </div>
      }
    >
      <HomeClient />
    </Suspense>
  )
}
