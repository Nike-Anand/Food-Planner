import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, CartItemSource, Ingredient } from '@/types/shared';
import { convertUsdToInr } from '@/lib/currency';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function migratePersistedCart(
  persistedState: unknown,
  version: number
): { items: CartItem[] } {
  if (version > 0) {
    throw new Error(`Unsupported persisted cart version: ${version}.`);
  }

  if (!isRecord(persistedState) || !Array.isArray(persistedState.items)) {
    throw new Error('Cannot migrate persisted cart: items must be an array.');
  }

  const items = persistedState.items.map((storedItem): CartItem => {
    if (
      !isRecord(storedItem) ||
      typeof storedItem.id !== 'string' ||
      typeof storedItem.name !== 'string' ||
      typeof storedItem.price !== 'number' ||
      !Number.isFinite(storedItem.price) ||
      typeof storedItem.quantity !== 'number' ||
      !Number.isInteger(storedItem.quantity) ||
      (storedItem.source !== 'food_menu' && storedItem.source !== 'recipe_ingredient') ||
      (storedItem.currency !== undefined && storedItem.currency !== 'INR') ||
      (storedItem.imageUrl !== undefined && typeof storedItem.imageUrl !== 'string')
    ) {
      throw new Error('Cannot migrate persisted cart: an item has an invalid shape.');
    }

    const price =
      storedItem.currency === 'INR' || storedItem.source === 'food_menu'
        ? storedItem.price
        : convertUsdToInr(storedItem.price);

    return { ...storedItem, price, currency: 'INR' } as CartItem;
  });

  return { items };
}

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
  getSubtotal: (source: CartItemSource) => number;
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
            price: ing.estimatedPrice,
            currency: ing.currency,
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

      getSubtotal: (source) => {
        return get().items.reduce(
          (subtotal, item) =>
            subtotal + (item.source === source ? item.price * item.quantity : 0),
          0
        );
      },
    }),
    {
      name: 'foodhub-cart',
      version: 1,
      partialize: (state) => ({ items: state.items }),
      migrate: migratePersistedCart,
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
