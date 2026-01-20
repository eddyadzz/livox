# BizDocs AI

A professional, AI-powered business document management system built with React, Node.js, and PostgreSQL. Optimized for modern business workflows with multi-lingual support.

**v2.6 - Smart Sequential Numbering & Linked Receipts**

## 🚀 Features

### 🔐 Secure Authentication & Access
*   **Admin-Only Registration**: Public signup is disabled. New users are created exclusively by Administrators via the Team Management portal.
*   **Account Recovery**: Secure "Forgot Password" flow with token-based email recovery.
*   **Role-Based Access (RBAC)**:
    *   **Admin**: Full system access, multi-business management, user management.
    *   **Editor**: Manage documents, products, and customers.
    *   **Viewer**: Read-only access to dashboard and documents.

### 🏢 Multi-Business Architecture
*   **Business Establishment**: Admins can create and manage multiple business entities under a single account.
*   **Independent Settings**: Each business maintains its own branding, sequence numbering, currency, and tax configurations.

### 📄 Document Command Center
*   **Sequential Numbering**: Document numbers automatically increment (INV-1000, INV-1001) for every business entity.
*   **Auto-Receipts**: Payment Receipts are automatically generated when a payment is recorded against an invoice, referencing the original invoice number.
*   **Smart Workflows**: Effortless conversion: Quotation → Invoice → Delivery Note.
*   **Multi-Lingual Support**: One-click **English to Dhivehi (Maldivian)** translation using Gemini AI.

### 💰 Financial Management
*   **Payment Tracking**: Record full or partial payments. Automatic invoice status updates.
*   **Expense Tracker**: Categorize spending and track vendor bills.
*   **Advanced Reporting**: Live dashboards for Revenue, Net Profit, and Tax reports.

---

## 🗄️ Database Schema (Prisma)

```prisma
model Business {
  id        String   @id
  name      String
  email     String
  phone     String
  address   String
  settings  Json     // Includes branding, sequences, tax configurations
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  staff     StaffMember[]
  customers Customer[]
  vendors   Vendor[]
  products  Product[]
  expenses  Expense[]
  docs      Doc[]
  logs      ActivityLog[]
}

model StaffMember {
  id               String    @id
  businessId       String
  name             String
  email            String    
  password         String
  role             String    @default("Viewer") 
  resetToken       String?
  resetTokenExpiry DateTime?
  createdAt        DateTime  @default(now())

  business         Business  @relation(fields: [businessId], references: [id], onDelete: Cascade)

  @@unique([email, businessId]) 
}

model Customer {
  id         String   @id
  businessId String
  name       String
  email      String
  phone      String
  address    String
  tin        String?
  
  business   Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
}

model Vendor {
  id         String   @id
  businessId String
  name       String
  email      String
  phone      String
  address    String
  taxId      String?
  
  business   Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
}

model Product {
  id          String   @id
  businessId  String
  name        String
  description String
  rate        Float
  
  business    Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
}

model Expense {
  id            String   @id
  businessId    String
  date          String
  dueDate       String?
  category      String
  description   String
  amount        Float
  taxAmount     Float?
  paymentMethod String
  vendorId      String?
  status        String   
  
  business      Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
}

model Doc {
  id            String   @id
  businessId    String
  type          String   // Invoice, Quotation, Delivery Note, Payment Receipt
  number        String
  date          String
  dueDate       String?
  clientName    String
  clientEmail   String
  clientAddress String
  clientTin     String?
  subtotal      Float
  taxTotal      Float
  total         Float
  currency      String
  status        String   
  notes         String   
  terms         String?  
  relatedDocId  String?  // Reference to source document ID (e.g. Invoice for a Receipt)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  business      Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  items         LineItem[]
  payments      PaymentRecord[]
}

model LineItem {
  id          String @id @default(cuid())
  docId       String
  description String
  quantity    Float
  rate        Float
  amount      Float
  notes       String?

  doc         Doc    @relation(fields: [docId], references: [id], onDelete: Cascade)
}

model PaymentRecord {
  id      String @id @default(cuid())
  docId   String
  date    String
  amount  Float
  method  String
  notes   String?

  doc     Doc    @relation(fields: [docId], references: [id], onDelete: Cascade)
}

model ActivityLog {
  id         String   @id @default(cuid())
  businessId String
  timestamp  DateTime @default(now())
  action     String
  details    String

  business   Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
}
```