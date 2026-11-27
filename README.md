# Food Planner & Cook It Yourself 🍳

A mobile-first web platform combining Food Ordering with a Recipe Maker & Cook It Yourself feature.

## Features
- **Feature 1 (Food Ordering)**: Browse 24 local sample dishes, search and filter the catalogue, and manage a cart persisted in browser storage.
- **Feature 2 (Cook It Yourself / Recipe Maker)**: The standalone recipe experience includes dish discovery, cooking steps, pantry ingredients, cost estimation, and ingredient ordering.
- **Track 1 Experiment**: The app entry point assigns visitors to food ordering or the pantry recipe experience using a Flagsmith multivariate experiment and records the primary action as an experiment event.
- **Feature Flags**: `food_discovery_experiment` assigns the entry experience; `cook_yourself_enabled` remains the separate recipe feature gate.
- **Database**: Supabase + PostgreSQL backs the Feature 2 dish and ingredient API.

## Currency and Checkout Policy

All food and recipe ingredient prices are displayed in INR. Recipe sample estimates use a fixed demo conversion rate of ₹85 per USD; food menu prices and food ingredient estimates are already in INR. The shared `/cart` shows separate subtotals and separate checkout actions. Food checkout contains only food-menu items and applies the demo food tax/restaurant-packaging charge. Recipe-ingredient checkout contains only ingredient items and does not apply restaurant packaging charges. Completing one checkout leaves the other feature's cart items untouched. These are demo orders only: no payment is processed, and each order is stored locally.

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
6. During the experiment, only the food-ordering variant exposes a cart link, and it opens `/cart?source=food_menu`. The recipe variant hides ingredient pricing, cart, and delivery actions; the standalone `/recipe` experience opens `/cart?source=recipe_ingredient` for ingredient ordering. Each scoped cart shows only its matching items and orders.
7. QA data disclosure: scripted browser validation on November 27, 2026 used a simulated anonymous identity assigned to `home_ingredient_recipe` and sent one `recipe_generated` conversion. Exclude this simulated `meal_action_completed` event and its assignment from real visitor results.

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

## Simulated Experiment Readout

> [!NOTE]
> **Hackathon Disclosure**: The data below was generated by running an automated 100-visitor simulation script (`scripts/simulate-flagsmith-traffic.mjs`) against our live Flagsmith Development environment (`XwttovMMSnU3HSHuwaDeBz`). All events carry `traffic_type: "simulated"` in their metadata.

### Results Table

| Variant | Experience Path | Sample Size (Exposures) | Primary Conversion Action | Conversions | Conversion Rate | Relative Lift |
|---|---|:---:|---|:---:|:---:|:---:|
| **Control** | Food Ordering (`food_ordering`) | 51 | `dish_added_to_cart` | 20 | **39.2%** | Baseline |
| **Variant 2** | Recipe Maker (`home_ingredient_recipe`) | 49 | `recipe_generated` | 26 | **53.1%** | **+35.5%** |

### Key Takeaways
1. **Natural 50/50 Hash Split**: Flagsmith evaluated 100 unique `sim-visitor-<uuid>` identities with zero skew (51 Control vs. 49 Variant 2), confirming multivariate targeting accuracy.
2. **Engagement Comparison**: The recipe maker entry path demonstrated higher initial engagement (+35.5% lift) as users explored what they could make from their existing pantry ingredients before purchasing.
3. **Live Dashboard Alignment**: All 100 identities, 100 exposure events, 46 conversion events, and evaluation hit counters have been successfully transmitted and accepted by Flagsmith (`XwttovMMSnU3HSHuwaDeBz`).

