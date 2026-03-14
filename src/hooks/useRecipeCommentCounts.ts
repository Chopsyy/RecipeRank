"use client";
import { useMemo } from "react";
import { Recipe } from "../types/Recipe";

export function useRecipeCommentCounts(
  recipes: Recipe[],
): Record<string, number> {
  return useMemo(() => {
    const result: Record<string, number> = {};
    for (const recipe of recipes) {
      result[recipe.id] = (recipe.comments ?? []).length;
    }
    return result;
  }, [recipes]);
}
