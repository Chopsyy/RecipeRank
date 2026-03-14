import type { Comment } from "./Comment";
import type { Rating } from "./Rating";

export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  customUnit?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  imageUrl?: string;
  createdAt: string;
  userId: string;
  ratings: Rating[];
  comments: Comment[];
}
