import { SignedIn } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="mb-4 text-4xl font-bold">RSS Reader</h1>
      <p className="mb-8 text-gray-600">A simple, clean RSS reader for your favorite blogs</p>
      <SignedIn>
        <Link
          href="/dashboard"
          className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Go to Dashboard
        </Link>
      </SignedIn>
    </div>
  );
}
