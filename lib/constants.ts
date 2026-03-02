export const ROLES = {
  SUPER_ADMIN: "super_admin",
  FACTORY_OWNER: "factory_owner",
  GENERAL_MANAGER: "general_manager",
  PRODUCTION_MANAGER: "production_manager",
  MERCHANDISER: "merchandiser",
  PURCHASE_MANAGER: "purchase_manager",
  STORE_MANAGER: "store_manager",
  QUALITY_MANAGER: "quality_manager",
  DYEING_MASTER: "dyeing_master",
  SEWING_SUPERVISOR: "sewing_supervisor",
  FINANCE_MANAGER: "finance_manager",
  HR_MANAGER: "hr_manager",
  MAINTENANCE_ENGINEER: "maintenance_engineer",
  DATA_ENTRY_OPERATOR: "data_entry_operator",
  BUYER_USER: "buyer_user",
  VENDOR_USER: "vendor_user",
  BUYING_HOUSE_USER: "buying_house_user",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const INTERNAL_ROLES: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.FACTORY_OWNER,
  ROLES.GENERAL_MANAGER,
  ROLES.PRODUCTION_MANAGER,
  ROLES.MERCHANDISER,
  ROLES.PURCHASE_MANAGER,
  ROLES.STORE_MANAGER,
  ROLES.QUALITY_MANAGER,
  ROLES.DYEING_MASTER,
  ROLES.SEWING_SUPERVISOR,
  ROLES.FINANCE_MANAGER,
  ROLES.HR_MANAGER,
  ROLES.MAINTENANCE_ENGINEER,
  ROLES.DATA_ENTRY_OPERATOR,
];

export const PORTAL_ROLES: Role[] = [
  ROLES.BUYER_USER,
  ROLES.VENDOR_USER,
  ROLES.BUYING_HOUSE_USER,
];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  factory_owner: "Factory Owner",
  general_manager: "General Manager",
  production_manager: "Production Manager",
  merchandiser: "Merchandiser",
  purchase_manager: "Purchase Manager",
  store_manager: "Store Manager",
  quality_manager: "Quality Manager",
  dyeing_master: "Dyeing Master",
  sewing_supervisor: "Sewing Supervisor",
  finance_manager: "Finance Manager",
  hr_manager: "HR Manager",
  maintenance_engineer: "Maintenance Engineer",
  data_entry_operator: "Data Entry Operator",
  buyer_user: "Buyer",
  vendor_user: "Vendor / Supplier",
  buying_house_user: "Buying House",
};

export const ORDER_STATUSES = [
  "confirmed",
  "material_sourcing",
  "in_production",
  "ready_to_ship",
  "shipped",
  "completed",
  "on_hold",
  "cancelled",
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  material_sourcing: "Material Sourcing",
  in_production: "In Production",
  ready_to_ship: "Ready to Ship",
  shipped: "Shipped",
  completed: "Completed",
  on_hold: "On Hold",
  cancelled: "Cancelled",
};

export const SAMPLE_TYPES = [
  "lab_dip",
  "strike_off",
  "fit_sample",
  "size_set",
  "pre_production",
  "production",
  "shipment",
  "photo",
] as const;

export const SAMPLE_TYPE_LABELS: Record<string, string> = {
  lab_dip: "Lab Dip",
  strike_off: "Strike Off",
  fit_sample: "Fit Sample",
  size_set: "Size Set",
  pre_production: "Pre-Production",
  production: "Production",
  shipment: "Shipment",
  photo: "Photo Sample",
};

export const INSPECTION_TYPES = [
  "incoming",
  "inline",
  "endline",
  "pre_final",
  "final",
] as const;

export const INSPECTION_TYPE_LABELS: Record<string, string> = {
  incoming: "Incoming Inspection",
  inline: "Inline Inspection",
  endline: "End-Line Inspection",
  pre_final: "Pre-Final Inspection",
  final: "Final Inspection",
};

export const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED"] as const;

export const FABRIC_TYPES = [
  "woven",
  "knitted",
  "non_woven",
] as const;

export const ITEM_TYPES = [
  "fabric",
  "yarn",
  "trim",
  "chemical",
  "accessory",
  "packing",
] as const;

export const MACHINE_STATUSES = [
  "running",
  "idle",
  "maintenance",
  "breakdown",
] as const;

export const STOCK_STATUSES = [
  "available",
  "quarantine",
  "reserved",
  "rejected",
] as const;

export const PO_STATUSES = [
  "draft",
  "pending_approval",
  "approved",
  "sent",
  "partial_received",
  "fully_received",
  "closed",
  "cancelled",
] as const;

export const SHIPMENT_STATUSES = [
  "packing",
  "ready",
  "in_transit",
  "delivered",
  "delayed",
] as const;

export const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  packing: "Packing",
  ready: "Ready to Ship",
  in_transit: "In Transit",
  delivered: "Delivered",
  delayed: "Delayed",
};

export const MAINTENANCE_PRIORITIES = ["P1", "P2", "P3"] as const;

export const MAINTENANCE_STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export const SUPPLIER_TIERS: Record<string, string> = {
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
  probation: "Probation",
};

export const DEMO_ROLES_DESCRIPTIONS: Record<string, string> = {
  super_admin: "Full system access, company setup, all modules",
  factory_owner: "Executive overview — revenue, capacity, quality, orders, shipments",
  general_manager: "Cross-functional dashboard — all KPIs, alerts, department scorecards",
  production_manager: "Production planning, floor tracking, work orders, efficiency",
  merchandiser: "Orders, samples, lab dips, TNA milestones, buyer communication",
  purchase_manager: "Purchase orders, supplier management, GRN, MRP-driven indents",
  store_manager: "Inventory levels, warehouse management, material issue, reorder alerts",
  quality_manager: "All inspections, defect analysis, CAPA, COPQ, AQL tracking",
  dyeing_master: "Dyeing recipes, lab dips, batch management, chemical usage",
  sewing_supervisor: "Line-level production tracking, hourly output, operator attendance",
  finance_manager: "Cost sheets, P&L, style profitability, outstanding payments",
  hr_manager: "Employee master, attendance, payroll processing, wage sheets",
  maintenance_engineer: "Machine health, breakdown log, PM schedule, OEE tracking",
  data_entry_operator: "Production data entry, cutting entries, assigned work orders",
  buyer_user: "Order tracking, sample approvals, shipment docs (Buyer Portal)",
  vendor_user: "Purchase orders, GRN status, payment tracking (Vendor Portal)",
  buying_house_user: "Multi-factory order monitoring, QC reports (Buying House Portal)",
};

// ============================================================
// NAVIGATION - all modules including 10 new additions
// ============================================================

export const NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    roles: INTERNAL_ROLES,
  },
  {
    title: "Orders",
    href: "/orders",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.MERCHANDISER,
      ROLES.PRODUCTION_MANAGER,
      ROLES.FINANCE_MANAGER,
    ],
  },
  {
    title: "Inquiries",
    href: "/inquiries",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.MERCHANDISER,
    ],
  },
  {
    title: "Samples",
    href: "/samples",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.MERCHANDISER,
      ROLES.QUALITY_MANAGER,
    ],
  },
  {
    title: "Lab Dips",
    href: "/lab-dips",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.MERCHANDISER,
      ROLES.DYEING_MASTER,
    ],
  },
  {
    title: "Costing",
    href: "/costing",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.MERCHANDISER,
      ROLES.FINANCE_MANAGER,
    ],
  },
  {
    title: "TNA",
    href: "/tna",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.MERCHANDISER,
      ROLES.PRODUCTION_MANAGER,
    ],
  },
  {
    title: "BOM",
    href: "/bom",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.MERCHANDISER,
      ROLES.PRODUCTION_MANAGER,
      ROLES.PURCHASE_MANAGER,
    ],
  },
  {
    title: "MRP",
    href: "/mrp",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.PRODUCTION_MANAGER,
      ROLES.PURCHASE_MANAGER,
      ROLES.STORE_MANAGER,
    ],
  },
  {
    title: "Purchase",
    href: "/purchase",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.PURCHASE_MANAGER,
      ROLES.STORE_MANAGER,
    ],
  },
  {
    title: "Inventory",
    href: "/inventory",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.STORE_MANAGER,
      ROLES.PRODUCTION_MANAGER,
      ROLES.PURCHASE_MANAGER,
    ],
  },
  {
    title: "Production",
    href: "/production",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.PRODUCTION_MANAGER,
      ROLES.SEWING_SUPERVISOR,
      ROLES.DATA_ENTRY_OPERATOR,
    ],
  },
  {
    title: "Capacity",
    href: "/capacity",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.PRODUCTION_MANAGER,
      ROLES.MERCHANDISER,
    ],
  },
  {
    title: "Quality",
    href: "/quality",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.QUALITY_MANAGER,
      ROLES.PRODUCTION_MANAGER,
    ],
  },
  {
    title: "Dyeing",
    href: "/dyeing",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.DYEING_MASTER,
      ROLES.MERCHANDISER,
    ],
  },
  {
    title: "Shipment",
    href: "/shipment",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.MERCHANDISER,
      ROLES.PRODUCTION_MANAGER,
    ],
  },
  {
    title: "Documents",
    href: "/documents",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.MERCHANDISER,
      ROLES.FINANCE_MANAGER,
    ],
  },
  {
    title: "Finance",
    href: "/finance",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.FINANCE_MANAGER,
    ],
  },
  {
    title: "HR",
    href: "/hr/attendance",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.HR_MANAGER,
      ROLES.PRODUCTION_MANAGER,
    ],
  },
  {
    title: "Maintenance",
    href: "/maintenance",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.MAINTENANCE_ENGINEER,
      ROLES.PRODUCTION_MANAGER,
    ],
  },
  {
    title: "Supplier Scorecard",
    href: "/purchase/scorecard",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.PURCHASE_MANAGER,
    ],
  },
  {
    title: "Masters",
    href: "/masters",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.HR_MANAGER,
    ],
  },
  {
    title: "Reports",
    href: "/reports",
    roles: INTERNAL_ROLES,
  },
  {
    title: "Users",
    href: "/users",
    roles: [ROLES.SUPER_ADMIN, ROLES.FACTORY_OWNER],
  },
  {
    title: "Settings",
    href: "/settings",
    roles: [ROLES.SUPER_ADMIN, ROLES.FACTORY_OWNER, ROLES.GENERAL_MANAGER],
  },
  // ============================================================
  // ADVANCED ANALYTICS & INTELLIGENCE FEATURES
  // ============================================================
  {
    title: "Profitability Heatmap",
    href: "/finance/profitability-heatmap",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.FINANCE_MANAGER,
    ],
  },
  {
    title: "Attendance Impact",
    href: "/production/attendance-impact",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.PRODUCTION_MANAGER,
      ROLES.HR_MANAGER,
    ],
  },
  {
    title: "Fabric Variance",
    href: "/production/fabric-variance",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.STORE_MANAGER,
      ROLES.PRODUCTION_MANAGER,
      ROLES.FINANCE_MANAGER,
    ],
  },
  {
    title: "Delivery Countdown",
    href: "/purchase/delivery-countdown",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.PURCHASE_MANAGER,
      ROLES.MERCHANDISER,
    ],
  },
  {
    title: "Rework Cost",
    href: "/quality/rework-cost",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.QUALITY_MANAGER,
      ROLES.FINANCE_MANAGER,
    ],
  },
  {
    title: "Style Library",
    href: "/style-library",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.MERCHANDISER,
      ROLES.PRODUCTION_MANAGER,
    ],
  },
  {
    title: "Exception Feed",
    href: "/production/exceptions",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.PRODUCTION_MANAGER,
    ],
  },
  {
    title: "Buyer Insights",
    href: "/buyer-insights",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.MERCHANDISER,
    ],
  },
  {
    title: "Expiry Tracker",
    href: "/inventory/expiry-tracker",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.STORE_MANAGER,
      ROLES.DYEING_MASTER,
    ],
  },
  {
    title: "Handoff Tracker",
    href: "/production/handoffs",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.PRODUCTION_MANAGER,
      ROLES.SEWING_SUPERVISOR,
    ],
  },
  {
    title: "Capacity Calendar",
    href: "/capacity/calendar",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.PRODUCTION_MANAGER,
      ROLES.MERCHANDISER,
    ],
  },
  {
    title: "Cost Benchmark",
    href: "/finance/cost-benchmark",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.FINANCE_MANAGER,
      ROLES.PRODUCTION_MANAGER,
    ],
  },
  {
    title: "Quality Gate",
    href: "/shipment/quality-gate",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
      ROLES.QUALITY_MANAGER,
      ROLES.MERCHANDISER,
    ],
  },
  {
    title: "Weekly Digest",
    href: "/reports/weekly-digest",
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.FACTORY_OWNER,
      ROLES.GENERAL_MANAGER,
    ],
  },
];
