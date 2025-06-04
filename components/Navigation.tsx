import Link from 'next/link';
import { PhotoIcon } from '@heroicons/react/24/outline';

export default function Navigation() {
  return (
    <nav className="bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-semibold text-white">
              KPT Shop
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/images"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PhotoIcon className="h-5 w-5 mr-2" />
              Image Manager
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 