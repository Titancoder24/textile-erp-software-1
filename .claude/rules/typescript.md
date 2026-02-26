---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript Guidelines

## Type Safety
- Never use `any` type - use `unknown` with type guards or proper interfaces
- Enable strict mode in tsconfig.json
- Export types separately: `export type { TypeName }`
- Use `as const` for literal types and enum-like objects
- Prefer interface over type for object shapes that may be extended

## Naming Conventions
- Interfaces/Types: PascalCase (User, BuyerFormData, OrderStatus)
- Props interfaces: ComponentNameProps (SidebarProps, DataTableProps)
- Constants: UPPER_SNAKE_CASE for module-level constants (ROLES, ORDER_STATUSES)
- Functions: camelCase (getBuyers, calculateEfficiency)
- Files: kebab-case (data-table.tsx, form-sheet.tsx)
- Components: PascalCase files only for page.tsx convention

## Imports
- Use @/ alias for all project imports
- Group imports: React/Next > external libs > internal components > types > utils
- Prefer named exports over default exports (except page.tsx)

## Error Handling
- Server actions return { data, error } pattern
- Never throw from server actions - return error strings
- Client-side: use try-catch with toast notifications for user feedback
- Log errors to console in development

## React Patterns
- Functional components only
- "use client" directive at top of client components
- "use server" directive at top of server action files
- Use React.memo sparingly - only for expensive renders
- Prefer composition over prop drilling
