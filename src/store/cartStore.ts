import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Ingredient } from '@/types/shared';

interface CartState {
  items: CartItem[];
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  // THE BRIDGE: Used by Developer 2 (Recipe Maker) to auto-order missing ingredients
  addIngredientsToCart: (ingredients: Ingredient[], recipeTitle?: string) => void;
  // Computed helpers
  getTotalCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        });
      },

      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      updateQuantity: (id: string, delta: number) => {
        set((state) => ({
          items: state.items
            .map((item) => {
              if (item.id === id) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
              }
              return item;
            })
            .filter((item): item is CartItem => item !== null),
        }));
      },

      clearCart: () => set({ items: [] }),

      // Integration bridge method:
      addIngredientsToCart: (ingredients: Ingredient[], recipeTitle?: string) => {
        set((state) => {
          const newItems: CartItem[] = ingredients.map((ing) => ({
            id: `ing-${ing.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: `${ing.name} (${ing.quantity})`,
            price: ing.estimatedPrice || 2.49,
            quantity: 1,
            source: 'recipe_ingredient',
            notes: recipeTitle ? `For: ${recipeTitle}` : undefined,
          }));
          return { items: [...state.items, ...newItems] };
        });
      },

      getTotalCount: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'foodhub-cart',
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.error('Failed to restore cart from local storage.', error);
        }
        useCartStore.setState({ hasHydrated: true });
      },
    }
  )
);
