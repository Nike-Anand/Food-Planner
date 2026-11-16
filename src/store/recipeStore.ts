import { create } from 'zustand';
import { Recipe, CookingStep } from '@/types/recipe';
import { Ingredient } from '@/types/shared';

interface RecipeState {
  selectedPantryIngredients: string[]; // Ingredient IDs currently in user's pantry
  activeRecipe: Recipe | null;
  savedRecipes: Recipe[];
  isGenerating: boolean;

  togglePantryIngredient: (ingredientId: string) => void;
  clearPantry: () => void;
  setActiveRecipe: (recipe: Recipe | null) => void;
  setIsGenerating: (status: boolean) => void;
  saveRecipe: (recipe: Recipe) => void;
}

export const useRecipeStore = create<RecipeState>((set) => ({
  selectedPantryIngredients: ['ing-eggs', 'ing-tomato', 'ing-olive-oil'],
  activeRecipe: null,
  savedRecipes: [],
  isGenerating: false,

  togglePantryIngredient: (id: string) => {
    set((state) => ({
      selectedPantryIngredients: state.selectedPantryIngredients.includes(id)
        ? state.selectedPantryIngredients.filter((i) => i !== id)
        : [...state.selectedPantryIngredients, id],
    }));
  },

  clearPantry: () => set({ selectedPantryIngredients: [] }),
  setActiveRecipe: (recipe) => set({ activeRecipe: recipe }),
  setIsGenerating: (status) => set({ isGenerating: status }),
  saveRecipe: (recipe) =>
    set((state) => ({
      savedRecipes: [...state.savedRecipes, recipe],
    })),
}));
