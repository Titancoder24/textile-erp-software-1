# TextileOS - Textile Industry ERP System

## Project Overview

TextileOS is a production-grade textile industry ERP system built as a modern web application. It manages the complete lifecycle from fiber to fashion, covering orders, production, quality, inventory, dyeing, shipment, and multi-role portals.

## Technology Stack

- **Framework**: Next.js 16 (App Router) + TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui components + Lucide Icons
- **Database**: Supabase (PostgreSQL + Auth + Storage + Realtime + RLS)
- **Charts**: Recharts for all data visualization
- **Forms**: React Hook Form + Zod validation
- **Tables**: TanStack Table (React Table v8)
- **Deployment**: Vercel

## Architecture

```
app/                    # Next.js App Router pages
  (auth)/               # Authentication pages (login, setup, forgot-password)
  (dashboard)/          # Main authenticated app pages
  (portal)/             # External portal pages (buyer, vendor, buying house)
  api/                  # API routes
  demo/                 # Demo session handler
components/
  ui/                   # shadcn/ui base components
  data-table/           # Reusable DataTable with sorting, filtering, pagination
  forms/                # Form components (FormSheet, ConfirmDialog, ColorSizeMatrix)
  charts/               # Recharts wrapper components
  layout/               # Sidebar, Topbar, Breadcrumb
  dashboards/           # Role-specific dashboard components
  production/           # Production-specific components (LineCard)
  orders/               # Order-specific components
hooks/                  # Custom React hooks
lib/
  actions/              # Server Actions ("use server") for all modules
  supabase/             # Supabase client (browser + server)
  utils.ts              # Utility functions
  constants.ts          # Roles, nav items, status labels, enums
  seed/                 # Demo data seeding
types/
  database.ts           # Database types (auto-generated from Supabase schema)
supabase/
  schema.sql            # Complete database schema (50+ tables, RLS, functions)
```

## Key Commands

- `npm run dev` - Start development server (localhost:3000)
- `npm run build` - Production build
- `npm run lint` - ESLint check

## Code Patterns

### Page Pattern
Every list page follows: PageHeader + StatCards + DataTable + FormSheet for CRUD.

### Server Actions
All data operations use Next.js Server Actions in `lib/actions/`. Pattern:
```typescript
"use server"
export async function getItems(companyId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("table").select("*").eq("company_id", companyId);
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}
```

### Component Pattern
- "use client" for all interactive components
- Props interfaces defined above component
- shadcn/ui for all base UI elements
- Tailwind v4 utility classes for styling
- No emojis in UI text

### Database Access
- All queries go through Supabase client (never raw SQL from frontend)
- Row Level Security enforces company-scoped data isolation
- `get_user_company_id()` function used in all RLS policies
- Every table has `company_id` for multi-tenancy

## RBAC (14 internal + 3 portal roles)

Internal: super_admin, factory_owner, general_manager, production_manager, merchandiser, purchase_manager, store_manager, quality_manager, dyeing_master, sewing_supervisor, finance_manager, hr_manager, maintenance_engineer, data_entry_operator

Portal: buyer_user, vendor_user, buying_house_user

Navigation items are filtered by role using `NAV_ITEMS` array in constants.ts.

## Important Notes

- Supabase project URL: https://vyaaxrylczgiginhqhft.supabase.co
- Database schema must be applied via SQL Editor (supabase/schema.sql)
- Demo data seeded via /api/setup/seed-demo endpoint
- All document numbers auto-generated via `get_next_number()` PostgreSQL function
- Efficiency formula: (produced * SMV) / (minutes * operators) * 100

@README.md
@package.json
@supabase/schema.sql
