// Shared types & contracts for both developers

export type IngredientCategory = 'produce' | 'dairy' | 'meat' | 'pantry' | 'spices' | 'bakery';

export interface Ingredient {
  id: string;
  name: string;
  quantity: string;             // e.g., "200g", "2 tbsp", "1 whole"
  category: IngredientCategory;
  isAvailableInPantry?: boolean;
  estimatedPrice: number;       // Price in USD ($)
}

export type CartItemSource = 'food_menu' | 'recipe_ingredient';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  source: CartItemSource;
  recipeReferenceId?: string;   // Traceability back to the recipe if ordered via Recipe Maker
  notes?: string;
}
