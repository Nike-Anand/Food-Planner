# Hackathon Project Blueprint: Mobile Web Food & Recipe Platform

## 1. Executive Summary & Strategy
As Team Lead, your priority for a hackathon is **speed, visual polish, and zero merge conflicts**. 

The greatest trap in hackathons with parallel feature developers is **directory collision and uncoordinated state**. If Developer 1 and Developer 2 touch the same files (routes, global styles, central stores), the final hours will be wasted resolving painful git conflicts rather than polishing the demo.

```
+--------------------------------------------------------------------------+
|                               MOBILE APP SHELL                           |
|       (Top Header + Bottom Navigation: "Explore Food" | "AI Chef" | "Cart") |
+--------------------------------------------------------------------------+
          |                                                    |
          v                                                    v
+-------------------------------+             +-------------------------------+
|  FEATURE 1: FOOD ORDERING     |             |  FEATURE 2: RECIPE MAKER      |
|  (Developer 1 Domain)         |             |  (Developer 2 Domain)         |
|  - Restaurant / Dish Catalog  |             |  - Pantry & Ingredient Picker |
|  - Dish Customizer & Filters  |             |  - AI Recipe Generator        |
|  - Cart & Checkout Simulation |             |  - Step-by-Step Cooking Mode  |
+-------------------------------+             +-------------------------------+
          \                                                    /
           \                                                  /
            +------------------------------------------------+
            |       INTEGRATION BRIDGE (The "Winning" Demo)   |
            |   "1-Click Add Recipe Ingredients to Food Cart" |
            +------------------------------------------------+
```

---

## 2. Recommended Tech Stack

| Layer | Recommended Choice | Why for this Hackathon? |
|---|---|---|
| **Framework** | **Next.js 14/15 (App Router, TypeScript)** | Mobile-first responsiveness, built-in API routes to safely hold AI API keys (Gemini / OpenAI) without exposing them in client bundles, and instant 1-click Vercel deployment. *(Alternative: Vite + React if purely client-side).* |
| **Styling & Design System** | **Tailwind CSS + shadcn/ui** | Tailwind delivers rapid mobile styling. `shadcn/ui` (built on Radix) provides pre-styled, accessible mobile components like bottom Drawers/Sheets, Dialogs, Badges, Tabs, and Toast notifications. |
| **Icons** | **Lucide React** (`lucide-react`) | Lightweight, clean, modern mobile icons. |
| **State Management** | **Zustand** | Zero-boilerplate. Highly modular: Developer 1 owns `useCartStore`, Developer 2 owns `useRecipeStore`. They operate independently without touching a single shared reducer. |
| **Mobile Gestures & Motion** | **Framer Motion** | Silky 60fps mobile transitions, swipeable cards, and animated checkout/recipe generation states that impress judges. |
| **Backend & AI** | **Next.js API Routes + Google Gemini API (or Mock Engine)** | Fast AI recipe suggestions from pantry photos/inputs. Includes an offline mock fallback in case API quota is exceeded during live demo. |

---

## 3. Modular Feature-Driven Directory Structure

Every developer works strictly inside their own feature sandbox. The Team Lead owns the shared core, routing layout, and integration contracts.

```text
food-planner/
├── src/
│   ├── app/                               # Next.js App Router
│   │   ├── layout.tsx                     # Lead: Mobile container wrapper (< 430px max-width)
│   │   ├── page.tsx                       # Lead: Home redirect or splash
│   │   ├── (mobile)/
│   │   │   ├── layout.tsx                 # Lead: Header + Bottom Navigation Bar
│   │   │   ├── order/                     # Dev 1 Route: /order (Food Catalog)
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── recipe/                    # Dev 2 Route: /recipe (Recipe Maker)
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── cart/                      # Dev 1 Route: /cart (Checkout)
│   │   │       └── page.tsx
│   │   └── api/                           # API Endpoints
│   │       ├── ai-recipe/route.ts         # Dev 2 / Lead: AI generation route
│   │       └── food-catalog/route.ts      # Dev 1: Food items API
│   │
│   ├── features/                          # ISOLATED FEATURE DOMAINS
│   │   ├── food-ordering/                 # --- DEVELOPER 1 STRICTLY WORKS HERE ---
│   │   │   ├── components/
│   │   │   │   ├── DishCard.tsx
│   │   │   │   ├── RestaurantList.tsx
│   │   │   │   ├── FilterPills.tsx
│   │   │   │   └── CartDrawer.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useFoodCatalog.ts
│   │   │   ├── services/
│   │   │   │   └── foodApi.ts
│   │   │   └── data/
│   │   │       └── mockDishes.ts          # Instant mock data for rapid testing
│   │   │
│   │   └── recipe-maker/                  # --- DEVELOPER 2 STRICTLY WORKS HERE ---
│   │       ├── components/
│   │       │   ├── IngredientSelector.tsx
│   │       │   ├── RecipeCard.tsx
│   │       │   ├── CookingStepViewer.tsx
│   │       │   └── MissingIngredientPrompt.tsx
│   │       ├── hooks/
│   │       │   └── useRecipeGenerator.ts
│   │       ├── services/
│   │       │   └── recipeAiService.ts
│   │       └── data/
│   │           └── mockRecipes.ts         # Safety fallback mock recipes
│   │
│   ├── store/                             # ZUSTAND STORES (Decoupled)
│   │   ├── cartStore.ts                   # Dev 1 (Cart items, quantities, totals)
│   │   └── recipeStore.ts                 # Dev 2 (Active recipe, selected ingredients)
│   │
│   ├── types/                             # SHARED TYPES (Locked by Lead)
│   │   ├── shared.ts                      # Common interfaces (Ingredient, Currency, etc.)
│   │   ├── food.ts                        # Food ordering types
│   │   └── recipe.ts                      # Recipe types
│   │
│   ├── components/                        # SHARED UI PRIMITIVES
│   │   ├── ui/                            # shadcn/ui components (Button, Input, Sheet, Card)
│   │   └── layout/                        # MobileNav.tsx, Header.tsx, MobileShell.tsx
│   │
│   └── lib/                               # UTILITIES
│       ├── utils.ts                       # cn() class merger
│       └── constants.ts
├── public/                                # Mock food images, icons
├── .env.example
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Shared Contract (Contract-First Development)

To allow both developers to build in parallel on day 1 without blocking each other, the Team Lead defines and freezes the contract in `src/types/shared.ts`:

```typescript
// src/types/shared.ts

export interface Ingredient {
  id: string;
  name: string;
  quantity: string;       // e.g., "200g", "2 tbsp", "1 whole"
  category: 'produce' | 'dairy' | 'meat' | 'pantry' | 'spices';
  isAvailableInPantry?: boolean;
  estimatedPrice?: number; // In cents/pennies or currency unit
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  source: 'food_menu' | 'recipe_ingredient';
  recipeReferenceId?: string; // Links back to recipe if ordered via Recipe Maker
}
```

### The Integration Bridge (Lead's Feature Merger)
In `src/store/cartStore.ts`, provide a bridge method that Developer 2 can call from the Recipe Maker:

```typescript
// Inside useCartStore
addIngredientsToCart: (ingredients: Ingredient[]) => {
  set((state) => {
    const newItems: CartItem[] = ingredients.map((ing) => ({
      id: `ing-${ing.id}-${Date.now()}`,
      name: ing.name,
      price: ing.estimatedPrice || 2.99,
      quantity: 1,
      source: 'recipe_ingredient',
    }));
    return { items: [...state.items, ...newItems] };
  });
}
```
*Demo impact:* When the judges ask "How do these two features connect?", the user shows a recipe, clicks **"Order Missing Ingredients"**, and the cart automatically populates with delivery items ready for checkout!

---

## 5. Mobile Web App UX Guidelines

Since the focus is a **Mobile Web App**:
1. **Viewport Lock**: Set max-width to `430px` (iPhone 15 Pro Max width) centered on desktop screens (`max-w-md mx-auto min-h-screen shadow-2xl bg-white relative`).
2. **Bottom Navigation Bar**: Persistent mobile tabs:
   - 🍔 **Order Food** (`/order`)
   - 🍳 **Recipe AI** (`/recipe`)
   - 🛍️ **Cart** (`/cart` with badge counter)
3. **Touch Targets**: Minimum clickable height `48px` (`h-12`) for buttons and touch targets.
4. **Bottom Sheets over Popups**: Use slide-up sheets (shadcn Drawer/Sheet) instead of center modal popups for mobile ergonomics.
5. **Safe Areas**: Include `pb-24` on scrollable lists so content is never hidden behind the bottom navigation bar.

---

## 6. Rules & Git Regulations for the Team

### 6.1 Branching Strategy
- **`main`**: Protected branch. Only Team Lead merges into `main`. Must always be deployable.
- **`feature-one` (or `feat/food-ordering`)**: Developer 1's branch.
- **`feature-two` (or `feat/recipe-maker`)**: Developer 2's branch.
- **Rebase Rule**: Developers must rebase or merge `main` into their feature branch at least twice a day.

### 6.2 Code Boundaries
1. **No crossing borders**:
   - Dev 1 touches only `src/features/food-ordering/`, `src/app/(mobile)/order/`, and `src/store/cartStore.ts`.
   - Dev 2 touches only `src/features/recipe-maker/`, `src/app/(mobile)/recipe/`, and `src/store/recipeStore.ts`.
2. **Shared UI rule**: Neither developer edits files inside `src/components/ui/` directly. If a new component is needed (e.g. `npx shadcn-ui add slider`), the Team Lead adds it or reviews the pull request.
3. **Fail-safe Mock Rule**: Every API call must have a fallback to static mock JSON data (`mockDishes.ts`, `mockRecipes.ts`) within `catch` blocks. The app must never show an empty broken screen during the judging demo.

### 6.3 Commit Message Convention
- `feat(ordering): add dish quantity selector`
- `feat(recipe): integrate pantry ingredient chip selector`
- `fix(cart): calculate subtotal and delivery tax`
- `bridge: connect recipe ingredient cart button`

---

## 7. Step-by-Step Execution Plan for Team Lead

1. **Step 1: Scaffold Base Project**
   - Initialize Next.js with TypeScript, Tailwind CSS, App Router, and ESLint.
   - Install dependencies: `lucide-react`, `zustand`, `clsx`, `tailwind-merge`, `framer-motion`.
2. **Step 2: Setup Mobile Layout & Navigation**
   - Create the responsive mobile container frame and the bottom navigation bar.
3. **Step 3: Define Shared Types & Mock Data**
   - Write `src/types/shared.ts` and base stores.
4. **Step 4: Push Scaffold to `main` and branch out**
   - Push to `main`, then update `feature-one` and `feature-two` with the base scaffold so both developers can clone and start coding instantly.
5. **Step 5: Merge & Demo Polish (Final 4 Hours)**
   - Merge `feature-one` into `main`.
   - Merge `feature-two` into `main`.
   - Wire the integration bridge button (**"Cook this with missing ingredients ordered"**).
   - Test on live mobile device (or Chrome DevTools mobile view).
