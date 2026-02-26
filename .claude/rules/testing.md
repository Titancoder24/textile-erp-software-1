---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
---

# Testing Rules

## Test Framework
- Use Vitest or Jest for unit tests
- Test server actions for business logic correctness
- Test utility functions for edge cases
- Test form validation schemas

## Test Patterns
- Arrange-Act-Assert pattern
- Use descriptive test names: "should calculate efficiency correctly when operators are present"
- Test both success and error cases for server actions
- Mock Supabase client for unit tests

## What to Test
- Business logic: efficiency calculation, AQL result, cost sheet math, process loss
- Validation schemas: all Zod schemas used in forms
- Utility functions: formatCurrency, getDaysRemaining, generateDocumentNumber
- Server actions: CRUD operations, status transitions, calculations

## What NOT to Test
- shadcn/ui component internals
- Next.js routing
- Supabase library internals
- Pure UI rendering without logic
