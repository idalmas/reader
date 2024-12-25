import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Inter, Playfair_Display } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const playfair = Playfair_Display({ subsets: ['latin'] });

export default function Home() {
  return (
    <div className={`min-h-screen bg-white selection:bg-black selection:text-white ${inter.className}`}>
      {/* Hero Section */}
      <div className="relative isolate">
        {/* Full-width image container */}
        <div className="w-screen relative bg-white overflow-hidden">
          <Image
            src="/landing.webp"
            alt="RSS Reader Landing Image"
            width={2400}
            height={1600}
            className="w-full h-auto"
            quality={100}
            priority
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent from-40% via-white/50 via-70% to-white/95" />
          
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

        {/* Main Content */}
        <div className="relative max-w-7xl mx-auto px-6 -mt-[450px] sm:-mt-[650px]">
          <div className="relative flex flex-col sm:flex-row items-start justify-between">
            {/* Text and Button Column */}
            <div>
              {/* Text */}
              <h1 className={`text-5xl sm:text-7xl font-medium tracking-tight text-white mb-8 drop-shadow-lg ${playfair.className}`}>
                A simple RSS<br />
                <span className="mt-4 inline-block">reader</span>
              </h1>

              {/* Buttons */}
              <div className="flex items-center gap-x-6">
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

            {/* Demo/Screenshot Box */}
            <div className="mt-8 sm:-mt-12 w-full sm:w-[600px] h-[400px] bg-black/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-2xl overflow-hidden">
              <Image
                src="/app.png"
                alt="Osgiliath RSS Reader Preview"
                width={1200}
                height={800}
                className="w-full h-full object-cover"
                priority
              />
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
