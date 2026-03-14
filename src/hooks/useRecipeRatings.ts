"use client";
import { useMemo } from "react";
import { Recipe } from "../types/Recipe";

export function useRecipeRatings(recipes: Recipe[]): Record<string, number> {
  return useMemo(() => {
    const result: Record<string, number> = {};
    for (const recipe of recipes) {
      const scores = (recipe.ratings ?? []).map((r) => r.score);
      result[recipe.id] = scores.length
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0;
    }
    return result;
  }, [recipes]);
}
