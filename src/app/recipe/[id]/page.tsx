'use client';
import { CommentList } from '@/components/CommentList';
import { RatingStars } from '@/components/RatingStars';
import { db } from '@/lib/firebase';
import styles from '@/styles/RecipeDetail.module.scss';
import { Comment } from '@/types/Comment';
import { Rating } from '@/types/Rating';
import { Recipe } from '@/types/Recipe';
import { addDoc, collection, doc, Timestamp } from 'firebase/firestore';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RecipeDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [score, setScore] = useState(1);
  const [user, setUser] = useState('me');
  const [commentText, setCommentText] = useState('');
  const [commentUser, setCommentUser] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const fetchAll = async () => {
      try {
        const recipeSnap = await import('firebase/firestore').then(
          ({ getDoc }) => getDoc(doc(db, 'recipes', id))
        );
        if (recipeSnap.exists()) {
          setRecipe({ id: recipeSnap.id, ...recipeSnap.data() } as Recipe);
          setError(null);
        } else {
          setError('Recipe not found.');
          setRecipe(null);
        }
        const ratingsSnap = await import('firebase/firestore').then(
          ({ getDocs }) => getDocs(collection(db, 'recipes', id, 'ratings'))
        );
        setRatings(
          ratingsSnap.docs.map(
            (d: import('firebase/firestore').QueryDocumentSnapshot) =>
              ({ id: d.id, ...d.data() } as Rating)
          )
        );
        const commentsSnap = await import('firebase/firestore').then(
          ({ getDocs }) => getDocs(collection(db, 'recipes', id, 'comments'))
        );
        setComments(
          commentsSnap.docs.map(
            (d: import('firebase/firestore').QueryDocumentSnapshot) =>
              ({ id: d.id, ...d.data() } as Comment)
          )
        );
      } catch {
        setError('Error loading recipe.');
        setRecipe(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const avgRating = ratings.length
    ? ratings.reduce((a, b) => a + b.score, 0) / ratings.length
    : 0;

  const handleAddRating = async () => {
    if (!id) return;
    await addDoc(collection(db, 'recipes', id, 'ratings'), {
      score,
      user,
      createdAt: Timestamp.now().toDate().toISOString(),
    });
  };

  const handleAddComment = async () => {
    if (!id || !commentText || !commentUser) return;
    await addDoc(collection(db, 'recipes', id, 'comments'), {
      comment: commentText,
      user: commentUser,
      createdAt: Timestamp.now().toDate().toISOString(),
    });
    setCommentText('');
    setCommentUser('');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!recipe) return null;

  return (
    <div className={styles.detail}>
      <div className={styles.headerSection}>
        <h1 className={styles.title}>{recipe.title}</h1>
        {recipe.imageUrl && (
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            className={styles.image}
            width={400}
            height={300}
            priority
          />
        )}
      </div>
      <p className={styles.description}>{recipe.description}</p>
      <div className={styles.ingredientsSection}>
        <h3 className={styles.ingredientsLabel}>Ingredients</h3>
        <ul className={styles.ingredientsList}>
          {recipe.ingredients.map(
            (ing: import('@/types/Recipe').Ingredient, i: number) => (
              <li key={i} className={styles.ingredient}>
                {typeof ing === 'object' &&
                ing !== null &&
                'name' in ing &&
                'quantity' in ing &&
                'unit' in ing
                  ? `${ing.quantity} ${
                      ing.unit === 'custom' && ing.customUnit
                        ? ing.customUnit
                        : ing.unit
                    } ${ing.name}`.trim()
                  : ing}
              </li>
            )
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
            value={user}
            onChange={(e) => setUser(e.target.value)}
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
        <input
          className={styles.formInput}
          value={commentUser}
          onChange={(e) => setCommentUser(e.target.value)}
          placeholder="Your name"
        />
        <input
          className={styles.formInput}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Comment"
        />
        <button className={styles.formButton} onClick={handleAddComment}>
          Add Comment
        </button>
      </div>
    </div>
  );
}
