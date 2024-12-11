import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <div className={`min-h-screen bg-white ${inter.className}`}>
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
              <div className="bg-white rounded-full h-12 flex items-center justify-between px-6">
                <div className="text-lg font-medium tracking-tight">Osgiliath</div>
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
        
        <div className="mx-auto max-w-[90%] lg:max-w-[80%] py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-gray-900">
              A simple RSS feed
            </h1>
            
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="rounded-full bg-black px-8 py-3 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black transition-all duration-200"
                >
                  Go to Dashboard
                </Link>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="rounded-full bg-black px-8 py-3 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black transition-all duration-200">
                    Get Started
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
