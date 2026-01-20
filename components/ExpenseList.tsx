
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Receipt, Filter } from 'lucide-react';
import { Expense, Vendor } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';
import { Modal } from './ui/Modal';

interface ExpenseListProps {
  expenses: Expense[];
  vendors: Vendor[];
  onSave: (expense: Expense) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  businessId: string;
  currency: string;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, vendors, onSave, onDelete, businessId, currency }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Expense>>({});

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setFormData(expense);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ 
        businessId, 
        date: new Date().toISOString().split('T')[0],
        category: 'Other',
        status: 'Paid',
        paymentMethod: 'Cash',
        taxAmount: 0
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.description || !formData.amount) return;
    const expense: Expense = {
      id: editingId || `exp_${Date.now()}`,
      businessId,
      date: formData.date || new Date().toISOString().split('T')[0],
      category: formData.category || 'Other',
      description: formData.description,
      amount: Number(formData.amount),
      taxAmount: Number(formData.taxAmount) || 0,
      paymentMethod: formData.paymentMethod || 'Cash',
      vendorId: formData.vendorId,
      status: formData.status as 'Paid' | 'Unpaid' || 'Paid',
      dueDate: formData.dueDate
    };
    await onSave(expense);
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Expenses & Bills</h2>
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Add Expense
        </button>
      </div>
      
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {expenses.length === 0 && <div className="p-8 text-center text-slate-500">No expenses recorded.</div>}
        {expenses.map((expense) => {
           const vendorName = vendors.find(v => v.id === expense.vendorId)?.name || 'Unknown Vendor';
           return (
          <div key={expense.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-4 group transition-colors">
            <div className="flex items-center gap-4 flex-1 w-full">
                <div className={`p-2.5 rounded-lg flex-shrink-0 ${expense.status === 'Unpaid' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                    <Receipt size={20} />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between md:justify-start gap-2">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{expense.description}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full self-center ${expense.status === 'Unpaid' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                            {expense.status}
                        </span>
                    </div>
                    <div className="text-sm text-slate-500 mt-1 flex gap-3">
                        <span>{expense.date}</span>
                        <span>•</span>
                        <span>{expense.category}</span>
                        {expense.vendorId && (
                           <><span>•</span><span>{vendorName}</span></>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-6 justify-between w-full md:w-auto">
                <div className="text-end">
                    <div className="font-mono font-bold text-slate-700 dark:text-slate-300">{currency} {expense.amount.toFixed(2)}</div>
                    {expense.taxAmount ? <div className="text-xs text-slate-400">Tax: {expense.taxAmount.toFixed(2)}</div> : null}
                </div>
                <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(expense)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"><Edit size={16}/></button>
                    <button onClick={() => onDelete(expense.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><Trash2 size={16}/></button>
                </div>
            </div>
          </div>
        )})}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Expense' : 'New Expense'}>
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div><label className="label-text">Date</label><input type="date" className="input-field" value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
                <div><label className="label-text">Status</label><select className="input-field" value={formData.status || 'Paid'} onChange={e => setFormData({...formData, status: e.target.value as any})}><option value="Paid">Paid</option><option value="Unpaid">Unpaid / Bill</option></select></div>
            </div>
            <div><label className="label-text">Description</label><input className="input-field" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="label-text">Amount</label><input type="number" className="input-field" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} /></div>
                <div><label className="label-text">Tax Amount</label><input type="number" className="input-field" value={formData.taxAmount} onChange={e => setFormData({...formData, taxAmount: parseFloat(e.target.value)})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="label-text">Category</label><select className="input-field" value={formData.category || 'Other'} onChange={e => setFormData({...formData, category: e.target.value})}>{EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className="label-text">Vendor</label><select className="input-field" value={formData.vendorId || ''} onChange={e => setFormData({...formData, vendorId: e.target.value})}><option value="">-- Select Vendor --</option>{vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
            </div>
            {formData.status === 'Unpaid' && (
                <div><label className="label-text">Due Date</label><input type="date" className="input-field" value={formData.dueDate || ''} onChange={e => setFormData({...formData, dueDate: e.target.value})} /></div>
            )}
            <div><label className="label-text">Payment Method</label><select className="input-field" value={formData.paymentMethod || 'Cash'} onChange={e => setFormData({...formData, paymentMethod: e.target.value})}><option value="Cash">Cash</option><option value="Bank Transfer">Bank Transfer</option><option value="Credit Card">Credit Card</option><option value="Check">Check</option></select></div>

            <div className="pt-4 flex justify-end gap-2">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-300">Cancel</button>
                <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Expense</button>
            </div>
        </div>
      </Modal>
    </div>
  );
};
