'use client'

import { Inter } from 'next/font/google'
import RSSReader from '@/components/RSSReader';

const inter = Inter({ subsets: ['latin'] })

export default function DashboardContent() {
  return (
    <main className={inter.className}>
      <RSSReader />
    </main>
  );
} 