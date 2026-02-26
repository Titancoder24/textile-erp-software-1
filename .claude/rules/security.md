---
paths:
  - "middleware.ts"
  - "lib/actions/**"
  - "app/api/**"
---

# Security Rules

## Authentication
- All routes except /login, /setup, /forgot-password, /reset-password are protected
- Middleware checks Supabase session on every request
- Portal routes additionally verify portal role from profiles table
- Demo sessions use httpOnly cookies with 4-hour expiry

## Authorization
- Server actions must verify user role before executing privileged operations
- RLS policies are the database-level enforcement layer
- UI hides unauthorized actions but server must also enforce
- Buyer users can only see their own orders/samples/shipments
- Vendor users can only see POs assigned to them

## Data Protection
- Never expose .env or .env.local files
- Never log sensitive data (passwords, API keys, tokens)
- Supabase anon key is public (safe for client) - service role key is secret
- File uploads go to Supabase Storage with access policies
- Audit logs are immutable - no update/delete allowed

## Input Validation
- All form data validated with Zod schemas before submission
- Server actions validate inputs before database operations
- Sanitize any user-generated content displayed in the UI
- File uploads: validate type and size before accepting

## OWASP Considerations
- No raw SQL - always use Supabase query builder
- No innerHTML or dangerouslySetInnerHTML
- CSRF protection via Next.js built-in mechanisms
- Secure cookies for session management
