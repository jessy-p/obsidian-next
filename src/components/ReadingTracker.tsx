'use client';

import { useEffect } from 'react';
import { useReadingHistory } from '@/hooks/useReadingHistory';

interface ReadingTrackerProps {
  slug: string;
  title: string;
}

export default function ReadingTracker({ slug, title }: ReadingTrackerProps) {
  const { addToHistory } = useReadingHistory();
  
  useEffect(() => {
    // This runs on the client side only
    addToHistory(slug, title);
  }, [slug, title, addToHistory]);

  // This component doesn't render anything visible
  return null;
}