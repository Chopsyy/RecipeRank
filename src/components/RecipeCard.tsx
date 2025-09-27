import Image from 'next/image';
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
  type IngredientObj = {
    name: string;
    quantity: string;
    unit: string;
    customUnit?: string;
  };

  const isIngredientObj = (
    ing: IngredientObj | string
  ): ing is IngredientObj => {
    return (
      typeof ing === 'object' &&
      ing !== null &&
      'name' in ing &&
      'quantity' in ing &&
      'unit' in ing
    );
  };
  const isExample = recipe.id.startsWith('example-');
  return (
    <a
      href={`/recipe/${recipe.id}`}
      className={styles.card}
      style={{ position: 'relative', textDecoration: 'none', color: 'inherit' }}
    >
      {onDelete && (
        <button
          className={styles.trashButton}
          onClick={(e) => {
            e.preventDefault();
            onDelete(recipe.id);
          }}
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
      {recipe.imageUrl && (
        <Image
          src={recipe.imageUrl}
          alt={recipe.title}
          className={styles.image}
          width={400}
          height={300}
          priority
          style={{ objectFit: 'cover' }}
        />
      )}
      <div className={styles.headerSection}>
        <h2 className={styles.title}>{recipe.title}</h2>
        {isExample && <span className={styles.exampleBadge}>Example</span>}
      </div>
      <div className={styles.ingredientsSection}>
        <h4 className={styles.ingredientsLabel}>Ingredients</h4>
        <ul className={styles.ingredientsList}>
          {recipe.ingredients.map((ing: IngredientObj | string, i: number) => (
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
    </a>
  );
};
