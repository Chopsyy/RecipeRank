"use client";
import { useState } from "react";
import { RecipeCard } from "../components/RecipeCard";
import { useRecipeCommentCounts } from "../hooks/useRecipeCommentCounts";
import { useRecipeRatingCounts } from "../hooks/useRecipeRatingCounts";
import { useRecipeRatings } from "../hooks/useRecipeRatings";
import { useRecipes } from "../hooks/useRecipes";
import { useRouter } from "next/navigation";
import styles from "../styles/HomePage.module.scss";

export default function HomePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();
  const recipes = useRecipes(refreshKey);
  const ratings = useRecipeRatings(recipes);
  const ratingCounts = useRecipeRatingCounts(recipes);
  const commentCounts = useRecipeCommentCounts(recipes);

  const handleDelete = async (id: string) => {
    await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    setRefreshKey((k) => k + 1);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className={styles.container}>
      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 10,
          background: "linear-gradient(90deg, #e74c3c 0%, #f39c12 100%)",
          color: "#fff",
          border: "none",
          borderRadius: "24px",
          padding: "10px 28px",
          fontWeight: "bold",
          fontSize: "1rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          cursor: "pointer",
          transition: "background 0.2s",
        }}
        onMouseOver={(e) =>
          (e.currentTarget.style.background =
            "linear-gradient(90deg, #f39c12 0%, #e74c3c 100%)")
        }
        onMouseOut={(e) =>
          (e.currentTarget.style.background =
            "linear-gradient(90deg, #e74c3c 0%, #f39c12 100%)")
        }
      >
        Logout
      </button>
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          avgRating={ratings[recipe.id] ?? 0}
          ratingCount={ratingCounts[recipe.id] ?? 0}
          commentCount={commentCounts[recipe.id] ?? 0}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
