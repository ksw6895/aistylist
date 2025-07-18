'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center group">
            <h1 className="text-2xl font-bold gradient-text group-hover:opacity-80 transition-opacity">
              AI Stylist
            </h1>
            <span className="ml-3 text-sm text-gray-500 font-light tracking-wider">
              Premium Fashion Curator
            </span>
          </Link>
          
          <nav className="flex gap-2">
            <Link
              href="/dressing-room"
              className={`px-5 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm ${
                pathname === '/dressing-room'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              My Wardrobe
            </Link>
            <Link
              href="/shopping-list"
              className={`px-5 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm ${
                pathname === '/shopping-list'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Shopping List
            </Link>
            <Link
              href="/history"
              className={`px-5 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm ${
                pathname === '/history'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Style History
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}