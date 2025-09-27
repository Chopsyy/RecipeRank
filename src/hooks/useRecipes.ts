'use client';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { Recipe } from '../types/Recipe';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  useEffect(() => {
    const q = query(collection(db, 'recipes'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setRecipes(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Recipe))
      );
    });
    return () => unsub();
  }, []);
  return recipes;
}
