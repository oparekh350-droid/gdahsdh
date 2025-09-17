import type { BusinessType, UserRole } from "@shared/types"

export interface BusinessModule {
  id: string
  title: string
  description: string
  icon: string
  path: string
  businessTypes: BusinessType[]
  allowedRoles: UserRole[]
  category:
    | "sales"
    | "inventory"
    | "customer"
    | "analytics"
    | "operations"
    | "finance"
    | "communication"
    | "hr"
    | "settings"
  priority: number
  isSpecialized: boolean // true for business-specific modules
  isCommon?: boolean // true for common features across all business types
}

// COMMON FEATURES - Available to all business types
export const COMMON_MODULES: BusinessModule[] = [
  // Business Setup & Profile
  {
    id: "business-profile",
    title: "Business Profile",
    description: "Manage business information, GST, currency, and settings",
    icon: "Building2",
    path: "/dashboard/settings",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: ["owner", "co_founder", "manager"],
    category: "settings",
    priority: 1,
    isSpecialized: false,
    isCommon: true,
  },

  // Dashboard
  {
    id: "main-dashboard",
    title: "Dashboard",
    description: "Overview of business KPIs and performance metrics",
    icon: "BarChart3",
    path: "/dashboard",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: ["owner", "co_founder", "manager", "staff", "accountant", "sales_executive"],
    category: "analytics",
    priority: 1,
    isSpecialized: false,
    isCommon: true,
  },

  // Sales & Invoice System
  {
    id: "add-sale-invoice",
    title: "Add Sale & Invoice",
    description: "Create sales and generate professional invoices",
    icon: "FileText",
    path: "/sales/new",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: ["owner", "co_founder", "manager", "accountant", "sales_executive"],
    category: "sales",
    priority: 2,
    isSpecialized: false,
    isCommon: true,
  },

  {
    id: "sales-documents",
    title: "Sales Documents",
    description: "Manage invoices, receipts, and sales documents",
    icon: "FolderOpen",
    path: "/dashboard/sales-documents",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: ["owner", "co_founder", "manager", "accountant", "sales_executive"],
    category: "sales",
    priority: 3,
    isSpecialized: false,
    isCommon: true,
  },

  // Inventory Basics
  {
    id: "basic-inventory",
    title: "Inventory Management",
    description: "View, add, edit products with low-stock alerts",
    icon: "Package",
    path: "/dashboard/inventory",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: ["owner", "co_founder", "manager", "staff"],
    category: "inventory",
    priority: 2,
    isSpecialized: false,
    isCommon: true,
  },

  // Analytics & Reports
  {
    id: "analytics-reports",
    title: "Analytics & Reports",
    description: "Sales, revenue, expenses, profitability, and valuation metrics",
    icon: "TrendingUp",
    path: "/dashboard/analytics",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: ["owner", "co_founder", "manager", "accountant"],
    category: "analytics",
    priority: 3,
    isSpecialized: false,
    isCommon: true,
  },

  // AI Business Assistant
  {
    id: "ai-assistant",
    title: "AI Business Assistant",
    description: "AI-powered suggestions, Q&A, trends, and growth tips",
    icon: "Bot",
    path: "/dashboard/ai-assistant",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: ["owner", "co_founder", "manager", "accountant", "sales_executive"],
    category: "operations",
    priority: 4,
    isSpecialized: false,
    isCommon: true,
  },

  // Task & To-Do Manager
  {
    id: "task-manager",
    title: "Task & To-Do Manager",
    description: "Assign, track, and complete tasks for staff",
    icon: "CheckSquare",
    path: "/dashboard/tasks",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: ["owner", "co_founder", "manager", "staff"],
    category: "operations",
    priority: 5,
    isSpecialized: false,
    isCommon: true,
  },

  // Internal Communication
  {
    id: "team-chat",
    title: "Team Chat",
    description: "In-app team communication and notifications",
    icon: "MessageSquare",
    path: "/dashboard/team-chat",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: ["owner", "co_founder", "manager", "staff", "accountant", "sales_executive"],
    category: "communication",
    priority: 6,
    isSpecialized: false,
    isCommon: true,
  },

  // Leave & Attendance
  {
    id: "attendance-tracker",
    title: "Leave & Attendance",
    description: "Staff availability logs and leave management",
    icon: "Calendar",
    path: "/dashboard/attendance",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: ["owner", "co_founder", "manager"],
    category: "hr",
    priority: 7,
    isSpecialized: false,
    isCommon: true,
  },

  // Activity Logs
  {
    id: "activity-logs",
    title: "Activity Logs",
    description: "Audit trail of actions taken by all roles",
    icon: "FileText",
    path: "/dashboard/activity-logs",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: ["owner", "co_founder", "manager"],
    category: "operations",
    priority: 8,
    isSpecialized: false,
    isCommon: true,
  },

  // Multi-Branch Support
  {
    id: "multi-branch",
    title: "Multi-Branch Management",
    description: "Centralized control over multiple branches/locations",
    icon: "MapPin",
    path: "/dashboard/branches",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: ["owner", "co_founder"],
    category: "operations",
    priority: 9,
    isSpecialized: false,
    isCommon: true,
  },

  // Backup & Restore
  {
    id: "backup-restore",
    title: "Backup & Restore",
    description: "Manual and scheduled backups, import/export data",
    icon: "Download",
    path: "/dashboard/backup",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: ["owner", "co_founder"],
    category: "settings",
    priority: 10,
    isSpecialized: false,
    isCommon: true,
  },

  // Performance Dashboard
  {
    id: "performance-dashboard",
    title: "Performance Dashboard",
    description: "Staff, sales, and task performance tracking",
    icon: "Users",
    path: "/dashboard/performance",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: ["owner", "co_founder", "manager"],
    category: "hr",
    priority: 11,
    isSpecialized: false,
    isCommon: true,
  },

  // QR Code Scanner
  {
    id: "qr-scanner",
    title: "QR Code Scanner",
    description: "Scan QR codes for products, payments, or quick actions",
    icon: "QrCode",
    path: "/dashboard/qr-scanner",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: ["owner", "co_founder", "manager", "staff", "sales_executive"],
    category: "operations",
    priority: 12,
    isSpecialized: false,
    isCommon: true,
  },

  // Settings
  {
    id: "settings",
    title: "Settings",
    description: "GST, currency, language, permissions, and branch settings",
    icon: "Settings",
    path: "/dashboard/settings",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: ["owner", "co_founder", "manager"],
    category: "settings",
    priority: 13,
    isSpecialized: false,
    isCommon: true,
  },

  // Staff Management
  {
    id: "staff-management",
    title: "Staff Management",
    description: "Add, edit, and manage staff members with roles and permissions",
    icon: "Users",
    path: "/dashboard/staff",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: ["owner", "co_founder", "manager"],
    category: "hr",
    priority: 14,
    isSpecialized: false,
    isCommon: true,
  },

  // Staff Attendance
  {
    id: "staff-attendance",
    title: "Staff Attendance",
    description: "Track daily attendance, check-in/out, and working hours",
    icon: "Clock",
    path: "/dashboard/staff/attendance",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: [
      "owner",
      "co_founder",
      "manager",
      "hr",
      "staff",
      "sales_staff",
      "inventory_manager",
      "delivery_staff",
      "production",
      "store_staff",
    ],
    category: "hr",
    priority: 15,
    isSpecialized: false,
    isCommon: true,
  },

  // Staff Performance
  {
    id: "staff-performance",
    title: "Staff Performance",
    description: "Track and analyze staff performance, productivity, and KPIs",
    icon: "TrendingUp",
    path: "/dashboard/staff/performance",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: ["owner", "co_founder", "manager", "hr"],
    category: "hr",
    priority: 16,
    isSpecialized: false,
    isCommon: true,
  },

  // Team Chat
  {
    id: "internal-chat",
    title: "Internal Chat",
    description: "Team communication with 1-on-1, group chats, and announcements",
    icon: "MessageCircle",
    path: "/dashboard/chat",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: [
      "owner",
      "co_founder",
      "manager",
      "staff",
      "accountant",
      "sales_executive",
      "hr",
      "sales_staff",
      "inventory_manager",
      "delivery_staff",
      "production",
      "store_staff",
    ],
    category: "communication",
    priority: 17,
    isSpecialized: false,
    isCommon: true,
  },

  // Task Assignment
  {
    id: "task-assignment",
    title: "Task Assignment",
    description: "Assign, track, and manage tasks for staff and teams",
    icon: "CheckSquare",
    path: "/dashboard/tasks/assignment",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: ["owner", "co_founder", "manager", "hr"],
    category: "operations",
    priority: 18,
    isSpecialized: false,
    isCommon: true,
  },

  // Commission Tracking (for applicable business types)
  {
    id: "sales-commission",
    title: "Sales Commission",
    description: "Track and manage sales staff commission earnings and payments",
    icon: "DollarSign",
    path: "/dashboard/staff/commission",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: ["owner", "co_founder", "manager", "accountant", "sales_staff"],
    category: "finance",
    priority: 19,
    isSpecialized: false,
    isCommon: true,
  },

  // Staff Leaderboard
  {
    id: "staff-leaderboard",
    title: "Staff Leaderboard",
    description: "Performance rankings and staff achievements",
    icon: "Trophy",
    path: "/dashboard/staff/leaderboard",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: ["owner", "co_founder", "manager", "hr"],
    category: "hr",
    priority: 20,
    isSpecialized: false,
    isCommon: true,
  },

  // Support Tickets
  {
    id: "support-tickets",
    title: "Support Tickets",
    description: "Submit and track support requests with management",
    icon: "HelpCircle",
    path: "/dashboard/staff/support",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: [
      "owner",
      "co_founder",
      "manager",
      "staff",
      "accountant",
      "sales_executive",
      "hr",
      "sales_staff",
      "inventory_manager",
      "delivery_staff",
      "production",
      "store_staff",
    ],
    category: "communication",
    priority: 21,
    isSpecialized: false,
    isCommon: true,
  },

  // WhatsApp Integration
  {
    id: "whatsapp-integration",
    title: "WhatsApp Integration",
    description: "Send invoices, catalogs, and quotations via WhatsApp",
    icon: "MessageCircle",
    path: "/dashboard/whatsapp",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: ["owner", "co_founder", "manager", "sales_executive", "sales_staff"],
    category: "communication",
    priority: 22,
    isSpecialized: false,
    isCommon: true,
  },

  // Payment Reminders
  {
    id: "payment-reminders",
    title: "Payment Reminders",
    description: "Automated payment reminders for due and overdue invoices",
    icon: "Bell",
    path: "/dashboard/payment-reminders",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: ["owner", "co_founder", "manager", "accountant"],
    category: "finance",
    priority: 23,
    isSpecialized: false,
    isCommon: true,
  },

  // Inventory Batch Tracking
  {
    id: "inventory-batches",
    title: "Batch & Expiry Tracking",
    description: "Track inventory batches, expiry dates, and stock movements",
    icon: "Package",
    path: "/dashboard/inventory-batches",
    businessTypes: ["retailer", "manufacturer", "distributor"],
    allowedRoles: ["owner", "co_founder", "manager", "inventory_manager", "staff"],
    category: "inventory",
    priority: 24,
    isSpecialized: false,
    isCommon: true,
  },

  // Customer Relationship Management (CRM)
  {
    id: "customer-relationship-management",
    title: "Customer Relationship Management",
    description: "Manage customer relationships, purchase history, follow-ups, and loyalty",
    icon: "Users",
    path: "/dashboard/crm",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: ["owner", "co_founder", "manager", "sales_executive", "accountant"],
    category: "customer",
    priority: 25,
    isSpecialized: false,
    isCommon: true,
  },

  // Document Vault
  {
    id: "document-vault",
    title: "Document Vault",
    description: "Centralized storage for invoices, contracts, and business documents with role-based access",
    icon: "FileText",
    path: "/dashboard/document-vault",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: ["owner", "co_founder", "manager", "accountant", "sales_executive"],
    category: "operations",
    priority: 26,
    isSpecialized: false,
    isCommon: true,
  },

  // Owner Analytics (Owner-Only)
  {
    id: "owner-analytics",
    title: "Owner Analytics Dashboard",
    description: "Advanced business analytics, PAT calculations, valuation calculator, and performance insights",
    icon: "Crown",
    path: "/dashboard/owner-analytics",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: ["owner"],
    category: "analytics",
    priority: 27,
    isSpecialized: false,
    isCommon: true,
  },

  // Vendor Management (For businesses with suppliers)
  {
    id: "vendor-management",
    title: "Vendor Management",
    description: "Manage suppliers, track vendor performance, orders, and relationship management",
    icon: "Building",
    path: "/dashboard/vendor-management",
    businessTypes: ["manufacturer", "distributor", "retailer", "trader"],
    allowedRoles: ["owner", "co_founder", "manager", "inventory_manager"],
    category: "operations",
    priority: 28,
    isSpecialized: false,
    isCommon: true,
  },

  // Branch Management (Owner-Only)
  {
    id: "branch-management",
    title: "Branch Management",
    description: "Manage multiple business locations, assign staff, and configure branch settings",
    icon: "Building",
    path: "/dashboard/branch-management",
    businessTypes: ["retailer", "ecommerce", "service", "manufacturer", "distributor", "trader"],
    allowedRoles: ["owner"],
    category: "settings",
    priority: 29,
    isSpecialized: false,
    isCommon: true,
  },
]

// BUSINESS-SPECIFIC MODULES
export const BUSINESS_MODULES: BusinessModule[] = [
  // =================== MANUFACTURER SPECIFIC ===================
  {
    id: "manufacturer-finished-inventory",
    title: "Finished Product Inventory",
    description: "Add, view, and edit finished products",
    icon: "Package",
    path: "/dashboard/manufacturer/finished-product-inventory",
    businessTypes: ["manufacturer"],
    allowedRoles: ["owner", "co_founder", "manager", "inventory_manager"],
    category: "inventory",
    priority: 1,
    isSpecialized: true,
  },
  {
    id: "manufacturer-raw-inventory",
    title: "Raw Material Inventory",
    description: "Add, view, and edit raw materials",
    icon: "Warehouse",
    path: "/dashboard/manufacturer/raw-material-inventory",
    businessTypes: ["manufacturer"],
    allowedRoles: ["owner", "co_founder", "manager", "inventory_manager"],
    category: "inventory",
    priority: 2,
    isSpecialized: true,
  },
  {
    id: "recipe",
    title: "Recipe",
    description: "Manage product recipes and material requirements",
    icon: "FileText",
    path: "/dashboard/manufacturer/recipe",
    businessTypes: ["manufacturer"],
    allowedRoles: ["owner", "co_founder", "manager", "production"],
    category: "operations",
    priority: 2,
    isSpecialized: true,
  },
  {
    id: "production",
    title: "Production",
    description: "Plan and schedule production runs",
    icon: "Calendar",
    path: "/dashboard/manufacturer/production",
    businessTypes: ["manufacturer"],
    allowedRoles: ["owner", "co_founder", "manager", "production"],
    category: "operations",
    priority: 3,
    isSpecialized: true,
  },
  {
    id: "waste-tracking",
    title: "Waste Tracking",
    description: "Monitor and analyze production waste and loss",
    icon: "AlertTriangle",
    path: "/dashboard/manufacturer/waste-tracking",
    businessTypes: ["manufacturer"],
    allowedRoles: ["owner", "co_founder", "manager", "production"],
    category: "operations",
    priority: 4,
    isSpecialized: true,
  },
  {
    id: "cost-per-unit",
    title: "Cost per Unit Calculation",
    description: "Calculate precise manufacturing costs per unit",
    icon: "Calculator",
    path: "/dashboard/manufacturer/cost-per-unit",
    businessTypes: ["manufacturer"],
    allowedRoles: ["owner", "co_founder", "manager", "accountant"],
    category: "finance",
    priority: 5,
    isSpecialized: true,
  },
  {
    id: "dispatch-management",
    title: "Dispatch Management",
    description: "Manage finished goods dispatch and delivery",
    icon: "Truck",
    path: "/dashboard/manufacturer/dispatch",
    businessTypes: ["manufacturer"],
    allowedRoles: ["owner", "co_founder", "manager", "staff", "delivery_staff", "sales_staff"],
    category: "operations",
    priority: 6,
    isSpecialized: true,
  },
  {
    id: "purchase-orders",
    title: "Purchase Order Management",
    description: "Manage supplier purchase orders and procurement",
    icon: "ShoppingCart",
    path: "/dashboard/manufacturer/purchase-orders",
    businessTypes: ["manufacturer"],
    allowedRoles: ["owner", "co_founder", "manager", "inventory_manager"],
    category: "operations",
    priority: 7,
    isSpecialized: true,
  },
  {
    id: "staff-productivity",
    title: "Staff Productivity Tracker",
    description: "Track and analyze staff productivity metrics",
    icon: "Users",
    path: "/dashboard/manufacturer/staff-productivity",
    businessTypes: ["manufacturer"],
    allowedRoles: ["owner", "co_founder", "manager"],
    category: "hr",
    priority: 8,
    isSpecialized: true,
  },
  {
    id: "vendor-management",
    title: "Vendor Management",
    description: "Manage supplier relationships and performance",
    icon: "Building",
    path: "/dashboard/manufacturer/vendor-management",
    businessTypes: ["manufacturer"],
    allowedRoles: ["owner", "co_founder", "manager"],
    category: "operations",
    priority: 9,
    isSpecialized: true,
  },
  {
    id: "manufacturer-sales-commission",
    title: "Sales Commission Management",
    description: "Track sales staff commissions on manufactured products",
    icon: "DollarSign",
    path: "/dashboard/manufacturer/sales-commission",
    businessTypes: ["manufacturer"],
    allowedRoles: ["owner", "co_founder", "manager", "sales_staff", "accountant"],
    category: "finance",
    priority: 10,
    isSpecialized: true,
  },
]

// Combine common and business-specific modules
export const ALL_MODULES = [...COMMON_MODULES, ...BUSINESS_MODULES]

/**
 * Get modules for a specific business type and role
 */
export function getBusinessModules(businessType: BusinessType, userRole: UserRole): BusinessModule[] {
  return ALL_MODULES.filter(
    (module) => module.businessTypes.includes(businessType) && module.allowedRoles.includes(userRole),
  ).sort((a, b) => a.priority - b.priority)
}

/**
 * Get common modules for any business type
 */
export function getCommonModules(userRole: UserRole): BusinessModule[] {
  return COMMON_MODULES.filter((module) => module.allowedRoles.includes(userRole)).sort(
    (a, b) => a.priority - b.priority,
  )
}

/**
 * Get business-specific modules only
 */
export function getSpecializedModules(businessType: BusinessType, userRole: UserRole): BusinessModule[] {
  return BUSINESS_MODULES.filter(
    (module) => module.businessTypes.includes(businessType) && module.allowedRoles.includes(userRole),
  ).sort((a, b) => a.priority - b.priority)
}

export const BUSINESS_TYPE_CONFIGS = {
  retailer: {
    name: "Shop Owner",
    description: "Retail store operations",
    primaryColor: "blue",
    features: ["Point of Sale", "Inventory Management", "Customer Database", "Sales Analytics"],
    mainModules: ["basic-inventory", "add-sale-invoice", "analytics-reports"],
  },
  ecommerce: {
    name: "E-commerce",
    description: "Online business operations",
    primaryColor: "purple",
    features: ["Product Catalog", "Order Management", "Customer Analytics", "Digital Marketing"],
    mainModules: ["customer-relationship-management"],
  },
  service: {
    name: "Service Business",
    description: "Service-based operations",
    primaryColor: "green",
    features: ["Service Management", "Appointment Booking", "Customer Relations", "Performance Tracking"],
    mainModules: ["customer-relationship-management"],
  },
  manufacturer: {
    name: "Manufacturing",
    description: "Production and manufacturing",
    primaryColor: "orange",
    features: ["Recipe Management", "Production Workflow", "Raw Material Tracking", "Production Planning"],
    mainModules: ["manufacturer-finished-inventory", "manufacturer-raw-inventory", "recipe", "production"],
  },
  distributor: {
    name: "Distributor",
    description: "Distribution and logistics",
    primaryColor: "teal",
    features: ["Territory Management", "Brand Products", "Commission Tracking", "Route Planning"],
    mainModules: ["customer-relationship-management"],
  },
  trader: {
    name: "Trader / Reseller",
    description: "Buy-sell trading operations",
    primaryColor: "yellow",
    features: ["Buy-Sell Tracking", "Margin Calculator", "P&L Statements", "Inventory Valuation"],
    mainModules: ["customer-relationship-management"],
  },
}

/**
 * Get business type display configuration
 */
export function getBusinessTypeConfig(businessType: BusinessType) {
  return BUSINESS_TYPE_CONFIGS[businessType] || BUSINESS_TYPE_CONFIGS.retailer
}

/**
 * Check if a module is available for a specific business type and role
 */
export function hasModuleAccess(moduleId: string, businessType: BusinessType, userRole: UserRole): boolean {
  const module = ALL_MODULES.find((m) => m.id === moduleId)
  return module ? module.businessTypes.includes(businessType) && module.allowedRoles.includes(userRole) : false
}
