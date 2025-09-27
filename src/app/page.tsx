'use client';
import { RecipeCard } from '../components/RecipeCard';
import { useRecipeRatingCounts } from '../hooks/useRecipeRatingCounts';
import { useRecipeRatings } from '../hooks/useRecipeRatings';
import { useRecipes } from '../hooks/useRecipes';

import styles from '../styles/HomePage.module.scss';

export default function HomePage() {
  const recipes = useRecipes();
  const ratings = useRecipeRatings(recipes.map((r) => r.id));
  const ratingCounts = useRecipeRatingCounts(recipes.map((r) => r.id));
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
          avgRating={ratings[recipe.id] ?? 0}
          ratingCount={ratingCounts[recipe.id] ?? 0}
          commentCount={0}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
