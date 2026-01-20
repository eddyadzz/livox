

import { Business, BusinessSettings, Customer, StaffMember, ActivityLog, Product, Expense, Vendor } from './types';

export const DEFAULT_SETTINGS: BusinessSettings = {
  currency: 'USD',
  taxLabel: 'VAT',
  taxRate: 10,
  tin: '',
  primaryColor: '#2563eb', // blue-600
  secondaryColor: '#1e40af', // blue-800
  template: 'classic',
  logoAlignment: 'left',
  sealAlignment: 'right',
  
  // Numbering Defaults
  invoicePrefix: 'INV',
  invoiceSequence: 1000,
  quotationPrefix: 'QUO',
  quotationSequence: 1000,
  deliveryNotePrefix: 'DEL',
  deliveryNoteSequence: 1000,
  paymentReceiptPrefix: 'REC',
  paymentReceiptSequence: 1000,

  defaultInvoiceNotes: 'Payment is due within 30 days. Thank you for your business.',
  defaultQuotationNotes: 'This quotation is valid for 14 days.',
  defaultDeliveryNoteNotes: 'Please sign to acknowledge receipt of goods in good order.',
  defaultPaymentReceiptNotes: 'Payment received with thanks.',

  defaultInvoiceTerms: '',
  defaultQuotationTerms: '',
  defaultDeliveryNoteTerms: '',
  defaultPaymentReceiptTerms: ''
};

export const DEFAULT_BUSINESS: Business = {
  id: 'default_biz_1',
  name: 'My Awesome Company',
  email: 'contact@example.com',
  phone: '+1 234 567 890',
  address: '123 Business St, Tech City, TC 90210',
  settings: { ...DEFAULT_SETTINGS },
};

export const MOCK_CUSTOMERS: Customer[] = [
    {
        id: 'cust_1',
        businessId: 'default_biz_1',
        name: 'Acme Corp',
        email: 'billing@acme.com',
        phone: '+1 555 0199',
        address: '123 Acme Way, Springfield, USA',
        tin: 'US-999-000-111'
    },
    {
        id: 'cust_2',
        businessId: 'default_biz_1',
        name: 'Globex Corporation',
        email: 'hank@globex.com',
        phone: '+1 555 0200',
        address: '456 Globex Dr, Cypress Creek, USA'
    }
];

export const MOCK_VENDORS: Vendor[] = [
    {
        id: 'vend_1',
        businessId: 'default_biz_1',
        name: 'Office Depot',
        email: 'support@officedepot.com',
        phone: '1-800-GO-DEPOT',
        address: 'Business Park, USA',
        taxId: 'US-TAX-555'
    },
    {
        id: 'vend_2',
        businessId: 'default_biz_1',
        name: 'Cloud Services Inc',
        email: 'billing@cloud.com',
        phone: '',
        address: 'Silicon Valley, CA'
    }
];

export const MOCK_PRODUCTS: Product[] = [
    {
        id: 'prod_1',
        businessId: 'default_biz_1',
        name: 'Web Design Basic',
        description: '5-page responsive website design service',
        rate: 500
    },
    {
        id: 'prod_2',
        businessId: 'default_biz_1',
        name: 'SEO Audit',
        description: 'Comprehensive SEO analysis and report',
        rate: 300
    },
    {
        id: 'prod_3',
        businessId: 'default_biz_1',
        name: 'Hourly Consultation',
        description: 'Technical consultation fee per hour',
        rate: 100
    }
];

export const MOCK_STAFF: StaffMember[] = [
    {
        id: 'staff_1',
        businessId: 'default_biz_1',
        name: 'Admin User',
        email: 'admin@mycompany.com',
        role: 'Admin'
    },
    {
        id: 'staff_2',
        businessId: 'default_biz_1',
        name: 'John Editor',
        email: 'editor@mycompany.com',
        role: 'Editor'
    },
    {
        id: 'staff_3',
        businessId: 'default_biz_1',
        name: 'Sarah Viewer',
        email: 'viewer@mycompany.com',
        role: 'Viewer'
    }
];

export const MOCK_LOGS: ActivityLog[] = [
    {
        id: 'log_1',
        businessId: 'default_biz_1',
        timestamp: new Date().toISOString(),
        action: 'System Init',
        details: 'System initialized with default data'
    }
];

export const MOCK_DOCS = [];

export const EXPENSE_CATEGORIES = [
    'Rent', 
    'Utilities', 
    'Salaries', 
    'Office Supplies', 
    'Marketing', 
    'Travel', 
    'Software', 
    'Insurance', 
    'Legal', 
    'Cost of Goods Sold',
    'Other'
];

export const MOCK_EXPENSES: Expense[] = [
    {
        id: 'exp_1',
        businessId: 'default_biz_1',
        date: new Date().toISOString().split('T')[0],
        category: 'Software',
        description: 'Monthly Cloud Hosting',
        amount: 29.99,
        taxAmount: 0,
        paymentMethod: 'Credit Card',
        vendorId: 'vend_2',
        status: 'Paid'
    },
    {
        id: 'exp_2',
        businessId: 'default_biz_1',
        date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString().split('T')[0],
        category: 'Office Supplies',
        description: 'Printer Paper and Ink',
        amount: 45.50,
        taxAmount: 4.50,
        paymentMethod: 'Cash',
        vendorId: 'vend_1',
        status: 'Paid'
    }
];

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'MVR'];
