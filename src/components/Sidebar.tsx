import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const isPath = (path: string) => pathname === path;

  return (
    <div 
      className={`fixed left-0 top-0 bottom-0 bg-[#f1f4f2] transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-44'
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-8 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {isCollapsed ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7" />
          </svg>
        )}
      </button>

      <div className={`flex flex-col h-full ${isCollapsed ? 'p-4' : 'p-6'}`}>
        <div className="space-y-12">
          {/* Header */}
          <div>
            <h1 className={`text-lg font-medium tracking-tight transition-opacity duration-300 ${
              isCollapsed ? 'opacity-0' : 'opacity-100'
            }`}>
              OSGILIATH
            </h1>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <div>
              <Link 
                href="/dashboard" 
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center ${
                  isPath('/dashboard') 
                    ? 'text-black font-medium bg-white' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
                title="Feed"
              >
                <Image
                  src="/custom-feed-icon.svg"
                  width={20}
                  height={20}
                  alt="Feed"
                  className="min-w-[20px]"
                />
                <span className={`ml-2 transition-opacity duration-300 ${
                  isCollapsed ? 'opacity-0 hidden' : 'opacity-100'
                }`}>
                  Feed
                </span>
              </Link>
            </div>
            <div>
              <Link 
                href="/feeds" 
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center ${
                  isPath('/feeds') 
                    ? 'text-black font-medium bg-white' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
                title="Manage Feeds"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className={`ml-2 transition-opacity duration-300 ${
                  isCollapsed ? 'opacity-0 hidden' : 'opacity-100'
                }`}>
                  Manage Feeds
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="mb-12 mt-auto space-y-4">
          <div>
            <Link 
              href="/settings" 
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center ${
                isPath('/settings') 
                  ? 'text-black font-medium bg-white' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
              }`}
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className={`ml-2 transition-opacity duration-300 ${
                isCollapsed ? 'opacity-0 hidden' : 'opacity-100'
              }`}>
                Settings
              </span>
            </Link>
          </div>
          <div>
            <Link 
              href="/docs" 
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center ${
                isPath('/docs') 
                  ? 'text-black font-medium bg-white' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
              }`}
              title="Docs"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className={`ml-2 transition-opacity duration-300 ${
                isCollapsed ? 'opacity-0 hidden' : 'opacity-100'
              }`}>
                Docs
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 