
export const translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    documents: "Documents",
    customers: "Customers",
    products: "Products",
    expenses: "Expenses / Bills",
    vendors: "Vendors",
    reports: "Financial Reports",
    profile: "My Profile",
    businesses: "Manage Businesses",
    users: "Team & Users",
    settings: "Settings",
    logout: "Log Out",
    
    // Dashboard
    total_invoiced: "Total Invoiced",
    total_received: "Total Received",
    outstanding: "Outstanding",
    total_expenses: "Total Expenses",
    net_profit: "Net Profit",
    revenue_vs_expenses: "Revenue - Expenses",
    
    // UI General
    create_new: "Create New",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    search: "Search...",
    actions: "Actions",
    all: "All",
    
    // Document Specifics
    invoice: "Invoice",
    quotation: "Quotation",
    delivery_note: "Delivery Note",
    payment_receipt: "Payment Receipt",
    
    // Status
    draft: "Draft",
    sent: "Sent",
    paid: "Paid",
    partially_paid: "Partially Paid",
    overdue: "Overdue",
    unpaid: "Unpaid",
  }
};

export type Locale = "en";
export type TranslationKey = keyof typeof translations.en;
