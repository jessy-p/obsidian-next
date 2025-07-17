export interface ReadingHistoryItem {
  slug: string;
  title: string;
  visitedAt: number;
}

const STORAGE_KEY = 'reading-history';
const MAX_HISTORY_SIZE = 5;

export function addToHistory(slug: string, title: string): void {
  const history = getHistory();
  
  // Remove if already exists (to move to front)
  const filteredHistory = history.filter(item => item.slug !== slug);
  
  // Add to front
  const newHistory = [
    { slug, title, visitedAt: Date.now() },
    ...filteredHistory
  ].slice(0, MAX_HISTORY_SIZE); // Keep only last 5
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
}

export function getHistory(): ReadingHistoryItem[] {
  if (typeof window === 'undefined') return []; // SSR safety
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load reading history:', error);
    return [];
  }
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}