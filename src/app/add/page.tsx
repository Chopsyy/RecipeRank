'use client';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import { db } from '../../lib/firebase';
import { supabase } from '../../lib/supabase';
import styles from '../../styles/AddRecipe.module.scss';

export default function AddRecipePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let imageUrl = '';
    if (image) {
      const { data } = await supabase.storage
        .from('recipe-images')
        .upload(`recipes/${Date.now()}_${image.name}`, image);
      if (data) {
        const { data: publicUrlData } = supabase.storage
          .from('recipe-images')
          .getPublicUrl(data.path);
        imageUrl = publicUrlData.publicUrl;
      }
    }
    await addDoc(collection(db, 'recipes'), {
      title,
      description,
      ingredients: ingredients.split('\n'),
      imageUrl,
      createdAt: Timestamp.now().toDate().toISOString(),
    });
    setTitle('');
    setDescription('');
    setIngredients('');
    setImage(null);
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Add Recipe</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="image">Image</label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
        </div>
        <div className={styles.field + ' ' + styles.full}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            required
          />
        </div>
        <div className={styles.field + ' ' + styles.full}>
          <label htmlFor="ingredients">Ingredients (one per line)</label>
          <textarea
            id="ingredients"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="Ingredients (one per line)"
            required
          />
        </div>
        <button type="submit" disabled={loading} className={styles.full}>
          {loading ? 'Adding...' : 'Add Recipe'}
        </button>
      </form>
    </div>
  );
}
