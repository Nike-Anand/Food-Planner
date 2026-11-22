import { Ingredient } from './shared';

export type FoodCategory =
  | 'All'
  | 'Meals & Rice'
  | 'Breads & Curries'
  | 'Street Food & Chaat'
  | 'Snacks & Fast Food'
  | 'South Indian'
  | 'Desserts & Beverages';

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  prepTimeMinutes: number;
  calories: number;
  category: FoodCategory;
  imageUrl: string;
  isVegetarian: boolean;
  tags?: string[];
  ingredients?: Ingredient[];
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  deliveryFee: number;
  deliveryTime: string;
  rating: number;
}
