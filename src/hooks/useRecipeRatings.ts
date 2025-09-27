import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';

export function useRecipeRatings(recipeIds: string[]) {
  const [ratings, setRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    if (recipeIds.length === 0) return;
    const unsubscribers: (() => void)[] = [];
    const newRatings: Record<string, number> = {};
    recipeIds.forEach((id) => {
      const ref = collection(db, 'recipes', id, 'ratings');
      const unsub = onSnapshot(ref, (snap) => {
        const scores = snap.docs.map((d) => d.data().score);
        newRatings[id] = scores.length
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0;
        setRatings({ ...newRatings });
      });
      unsubscribers.push(unsub);
    });
    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [recipeIds]);

  return ratings;
}
