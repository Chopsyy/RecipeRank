"use client";
import { useMemo } from "react";
import { Recipe } from "../types/Recipe";

export function useRecipeRatingCounts(
  recipes: Recipe[],
): Record<string, number> {
  return useMemo(() => {
    const result: Record<string, number> = {};
    for (const recipe of recipes) {
      result[recipe.id] = (recipe.ratings ?? []).length;
    }
    return result;
  }, [recipes]);
}
