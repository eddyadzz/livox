import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_SETTINGS = {
  currency: 'USD',
  taxLabel: 'VAT',
  taxRate: 10,
  tin: 'US-TAX-12345',
  primaryColor: '#2563eb', // blue-600
  secondaryColor: '#1e40af', // blue-800
  template: 'modern',
  logoAlignment: 'left',
  sealAlignment: 'right',
  
  // Numbering Defaults
  invoicePrefix: 'INV',
  invoiceSequence: 1004,
  quotationPrefix: 'QUO',
  quotationSequence: 1001,
  deliveryNotePrefix: 'DEL',
  deliveryNoteSequence: 1000,
  paymentReceiptPrefix: 'REC',
  paymentReceiptSequence: 1000,

  defaultInvoiceNotes: 'Payment is due within 30 days. Thank you for your business.',
  defaultQuotationNotes: 'This quotation is valid for 14 days.',
  defaultDeliveryNoteNotes: 'Please sign to acknowledge receipt of goods in good order.',
  defaultPaymentReceiptNotes: 'Payment received with thanks.',
  
  defaultInvoiceTerms: '1. Goods remain property of seller until paid.\n2. Late payments subject to 5% fee.',
  defaultQuotationTerms: 'Prices subject to change after validity period.',
  defaultDeliveryNoteTerms: '',
  defaultPaymentReceiptTerms: ''
};

async function main() {
  console.log('🌱 Starting database seed...');

  const businessId = 'default_biz_1';
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Business
  const business = await prisma.business.upsert({
    where: { id: businessId },
    update: { settings: DEFAULT_SETTINGS },
    create: {
      id: businessId,
      name: 'Tech Solutions Inc.',
      email: 'contact@techsolutions.com',
      phone: '+1 (555) 123-4567',
      address: '101 Innovation Dr, Silicon Valley, CA 94025',
      settings: DEFAULT_SETTINGS,
    },
  });
  console.log(`✅ Business created: ${business.name}`);

  // 2. Create Staff
  const admin = await prisma.staffMember.upsert({
    where: { id: 'staff_admin' },
    update: { password: hashedPassword },
    create: {
      id: 'staff_admin',
      businessId,
      name: 'Admin User',
      email: 'admin@techsolutions.com',
      role: 'Admin',
      password: hashedPassword
    },
  });

  await prisma.staffMember.upsert({
    where: { id: 'staff_editor' },
    update: { password: hashedPassword },
    create: {
      id: 'staff_editor',
      businessId,
      name: 'John Editor',
      email: 'editor@techsolutions.com',
      role: 'Editor',
      password: hashedPassword
    },
  });

  await prisma.staffMember.upsert({
    where: { id: 'staff_viewer' },
    update: { password: hashedPassword },
    create: {
      id: 'staff_viewer',
      businessId,
      name: 'Sarah Viewer',
      email: 'viewer@techsolutions.com',
      role: 'Viewer',
      password: hashedPassword
    },
  });
  console.log(`✅ Staff created: Admin, Editor, Viewer (Password: password123)`);

  // 3. Create Customers
  const cust1 = await prisma.customer.upsert({
    where: { id: 'cust_acme' },
    update: {},
    create: {
        id: 'cust_acme',
        businessId,
        name: 'Acme Corp',
        email: 'billing@acme.com',
        phone: '+1 555 0199',
        address: '123 Acme Way, Springfield, IL',
        tin: 'US-999-000-111'
    }
  });

  const cust2 = await prisma.customer.upsert({
    where: { id: 'cust_globex' },
    update: {},
    create: {
        id: 'cust_globex',
        businessId,
        name: 'Globex Corporation',
        email: 'finance@globex.com',
        phone: '+1 555 9988',
        address: '456 Cypress Creek',
        tin: 'US-888-777-666'
    }
  });
  console.log(`✅ Customers created: ${cust1.name}, ${cust2.name}`);

  // 4. Create Vendors
  const vendor = await prisma.vendor.upsert({
      where: { id: 'vend_aws' },
      update: {},
      create: {
          id: 'vend_aws',
          businessId,
          name: 'Amazon Web Services',
          email: 'billing@aws.amazon.com',
          address: '410 Terry Ave N, Seattle, WA',
          phone: '',
          taxId: 'US-AWS-999'
      }
  });
  console.log(`✅ Vendor created: ${vendor.name}`);

  // 5. Create Products
  const prod1 = await prisma.product.upsert({
      where: { id: 'prod_web' },
      update: {},
      create: {
        id: 'prod_web',
        businessId,
        name: 'Web Development',
        description: 'Full stack web development service (Hourly)',
        rate: 150
      }
  });
  
  const prod2 = await prisma.product.upsert({
      where: { id: 'prod_seo' },
      update: {},
      create: {
        id: 'prod_seo',
        businessId,
        name: 'SEO Optimization',
        description: 'Monthly SEO maintenance and reporting',
        rate: 500
      }
  });
  console.log(`✅ Products created: ${prod1.name}, ${prod2.name}`);

  // 6. Create Documents

  // DOC 1: SENT Invoice (Outstanding)
  const invoiceId1 = 'doc_inv_1001';
  await prisma.doc.upsert({
    where: { id: invoiceId1 },
    update: {},
    create: {
        id: invoiceId1,
        businessId,
        type: 'Invoice',
        number: 'INV-1001',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        clientName: cust1.name,
        clientEmail: cust1.email,
        clientAddress: cust1.address,
        clientTin: cust1.tin,
        currency: 'USD',
        status: 'Sent',
        subtotal: 1250,
        taxTotal: 125,
        total: 1375,
        notes: DEFAULT_SETTINGS.defaultInvoiceNotes,
        terms: DEFAULT_SETTINGS.defaultInvoiceTerms,
        items: {
            create: [
                { description: prod1.name, quantity: 5, rate: 150, amount: 750 },
                { description: prod2.name, quantity: 1, rate: 500, amount: 500 }
            ]
        }
    }
  });

  // DOC 2: PAID Invoice
  const invoiceId2 = 'doc_inv_1002';
  const paidDoc = await prisma.doc.upsert({
    where: { id: invoiceId2 },
    update: {},
    create: {
        id: invoiceId2,
        businessId,
        type: 'Invoice',
        number: 'INV-1002',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        clientName: cust2.name,
        clientEmail: cust2.email,
        clientAddress: cust2.address,
        clientTin: cust2.tin,
        currency: 'USD',
        status: 'Paid',
        subtotal: 500,
        taxTotal: 50,
        total: 550,
        notes: DEFAULT_SETTINGS.defaultInvoiceNotes,
        items: {
            create: [
                { description: 'Consultation', quantity: 1, rate: 500, amount: 500 }
            ]
        }
    }
  });
  // Add payment for Doc 2
  const existingPayment = await prisma.paymentRecord.findFirst({ where: { docId: invoiceId2 }});
  if (!existingPayment) {
      await prisma.paymentRecord.create({
          data: {
              docId: invoiceId2,
              date: new Date().toISOString().split('T')[0],
              amount: 550,
              method: 'Bank Transfer',
              notes: 'Full payment received'
          }
      });
  }

  // DOC 3: OVERDUE Invoice
  const invoiceId3 = 'doc_inv_1003';
  await prisma.doc.upsert({
    where: { id: invoiceId3 },
    update: {},
    create: {
        id: invoiceId3,
        businessId,
        type: 'Invoice',
        number: 'INV-1003',
        date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Past due
        clientName: cust1.name,
        clientEmail: cust1.email,
        clientAddress: cust1.address,
        clientTin: cust1.tin,
        currency: 'USD',
        status: 'Overdue',
        subtotal: 150,
        taxTotal: 15,
        total: 165,
        notes: 'URGENT: Payment is overdue.',
        items: {
            create: [
                { description: 'Web Maintenance', quantity: 1, rate: 150, amount: 150 }
            ]
        }
    }
  });

  console.log(`✅ Documents created: INV-1001 (Sent), INV-1002 (Paid), INV-1003 (Overdue)`);

  // 7. Create Expenses
  
  // Paid Expense
  const expenseId = 'exp_hosting';
  await prisma.expense.upsert({
      where: { id: expenseId },
      update: {},
      create: {
          id: expenseId,
          businessId,
          date: new Date().toISOString().split('T')[0],
          category: 'Software',
          description: 'AWS Monthly Hosting',
          amount: 245.50,
          taxAmount: 0,
          paymentMethod: 'Credit Card',
          status: 'Paid',
          vendorId: vendor.id
      }
  });

  // Unpaid Bill
  const billId = 'exp_legal';
  await prisma.expense.upsert({
    where: { id: billId },
    update: {},
    create: {
        id: billId,
        businessId,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'Legal',
        description: 'Contract Review',
        amount: 1200.00,
        taxAmount: 120,
        paymentMethod: 'Bank Transfer',
        status: 'Unpaid'
    }
});

  console.log(`✅ Expenses created: AWS Hosting (Paid), Legal (Unpaid)`);

  // 8. Create Activity Log
  await prisma.activityLog.create({
      data: {
          businessId,
          action: 'System Seed',
          details: 'Database seeded with comprehensive test data',
          timestamp: new Date()
      }
  });

  console.log('🚀 Seeding finished successfully.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
