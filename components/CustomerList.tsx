
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { Customer } from '../types';
import { Modal } from './ui/Modal';

interface CustomerListProps {
  customers: Customer[];
  onSave: (customer: Customer) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  businessId: string;
}

export const CustomerList: React.FC<CustomerListProps> = ({ customers, onSave, onDelete, businessId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({});

  const handleEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setFormData(customer);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ businessId });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) return;
    const customer: Customer = {
      id: editingId || `cust_${Date.now()}`,
      businessId,
      name: formData.name,
      email: formData.email || '',
      phone: formData.phone || '',
      address: formData.address || '',
      tin: formData.tin || '',
    };
    await onSave(customer);
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Customers</h2>
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Add Customer
        </button>
      </div>
      
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {customers.length === 0 && <div className="p-8 text-center text-slate-500">No customers found.</div>}
        {customers.map((customer) => (
          <div key={customer.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group transition-colors">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">{customer.name}</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                {customer.email && <span className="flex items-center gap-1"><Mail size={12}/> {customer.email}</span>}
                {customer.phone && <span className="flex items-center gap-1"><Phone size={12}/> {customer.phone}</span>}
                {customer.tin && <span className="text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">TIN: {customer.tin}</span>}
              </div>
              {customer.address && <div className="mt-1 text-xs text-slate-400 flex items-center gap-1"><MapPin size={12}/> {customer.address}</div>}
            </div>
            <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(customer)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"><Edit size={16}/></button>
              <button onClick={() => onDelete(customer.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Customer' : 'New Customer'}>
        <div className="space-y-4">
          <div><label className="label-text">Name</label><input className="input-field" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label-text">Email</label><input className="input-field" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
            <div><label className="label-text">Phone</label><input className="input-field" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
          </div>
          <div><label className="label-text">Address</label><textarea className="input-field" rows={2} value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
          <div><label className="label-text">Tax ID / TIN</label><input className="input-field" value={formData.tin || ''} onChange={e => setFormData({...formData, tin: e.target.value})} /></div>
          <div className="pt-4 flex justify-end gap-2">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-300">Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Customer</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
