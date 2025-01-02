import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
} from '@clerk/nextjs'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Osgiliath',
  description: 'A simple, clean RSS reader',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <div className="fixed top-4 right-4 z-50">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
          <main>
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  )
}
