---
paths:
  - "lib/actions/**"
  - "lib/supabase/**"
  - "supabase/**"
---

# Database & Supabase Rules

## Query Patterns
- Always use the Supabase client from lib/supabase/server.ts for server actions
- Always use the Supabase client from lib/supabase/client.ts for client components
- Never concatenate user input into queries - Supabase handles parameterization
- Specify exact columns in select() when possible instead of select("*")
- Use .eq(), .in(), .gte(), .lte() for filtering - never raw SQL from frontend

## Row Level Security (RLS)
- Every table has RLS enabled
- All policies check company_id = get_user_company_id()
- Portal users (buyer/vendor) have additional row-level isolation
- Audit logs are insert-only - no updates or deletes allowed
- Notifications are user-scoped (user can only see their own)

## Data Patterns
- All primary keys are UUID (uuid_generate_v4())
- All tables have created_at TIMESTAMPTZ DEFAULT NOW()
- Most tables have updated_at with auto-update trigger
- Document numbers generated via get_next_number() function
- Soft deletes use is_active = false (never hard delete master data)
- Color-size matrices stored as JSONB

## Multi-tenancy
- Every query must filter by company_id
- RLS is the last line of defense but server actions should also filter
- Demo company data is isolated by company_id with is_demo = true

## Performance
- Use indexes on frequently filtered columns (status, company_id, buyer_id)
- Paginate results: .range(from, to) for large datasets
- Use .order() for consistent result ordering
- Batch inserts when creating related records (BOM + items, PO + items)
