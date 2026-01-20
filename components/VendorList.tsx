
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { Vendor } from '../types';
import { Modal } from './ui/Modal';

interface VendorListProps {
  vendors: Vendor[];
  onSave: (vendor: Vendor) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  businessId: string;
}

export const VendorList: React.FC<VendorListProps> = ({ vendors, onSave, onDelete, businessId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Vendor>>({});

  const handleEdit = (vendor: Vendor) => {
    setEditingId(vendor.id);
    setFormData(vendor);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ businessId });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) return;
    const vendor: Vendor = {
      id: editingId || `vend_${Date.now()}`,
      businessId,
      name: formData.name,
      email: formData.email || '',
      phone: formData.phone || '',
      address: formData.address || '',
      taxId: formData.taxId || '',
    };
    await onSave(vendor);
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Vendors</h2>
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Add Vendor
        </button>
      </div>
      
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {vendors.length === 0 && <div className="p-8 text-center text-slate-500">No vendors found.</div>}
        {vendors.map((vendor) => (
          <div key={vendor.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group transition-colors">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">{vendor.name}</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                {vendor.email && <span className="flex items-center gap-1"><Mail size={12}/> {vendor.email}</span>}
                {vendor.phone && <span className="flex items-center gap-1"><Phone size={12}/> {vendor.phone}</span>}
                {vendor.taxId && <span className="text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">Tax ID: {vendor.taxId}</span>}
              </div>
              {vendor.address && <div className="mt-1 text-xs text-slate-400 flex items-center gap-1"><MapPin size={12}/> {vendor.address}</div>}
            </div>
            <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(vendor)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"><Edit size={16}/></button>
              <button onClick={() => onDelete(vendor.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Vendor' : 'New Vendor'}>
        <div className="space-y-4">
          <div><label className="label-text">Name</label><input className="input-field" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label-text">Email</label><input className="input-field" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
            <div><label className="label-text">Phone</label><input className="input-field" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
          </div>
          <div><label className="label-text">Address</label><textarea className="input-field" rows={2} value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
          <div><label className="label-text">Tax ID</label><input className="input-field" value={formData.taxId || ''} onChange={e => setFormData({...formData, taxId: e.target.value})} /></div>
          <div className="pt-4 flex justify-end gap-2">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-300">Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Vendor</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
