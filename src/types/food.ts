import { Ingredient } from './shared';

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  prepTimeMinutes: number;
  calories: number;
  category: 'Bowls' | 'Burgers' | 'Asian' | 'Salads' | 'Desserts' | 'Drinks';
  imageUrl: string;
  isVegetarian?: boolean;
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
