import type { Ingredient } from '@/types/shared';
import type { Recipe } from '@/types/recipe';

export const PANTRY_OPTIONS: Ingredient[] = [
  { id: 'ing-eggs',      name: 'Eggs',               quantity: 'Pack of 6',    category: 'dairy',   estimatedPrice: 75,  currency: 'INR' },
  { id: 'ing-tomato',    name: 'Tomatoes',            quantity: '500g pack',    category: 'produce', estimatedPrice: 30,  currency: 'INR' },
  { id: 'ing-olive-oil', name: 'Olive Oil',           quantity: '250ml bottle', category: 'pantry',  estimatedPrice: 220, currency: 'INR' },
  { id: 'ing-garlic',    name: 'Garlic',              quantity: '100g pack',    category: 'produce', estimatedPrice: 25,  currency: 'INR' },
  { id: 'ing-pasta',     name: 'Pasta',               quantity: '500g pack',    category: 'pantry',  estimatedPrice: 80,  currency: 'INR' },
  { id: 'ing-parmesan',  name: 'Parmesan Cheese',     quantity: '100g pack',    category: 'dairy',   estimatedPrice: 280, currency: 'INR' },
  { id: 'ing-chicken',   name: 'Chicken Breast',      quantity: '500g pack',    category: 'meat',    estimatedPrice: 180, currency: 'INR' },
  { id: 'ing-basil',     name: 'Fresh Basil',         quantity: '50g bunch',    category: 'produce', estimatedPrice: 40,  currency: 'INR' },
];

export const SAMPLE_RECIPE: Recipe = {
  id: 'rec-shakshuka-1',
  title: 'Rustic Mediterranean Shakshuka',
  description: 'Gently poached eggs in a simmering spiced tomato sauce with garlic, bell peppers, and olive oil.',
  cookTimeMinutes: 20,
  difficulty: 'Easy',
  servings: 2,
  calories: 340,
  imageUrl: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=500&auto=format&fit=crop&q=60',
  ingredients: [
    { id: 'ing-eggs',        name: 'Eggs',              quantity: 'Pack of 6',      category: 'dairy',   estimatedPrice: 75,  currency: 'INR' },
    { id: 'ing-tomato',      name: 'Tomatoes',          quantity: '500g pack',      category: 'produce', estimatedPrice: 30,  currency: 'INR' },
    { id: 'ing-olive-oil',   name: 'Olive Oil',         quantity: '250ml bottle',   category: 'pantry',  estimatedPrice: 220, currency: 'INR' },
    { id: 'ing-bell-pepper', name: 'Red Bell Pepper',   quantity: '2 pcs (250g)',   category: 'produce', estimatedPrice: 55,  currency: 'INR' },
    { id: 'ing-feta',        name: 'Feta Cheese',       quantity: '200g pack',      category: 'dairy',   estimatedPrice: 320, currency: 'INR' },
    { id: 'ing-cumin',       name: 'Cumin Powder',      quantity: '100g pack',      category: 'spices',  estimatedPrice: 45,  currency: 'INR' },
    { id: 'ing-paprika',     name: 'Smoked Paprika',    quantity: '50g pack',       category: 'spices',  estimatedPrice: 60,  currency: 'INR' },
  ],
  steps: [
    { stepNumber: 1, instruction: 'Heat olive oil in a skillet over medium heat. Sauté sliced bell peppers and garlic until soft.', durationMinutes: 5 },
    { stepNumber: 2, instruction: 'Pour in crushed tomatoes, season with cumin, paprika, and salt. Simmer for 10 minutes until sauce thickens.', durationMinutes: 10, tip: 'Stir occasionally and add a splash of water if it gets too thick.' },
    { stepNumber: 3, instruction: 'Create small wells in the sauce and crack eggs into them. Cover and cook for 5–7 minutes until whites are set but yolks are still runny.', durationMinutes: 7 },
    { stepNumber: 4, instruction: 'Top with crumbled feta and fresh herbs. Serve hot with crusty bread.', tip: 'A drizzle of olive oil on top before serving elevates the dish.' },
  ],
};
