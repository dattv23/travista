'use client' 

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h2 className="text-2xl font-bold text-dark-text mb-4">
        Something went wrong!
      </h2>
      <p className="text-sub-text mb-6">
        We apologize for the inconvenience. An unexpected error occurred.
      </p>
      <button
        onClick={
          () => reset()
        }
        className="bg-primary text-light-text px-6 py-2 rounded-md hover:bg-[color-mix(in_srgb,var(--color-primary),black_10%)] transition-colors"
      >
        Try again
      </button>
    </div>
  )
}