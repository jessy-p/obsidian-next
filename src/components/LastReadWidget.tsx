'use client';

import Link from 'next/link';
import { useReadingHistory } from '@/hooks/useReadingHistory';

export default function LastReadWidget() {
  const { history, isLoading } = useReadingHistory();

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b border-gray-100 pb-2">
          📚 Last Read
        </h3>
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b border-gray-100 pb-2">
          📚 Last Read
        </h3>
        <p className="text-gray-500 text-sm">No reading history yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b border-gray-100 pb-2">
        📚 Last Read
      </h3>
      <div className="space-y-1">
        {history.map((item, index) => (
          <Link
            key={item.slug}
            href={`/${item.slug}`}
            className="block px-2 py-2 text-sm hover:bg-gray-50 rounded transition-colors"
          >
            <div className="font-medium text-gray-900 truncate">{item.title}</div>
            <div className="text-xs text-gray-500 mt-0.5">
              {new Date(item.visitedAt).toLocaleDateString()}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}