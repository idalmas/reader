import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <div className={`min-h-screen bg-white selection:bg-black selection:text-white ${inter.className}`}>
      {/* Hero Section */}
      <div className="relative isolate">
        {/* Full-width image container */}
        <div className="h-[500px] sm:h-[800px] w-full relative">
          <Image
            src="/landing.webp"
            alt="RSS Reader Landing Image"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          
          {/* Floating Header Bar */}
          <div className="absolute top-8 left-0 right-0 z-10 px-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg h-12 flex items-center justify-between px-6">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v18M8 21h8M7 3h10M9 6h6M9 9h6M9 12h6M9 15h6M7 18h10M8 3v2M16 3v2M10 6v3M14 6v3M10 12v3M14 12v3" />
                  </svg>
                  <span className="text-lg font-medium tracking-tight ml-2">Osgiliath</span>
                </div>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="text-lg text-gray-600 hover:text-gray-900 transition-colors">
                      Login
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard" className="text-lg text-gray-600 hover:text-gray-900 transition-colors">
                    Dashboard
                  </Link>
                </SignedIn>
              </div>
            </div>
          </div>
        </div>

        {/* Overlapping White Box */}
        <div className="relative -mt-64 sm:-mt-[400px]">
          <div className="bg-white shadow-xl mx-auto w-[700px] h-[650px] rounded-t-2xl relative">
            {/* Text on white box */}
            <div className="absolute inset-x-0 top-16 flex items-center justify-center">
              <h1 className="text-4xl sm:text-6xl font-medium tracking-tight text-black">
                A simple RSS reader
              </h1>
            </div>

            {/* Buttons */}
            <div className="absolute inset-x-0 top-48 flex items-center justify-center">
              <div className="flex items-center justify-center gap-x-6">
                <SignedIn>
                  <Link
                    href="/dashboard"
                    className="rounded-lg bg-black px-8 py-3 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black transition-all duration-200"
                  >
                    Go to Dashboard
                  </Link>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="rounded-lg bg-black px-8 py-3 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black transition-all duration-200">
                      Get Started
                    </button>
                  </SignInButton>
                </SignedOut>
              </div>
            </div>
          </div>
        </div>

        {/* Space before footer */}
        <div className="h-24"></div>

        {/* Minimal Footer */}
        <div className="border-t border-gray-200">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <div className="text-center text-sm text-gray-500">
              © 2024
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
