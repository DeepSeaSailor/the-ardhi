# The Ardhi — Property Management Platform

Built for Uganda. Three-tier: Admin, Landlord, Tenant.

## Setup

### 1. Supabase
- Create a new Supabase project at supabase.com
- Run the SQL in `lib/supabase-schema.sql` in the Supabase SQL editor
- Copy your project URL and anon key

### 2. Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Set same variables in Vercel dashboard under Project Settings > Environment Variables.

### 3. Create Admin Account
After deployment, sign up with role "Admin" using your email.

### 4. Run locally
```bash
npm install
npm run dev
```

## Architecture
- Next.js 15 App Router
- Supabase (Auth + PostgreSQL)
- Deployed on Vercel
- Three portals: `/admin`, `/landlord`, `/tenant`

## Payment Flow
Payments are submitted as "pending" by tenants, then confirmed by admin after verifying Mobile Money or bank deposit.
