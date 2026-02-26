# TextileOS — The Textile Industry's Operating System

> **From Fiber to Fashion. From Brand to Factory Floor. One Platform.**

TextileOS is a production-grade ERP system purpose-built for the garment and textile manufacturing industry. It replaces disconnected spreadsheets, WhatsApp threads, and legacy software with a single intelligent platform connecting every department — from merchandising to shipment, from the boardroom to the factory floor.

---

## Why TextileOS?

Every textile factory runs on chaos: buyers chasing orders on WhatsApp, production managers guessing daily output, purchase teams losing track of material shortages, and owners waking up at 3am wondering if the H&M shipment will make it on time.

TextileOS solves all of it.

| Pain Point | TextileOS Solution |
|---|---|
| "What's our efficiency today?" | Real-time Floor Dashboard with line-by-line OEE |
| "Do we have enough fabric to cut?" | MRP engine auto-calculates shortages from BOM + stock |
| "Will we hit the delivery date?" | Capacity Planner with feasibility checker |
| "Are we making money on this style?" | Style Profitability with actual vs budgeted cost |
| "Why did the buyer reject 200 pieces?" | COPQ module with defect cost attribution by stage |
| "Which supplier is causing delays?" | Supplier Scorecard with delivery + quality ratings |
| "Is payroll ready?" | Integrated Attendance + Payroll with one-click processing |
| "What's the shipment status?" | Container tracking with pre-shipment checklist |

---

## Feature Overview

### 30 Modules. Every Department. Zero Blind Spots.

```
Order Lifecycle        │  Production           │  Supply Chain
─────────────────────  │  ───────────────────  │  ────────────────────
Inquiries & Quotations │  Work Orders          │  Bill of Materials
Sales Order Management │  Live Floor Dashboard │  MRP Planning
TNA Milestones         │  Cutting Entries      │  Purchase Orders
Sample Tracking        │  Production Entry     │  GRN & Incoming QC
Lab Dips & Recipes     │  Finishing & Packing  │  Inventory Management
Cost Sheets (FOB)      │  Capacity Planning    │  Supplier Scorecard

Quality Control        │  Finance & Admin      │  External Portals
─────────────────────  │  ───────────────────  │  ────────────────────
Incoming Inspection    │  P&L Dashboard        │  Buyer Portal
Inline Inspection      │  Style Profitability  │  Vendor Portal
Final Inspection       │  Outstanding Payments │  Buying House Portal
CAPA Management        │  HR & Attendance      │
Fabric Inspection      │  Payroll Processing   │
COPQ Analysis          │  Machine Maintenance  │
Defect Analytics       │  Document Center      │
                       │  Shipment Tracking    │
```

---

## Demo Access

Try TextileOS immediately with a pre-seeded factory (Mehta Garments Pvt. Ltd.) running 8 production lines with live orders, suppliers, and quality data.

### Internal Roles

| Role | Email | Password | What You Will See |
|---|---|---|---|
| Factory Owner | `owner@demo.textile-os.com` | `Demo@2026` | Full access — revenue, capacity, all KPIs |
| General Manager | `gm@demo.textile-os.com` | `Demo@2026` | Cross-functional dashboard, dept scorecards, alerts |
| Production Manager | `production@demo.textile-os.com` | `Demo@2026` | Work orders, floor dashboard, efficiency metrics |
| Sewing Supervisor | `supervisor@demo.textile-os.com` | `Demo@2026` | Line-level output, hourly tracking, operator attendance |
| Merchandiser | `merchandiser@demo.textile-os.com` | `Demo@2026` | Orders, samples, TNA milestones, buyer communication |
| Purchase Manager | `purchase@demo.textile-os.com` | `Demo@2026` | Purchase orders, MRP indents, supplier scorecard |
| Store Manager | `store@demo.textile-os.com` | `Demo@2026` | Inventory levels, reorder alerts, material issue |
| Quality Manager | `quality@demo.textile-os.com` | `Demo@2026` | Inspections, defect analytics, CAPA, COPQ analysis |
| Dyeing Master | `dyeing@demo.textile-os.com` | `Demo@2026` | Recipes, dyeing batches, lab dips, chemical usage |
| Finance Manager | `finance@demo.textile-os.com` | `Demo@2026` | P&L, style profitability, costing, outstanding payments |
| HR Manager | `hr@demo.textile-os.com` | `Demo@2026` | Attendance, payroll processing, employee master |
| Maintenance Engineer | `maintenance@demo.textile-os.com` | `Demo@2026` | Machine health, breakdown log, PM schedule, OEE |
| Data Entry Operator | `dataentry@demo.textile-os.com` | `Demo@2026` | Production entry, cutting entries, assigned work orders |

### External Portals

| Role | Email | Password | Portal Access |
|---|---|---|---|
| Buyer | `buyer@demo.textile-os.com` | `Demo@2026` | Order status, sample approvals, shipment documents |
| Vendor / Supplier | `vendor@demo.textile-os.com` | `Demo@2026` | Purchase orders, GRN status, payment tracking |
| Buying House | `buyinghouse@demo.textile-os.com` | `Demo@2026` | Multi-factory order monitoring, QC reports |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui + Radix UI primitives |
| Icons | Lucide React |
| Database | Supabase (PostgreSQL 15) |
| Auth | Supabase Auth + JWT + Cookie sessions |
| Security | Row Level Security on all 50+ tables |
| Charts | Recharts 3 |
| Forms | React Hook Form + Zod v4 |
| Tables | TanStack Table v8 |
| Deployment | Vercel (Edge Network) |

---

## Architecture

```
textile-erp-softwares/
├── app/
│   ├── (auth)/                 # Login, setup wizard, password reset
│   ├── (dashboard)/            # Main app — 30 modules, role-filtered nav
│   │   ├── dashboard/          # Role-specific home dashboard (13 variants)
│   │   ├── orders/             # Sales order lifecycle + amendments
│   │   ├── inquiries/          # Buyer inquiry and quotation pipeline
│   │   ├── samples/            # 8 sample types from fit to shipment
│   │   ├── lab-dips/           # Lab dip submissions and approvals
│   │   ├── costing/            # FOB cost sheet builder with versioning
│   │   ├── tna/                # Time & Action milestone tracker
│   │   ├── bom/                # Bill of Materials with cost explosion
│   │   ├── mrp/                # Material Requirements Planning engine
│   │   ├── purchase/           # POs, GRN, Supplier Scorecard
│   │   ├── inventory/          # Warehouse, stock ledger, reorder
│   │   ├── production/         # Floor dashboard, work orders, entry
│   │   ├── capacity/           # Line loading + delivery feasibility
│   │   ├── quality/            # Inspections, CAPA, COPQ, Fabric QC
│   │   ├── dyeing/             # Recipes, dyeing batches, lab dips
│   │   ├── shipment/           # Container tracking, pre-shipment checklist
│   │   ├── documents/          # Packing list, invoice, COO, test reports
│   │   ├── finance/            # P&L dashboard + style profitability
│   │   ├── hr/                 # Attendance marking + payroll processing
│   │   ├── maintenance/        # Machine health + PM schedule (TPM)
│   │   ├── masters/            # Buyers, suppliers, fabrics, colors, etc.
│   │   ├── reports/            # Business intelligence + exports
│   │   ├── users/              # User + role management
│   │   └── settings/           # Config, number series, audit log
│   ├── (portal)/               # External-facing portals
│   │   ├── buyer/              # Buyer order tracking + approvals
│   │   ├── vendor/             # Supplier PO + payment portal
│   │   └── buying-house/       # Multi-factory monitoring dashboard
│   └── api/
│       └── setup/seed-demo/    # One-call demo data seeding
├── components/
│   ├── ui/                     # 26 shadcn/ui base components
│   ├── dashboards/             # 13 role-specific dashboard components
│   ├── charts/                 # Recharts wrapper components
│   ├── data-table/             # TanStack Table (sorting, filtering, pagination)
│   ├── forms/                  # FormSheet, ConfirmDialog, ColorSizeMatrix
│   ├── layout/                 # Sidebar, Topbar, Breadcrumb, GlobalSearch
│   ├── orders/                 # Order status badge, progress tracker
│   └── production/             # Line card, floor components
├── lib/
│   ├── actions/                # 16 Server Action files, 80+ functions
│   ├── supabase/               # Browser + server Supabase clients
│   ├── seed/                   # Reproducible demo data (fixed UUIDs)
│   ├── constants.ts            # Roles, nav items, status labels, all enums
│   └── utils.ts                # cn(), formatCurrency(), formatDate()
├── types/
│   └── database.ts             # TypeScript types for all 50+ DB tables
└── supabase/
    └── schema.sql              # Full schema: tables, RLS, functions, triggers
```

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd textile-erp-softwares
npm install
```

### 2. Configure environment

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Initialize the database

Open your Supabase project → SQL Editor → paste and run `supabase/schema.sql`.

This creates:
- 50+ normalized tables with foreign keys and indexes
- `get_next_number(company_id, document_type)` for sequential document numbers
- Row Level Security policies on every table
- `updated_at` triggers via `update_updated_at()` function

### 4. Seed demo data

```bash
npm run dev

# In a separate terminal:
curl -X POST http://localhost:3000/api/setup/seed-demo
```

Seeds the database with a complete demo factory: 16 users, 5 buyers, 8 suppliers, 20 colors, 10 fabrics, 15 styles, 8 production lines, and all master data.

### 5. Open the app

```
http://localhost:3000
```

Log in with any demo credential from the table above.

---

## Module Deep Dives

### MRP — Material Requirements Planning

The operational backbone of supply chain. Given open sales orders and their BOMs, MRP calculates exactly what to buy, how much, and by when.

- Explodes BOM requirements across all confirmed orders simultaneously
- Compares gross requirements against available inventory
- Highlights shortages in red with exact gap quantities
- One-click "Generate Purchase Indents" creates POs for all shortage items
- Sorted by delivery date urgency — critical orders surface first

### Capacity Planning

Prevents the most common factory mistake: over-committing on delivery dates without checking line loading.

- Visual line loading chart (Gantt-style) across 8 rolling weeks
- Per-line utilization % color-coded: green <75%, amber 75–90%, red >90%
- Real-time feasibility checker: input qty + delivery date → instant answer
- Identifies bottleneck lines and free capacity windows
- Month-by-month capacity forecast for sales planning

### COPQ — Cost of Poor Quality

Converts quality failures into financial accountability.

- Tracks rejection cost at every stage: cutting, inline, endline, final, buyer return
- Monthly COPQ trend line vs target (typically 2% of revenue)
- Four-category breakdown: internal failure, external failure, appraisal, prevention
- Shows the monetary impact of a 1% defect rate reduction
- Root cause table with open CAPA linkage

### Finance & Style Profitability

- Monthly P&L with revenue, COGS, and gross margin trends
- Style-wise profitability ranking: best and worst margin styles side-by-side
- Buyer-wise revenue concentration and dependency analysis
- Outstanding payment aging with overdue flagging
- Cost structure breakdown: material (62%), labor (18%), overhead (10%), rejection (4%), profit (6%)

### Supplier Scorecard

Transforms supplier management from gut feel to data-driven decisions.

- Four dimensions: delivery adherence, quality pass rate, price competitiveness, responsiveness
- Gold / Silver / Bronze / Probation tier system with automatic classification
- Radar chart head-to-head comparison of top 3 suppliers
- Monthly rejection trend and delivery performance history
- Auto-flags suppliers falling below acceptable thresholds

### Machine Maintenance (TPM)

- Real-time machine grid: running (green), idle (blue), maintenance (amber), breakdown (red, pulsing)
- P1/P2/P3 priority breakdown logging with engineer assignment
- Preventive maintenance schedule with weekly compliance tracking
- OEE calculation: Availability × Performance × Quality
- MTTR and MTBF trending over time

### HR — Attendance & Payroll

- Daily attendance marking by department with bulk actions
- 14-day attendance heatmap for absenteeism patterns
- Monthly payroll processing: gross → deductions (PF, ESI, TDS) → net
- One-click salary slip generation per employee
- Bank transfer export (CSV) when payroll is finalized

---

## Database Design

The schema is designed for production use at scale.

**Multi-tenancy**: Every table has `company_id`. Users are hard-scoped to their company via RLS — no data leaks between factories.

**Row Level Security**: The `get_user_company_id()` and `get_user_role()` helper functions power all RLS policies. No backend middleware required — the database enforces isolation.

**Document Numbering**: `get_next_number(company_id, document_type)` generates sequential prefixed numbers (e.g., `SO-2026-0041`) with atomic increment using `SECURITY DEFINER`.

**Audit Trail**: `audit_logs` captures every create/update/delete with `old_data` and `new_data` JSONB, accessible to factory owners and admins only.

### Core Table Relationships

```
companies
  ├── profiles (users with roles)
  ├── buyers → inquiries → sales_orders
  │                           ├── tna_milestones
  │                           ├── samples
  │                           ├── work_orders → production_entries
  │                           │                └── cutting_entries
  │                           └── shipments
  ├── suppliers → purchase_orders → grns → inventory
  ├── products → boms → bom_items
  ├── fabrics / yarns / trims / chemicals (material masters)
  ├── machines → maintenance (breakdowns, PM)
  ├── employees → attendance → payroll
  ├── recipes → dyeing_batches
  └── inspections → inspection_defects → capas
```

---

## RBAC — Role-Based Access Control

17 total roles (14 internal + 3 portal), each with a filtered navigation sidebar and a tailored dashboard component.

### Navigation Access Matrix

| Module | Owner | GM | Prod Mgr | Merch | Purchase | Store | Quality | Finance | HR | Maint |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Orders | ✓ | ✓ | ✓ | ✓ | — | — | — | ✓ | — | — |
| MRP | ✓ | ✓ | ✓ | — | ✓ | ✓ | — | — | — | — |
| Production | ✓ | ✓ | ✓ | — | — | — | — | — | — | — |
| Capacity | ✓ | ✓ | ✓ | ✓ | — | — | — | — | — | — |
| Quality | ✓ | ✓ | ✓ | — | — | — | ✓ | — | — | — |
| Finance | ✓ | ✓ | — | — | — | — | — | ✓ | — | — |
| HR | ✓ | ✓ | ✓ | — | — | — | — | — | ✓ | — |
| Maintenance | ✓ | ✓ | ✓ | — | — | — | — | — | — | ✓ |
| Supplier Scorecard | ✓ | ✓ | — | — | ✓ | — | — | — | — | — |
| Documents | ✓ | ✓ | — | ✓ | — | — | — | ✓ | — | — |

---

## Development Patterns

### Server Actions

All data operations use Next.js Server Actions with a consistent `{ data, error }` return pattern:

```typescript
// lib/actions/orders.ts
"use server";

export async function createOrder(data: CreateOrderInput) {
  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from("sales_orders")
    .insert(data)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: order, error: null };
}
```

### Page Structure

Every list page follows the same composition pattern:

```
PageHeader (title + description + action buttons)
  └── StatCards row (4 KPI tiles with icons + values)
      └── DataTable (TanStack Table: sort, filter, paginate)
          └── FormSheet (right-side drawer for create/edit)
              └── ConfirmDialog (delete with confirmation)
```

### Naming Conventions

- Pages: `app/(dashboard)/[module]/page.tsx`
- Server Actions: `lib/actions/[module].ts`
- Dashboard Components: `components/dashboards/[role]-dashboard.tsx`
- Form Components: `components/forms/[module]/[entity]-form.tsx`

---

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel --prod
```

Set these environment variables in the Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Self-Hosted (Node.js)

```bash
npm run build
npm run start   # Runs on port 3000
```

### Self-Hosted (Docker)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Project Statistics

| Metric | Count |
|---|---|
| Total modules | 30 |
| Database tables | 50+ |
| RLS policies | 100+ |
| Server Action files | 16 |
| Server Action functions | 80+ |
| Role-specific dashboards | 13 |
| Demo user accounts | 16 |
| Total source files | 200+ |
| Lines of code | ~60,000 |

---

## Roadmap

- [ ] Mobile app (React Native) for shop-floor supervisors
- [ ] Push notifications for delays, quality failures, PO approvals
- [ ] AI demand forecasting and style recommendation
- [ ] Automated buyer status report emails
- [ ] Multi-factory group-level dashboard
- [ ] Barcode / QR scanning for production entry
- [ ] Tally / QuickBooks integration for accounts
- [ ] Third-party logistics (3PL) and freight forwarder APIs
- [ ] ISO 9001 compliance documentation module

---

*TextileOS — Built for the factories that build the world's wardrobes.*
