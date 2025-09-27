import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';

// Global cache
let ratingCountsCache: Record<string, number> = {};

export function useRecipeRatingCounts(recipeIds: string[]) {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (recipeIds.length === 0) return;
    const unsubscribers: (() => void)[] = [];
    const newCounts: Record<string, number> = {};
    recipeIds.forEach((id) => {
      const ref = collection(db, 'recipes', id, 'ratings');
      const unsub = onSnapshot(ref, (snap) => {
        newCounts[id] = snap.docs.length;
        ratingCountsCache = { ...ratingCountsCache, ...newCounts };
        setCounts({ ...ratingCountsCache });
      });
      unsubscribers.push(unsub);
    });
    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [recipeIds]);

  return counts;
}
