import Link from 'next/link';
import React from 'react';
import styles from '../styles/RecipeCard.module.scss';
import { Recipe } from '../types/Recipe';
interface Props {
  recipe: Recipe;
  avgRating: number;
  ratingCount?: number;
  commentCount: number;
  onDelete?: (id: string) => void;
}

export const RecipeCard: React.FC<Props> = ({
  recipe,
  avgRating,
  ratingCount = 0,
  commentCount,
  onDelete,
}) => {
  // Type guard for new ingredient object
  const isIngredientObj = (
    ing: any
  ): ing is {
    name: string;
    quantity: string;
    unit: string;
    customUnit?: string;
  } => {
    return (
      typeof ing === 'object' &&
      ing !== null &&
      'name' in ing &&
      'quantity' in ing &&
      'unit' in ing
    );
  };
  return (
    <div className={styles.card} style={{ position: 'relative' }}>
      {onDelete && (
        <button
          className={styles.trashButton}
          onClick={() => onDelete(recipe.id)}
          aria-label="Delete recipe"
        >
          <svg
            viewBox="0 0 32 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.trashIcon}
          >
            <rect x="8" y="8" width="16" height="6" rx="3" fill="#e74c3c" />
            <rect x="6" y="14" width="20" height="40" rx="5" fill="#e74c3c" />
            <rect x="11" y="20" width="2" height="28" rx="1" fill="white" />
            <rect x="15" y="20" width="2" height="28" rx="1" fill="white" />
            <rect x="19" y="20" width="2" height="28" rx="1" fill="white" />
          </svg>
        </button>
      )}
      <Link href={`/recipe/${recipe.id}`} className={styles.cardLink}>
        {recipe.imageUrl && (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className={styles.image}
          />
        )}
        <div className={styles.headerSection}>
          <h2 className={styles.title}>{recipe.title}</h2>
        </div>
        <div className={styles.ingredientsSection}>
          <h4 className={styles.ingredientsLabel}>Ingredients</h4>
          <ul className={styles.ingredientsList}>
            {recipe.ingredients.map((ing: any, i: number) => (
              <li key={i} className={styles.ingredient}>
                {isIngredientObj(ing)
                  ? `${ing.quantity} ${
                      ing.unit === 'custom' && ing.customUnit
                        ? ing.customUnit
                        : ing.unit
                    } ${ing.name}`.trim()
                  : ing}
              </li>
            ))}
          </ul>
        </div>
        <p className={styles.description}>{recipe.description}</p>
        <div className={styles.meta}>
          <span>
            ⭐ {avgRating.toFixed(1)}
            {ratingCount > 0 ? ` (${ratingCount})` : ''}
          </span>
          <span>💬 {commentCount}</span>
        </div>
      </Link>
    </div>
  );
};
