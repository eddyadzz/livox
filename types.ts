export enum DocumentType {
  INVOICE = 'Invoice',
  QUOTATION = 'Quotation',
  DELIVERY_NOTE = 'Delivery Note',
  PAYMENT_RECEIPT = 'Payment Receipt',
}

export enum DocumentStatus {
  DRAFT = 'Draft',
  SENT = 'Sent',
  PARTIALLY_PAID = 'Partially Paid',
  PAID = 'Paid',
  OVERDUE = 'Overdue',
}

export type DocumentTemplate = 'classic' | 'modern' | 'minimal' | 'professional';
export type Alignment = 'left' | 'center' | 'right';

export interface BusinessSettings {
  currency: string;
  taxLabel: string;
  taxRate: number;
  tin: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  logoAlignment?: Alignment;
  sealUrl?: string;
  sealAlignment?: Alignment;
  paidStampUrl?: string;
  smtpHost?: string;
  smtpUser?: string;
  smtpPort?: string;
  smtpPassword?: string;
  template: DocumentTemplate;
  
  invoicePrefix?: string;
  invoiceSequence?: number;
  quotationPrefix?: string;
  quotationSequence?: number;
  deliveryNotePrefix?: string;
  deliveryNoteSequence?: number;
  paymentReceiptPrefix?: string;
  paymentReceiptSequence?: number;

  defaultInvoiceNotes?: string;
  defaultQuotationNotes?: string;
  defaultDeliveryNoteNotes?: string;
  defaultPaymentReceiptNotes?: string;

  defaultInvoiceTerms?: string;
  defaultQuotationTerms?: string;
  defaultDeliveryNoteTerms?: string;
  defaultPaymentReceiptTerms?: string;
}

export interface Business {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  settings: BusinessSettings;
  createdAt?: string;
  updatedAt?: string;
  customers?: Customer[];
  vendors?: Vendor[];
  products?: Product[];
  expenses?: Expense[];
  staff?: StaffMember[];
  logs?: ActivityLog[];
  docs?: Doc[];
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  tin?: string;
  createdAt?: string;
}

export interface Vendor {
  id: string;
  businessId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId?: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  description: string;
  rate: number;
  createdAt?: string;
}

export interface Expense {
  id: string;
  businessId: string;
  date: string;
  dueDate?: string;
  category: string;
  description: string;
  amount: number;
  taxAmount?: number;
  paymentMethod: string;
  vendorId?: string;
  status: 'Paid' | 'Unpaid';
  createdAt?: string;
}

export interface StaffMember {
  id: string;
  businessId: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  password?: string;
  createdAt?: string;
}

export interface ActivityLog {
  id: string;
  businessId: string;
  timestamp: string;
  action: string;
  details: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: string;
  notes?: string;
}

export interface Doc {
  id: string;
  businessId: string;
  type: DocumentType;
  number: string;
  date: string;
  dueDate?: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  clientTin?: string;
  items: LineItem[];
  subtotal: number;
  taxTotal: number;
  total: number;
  notes: string;
  terms?: string;
  status: DocumentStatus;
  currency: string;
  payments?: PaymentRecord[];
  relatedDocId?: string; // Links to source document (e.g. Invoice ID for a Receipt)
  createdAt?: string;
  updatedAt?: string;
}

export interface AIRsponseItems {
  items: { description: string; quantity: number; rate: number }[];
}