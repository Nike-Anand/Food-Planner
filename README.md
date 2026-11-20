# Cook It Yourself 🍳

Feature 2 of the FlagSmith Hackathon — a mobile-first dish discovery app where users can search dishes, view cooking instructions, estimate costs, and order ingredients via an Instamart-style cart.

## Stack
- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase + PostgreSQL**
- **Flagsmith** (feature flag: `cook_yourself_enabled`)
- **Vercel** (deployment)

## Setup

### 1. Supabase
1. Create a new Supabase project
2. Run `supabase/seed.sql` in the SQL editor — this creates tables and seeds 50 dishes
3. Copy your project URL and anon key

### 2. Flagsmith
1. Create a project at [flagsmith.com](https://flagsmith.com)
2. Create a feature flag named exactly: `cook_yourself_enabled`
3. Copy your **Server-side Environment Key** and **Client-side Environment Key**

### 3. Environment Variables
Create `.env.local`:
```
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
Add the 4 env vars in Vercel dashboard → Settings → Environment Variables.

## Feature Flag Behavior
| Flag `cook_yourself_enabled` | Behavior |
|---|---|
| ✅ ON | Full Cook It Yourself app |
| ❌ OFF | "Feature Coming Soon" screen |

## App Flow
1. **Home** → Search/browse 50 dishes grouped by cuisine
2. **Dish Detail** → Cooking steps + ingredients with cost estimate
3. **Cart Drawer** → Add ingredients, see total, place Instamart order
