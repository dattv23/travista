import Link from 'next/link'
 
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h2 className="text-4xl font-bold">404 - Not Found</h2>
      <p className="mt-4 text-lg">
        Could not find the page you were looking for.
      </p>
      <Link 
        href="/"
        className="mt-6 rounded-md bg-primary px-4 py-2 text-light-text hover:bg-[color-mix(in_srgb,var(--color-primary),black_10%)]"
      >
        Go Back Home
      </Link>
    </main>
  )
}