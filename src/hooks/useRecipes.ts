'use client';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { Recipe } from '../types/Recipe';

// Global cache

export function useRecipes(refreshKey?: number) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  useEffect(() => {
    const fetchRecipes = async () => {
      const q = query(collection(db, 'recipes'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Recipe)
      );
      setRecipes(data);
    };
    fetchRecipes();
  }, [refreshKey]);
  return recipes;
}
