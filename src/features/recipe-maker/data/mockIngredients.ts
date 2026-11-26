import type { Ingredient } from '@/types/shared';
import type { Recipe } from '@/types/recipe';
import type { Dish } from '@/types/food';
import { INDIAN_FOOD_ITEMS } from '@/features/food-ordering/data/mockDishes';

export const PANTRY_OPTIONS: Ingredient[] = [
  // Produce
  { id: 'ing-tomato',       name: '🍅 Tomatoes',          quantity: '500g pack',    category: 'produce', estimatedPrice: 30,  currency: 'INR' },
  { id: 'ing-onion',        name: '🧅 Onion',             quantity: '500g pack',    category: 'produce', estimatedPrice: 25,  currency: 'INR' },
  { id: 'ing-garlic',       name: '🧄 Garlic',            quantity: '100g pack',    category: 'produce', estimatedPrice: 25,  currency: 'INR' },
  { id: 'ing-ginger',       name: '🫚 Ginger',            quantity: '100g pack',    category: 'produce', estimatedPrice: 20,  currency: 'INR' },
  { id: 'ing-potato',       name: '🥔 Potato',            quantity: '1kg pack',     category: 'produce', estimatedPrice: 35,  currency: 'INR' },
  { id: 'ing-spinach',      name: '🥬 Spinach',           quantity: '250g bunch',   category: 'produce', estimatedPrice: 30,  currency: 'INR' },
  { id: 'ing-bell-pepper',  name: '🫑 Bell Pepper',       quantity: '2 pcs (250g)', category: 'produce', estimatedPrice: 55,  currency: 'INR' },
  { id: 'ing-lemon',        name: '🍋 Lemon',             quantity: 'Pack of 4',    category: 'produce', estimatedPrice: 20,  currency: 'INR' },
  { id: 'ing-coriander',    name: '🌿 Coriander',         quantity: '50g bunch',    category: 'produce', estimatedPrice: 15,  currency: 'INR' },
  { id: 'ing-basil',        name: '🌿 Fresh Basil',       quantity: '50g bunch',    category: 'produce', estimatedPrice: 40,  currency: 'INR' },
  // Dairy
  { id: 'ing-eggs',         name: '🥚 Eggs',              quantity: 'Pack of 6',    category: 'dairy',   estimatedPrice: 75,  currency: 'INR' },
  { id: 'ing-milk',         name: '🥛 Milk',              quantity: '500ml pack',   category: 'dairy',   estimatedPrice: 30,  currency: 'INR' },
  { id: 'ing-butter',       name: '🧈 Butter',            quantity: '100g pack',    category: 'dairy',   estimatedPrice: 55,  currency: 'INR' },
  { id: 'ing-paneer',       name: '🧀 Paneer',            quantity: '200g pack',    category: 'dairy',   estimatedPrice: 90,  currency: 'INR' },
  { id: 'ing-curd',         name: '🥣 Curd / Yogurt',     quantity: '400g pack',    category: 'dairy',   estimatedPrice: 45,  currency: 'INR' },
  { id: 'ing-cream',        name: '🍶 Fresh Cream',       quantity: '200ml pack',   category: 'dairy',   estimatedPrice: 55,  currency: 'INR' },
  { id: 'ing-parmesan',     name: '🧀 Parmesan',          quantity: '100g pack',    category: 'dairy',   estimatedPrice: 280, currency: 'INR' },
  // Meat
  { id: 'ing-chicken',      name: '🍗 Chicken Breast',    quantity: '500g pack',    category: 'meat',    estimatedPrice: 180, currency: 'INR' },
  { id: 'ing-mutton',       name: '🥩 Mutton',            quantity: '500g pack',    category: 'meat',    estimatedPrice: 380, currency: 'INR' },
  { id: 'ing-prawns',       name: '🦐 Prawns',            quantity: '250g pack',    category: 'meat',    estimatedPrice: 220, currency: 'INR' },
  // Pantry
  { id: 'ing-rice',         name: '🍚 Basmati Rice',      quantity: '1kg pack',     category: 'pantry',  estimatedPrice: 90,  currency: 'INR' },
  { id: 'ing-pasta',        name: '🍝 Pasta',             quantity: '500g pack',    category: 'pantry',  estimatedPrice: 80,  currency: 'INR' },
  { id: 'ing-olive-oil',    name: '🫙 Olive Oil',         quantity: '250ml bottle', category: 'pantry',  estimatedPrice: 220, currency: 'INR' },
  { id: 'ing-refined-oil',  name: '🫙 Refined Oil',       quantity: '1L bottle',    category: 'pantry',  estimatedPrice: 130, currency: 'INR' },
  { id: 'ing-dal',          name: '🫘 Toor Dal',          quantity: '500g pack',    category: 'pantry',  estimatedPrice: 70,  currency: 'INR' },
  { id: 'ing-chickpeas',    name: '🫘 Chickpeas',         quantity: '500g pack',    category: 'pantry',  estimatedPrice: 65,  currency: 'INR' },
  { id: 'ing-bread',        name: '🍞 Bread',             quantity: 'Pack of 10',   category: 'bakery',  estimatedPrice: 45,  currency: 'INR' },
  // Spices
  { id: 'ing-cumin',        name: '🌶 Cumin Powder',      quantity: '100g pack',    category: 'spices',  estimatedPrice: 45,  currency: 'INR' },
  { id: 'ing-turmeric',     name: '🌿 Turmeric Powder',   quantity: '100g pack',    category: 'spices',  estimatedPrice: 35,  currency: 'INR' },
  { id: 'ing-chilli',       name: '🌶 Red Chilli Powder', quantity: '100g pack',    category: 'spices',  estimatedPrice: 40,  currency: 'INR' },
  { id: 'ing-garam-masala', name: '🌶 Garam Masala',      quantity: '100g pack',    category: 'spices',  estimatedPrice: 55,  currency: 'INR' },
  { id: 'ing-paprika',      name: '🌶 Smoked Paprika',    quantity: '50g pack',     category: 'spices',  estimatedPrice: 60,  currency: 'INR' },
  { id: 'ing-salt',         name: '🧂 Salt',              quantity: '1kg pack',     category: 'spices',  estimatedPrice: 20,  currency: 'INR' },
];

export function dishToRecipe(dish: Dish): Recipe {
  return {
    id: `rec-${dish.id}`,
    title: dish.name,
    description: dish.description,
    cookTimeMinutes: dish.prepTimeMinutes,
    difficulty: dish.prepTimeMinutes <= 10 ? 'Easy' : dish.prepTimeMinutes <= 20 ? 'Medium' : 'Hard',
    servings: 2,
    calories: dish.calories,
    imageUrl: dish.imageUrl,
    ingredients: dish.ingredients ?? [],
    steps: dish.steps ?? [],
  };
}

export const RECIPES: Recipe[] = INDIAN_FOOD_ITEMS
  .filter((d) => d.ingredients?.length && d.steps?.length)
  .map(dishToRecipe);
