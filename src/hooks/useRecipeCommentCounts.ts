import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';

export function useRecipeCommentCounts(recipeIds: string[]) {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (recipeIds.length === 0) return;
    const fetchCounts = async () => {
      const newCounts: Record<string, number> = {};
      for (const id of recipeIds) {
        const ref = collection(db, 'recipes', id, 'comments');
        const snap = await getDocs(ref);
        newCounts[id] = snap.docs.length;
      }
      setCounts(newCounts);
    };
    fetchCounts();
  }, [recipeIds]);

  return counts;
}
