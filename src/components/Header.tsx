'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-primary-600">
              나만의 AI 스타일리스트
            </h1>
          </Link>
          
          <nav className="flex gap-4">
            <Link
              href="/dressing-room"
              className={`px-4 py-2 rounded-lg transition-colors ${
                pathname === '/dressing-room'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              My dressing room
            </Link>
            <Link
              href="/shopping-list"
              className={`px-4 py-2 rounded-lg transition-colors ${
                pathname === '/shopping-list'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Shopping Recommendation
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}