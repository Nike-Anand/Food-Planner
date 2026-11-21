# Food Planner & Cook It Yourself 🍳

A mobile-first web platform combining Food Ordering with a Recipe Maker & Cook It Yourself feature.

## Features
- **Feature 1 (Food Ordering)**: Restaurant / dish discovery and cart management.
- **Feature 2 (Cook It Yourself / Recipe Maker)**: Dish discovery, cooking steps, pantry ingredients, cost estimation, and Instamart-style ingredient ordering.
- **Feature Flags**: Powered by Flagsmith (`cook_yourself_enabled`).
- **Database**: Supabase + PostgreSQL.

## Stack
- **Next.js 15/16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase + PostgreSQL**
- **Flagsmith**
- **Zustand**

## Setup

### 1. Supabase
1. Create a new Supabase project
2. Run `supabase/seed.sql` in the SQL editor — creates tables and seeds dishes & ingredients
3. Copy your project URL and anon key

### 2. Flagsmith
1. Create a project at [flagsmith.com](https://flagsmith.com)
2. Create a feature flag named: `cook_yourself_enabled`
3. Copy your **Server-side Environment Key** and **Client-side Environment Key**

### 3. Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_FLAGSMITH_ENV_KEY=your_flagsmith_client_key
FLAGSMITH_SERVER_KEY=your_flagsmith_server_key
```

### 4. Run locally
```bash
npm install
npm run dev
```

### 5. Deploy to Vercel
```bash
npx vercel --prod
```
Add the environment variables in Vercel dashboard → Settings → Environment Variables.
