import Link from 'next/link';
import React from 'react';
import styles from '../styles/RecipeCard.module.scss';
import { Recipe } from '../types/Recipe';

interface Props {
  recipe: Recipe;
  avgRating: number;
  commentCount: number;
}

export const RecipeCard: React.FC<Props> = ({
  recipe,
  avgRating,
  commentCount,
}) => (
  <Link href={`/recipe/${recipe.id}`} className={styles.card}>
    {recipe.imageUrl && (
      <img src={recipe.imageUrl} alt={recipe.title} className={styles.image} />
    )}
    <div className={styles.headerSection}>
      <h2 className={styles.title}>{recipe.title}</h2>
    </div>
    <div className={styles.ingredientsSection}>
      <h4 className={styles.ingredientsLabel}>Ingredients</h4>
      <ul className={styles.ingredientsList}>
        {recipe.ingredients.map((ing, i) => (
          <li key={i} className={styles.ingredient}>
            {ing}
          </li>
        ))}
      </ul>
    </div>
    <p className={styles.description}>{recipe.description}</p>
    <div className={styles.meta}>
      <span>⭐ {avgRating.toFixed(1)}</span>
      <span>💬 {commentCount}</span>
    </div>
  </Link>
);
