# TextileOS - The Textile Industry's Operating System

From Fiber to Fashion. From Brand to Factory Floor. One Platform.

## Quick Start

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build
npm run lint         # Lint check
```

## Database Setup

1. Go to Supabase SQL Editor
2. Run `supabase/schema.sql` to create all tables, functions, and RLS policies
3. Seed demo data via POST to `/api/setup/seed-demo`

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Factory Owner | owner@demo.textile-os.com | Demo@2026 |
| Production Manager | production@demo.textile-os.com | Demo@2026 |
| Merchandiser | merchandiser@demo.textile-os.com | Demo@2026 |
| Quality Manager | quality@demo.textile-os.com | Demo@2026 |
| Purchase Manager | purchase@demo.textile-os.com | Demo@2026 |

## Project Structure

- `app/(auth)/` - Login, setup wizard, password reset
- `app/(dashboard)/` - Main app with role-based sidebar
- `app/(portal)/` - External portals (buyer, vendor, buying house)
- `components/ui/` - shadcn/ui base components
- `components/data-table/` - Reusable data table
- `components/charts/` - Recharts wrapper components
- `components/dashboards/` - 12 role-specific dashboards
- `lib/actions/` - Server actions for all modules
- `lib/supabase/` - Database client setup
- `types/database.ts` - TypeScript types for all tables

## Key Patterns

- **Pages**: PageHeader + StatCards + DataTable + FormSheet
- **Actions**: "use server" with { data, error } return pattern
- **Auth**: Supabase Auth + middleware + RLS
- **Roles**: 14 internal + 3 portal roles with permission-based UI

@package.json
@supabase/schema.sql
