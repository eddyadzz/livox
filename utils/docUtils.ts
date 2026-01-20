
import { BusinessSettings, Doc, DocumentType, DocumentStatus, LineItem } from '../types';

export const getDocDefaults = (type: DocumentType, settings: BusinessSettings) => {
  let prefix = 'DOC';
  let sequence = 1000;
  let notes = '';
  let terms = '';

  switch (type) {
    case DocumentType.INVOICE:
      prefix = settings.invoicePrefix || 'INV';
      sequence = settings.invoiceSequence || 1000;
      notes = settings.defaultInvoiceNotes || '';
      terms = settings.defaultInvoiceTerms || '';
      break;
    case DocumentType.QUOTATION:
      prefix = settings.quotationPrefix || 'QUO';
      sequence = settings.quotationSequence || 1000;
      notes = settings.defaultQuotationNotes || '';
      terms = settings.defaultQuotationTerms || '';
      break;
    case DocumentType.DELIVERY_NOTE:
      prefix = settings.deliveryNotePrefix || 'DEL';
      sequence = settings.deliveryNoteSequence || 1000;
      notes = settings.defaultDeliveryNoteNotes || '';
      terms = settings.defaultDeliveryNoteTerms || '';
      break;
    case DocumentType.PAYMENT_RECEIPT:
      prefix = settings.paymentReceiptPrefix || 'REC';
      sequence = settings.paymentReceiptSequence || 1000;
      notes = settings.defaultPaymentReceiptNotes || '';
      terms = settings.defaultPaymentReceiptTerms || '';
      break;
  }
  return { number: `${prefix}-${sequence}`, notes, terms };
};

export const createNewDoc = (type: DocumentType, businessId: string, settings: BusinessSettings): Doc => {
  const defaults = getDocDefaults(type, settings);
  
  return {
    id: `doc_${Date.now()}`,
    businessId,
    type,
    number: defaults.number,
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    clientTin: '',
    items: [],
    subtotal: 0,
    taxTotal: 0,
    total: 0,
    status: DocumentStatus.DRAFT,
    currency: settings.currency,
    notes: defaults.notes,
    terms: defaults.terms,
    payments: []
  };
};

export const calculateDocTotals = (doc: Doc, taxRate: number): Doc => {
  const subtotal = doc.items.reduce((acc, item) => acc + item.amount, 0);
  // No tax on Delivery Notes
  const taxTotal = doc.type === DocumentType.DELIVERY_NOTE ? 0 : (subtotal * taxRate) / 100;
  const total = subtotal + taxTotal;
  
  return { ...doc, subtotal, taxTotal, total };
};

export const calculateDocStatus = (doc: Doc): DocumentStatus => {
  let status = doc.status;
  const paid = doc.payments ? doc.payments.reduce((sum, p) => sum + p.amount, 0) : 0;
  const total = doc.total;

  if (doc.type === DocumentType.INVOICE) {
      if (paid >= total && total > 0) status = DocumentStatus.PAID;
      else if (paid > 0) status = DocumentStatus.PARTIALLY_PAID;
      else if (doc.dueDate && new Date(doc.dueDate) < new Date() && status !== DocumentStatus.PAID) status = DocumentStatus.OVERDUE;
      else if (status !== DocumentStatus.DRAFT) status = DocumentStatus.SENT;
  }
  return status;
};

export const convertDoc = (doc: Doc, targetType: DocumentType, settings: BusinessSettings): Doc => {
  const defaults = getDocDefaults(targetType, settings);

  // Transform items based on conversion rules
  let newItems = doc.items.map(item => ({
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` // New ID
  }));

  // Rule: Invoice -> Delivery Note: Remove prices
  if (doc.type === DocumentType.INVOICE && targetType === DocumentType.DELIVERY_NOTE) {
      newItems = newItems.map(item => ({
          ...item,
          rate: 0,
          amount: 0
      }));
  }

  // Base new doc - strip createdAt/updatedAt/id to ensure it's treated as new by apiService
  const { createdAt, updatedAt, id, ...baseDoc } = doc;

  const newDoc: Doc = {
      ...baseDoc,
      id: `doc_${Date.now()}`,
      type: targetType,
      number: defaults.number,
      date: new Date().toISOString().split('T')[0],
      status: DocumentStatus.DRAFT,
      items: newItems,
      notes: defaults.notes,
      terms: defaults.terms,
      payments: [],
      subtotal: 0,
      taxTotal: 0,
      total: 0
  };
  
  // Physically delete keys to satisfy Save logic check: !doc.createdAt
  delete (newDoc as any).createdAt;
  delete (newDoc as any).updatedAt;

  // Recalculate totals
  return calculateDocTotals(newDoc, settings.taxRate);
};
