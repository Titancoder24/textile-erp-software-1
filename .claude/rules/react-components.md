---
paths:
  - "components/**"
  - "app/**/*.tsx"
---

# React & UI Component Rules

## Component Structure
- All interactive components must have "use client" at the top
- Props interface defined immediately above the component function
- Export component as named export (except page.tsx which uses default)
- Keep components focused - extract sub-components when > 150 lines

## UI Framework
- Use shadcn/ui components from @/components/ui/ for all base elements
- Use Lucide React for all icons (never use emoji)
- Use Tailwind CSS v4 utility classes for styling
- Use Recharts for all charts and data visualization
- Use TanStack Table for all data tables

## Design System
- Cards: use shadcn Card for all content containers
- Forms: React Hook Form + Zod schema validation
- Lists: DataTable component with search, sort, filter, pagination
- Create/Edit: FormSheet (slide-over panel from right)
- Delete: ConfirmDialog with destructive variant
- Feedback: Sonner toast for success/error notifications
- Loading: Skeleton components while data loads
- Empty: EmptyState component when no data

## Accessibility
- All interactive elements must be keyboard accessible
- Use semantic HTML (nav, main, section, article)
- Form inputs must have associated labels
- Color should not be the only indicator of state

## Responsive Design
- Mobile-first approach
- Sidebar collapses to icons on tablet, drawer on mobile
- DataTables horizontally scroll on mobile
- Dashboard grids: 1 col mobile, 2 col tablet, 3-4 col desktop
- Form sheets: full-width on mobile, slide-over on desktop

## No Emojis Policy
- Never use emojis in UI text, labels, or messages
- Use Lucide icons for visual indicators
- Use colored badges/dots for status indicators
