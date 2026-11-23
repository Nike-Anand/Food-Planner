import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, CartItemSource, Ingredient } from '@/types/shared';
import { convertUsdToInr } from '@/lib/currency';

export interface DeliveryDetails {
  name: string;
  phone: string;
  address: string;
  deliveryMethod: 'standard' | 'express';
  paymentMethod: 'upi' | 'cod' | 'card';
  notes?: string;
}

export interface ActiveOrder {
  orderId: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  taxesAndPackaging: number;
  grandTotal: number;
  deliveryDetails: DeliveryDetails;
  status: 'placed' | 'preparing' | 'on_the_way' | 'delivered';
  placedAt: string;
  estimatedDeliveryMinutes: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function migratePersistedCart(
  persistedState: unknown,
  version: number
): { items: CartItem[]; orders: ActiveOrder[] } {
  if (version > 1) {
    throw new Error(`Unsupported persisted cart version: ${version}.`);
  }

  if (!isRecord(persistedState) || !Array.isArray(persistedState.items)) {
    return { items: [], orders: [] };
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
      (storedItem.source !== 'food_menu' && storedItem.source !== 'recipe_ingredient')
    ) {
      return {
        id: 'fallback-item',
        name: 'Item',
        price: 99,
        quantity: 1,
        source: 'food_menu',
        currency: 'INR',
      };
    }

    const price =
      storedItem.currency === 'INR' || storedItem.source === 'food_menu'
        ? storedItem.price
        : convertUsdToInr(storedItem.price);

    return { ...storedItem, price, currency: 'INR' } as CartItem;
  });

  const orders = Array.isArray(persistedState.orders) ? (persistedState.orders as ActiveOrder[]) : [];

  return { items, orders };
}

interface CartState {
  items: CartItem[];
  orders: ActiveOrder[];
  activeOrder: ActiveOrder | null;
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  // THE BRIDGE: Used by Developer 2 (Recipe Maker) to auto-order missing ingredients
  addIngredientsToCart: (ingredients: Ingredient[], recipeTitle?: string) => void;
  // Checkout & Orders
  createOrder: (details: DeliveryDetails) => Promise<ActiveOrder>;
  getOrderById: (orderId: string) => ActiveOrder | undefined;
  updateOrderStatus: (orderId: string, status: ActiveOrder['status']) => void;
  // Computed helpers
  getTotalCount: () => number;
  getSubtotal: (source?: CartItemSource) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      orders: [],
      activeOrder: null,
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
            currency: 'INR',
            quantity: 1,
            source: 'recipe_ingredient',
            notes: recipeTitle ? `For: ${recipeTitle}` : undefined,
          }));
          return { items: [...state.items, ...newItems] };
        });
      },

      createOrder: async (details: DeliveryDetails) => {
        const state = get();
        const currentItems = [...state.items];
        const subtotal = state.getSubtotal();
        const deliveryFee = details.deliveryMethod === 'express' ? 49 : 25;
        const taxesAndPackaging = Math.round(subtotal * 0.05) + 15;
        const grandTotal = subtotal + deliveryFee + taxesAndPackaging;
        const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

        const newOrder: ActiveOrder = {
          orderId,
          items: currentItems,
          subtotal,
          deliveryFee,
          taxesAndPackaging,
          grandTotal,
          deliveryDetails: details,
          status: 'placed',
          placedAt: new Date().toISOString(),
          estimatedDeliveryMinutes: details.deliveryMethod === 'express' ? 15 : 30,
        };

        // Try syncing to backend API asynchronously (non-blocking for demo resilience)
        try {
          await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_session: details.phone || 'guest-session',
              items: currentItems,
              total: grandTotal,
            }),
          });
        } catch (e) {
          console.warn('API sync failed, persisting locally for seamless experience:', e);
        }

        // Update local state and clear current cart
        set((prev) => ({
          orders: [newOrder, ...prev.orders],
          activeOrder: newOrder,
          items: [],
        }));

        return newOrder;
      },

      getOrderById: (orderId: string) => {
        return get().orders.find((o) => o.orderId === orderId);
      },

      updateOrderStatus: (orderId: string, status: ActiveOrder['status']) => {
        set((state) => ({
          orders: state.orders.map((o) => (o.orderId === orderId ? { ...o, status } : o)),
          activeOrder:
            state.activeOrder?.orderId === orderId
              ? { ...state.activeOrder, status }
              : state.activeOrder,
        }));
      },

      getTotalCount: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },

      getSubtotal: (source) => {
        return get().items.reduce(
          (subtotal, item) =>
            source ? subtotal + (item.source === source ? item.price * item.quantity : 0) : subtotal + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'foodhub-cart',
      version: 2,
      partialize: (state) => ({ items: state.items, orders: state.orders }),
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
