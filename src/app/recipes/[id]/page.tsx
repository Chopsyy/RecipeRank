"use client";
import { CommentList } from "@/components/CommentList";
import { RatingStars } from "@/components/RatingStars";
import { useAuthUser } from "@/hooks/useAuthUser";
import styles from "@/styles/RecipeDetail.module.scss";
import { Comment } from "@/types/Comment";
import { Rating } from "@/types/Rating";
import { Recipe } from "@/types/Recipe";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RecipeDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(5);
  const [ratingUser, setRatingUser] = useState<"me" | "gf">("me");
  const authUser = useAuthUser();
  const [commentText, setCommentText] = useState("");

  const fetchRecipe = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/recipes/${id}`);
      if (!res.ok) {
        setError("Recipe not found.");
        setRecipe(null);
      } else {
        setRecipe(await res.json());
        setError(null);
      }
    } catch {
      setError("Error loading recipe.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const ratings: Rating[] = recipe?.ratings ?? [];
  const comments: Comment[] = recipe?.comments ?? [];

  const avgRating = ratings.length
    ? ratings.reduce((a, b) => a + b.score, 0) / ratings.length
    : 0;

  const handleAddRating = async () => {
    if (!id) return;
    await fetch(`/api/recipes/${id}/ratings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, user: ratingUser }),
    });
    fetchRecipe();
  };

  const handleAddComment = async () => {
    if (!id || !commentText.trim()) return;
    await fetch(`/api/recipes/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment: commentText }),
    });
    setCommentText("");
    fetchRecipe();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!recipe) return null;

  return (
    <div className={styles.detail}>
      <div className={styles.headerSection}>
        <h1 className={styles.title}>{recipe.title}</h1>
        {recipe.imageUrl && (
          <Image
            src={
              recipe.imageUrl.includes(".blob.vercel-storage.com")
                ? `/api/images?url=${encodeURIComponent(recipe.imageUrl)}`
                : recipe.imageUrl
            }
            alt={recipe.title}
            className={styles.image}
            width={400}
            height={300}
            priority
          />
        )}
      </div>
      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: recipe.description ?? "" }}
      />
      <div className={styles.ingredientsSection}>
        <h3 className={styles.ingredientsLabel}>Ingredients</h3>
        <ul className={styles.ingredientsList}>
          {recipe.ingredients.map(
            (ing: import("@/types/Recipe").Ingredient, i: number) => (
              <li key={i} className={styles.ingredient}>
                {typeof ing === "object" &&
                ing !== null &&
                "name" in ing &&
                "quantity" in ing &&
                "unit" in ing
                  ? `${ing.quantity} ${
                      ing.unit === "custom" && ing.customUnit
                        ? ing.customUnit
                        : ing.unit
                    } ${ing.name}`.trim()
                  : ing}
              </li>
            ),
          )}
        </ul>
      </div>
      <div className={styles.section}>
        <h3>Ratings</h3>
        <div className={styles.ratings}>
          <RatingStars score={score} onRate={setScore} />
          <span>
            Average: {avgRating.toFixed(1)} ({ratings.length} ratings)
          </span>
          <select
            className={styles.formInput}
            value={ratingUser}
            onChange={(e) => setRatingUser(e.target.value as "me" | "gf")}
          >
            <option value="me">Me</option>
            <option value="gf">Girlfriend</option>
          </select>
          <button className={styles.formButton} onClick={handleAddRating}>
            Add Rating
          </button>
        </div>
      </div>
      <div className={styles.comments}>
        <h3>Comments</h3>
        <CommentList comments={comments} />
        {authUser && (
          <>
            <input
              className={styles.formInput}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment…"
            />
            <button className={styles.formButton} onClick={handleAddComment}>
              Add Comment
            </button>
          </>
        )}
      </div>
    </div>
  );
}
