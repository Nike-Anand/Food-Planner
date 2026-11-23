# Food Planner & Cook It Yourself 🍳

A mobile-first web platform combining Food Ordering with a Recipe Maker & Cook It Yourself feature.

## Features
- **Feature 1 (Food Ordering)**: Browse 24 local sample dishes, search and filter the catalogue, and manage a cart persisted in browser storage.
- **Feature 2 (Cook It Yourself / Recipe Maker)**: Dish discovery, cooking steps, pantry ingredients, cost estimation, and Instamart-style ingredient ordering.
- **Feature Flags**: Flagsmith controls Feature 2 only (`cook_yourself_enabled`).
- **Database**: Supabase + PostgreSQL backs the Feature 2 dish and ingredient API.

## Currency and Checkout Policy

All food and recipe ingredient prices are displayed in INR. Recipe sample estimates use a fixed demo conversion rate of ₹85 per USD; food menu prices and food ingredient estimates are already in INR. The shared `/cart` shows separate subtotals and checkout actions for each feature. Those checkout actions are demo-only notices: they do not process payment or remove items.

## Stack
- **Next.js 15/16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase + PostgreSQL**
- **Flagsmith**
- **Zustand**

## Setup

### Feature 1: Food Ordering

Feature 1 uses local sample data and browser storage. The `/order` and `/cart` pages do not require Supabase or Flagsmith environment variables.

### Feature 2: Cook It Yourself

Feature 2 requires Supabase and Flagsmith.

#### 1. Supabase
1. Create a new Supabase project
2. Run `supabase/seed.sql` in the SQL editor — creates tables and seeds dishes & ingredients
3. Copy your project URL and anon key. Keep Row Level Security enabled and never use a service-role key as the anon key.

#### 2. Flagsmith
1. Create a project at [flagsmith.com](https://flagsmith.com)
2. Create a feature flag named: `cook_yourself_enabled`
3. Copy the **Server-side Environment Key**. It is used by the server-side recipe route layout.

#### 3. Environment Variables
Copy `.env.example` to `.env.local` and fill in the values for Feature 2. `NEXT_PUBLIC_FLAGSMITH_ENV_KEY` is not used by this project and is not required.

### Run locally
```bash
npm install
npm run dev
```

Feature 1 can be run without `.env.local`. Feature 2's Supabase API routes need the Supabase variables, and its route is enabled only when the Flagsmith flag evaluates to true. If Flagsmith is unavailable, only Feature 2 is paused.

### Deploy to Vercel
```bash
npx vercel --prod
```
For Feature 1, no environment variables are required by the ordering pages. For Feature 2, add the variables from `.env.example` in Vercel dashboard → Settings → Environment Variables.
