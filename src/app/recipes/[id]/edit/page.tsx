"use client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import styles from "@/styles/AddRecipe.module.scss";
import RichTextEditor from "@/components/RichTextEditor";
import { Recipe } from "@/types/Recipe";

type Ingredient = {
  name: string;
  quantity: string;
  unit: string;
  customUnit?: string;
};

export default function EditRecipePage() {
  const user = useAuthUser();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const commonUnits = [
    "g",
    "kg",
    "ml",
    "l",
    "TL",
    "EL",
    "Stück",
    "Prise",
    "Bund",
    "Dose",
    "Päckchen",
    "Scheibe",
    "Tasse",
    "Becher",
    "cm",
    "Msp.",
    "Schuss",
    "Spritzer",
    "Würfel",
    "Kugel",
    "Blatt",
    "Zehe",
    "Handvoll",
    "custom",
  ];

  const [loadingRecipe, setLoadingRecipe] = useState(true);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", quantity: "", unit: "" },
  ]);
  const [imageType, setImageType] = useState<"url" | "file">("url");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/recipes/${id}`)
      .then((r) => {
        if (!r.ok) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((data: Recipe | null) => {
        if (!data) return;
        setRecipe(data);
        setTitle(data.title);
        setDescription(data.description ?? "");
        setIngredients(
          data.ingredients?.length
            ? data.ingredients
            : [{ name: "", quantity: "", unit: "" }],
        );
        setTags(data.tags ?? []);
        setImageUrlInput(
          data.imageUrl && !data.imageUrl.includes(".blob.vercel-storage.com")
            ? data.imageUrl
            : "",
        );
        setImageType("url");
      })
      .finally(() => setLoadingRecipe(false));
  }, [id]);

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((data: string[]) => setAvailableTags(data))
      .catch(() => {});
  }, []);

  const filteredTags = availableTags.filter(
    (t) =>
      t.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(t),
  );

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) setTags([...tags, trimmed]);
    setTagInput("");
    setShowTagDropdown(false);
    tagInputRef.current?.focus();
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (tagInput.trim()) addTag(tagInput);
    } else if (e.key === "Escape") {
      setShowTagDropdown(false);
    }
  };

  const handleImageTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as "url" | "file";
    setImageType(newType);
    if (newType === "url") setImage(null);
    else setImageUrlInput("");
  };

  const handlePasteImageUrl = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setImageUrlInput(text);
    } catch {
      alert("Failed to read clipboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("ingredients", JSON.stringify(ingredients));
      formData.append("tags", JSON.stringify(tags));
      if (imageType === "file" && image) {
        formData.append("image", image);
      } else {
        formData.append("imageUrl", imageUrlInput);
      }
      const res = await fetch(`/api/recipes/${id}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Failed to save changes.");
        return;
      }
      router.push(`/recipes/${id}`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingRecipe) return <div>Loading…</div>;
  if (notFound) return <div style={{ color: "red" }}>Recipe not found.</div>;
  if (!recipe) return null;

  if (user && recipe.userId !== user) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Edit Recipe</h1>
        <p>You are not authorized to edit this recipe.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Edit Recipe</h1>
        <p>You must be logged in to edit a recipe.</p>
        <a href="/login" style={{ color: "#3498db" }}>
          Go to Login
        </a>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Edit Recipe</h1>
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
          <label htmlFor="imageType">Image Type</label>
          <select
            id="imageType"
            value={imageType}
            onChange={handleImageTypeChange}
          >
            <option value="url">Image URL</option>
            <option value="file">Upload File</option>
          </select>
        </div>
        {imageType === "url" ? (
          <div
            className={styles.field}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <label htmlFor="imageUrl">Image URL</label>
            <input
              id="imageUrl"
              type="url"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              placeholder="https://..."
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={handlePasteImageUrl}
              style={{
                padding: "0.25rem 0.5rem",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
              aria-label="Paste from clipboard"
            >
              Paste
            </button>
          </div>
        ) : (
          <div className={styles.field}>
            <label htmlFor="image">Image File</label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </div>
        )}
        <div className={styles.field + " " + styles.full}>
          <label>Description</label>
          <RichTextEditor value={description} onChange={setDescription} />
        </div>
        <div className={styles.field + " " + styles.full}>
          <label>Ingredients</label>
          {ingredients.map((ing, idx) => (
            <div
              key={idx}
              style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}
            >
              <input
                type="text"
                placeholder="Name"
                value={ing.name}
                onChange={(e) => {
                  const next = [...ingredients];
                  next[idx].name = e.target.value;
                  setIngredients(next);
                }}
                required
                style={{ flex: 2 }}
              />
              <input
                type="text"
                placeholder="Menge (z.B. 200)"
                value={ing.quantity}
                onChange={(e) => {
                  const next = [...ingredients];
                  next[idx].quantity = e.target.value;
                  setIngredients(next);
                }}
                required
                style={{ flex: 1 }}
              />
              <select
                value={ing.unit}
                onChange={(e) => {
                  const next = [...ingredients];
                  next[idx].unit = e.target.value;
                  setIngredients(next);
                }}
                required
                style={{ flex: 1 }}
              >
                <option value="">Einheit wählen</option>
                {commonUnits.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit === "custom" ? "Andere..." : unit}
                  </option>
                ))}
              </select>
              {ing.unit === "custom" && (
                <input
                  type="text"
                  placeholder="Eigene Einheit"
                  value={ing.customUnit || ""}
                  onChange={(e) => {
                    const next = [...ingredients];
                    next[idx].customUnit = e.target.value;
                    setIngredients(next);
                  }}
                  style={{ flex: 1 }}
                />
              )}
              <button
                type="button"
                onClick={() =>
                  setIngredients(ingredients.filter((_, i) => i !== idx))
                }
                style={{
                  background: "#e74c3c",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "0 0.5rem",
                  cursor: "pointer",
                }}
                aria-label="Remove ingredient"
                disabled={ingredients.length === 1}
              >
                &times;
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setIngredients([
                ...ingredients,
                { name: "", quantity: "", unit: "" },
              ])
            }
            style={{
              background: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "0.3rem 0.7rem",
              cursor: "pointer",
              marginTop: "0.5rem",
            }}
          >
            + Add Ingredient
          </button>
        </div>
        <div className={styles.field + " " + styles.full}>
          <label>Tags</label>
          <div className={styles.tagPillsRow}>
            {tags.map((tag) => (
              <span key={tag} className={styles.tagPill}>
                {tag}
                <button
                  type="button"
                  onClick={() => setTags(tags.filter((t) => t !== tag))}
                  aria-label={`Remove tag ${tag}`}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          <div className={styles.tagInputWrapper}>
            <input
              ref={tagInputRef}
              type="text"
              placeholder="Type to search or create a tag, press Enter to add"
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value);
                setShowTagDropdown(true);
              }}
              onFocus={() => setShowTagDropdown(true)}
              onBlur={() => setTimeout(() => setShowTagDropdown(false), 150)}
              onKeyDown={handleTagKeyDown}
              autoComplete="off"
            />
            {showTagDropdown &&
              (filteredTags.length > 0 || tagInput.trim()) && (
                <ul className={styles.tagDropdown}>
                  {filteredTags.map((t) => (
                    <li key={t} onMouseDown={() => addTag(t)}>
                      {t}
                    </li>
                  ))}
                  {tagInput.trim() &&
                    !availableTags.includes(tagInput.trim()) && (
                      <li
                        className={styles.tagDropdownNew}
                        onMouseDown={() => addTag(tagInput)}
                      >
                        Create &ldquo;{tagInput.trim()}&rdquo;
                      </li>
                    )}
                </ul>
              )}
          </div>
        </div>
        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? "Saving…" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/recipes/${id}`)}
            style={{
              background: "#444",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              padding: "0.75rem 1.5rem",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
