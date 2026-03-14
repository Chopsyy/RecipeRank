"use client";
import { useEffect, useState } from "react";
import { Recipe } from "../types/Recipe";

export function useRecipes(refreshKey?: number) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  useEffect(() => {
    fetch("/api/recipes")
      .then((res) => res.json())
      .then(setRecipes)
      .catch(() => setRecipes([]));
  }, [refreshKey]);
  return recipes;
}
