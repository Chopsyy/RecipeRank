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
}
