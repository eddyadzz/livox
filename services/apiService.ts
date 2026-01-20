
import { Business, Doc, Customer, Vendor, Product, Expense, StaffMember } from "../types";

const API_BASE = '/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {
    // Auth
    login: async (email, password): Promise<any> => {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Login failed' }));
            throw new Error(err.error || 'Login failed');
        }
        const data = await res.json();
        if (data.token) localStorage.setItem('token', data.token);
        return data;
    },

    forgotPassword: async (email: string): Promise<any> => {
        const res = await fetch(`${API_BASE}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        return res.json();
    },

    resetPassword: async (token: string, newPassword: string): Promise<any> => {
        const res = await fetch(`${API_BASE}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Reset failed');
        }
        return res.json();
    },

    updateProfile: async (name: string): Promise<any> => {
        const res = await fetch(`${API_BASE}/auth/profile`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ name })
        });
        return res.json();
    },

    changePassword: async (oldPassword: string, newPassword: string): Promise<any> => {
        const res = await fetch(`${API_BASE}/auth/change-password`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ oldPassword, newPassword })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Update failed');
        }
        return res.json();
    },

    // Staff
    getStaff: async (businessId: string): Promise<StaffMember[]> => {
        const res = await fetch(`${API_BASE}/staff?businessId=${businessId}`, { headers: getHeaders() });
        return res.json();
    },

    createStaff: async (staffData: any): Promise<StaffMember> => {
        const res = await fetch(`${API_BASE}/staff`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(staffData)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to create staff');
        }
        return res.json();
    },

    deleteStaff: async (id: string): Promise<void> => {
        await fetch(`${API_BASE}/staff/${id}`, { method: 'DELETE', headers: getHeaders() });
    },

    // Bootstrap
    fetchBootstrap: async (): Promise<Business[]> => {
        const res = await fetch(`${API_BASE}/bootstrap`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to load data');
        return res.json();
    },

    // Business
    createBusiness: async (businessData: any): Promise<Business> => {
        const res = await fetch(`${API_BASE}/businesses`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(businessData)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to create business');
        }
        return res.json();
    },

    updateBusiness: async (business: Business): Promise<Business> => {
        const res = await fetch(`${API_BASE}/businesses/${business.id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(business)
        });
        return res.json();
    },

    // CRUD entities
    saveDoc: async (doc: Doc): Promise<Doc> => {
        // Robust check for brand new or converted documents
        const isNew = !doc.createdAt || doc.createdAt === null;
        const method = isNew ? 'POST' : 'PUT';
        
        // For POST, do NOT append ID to URL
        const url = isNew ? `${API_BASE}/docs` : `${API_BASE}/docs/${doc.id}`;
        
        const res = await fetch(url, { 
            method, 
            headers: getHeaders(), 
            body: JSON.stringify(doc) 
        });
        
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(err.error || `Server responded with ${res.status}`);
        }
        return res.json();
    },
    deleteDoc: async (id: string): Promise<void> => {
        await fetch(`${API_BASE}/docs/${id}`, { method: 'DELETE', headers: getHeaders() });
    },

    recordPayment: async (docId: string, amount: number, date: string, method: string, notes?: string): Promise<any> => {
        const res = await fetch(`${API_BASE}/payments`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ docId, amount, date, method, notes })
        });
        return res.json();
    },

    saveCustomer: async (customer: Customer): Promise<Customer> => {
        const isNew = !customer.createdAt;
        const method = isNew ? 'POST' : 'PUT';
        const url = isNew ? `${API_BASE}/customers` : `${API_BASE}/customers/${customer.id}`;
        const res = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(customer) });
        return res.json();
    },
    deleteCustomer: async (id: string): Promise<void> => {
        await fetch(`${API_BASE}/customers/${id}`, { method: 'DELETE', headers: getHeaders() });
    },

    saveVendor: async (vendor: Vendor): Promise<Vendor> => {
        const isNew = !vendor.createdAt;
        const method = isNew ? 'POST' : 'PUT';
        const url = isNew ? `${API_BASE}/vendors` : `${API_BASE}/vendors/${vendor.id}`;
        const res = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(vendor) });
        return res.json();
    },
    deleteVendor: async (id: string): Promise<void> => {
        await fetch(`${API_BASE}/vendors/${id}`, { method: 'DELETE', headers: getHeaders() });
    },

    saveProduct: async (product: Product): Promise<Product> => {
        const isNew = !product.createdAt;
        const method = isNew ? 'POST' : 'PUT';
        const url = isNew ? `${API_BASE}/products` : `${API_BASE}/products/${product.id}`;
        const res = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(product) });
        return res.json();
    },
    deleteProduct: async (id: string): Promise<void> => {
        await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE', headers: getHeaders() });
    },

    saveExpense: async (expense: Expense): Promise<Expense> => {
        const isNew = !expense.createdAt;
        const method = isNew ? 'POST' : 'PUT';
        const url = isNew ? `${API_BASE}/expenses` : `${API_BASE}/expenses/${expense.id}`;
        const res = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(expense) });
        return res.json();
    },
    deleteExpense: async (id: string): Promise<void> => {
        await fetch(`${API_BASE}/expenses/${id}`, { method: 'DELETE', headers: getHeaders() });
    }
};

export const sendEmailViaBackend = async (to: string, subject: string, body: string, attachments?: any[]) => {
    const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ to, subject, html: body.replace(/\n/g, '<br>'), text: body, attachments })
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Email delivery failed' }));
        throw new Error(err.error || 'Failed to send email');
    }
    return res.json();
};
