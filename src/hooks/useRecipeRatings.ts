import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';

// Global cache
let ratingsCache: Record<string, number> = {};

export function useRecipeRatings(recipeIds: string[]) {
  const [ratings, setRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    if (recipeIds.length === 0) return;
    const fetchRatings = async () => {
      const newRatings: Record<string, number> = {};
      for (const id of recipeIds) {
        const ref = collection(db, 'recipes', id, 'ratings');
        const snap = await getDocs(ref);
        const scores = snap.docs.map((d) => d.data().score);
        newRatings[id] = scores.length
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0;
      }
      setRatings(newRatings);
    };
    fetchRatings();
  }, [recipeIds]);

  return ratings;
}
