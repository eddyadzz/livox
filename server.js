
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import puppeteer from 'puppeteer';
import nodemailer from 'nodemailer';

// --- CONFIGURATION ---
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_in_production';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const prisma = new PrismaClient();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve Static Files
app.use(express.static(path.join(__dirname, 'dist')));

// --- HELPERS ---
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const createLog = async (businessId, action, details) => {
    try {
        await prisma.activityLog.create({
            data: {
                businessId,
                action,
                details,
                timestamp: new Date()
            }
        });
    } catch (e) {
        console.error("Logging failed:", e);
    }
};

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

const checkAccess = async (email, businessId, requiredRoles = ['Admin', 'Editor', 'Viewer']) => {
    if (!businessId) throw new Error('Business ID is required for this operation');
    const membership = await prisma.staffMember.findFirst({
        where: { email, businessId }
    });
    if (!membership) throw new Error('Unauthorized: You are not a member of this business');
    if (!requiredRoles.includes(membership.role)) throw new Error(`Unauthorized: ${membership.role} role cannot perform this action`);
    return membership;
};

// --- ROUTES: AUTHENTICATION ---

app.post('/api/auth/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const staff = await prisma.staffMember.findFirst({ where: { email } });
    if (!staff || !staff.password) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, staff.password);
    if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
        { id: staff.id, email: staff.email }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
    );

    await createLog(staff.businessId, 'Login', `User ${staff.name} logged in`);
    const { password: _, ...userWithoutPassword } = staff;
    res.json({ token, user: userWithoutPassword });
}));

app.post('/api/auth/forgot-password', asyncHandler(async (req, res) => {
    const { email } = req.body;
    const staff = await prisma.staffMember.findFirst({ where: { email } });
    if (!staff) return res.json({ success: true });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);
    await prisma.staffMember.updateMany({
        where: { email: staff.email },
        data: { resetToken, resetTokenExpiry }
    });
    res.json({ success: true, message: 'Reset link sent.' });
}));

app.post('/api/auth/reset-password', asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    const staff = await prisma.staffMember.findFirst({
        where: { resetToken: token, resetTokenExpiry: { gt: new Date() } }
    });
    if (!staff) return res.status(400).json({ error: 'Invalid or expired token' });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.staffMember.updateMany({
        where: { email: staff.email },
        data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null }
    });
    res.json({ success: true });
}));

app.post('/api/auth/change-password', authenticateToken, asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const staff = await prisma.staffMember.findFirst({ where: { email: req.user.email } });
    const validPassword = await bcrypt.compare(oldPassword, staff.password);
    if (!validPassword) return res.status(400).json({ error: 'Incorrect current password' });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.staffMember.updateMany({
        where: { email: req.user.email },
        data: { password: hashedPassword }
    });
    res.json({ success: true });
}));

app.put('/api/auth/profile', authenticateToken, asyncHandler(async (req, res) => {
    const { name } = req.body;
    await prisma.staffMember.updateMany({
        where: { email: req.user.email },
        data: { name }
    });
    res.json({ success: true });
}));

// --- ROUTES: CORE DATA ---

app.get('/api/bootstrap', authenticateToken, asyncHandler(async (req, res) => {
    const staffMembers = await prisma.staffMember.findMany({ where: { email: req.user.email } });
    const businessIds = staffMembers.map(s => s.businessId);
    const businesses = await prisma.business.findMany({
      where: { id: { in: businessIds } },
      include: {
        customers: true,
        vendors: true,
        products: true,
        expenses: { orderBy: { date: 'desc' }, take: 100 },
        staff: { select: { id: true, name: true, email: true, role: true, businessId: true } },
        logs: { orderBy: { timestamp: 'desc' }, take: 20 },
        docs: { 
            orderBy: { createdAt: 'desc' },
            take: 100,
            include: { items: true, payments: true } 
        }
      }
    });
    res.json(businesses);
}));

app.post('/api/businesses', authenticateToken, asyncHandler(async (req, res) => {
    const { name, email, phone, address } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Business name and email are required' });

    const businessId = `biz_${Date.now()}`;
    const staffId = `staff_${Date.now()}`;
    const currentUser = await prisma.staffMember.findFirst({ where: { email: req.user.email } });

    const result = await prisma.$transaction(async (tx) => {
        const business = await tx.business.create({
            data: {
                id: businessId,
                name,
                email,
                phone: phone || '',
                address: address || '',
                settings: {
                    currency: 'USD',
                    taxLabel: 'VAT',
                    taxRate: 10,
                    template: 'modern',
                    primaryColor: '#2563eb',
                    invoicePrefix: 'INV',
                    invoiceSequence: 1000,
                    quotationPrefix: 'QUO',
                    quotationSequence: 1000,
                    deliveryNotePrefix: 'DEL',
                    deliveryNoteSequence: 1000,
                    paymentReceiptPrefix: 'REC',
                    paymentReceiptSequence: 1000
                }
            }
        });
        await tx.staffMember.create({
            data: {
                id: staffId,
                businessId,
                name: currentUser.name,
                email: currentUser.email,
                password: currentUser.password,
                role: 'Admin'
            }
        });
        return business;
    });
    await createLog(businessId, 'Business Created', `Business "${name}" created`);
    res.json(result);
}));

app.put('/api/businesses/:id', authenticateToken, asyncHandler(async (req, res) => {
    await checkAccess(req.user.email, req.params.id, ['Admin']);
    const { customers, vendors, products, expenses, staff, logs, docs, id: _id, createdAt, updatedAt, ...cleanData } = req.body;
    const business = await prisma.business.update({
      where: { id: req.params.id },
      data: cleanData
    });
    res.json(business);
}));

// --- ENTITY CRUD ---

const createCrudHandlers = (modelName) => {
    return {
        create: asyncHandler(async (req, res) => {
            await checkAccess(req.user.email, req.body.businessId, ['Admin', 'Editor']);
            const { id, ...data } = req.body;
            const item = await prisma[modelName].create({ 
                data: { ...data, id: id || `${modelName}_${Date.now()}` } 
            });
            res.json(item);
        }),
        update: asyncHandler(async (req, res) => {
            const existing = await prisma[modelName].findUnique({ where: { id: req.params.id } });
            if (!existing) return res.status(404).json({ error: 'Record not found' });
            await checkAccess(req.user.email, existing.businessId, ['Admin', 'Editor']);
            const { id: _, businessId: __, createdAt: ___, updatedAt: ____, ...data } = req.body;
            const scalarData = Object.fromEntries(
                Object.entries(data).filter(([_, v]) => !Array.isArray(v) && typeof v !== 'object' || v === null)
            );
            const item = await prisma[modelName].update({ 
                where: { id: req.params.id }, 
                data: scalarData 
            });
            res.json(item);
        }),
        delete: asyncHandler(async (req, res) => {
            const existing = await prisma[modelName].findUnique({ where: { id: req.params.id } });
            if (!existing) return res.status(404).json({ error: 'Record not found' });
            await checkAccess(req.user.email, existing.businessId, ['Admin', 'Editor']);
            await prisma[modelName].delete({ where: { id: req.params.id } });
            res.json({ success: true });
        })
    };
};

app.post('/api/customers', authenticateToken, createCrudHandlers('customer').create);
app.put('/api/customers/:id', authenticateToken, createCrudHandlers('customer').update);
app.delete('/api/customers/:id', authenticateToken, createCrudHandlers('customer').delete);

app.post('/api/vendors', authenticateToken, createCrudHandlers('vendor').create);
app.put('/api/vendors/:id', authenticateToken, createCrudHandlers('vendor').update);
app.delete('/api/vendors/:id', authenticateToken, createCrudHandlers('vendor').delete);

app.post('/api/products', authenticateToken, createCrudHandlers('product').create);
app.put('/api/products/:id', authenticateToken, createCrudHandlers('product').update);
app.delete('/api/products/:id', authenticateToken, createCrudHandlers('product').delete);

app.post('/api/expenses', authenticateToken, createCrudHandlers('expense').create);
app.put('/api/expenses/:id', authenticateToken, createCrudHandlers('expense').update);
app.delete('/api/expenses/:id', authenticateToken, createCrudHandlers('expense').delete);

app.post('/api/docs', authenticateToken, asyncHandler(async (req, res) => {
    await checkAccess(req.user.email, req.body.businessId, ['Admin', 'Editor']);
    const { items, payments, id, ...docData } = req.body;
    
    const result = await prisma.$transaction(async (tx) => {
        // 1. Create document
        const doc = await tx.doc.create({
            data: {
                id: id || `doc_${Date.now()}`,
                ...docData,
                items: { 
                    create: (items || []).map(i => ({ 
                        description: i.description, 
                        quantity: i.quantity, 
                        rate: i.rate, 
                        amount: i.amount, 
                        notes: i.notes 
                    })) 
                }
            },
            include: { items: true, payments: true }
        });

        // 2. Increment sequence
        const business = await tx.business.findUnique({ where: { id: docData.businessId } });
        if (business && business.settings) {
            let settings = { ...business.settings };
            const docType = docData.type;
            let sequenceKey = '';

            if (docType === 'Invoice') sequenceKey = 'invoiceSequence';
            else if (docType === 'Quotation') sequenceKey = 'quotationSequence';
            else if (docType === 'Delivery Note') sequenceKey = 'deliveryNoteSequence';
            else if (docType === 'Payment Receipt') sequenceKey = 'paymentReceiptSequence';

            if (sequenceKey && settings[sequenceKey] !== undefined) {
                settings[sequenceKey] = Number(settings[sequenceKey]) + 1;
                await tx.business.update({
                    where: { id: docData.businessId },
                    data: { settings }
                });
            }
        }
        return doc;
    });

    res.json(result);
}));

app.put('/api/docs/:id', authenticateToken, asyncHandler(async (req, res) => {
    const existing = await prisma.doc.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Record not found' });
    await checkAccess(req.user.email, existing.businessId, ['Admin', 'Editor']);
    const { items, payments, businessId, createdAt, updatedAt, ...docData } = req.body;
    await prisma.$transaction(async (tx) => {
         await tx.doc.update({ where: { id: req.params.id }, data: docData });
         await tx.lineItem.deleteMany({ where: { docId: req.params.id } });
         if (items?.length) await tx.lineItem.createMany({ data: items.map(i => ({ docId: req.params.id, description: i.description, quantity: i.quantity, rate: i.rate, amount: i.amount, notes: i.notes })) });
    });
    res.json(await prisma.doc.findUnique({ where: { id: req.params.id }, include: { items: true, payments: true } }));
}));

app.delete('/api/docs/:id', authenticateToken, asyncHandler(async (req, res) => {
    const existing = await prisma.doc.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Record not found' });
    await checkAccess(req.user.email, existing.businessId, ['Admin', 'Editor']);
    await prisma.doc.delete({ where: { id: req.params.id } });
    res.json({ success: true });
}));

app.post('/api/payments', authenticateToken, asyncHandler(async (req, res) => {
    const invoice = await prisma.doc.findUnique({ where: { id: req.body.docId } });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    await checkAccess(req.user.email, invoice.businessId, ['Admin', 'Editor']);
    const { docId, amount, date, method, notes } = req.body;

    const result = await prisma.$transaction(async (tx) => {
        // 1. Record the payment
        await tx.paymentRecord.create({ data: { docId, amount: Number(amount), date, method, notes } });
        
        // 2. Update status of the source invoice
        const updatedInvoice = await tx.doc.findUnique({ where: { id: docId }, include: { payments: true } });
        const totalPaid = updatedInvoice.payments.reduce((s, p) => s + p.amount, 0);
        let newStatus = updatedInvoice.status;
        if (totalPaid >= updatedInvoice.total) newStatus = 'Paid';
        else if (totalPaid > 0) newStatus = 'Partially Paid';
        await tx.doc.update({ where: { id: docId }, data: { status: newStatus } });

        // 3. Generate a Payment Receipt Document
        const business = await tx.business.findUnique({ where: { id: invoice.businessId } });
        const settings = business.settings || {};
        const prefix = settings.paymentReceiptPrefix || 'REC';
        const sequence = Number(settings.paymentReceiptSequence || 1000);
        const receiptNumber = `${prefix}-${sequence}`;

        await tx.doc.create({
            data: {
                id: `receipt_${Date.now()}`,
                businessId: invoice.businessId,
                type: 'Payment Receipt',
                number: receiptNumber,
                date: date,
                clientName: invoice.clientName,
                clientEmail: invoice.clientEmail,
                clientAddress: invoice.clientAddress,
                clientTin: invoice.clientTin,
                currency: invoice.currency,
                status: 'Paid',
                subtotal: Number(amount),
                taxTotal: 0,
                total: Number(amount),
                notes: `Official receipt for payment of ${invoice.type} #${invoice.number}. ${notes || ''}`,
                terms: settings.defaultPaymentReceiptTerms || '',
                relatedDocId: invoice.id,
                items: {
                    create: [{
                        description: `Payment for ${invoice.type} #${invoice.number}`,
                        quantity: 1,
                        rate: Number(amount),
                        amount: Number(amount),
                        notes: `Method: ${method}`
                    }]
                }
            }
        });

        // 4. Increment Receipt Sequence
        const newSettings = { ...settings, paymentReceiptSequence: sequence + 1 };
        await tx.business.update({
            where: { id: invoice.businessId },
            data: { settings: newSettings }
        });

        return await tx.doc.findUnique({ where: { id: docId }, include: { items: true, payments: true } });
    });
    res.json(result);
}));

app.post('/api/pdf/generate', authenticateToken, asyncHandler(async (req, res) => {
    const { html } = req.body;
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    res.set({ 'Content-Type': 'application/pdf' }).send(pdf);
}));

app.post('/api/ai/generate', authenticateToken, asyncHandler(async (req, res) => {
    const { model, contents, config } = req.body;
    if (!model || !contents) return res.status(400).json({ error: 'Model and contents are required' });
    
    try {
        let apiKey = process.env.API_KEY || '';
        apiKey = apiKey.trim().replace(/^["']|["']$/g, '');
        
        if (!apiKey || apiKey === 'your-google-gemini-api-key') {
            throw new Error("Invalid or missing API_KEY environment variable. Please check your .env file.");
        }

        const ai = new GoogleGenAI({ apiKey });
        const payload = {
            model,
            contents: typeof contents === 'string' ? [{ role: 'user', parts: [{ text: contents }] }] : contents,
            config
        };

        const response = await ai.models.generateContent(payload);
        res.json({ text: response.text });
    } catch (e) {
        console.error("Gemini API Error:", e.message);
        const statusCode = e.status || 400;
        res.status(statusCode).json({ 
            error: "Gemini AI request failed", 
            details: e.message || "Unknown Error",
            code: e.code || 'API_ERROR'
        });
    }
}));

app.post('/api/email/send', authenticateToken, asyncHandler(async (req, res) => {
    const { to, subject, html, text, attachments } = req.body;
    if (!to || !subject) return res.status(400).json({ error: 'To and Subject are required' });

    if (!process.env.SMTP_USER) {
        console.log("Mock Email Sent to:", to, "Subject:", subject);
        return res.json({ success: true, mock: true });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: `"${process.env.APP_NAME || 'BizDocs AI'}" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text: text || "Document attached.",
            html: html || text || "Document attached.",
            attachments: attachments?.map(a => ({
                filename: a.filename,
                content: a.content,
                encoding: a.encoding
            }))
        });

        res.json({ success: true });
    } catch (e) {
        console.error("SMTP Error:", e);
        res.status(500).json({ error: "Failed to send email", details: e.message });
    }
}));

app.post('/api/staff', authenticateToken, asyncHandler(async (req, res) => {
    await checkAccess(req.user.email, req.body.businessId, ['Admin']);
    const { name, email, password, role, businessId } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const staff = await prisma.staffMember.create({ data: { id: `staff_${Date.now()}`, businessId, name, email, password: hashedPassword, role: role || 'Viewer' } });
    res.json(staff);
}));

app.get('/api/staff', authenticateToken, asyncHandler(async (req, res) => {
    const bId = req.query.businessId;
    await checkAccess(req.user.email, bId);
    res.json(await prisma.staffMember.findMany({ where: { businessId: bId }, select: { id: true, name: true, email: true, role: true } }));
}));

app.delete('/api/staff/:id', authenticateToken, asyncHandler(async (req, res) => {
    const targetStaff = await prisma.staffMember.findUnique({ where: { id: req.params.id } });
    if (!targetStaff) return res.status(404).json({ error: 'Staff member not found' });
    await checkAccess(req.user.email, targetStaff.businessId, ['Admin']);
    await prisma.staffMember.delete({ where: { id: req.params.id } });
    res.json({ success: true });
}));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
    console.error("SERVER ERROR:", err);
    res.status(err.message?.includes('Unauthorized') ? 403 : 500).json({ error: err.message || "Internal Server Error" });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html'), (e) => e && res.sendFile(path.join(__dirname, 'index.html'))));

const server = app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`ERROR: Port ${PORT} is already in use by another process.`);
    console.error(`Please close the existing server or try a different port using 'PORT=3001 npm start'.`);
    process.exit(1);
  } else {
    console.error('Server error:', e);
  }
});
