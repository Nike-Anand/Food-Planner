import { Ingredient } from './shared';

export interface CookingStep {
  stepNumber: number;
  instruction: string;
  durationMinutes?: number;
  tip?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  cookTimeMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: number;
  calories: number;
  imageUrl?: string;
  ingredients: Ingredient[];
  steps: CookingStep[];
  matchedPantryPercentage?: number;
}
