# Food Planner & Cook It Yourself 🍳

A mobile-first web platform combining Food Ordering with a Recipe Maker & Cook It Yourself feature.

## Features
- **Feature 1 (Food Ordering)**: Browse 24 local sample dishes, search and filter the catalogue, and manage a cart persisted in browser storage.
- **Feature 2 (Cook It Yourself / Recipe Maker)**: Dish discovery, cooking steps, pantry ingredients, cost estimation, and Instamart-style ingredient ordering.
- **Track 1 Experiment**: The app entry point assigns visitors to food ordering or the pantry recipe experience using a Flagsmith multivariate experiment and records the primary action as an experiment event.
- **Feature Flags**: `food_discovery_experiment` assigns the entry experience; `cook_yourself_enabled` remains the separate recipe feature gate.
- **Database**: Supabase + PostgreSQL backs the Feature 2 dish and ingredient API.

## Currency and Checkout Policy

All food and recipe ingredient prices are displayed in INR. Recipe sample estimates use a fixed demo conversion rate of ₹85 per USD; food menu prices and food ingredient estimates are already in INR. The shared `/cart` shows separate subtotals and a unified demo checkout. It does not process payment; placing a demo order saves it locally and clears the cart.

## Stack
- **Next.js 15/16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase + PostgreSQL**
- **Flagsmith**
- **Zustand**

## Setup

### Feature 1: Food Ordering

Feature 1 uses local sample data and browser storage. The `/order` and `/cart` routes work without Supabase. The `/` entry point redirects to `/experiment` and requires the public Flagsmith environment ID.

### Feature 2: Cook It Yourself

The primary `/recipe` demo uses local sample data. The older `/dish/[id]` API-backed route requires Supabase. The recipe feature gate uses the server-only Flagsmith key.

#### 1. Supabase
1. Create a new Supabase project
2. Run `supabase/seed.sql` in the SQL editor — creates tables and seeds dishes & ingredients
3. Copy your project URL and anon key. Keep Row Level Security enabled and never use a service-role key as the anon key.

#### 2. Flagsmith
1. Create a project at [flagsmith.com](https://flagsmith.com)
2. Create a feature flag named: `cook_yourself_enabled`
3. Copy the **Server-side Environment Key** for `FLAGSMITH_SERVER_KEY`; it is used by the server-side recipe route gate.
4. Copy the public **Environment ID** into `NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID`. This key is intentionally used by the browser SDK and is not a server secret.

#### 3. Track 1 Food Discovery Experiment
1. Create a multivariate flag named `food_discovery_experiment` and configure its string values as `food_ordering` and `home_ingredient_recipe`.
2. Create and start a 50/50 experiment for that flag with the `meal_action_completed` conversion event.
3. Keep `cook_yourself_enabled` enabled while the recipe variant is being tested.
4. The experiment entry page uses a persistent anonymous UUID from browser storage. It records one `meal_action_completed` event per anonymous identity, with the assigned variant and completed action as event metadata.
5. Food ordering is the control action (`dish_added_to_cart`); recipe maker is the treatment action (`recipe_generated`). This measures first-action engagement, not paid orders.

#### 4. Environment Variables
Copy `.env.example` to `.env.local` and fill in the variables needed by the routes you use. Never put the server-side Flagsmith key in a `NEXT_PUBLIC_` variable.

### Run locally
```bash
npm install
npm run dev
```

The `/order` and `/cart` routes work without environment variables. The default `/` entry experiment requires `NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID` and a running Flagsmith experiment. If the experiment cannot be evaluated, the entry route shows an error instead of choosing a local variant. Feature 2's Supabase API routes need the Supabase variables, and its recipe route is gated by `cook_yourself_enabled`.

### Deploy to Vercel
```bash
npx vercel --prod
```
Add the needed variables from `.env.example` in Vercel dashboard → Settings → Environment Variables. `NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID` is public and bundled into the browser; `FLAGSMITH_SERVER_KEY` must remain server-only.
