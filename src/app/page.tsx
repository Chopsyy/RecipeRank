'use client';
import { RecipeCard } from '../components/RecipeCard';
import { useRecipes } from '../hooks/useRecipes';

import styles from '../styles/HomePage.module.scss';

export default function HomePage() {
  const recipes = useRecipes();
  const handleDelete = async (id: string) => {
    const { doc, deleteDoc } = await import('firebase/firestore');
    const { db } = await import('../lib/firebase');
    await deleteDoc(doc(db, 'recipes', id));
  };
  return (
    <div className={styles.container}>
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          avgRating={0}
          commentCount={0}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
