'use client';
import { RecipeCard } from '../components/RecipeCard';
import { useRecipes } from '../hooks/useRecipes';

import styles from '../styles/HomePage.module.scss';

export default function HomePage() {
  const recipes = useRecipes();
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>RecipeRank</h1>
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          avgRating={0}
          commentCount={0}
        />
      ))}
    </div>
  );
}
