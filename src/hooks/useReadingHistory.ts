'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  addToHistory as addToHistoryUtil, 
  getHistory as getHistoryUtil, 
  clearHistory as clearHistoryUtil,
  type ReadingHistoryItem 
} from '@/lib/reading-history';

export function useReadingHistory() {
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history on mount
  useEffect(() => {
    setHistory(getHistoryUtil());
    setIsLoading(false);
  }, []);

  // Add item to history and update state
  const addToHistory = useCallback((slug: string, title: string) => {
    addToHistoryUtil(slug, title);
    setHistory(getHistoryUtil()); // Refresh local state
  }, []);

  // Clear all history
  const clearHistory = useCallback(() => {
    clearHistoryUtil();
    setHistory([]);
  }, []);

  // Refresh history from localStorage
  const refreshHistory = useCallback(() => {
    setHistory(getHistoryUtil());
  }, []);

  return {
    history,
    isLoading,
    addToHistory,
    clearHistory,
    refreshHistory,
  };
}