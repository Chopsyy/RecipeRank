// Example recipes for RecipeRank
// You can import these into Firestore or use for testing

export const exampleRecipes = [
  {
    title: 'Classic Pancakes',
    description: 'Fluffy pancakes perfect for breakfast.',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
    ingredients: [
      { name: 'Flour', quantity: 2, unit: 'cup' },
      { name: 'Milk', quantity: 1.5, unit: 'cup' },
      { name: 'Eggs', quantity: 2, unit: 'piece' },
      { name: 'Sugar', quantity: 2, unit: 'tbsp' },
      { name: 'Baking Powder', quantity: 2, unit: 'tsp' },
      { name: 'Salt', quantity: 0.5, unit: 'tsp' },
    ],
  },
  {
    title: 'Spaghetti Carbonara',
    description: 'Rich and creamy Italian pasta dish.',
    imageUrl: 'https://images.unsplash.com/photo-1523987355523-c7b5b0723c6b',
    ingredients: [
      { name: 'Spaghetti', quantity: 400, unit: 'g' },
      { name: 'Pancetta', quantity: 150, unit: 'g' },
      { name: 'Eggs', quantity: 3, unit: 'piece' },
      { name: 'Parmesan Cheese', quantity: 50, unit: 'g' },
      { name: 'Black Pepper', quantity: 1, unit: 'tsp' },
    ],
  },
  {
    title: 'Chicken Caesar Salad',
    description: 'A healthy salad with grilled chicken and Caesar dressing.',
    imageUrl: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c',
    ingredients: [
      { name: 'Romaine Lettuce', quantity: 1, unit: 'head' },
      { name: 'Chicken Breast', quantity: 2, unit: 'piece' },
      { name: 'Croutons', quantity: 1, unit: 'cup' },
      { name: 'Parmesan Cheese', quantity: 0.5, unit: 'cup' },
      { name: 'Caesar Dressing', quantity: 0.5, unit: 'cup' },
    ],
  },
];
