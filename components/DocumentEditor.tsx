
import React from 'react';
import { ArrowRight, DollarSign, Save, Trash2, Mail, Download, Loader2, User, Calendar, MapPin, Hash, Plus } from 'lucide-react';
import { Doc, DocumentType, LineItem, Product, Customer, Business } from '../types';
import { AIInput } from './AIInput';
import { RichTextEditor } from './RichTextEditor';
import { DocumentPreview } from './DocumentPreview';

interface DocumentEditorProps {
  doc: Doc;
  onUpdate: (updates: Partial<Doc>) => void;
  onSave: (doc: Doc) => void;
  onPayment?: () => void;
  onConvert: (doc: Doc, type: DocumentType) => void;
  business: Business;
  customers: Customer[];
  products: Product[];
  onAiGenerate: (text: string) => Promise<void>;
  onDownload: () => void;
  onEmail: () => void;
  isGenerating?: boolean;
  onTranslate: (text: string) => Promise<string>;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ 
  doc, onUpdate, onSave, onPayment, onConvert, business, customers, products, onAiGenerate, onDownload, onEmail, isGenerating, onTranslate
}) => {
    
    const updateItem = (index: number, field: keyof LineItem, value: any) => {
        const newItems = [...doc.items];
        newItems[index] = { ...newItems[index], [field]: value };
        if (field === 'quantity' || field === 'rate') newItems[index].amount = newItems[index].quantity * newItems[index].rate;
        onUpdate({ items: newItems });
    };

    const addItem = () => { onUpdate({ items: [...doc.items, { id: `item_${Date.now()}`, description: '', quantity: 1, rate: 0, amount: 0 }] }); };
    
    const deleteItem = (index: number) => { 
        const newItems = [...doc.items]; 
        newItems.splice(index, 1); 
        onUpdate({ items: newItems }); 
    };

    const filteredCustomers = customers.filter((c: Customer) => c.businessId === business.id);
    const filteredProducts = products.filter((p: Product) => p.businessId === business.id);

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-full">
            <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            Edit {doc.type}
                            <span className="text-sm font-normal text-slate-400">#{doc.number}</span>
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Fill in the details below to generate your document.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                         {doc.type === DocumentType.QUOTATION && <button onClick={() => onConvert(doc, DocumentType.INVOICE)} className="px-4 py-2 border border-blue-200 text-blue-600 dark:border-blue-900/50 dark:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10 text-sm font-semibold flex items-center gap-2 transition-all"><ArrowRight size={16} /> To Invoice</button>}
                         {doc.type === DocumentType.INVOICE && <button onClick={() => onConvert(doc, DocumentType.DELIVERY_NOTE)} className="px-4 py-2 border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 text-sm font-semibold flex items-center gap-2 transition-all"><ArrowRight size={16} /> To Delivery</button>}
                         {doc.type === DocumentType.INVOICE && doc.id && onPayment && <button onClick={onPayment} className="px-4 py-2 border border-green-500 text-green-600 rounded-xl hover:bg-green-50 flex items-center gap-2 text-sm font-semibold transition-all"><DollarSign size={16}/> Record Payment</button>}
                         
                         {/* Email button added next to save */}
                         <button onClick={onEmail} className="px-4 py-2 border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 flex items-center gap-2 text-sm font-semibold transition-all"><Mail size={16}/> Email</button>
                         
                         <button onClick={() => onSave(doc)} className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 text-sm font-semibold shadow-lg shadow-blue-600/20 transition-all"><Save size={16}/> Save</button>
                    </div>
                </div>
                
                <AIInput onGenerate={onAiGenerate} placeholder="Paste item list, product descriptions or raw text to extract line items..." buttonLabel="Draft with AI" />
                
                <div className="space-y-6 mb-10">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 pb-2">Client Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <label className="label-text">Client Name</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                    <input className="input-field pl-11" list="customer-list" placeholder="Start typing name..." value={doc.clientName} onChange={e => { const val = e.target.value; const cust = filteredCustomers.find((c: Customer) => c.name === val); if (cust) { onUpdate({ clientName: cust.name, clientEmail: cust.email, clientAddress: cust.address, clientTin: cust.tin }); } else { onUpdate({ clientName: val }); } }} />
                                    <datalist id="customer-list">{filteredCustomers.map((c: Customer) => <option key={c.id} value={c.name} />)}</datalist>
                                </div>
                            </div>
                            <div className="relative group">
                                <label className="label-text">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                    <input className="input-field pl-11" placeholder="client@example.com" value={doc.clientEmail} onChange={e => onUpdate({ clientEmail: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="relative group">
                                <label className="label-text">Document Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                    <input type="date" className="input-field pl-11" value={doc.date} onChange={e => onUpdate({ date: e.target.value })} />
                                </div>
                            </div>
                            {doc.type !== DocumentType.DELIVERY_NOTE && (
                                <div className="relative group">
                                    <label className="label-text">Payment Due Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                        <input type="date" className="input-field pl-11" value={doc.dueDate || ''} onChange={e => onUpdate({ dueDate: e.target.value })} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="md:col-span-2 relative group">
                            <label className="label-text">Billing Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <textarea className="input-field pl-11 min-h-[80px]" rows={2} placeholder="Full address details..." value={doc.clientAddress} onChange={e => onUpdate({ clientAddress: e.target.value })} />
                            </div>
                        </div>
                        <div className="relative group">
                            <label className="label-text">Client Tax ID / TIN</label>
                            <div className="relative">
                                <Hash className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input className="input-field pl-11" placeholder="Optional TIN" value={doc.clientTin || ''} onChange={e => onUpdate({ clientTin: e.target.value })} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-10">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 pb-2 w-full">Line Items</h3>
                        <button onClick={addItem} className="flex-shrink-0 ml-4 flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
                            <Plus size={14} /> Add Item
                        </button>
                    </div>
                    <div className="space-y-4">
                        {doc.items.map((item: LineItem, idx: number) => (
                            <div key={idx} className="relative p-5 bg-slate-50 dark:bg-slate-700/20 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all hover:border-slate-300 dark:hover:border-slate-600">
                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                                     <div className="sm:col-span-6 space-y-3">
                                         <input className="input-field font-semibold" placeholder="Item Name / Service description" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} />
                                         <textarea className="input-field text-xs bg-white/50 dark:bg-black/20" rows={1} placeholder="Additional notes or specifications..." value={item.notes || ''} onChange={e => updateItem(idx, 'notes', e.target.value)} />
                                     </div>
                                     <div className="sm:col-span-2">
                                         <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1 ml-1">Quantity</label>
                                         <input type="number" className="input-field text-center font-mono" placeholder="0" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseFloat(e.target.value))} />
                                     </div>
                                     <div className="sm:col-span-2">
                                         <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1 ml-1">Unit Price</label>
                                         <input type="number" className="input-field text-end font-mono" placeholder="0.00" value={item.rate} onChange={e => updateItem(idx, 'rate', parseFloat(e.target.value))} />
                                     </div>
                                     <div className="sm:col-span-2 text-end pt-6">
                                         <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 pr-1">Subtotal</p>
                                         <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-200">{doc.currency} {item.amount.toFixed(2)}</span>
                                     </div>
                                </div>
                                <button onClick={() => deleteItem(idx)} className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                                    <Trash2 size={14}/>
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <select className="input-field text-sm w-auto min-w-[200px]" onChange={(e) => { const prod = filteredProducts.find((p: Product) => p.id === e.target.value); if (prod) { onUpdate({ items: [...doc.items, { id: `item_${Date.now()}`, description: prod.name, notes: prod.description, quantity: 1, rate: prod.rate, amount: prod.rate }] }); e.target.value = ""; } }}>
                            <option value="">Quick Add from Library...</option>
                            {filteredProducts.map((p: Product) => <option key={p.id} value={p.id}>{p.name} ({business.settings.currency} {p.rate.toFixed(2)})</option>)}
                        </select>
                    </div>
                </div>
                
                <div className="space-y-8">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 pb-2">Notes & Terms</h3>
                    <div className="grid grid-cols-1 gap-8">
                        <div>
                            <label className="label-text mb-2 block">Public Notes</label>
                            <RichTextEditor value={doc.notes} onChange={(val) => onUpdate({ notes: val })} />
                        </div>
                        <div>
                            <label className="label-text mb-2 block">Terms & Conditions</label>
                            <RichTextEditor value={doc.terms || ''} onChange={(val) => onUpdate({ terms: val })} />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="hidden lg:flex flex-1 flex-col bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 relative h-[100%] max-h-screen">
                 <div className="bg-slate-800 text-white p-4 text-xs font-bold flex justify-between items-center shrink-0">
                    <span className="uppercase tracking-widest opacity-60">Live Preview</span>
                    <div className="flex gap-4">
                        <button onClick={onEmail} className="flex items-center gap-2 hover:text-blue-400 transition-colors"><Mail size={16}/> Email to Client</button>
                        <button onClick={onDownload} disabled={isGenerating} className="flex items-center gap-2 hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-wait">
                            {isGenerating ? <Loader2 size={16} className="animate-spin"/> : <Download size={16}/>} Download PDF
                        </button>
                    </div>
                 </div>
                 <div className="flex-1 overflow-auto p-12 flex justify-center bg-slate-200/50 dark:bg-black/20">
                    <div className="scale-[0.8] origin-top transform-gpu shadow-2xl">
                        <DocumentPreview 
                            doc={{ 
                                ...doc, 
                                subtotal: doc.items.reduce((a: number, b: LineItem) => a + b.amount, 0), 
                                taxTotal: doc.type === DocumentType.DELIVERY_NOTE ? 0 : (doc.items.reduce((a: number, b: LineItem) => a + b.amount, 0) * business.settings.taxRate) / 100, 
                                total: doc.type === DocumentType.DELIVERY_NOTE ? doc.items.reduce((a: number, b: LineItem) => a + b.amount, 0) : (doc.items.reduce((a: number, b: LineItem) => a + b.amount, 0) * (1 + business.settings.taxRate/100)) 
                            }} 
                            business={business} 
                        />
                    </div>
                 </div>
            </div>
        </div>
    );
};
