import { Ingredient } from '@/types/shared';
import { Recipe } from '@/types/recipe';

export const PANTRY_OPTIONS: Ingredient[] = [
  { id: 'ing-eggs', name: 'Eggs (2)', quantity: '2 units', category: 'dairy', estimatedPrice: 0.99 },
  { id: 'ing-tomato', name: 'Ripe Tomatoes', quantity: '2 medium', category: 'produce', estimatedPrice: 1.49 },
  { id: 'ing-olive-oil', name: 'Extra Virgin Olive Oil', quantity: '2 tbsp', category: 'pantry', estimatedPrice: 1.2 },
  { id: 'ing-garlic', name: 'Garlic Cloves', quantity: '3 cloves', category: 'produce', estimatedPrice: 0.5 },
  { id: 'ing-pasta', name: 'Fettuccine Pasta', quantity: '250g', category: 'pantry', estimatedPrice: 1.89 },
  { id: 'ing-parmesan', name: 'Parmesan Cheese', quantity: '50g', category: 'dairy', estimatedPrice: 2.99 },
  { id: 'ing-chicken', name: 'Chicken Breast', quantity: '300g', category: 'meat', estimatedPrice: 4.5 },
  { id: 'ing-basil', name: 'Fresh Basil Leaves', quantity: 'handful', category: 'produce', estimatedPrice: 1.99 },
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
    { id: 'ing-eggs', name: 'Eggs', quantity: '3 large', category: 'dairy', estimatedPrice: 1.2 },
    { id: 'ing-tomato', name: 'Crushed Heirloom Tomatoes', quantity: '400g can', category: 'produce', estimatedPrice: 2.49 },
    { id: 'ing-olive-oil', name: 'Olive Oil', quantity: '2 tbsp', category: 'pantry', estimatedPrice: 0.8 },
    // Missing ingredients needed from store
    { id: 'ing-bell-pepper', name: 'Red Bell Pepper', quantity: '1 sliced', category: 'produce', estimatedPrice: 1.89 },
    { id: 'ing-feta', name: 'Crumbled Greek Feta', quantity: '60g', category: 'dairy', estimatedPrice: 3.25 },
  ],
  steps: [
    { stepNumber: 1, instruction: 'Heat olive oil in a skillet over medium heat. Sauté sliced bell peppers and garlic until soft.' },
    { stepNumber: 2, instruction: 'Pour in crushed tomatoes, season with cumin, paprika, salt, and simmer for 10 minutes.' },
    { stepNumber: 3, instruction: 'Create small wells in sauce and crack eggs into them. Cover and cook for 5-7 minutes until whites are set.' },
    { stepNumber: 4, instruction: 'Top with crumbled feta and fresh herbs. Serve hot with crusty sourdough bread.' },
  ],
};
