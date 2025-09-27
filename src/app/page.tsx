'use client';
import { useMemo, useState } from 'react';
import { RecipeCard } from '../components/RecipeCard';
import { useRecipeCommentCounts } from '../hooks/useRecipeCommentCounts';
import { useRecipeRatingCounts } from '../hooks/useRecipeRatingCounts';
import { useRecipeRatings } from '../hooks/useRecipeRatings';
import { useRecipes } from '../hooks/useRecipes';

import { exampleRecipes } from '../data/exampleRecipes';
import styles from '../styles/HomePage.module.scss';

export default function HomePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const recipes = useRecipes(refreshKey);
  // Add example recipes (no id, so use index as key)
  const allRecipes = [
    ...recipes,
    ...exampleRecipes.map((r, i) => ({
      ...r,
      id: `example-${i}`,
      createdAt: new Date().toISOString(),
      ingredients: r.ingredients.map((ing) => ({
        ...ing,
        quantity: ing.quantity.toString(),
      })),
    })),
  ];
  const recipeIds = useMemo(() => recipes.map((r) => r.id), [recipes]);
  const ratings = useRecipeRatings(recipeIds);
  const ratingCounts = useRecipeRatingCounts(recipeIds);
  const commentCounts = useRecipeCommentCounts(recipeIds);
  const handleDelete = async (id: string) => {
    const { doc, deleteDoc } = await import('firebase/firestore');
    const { db } = await import('../lib/firebase');
    await deleteDoc(doc(db, 'recipes', id));
    setRefreshKey((k) => k + 1);
  };
  const handleLogout = () => {
    // Remove the Firebase Auth token cookie
    document.cookie =
      'firebase_token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    window.location.reload();
  };
  return (
    <div className={styles.container}>
      <button
        onClick={handleLogout}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 10,
          background: 'linear-gradient(90deg, #e74c3c 0%, #f39c12 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: '24px',
          padding: '10px 28px',
          fontWeight: 'bold',
          fontSize: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseOver={(e) =>
          (e.currentTarget.style.background =
            'linear-gradient(90deg, #f39c12 0%, #e74c3c 100%)')
        }
        onMouseOut={(e) =>
          (e.currentTarget.style.background =
            'linear-gradient(90deg, #e74c3c 0%, #f39c12 100%)')
        }
      >
        Logout
      </button>
      {allRecipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          avgRating={ratings[recipe.id] ?? 0}
          ratingCount={ratingCounts[recipe.id] ?? 0}
          commentCount={commentCounts[recipe.id] ?? 0}
          onDelete={recipe.id.startsWith('example-') ? undefined : handleDelete}
        />
      ))}
    </div>
  );
}
