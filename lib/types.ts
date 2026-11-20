export type Dish = {
  id: string
  name: string
  image_url: string
  description: string
  cook_time: number
  servings: number
  cuisine: string
  is_veg?: boolean
  difficulty?: 'Easy' | 'Medium' | 'Hard'
}

export type Ingredient = {
  id: string
  dish_id: string
  name: string
  quantity: string
  unit: string
  price_estimate: number
}

export type CartItem = {
  ingredient: Ingredient
  quantity: number
}

export type Toast = {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}
