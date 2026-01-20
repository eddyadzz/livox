
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { Product } from '../types';
import { Modal } from './ui/Modal';

interface ProductListProps {
  products: Product[];
  onSave: (product: Product) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  businessId: string;
  currency: string;
}

export const ProductList: React.FC<ProductListProps> = ({ products, onSave, onDelete, businessId, currency }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData(product);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ businessId });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) return;
    const product: Product = {
      id: editingId || `prod_${Date.now()}`,
      businessId,
      name: formData.name,
      description: formData.description || '',
      rate: Number(formData.rate) || 0,
    };
    await onSave(product);
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Products & Services</h2>
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Add Product
        </button>
      </div>
      
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {products.length === 0 && <div className="p-8 text-center text-slate-500">No products found.</div>}
        {products.map((product) => (
          <div key={product.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center justify-between group transition-colors">
            <div className="flex items-start gap-4">
                <div className="bg-indigo-100 text-indigo-600 p-2.5 rounded-lg dark:bg-indigo-900/30 dark:text-indigo-400">
                    <Package size={20} />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{product.name}</h3>
                    <p className="text-sm text-slate-500 line-clamp-1">{product.description}</p>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{currency} {product.rate.toFixed(2)}</span>
                <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(product)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"><Edit size={16}/></button>
                    <button onClick={() => onDelete(product.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><Trash2 size={16}/></button>
                </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Product' : 'New Product'}>
        <div className="space-y-4">
          <div><label className="label-text">Product Name</label><input className="input-field" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
          <div><label className="label-text">Description</label><textarea className="input-field" rows={3} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
          <div><label className="label-text">Rate / Price</label><input type="number" className="input-field" value={formData.rate} onChange={e => setFormData({...formData, rate: parseFloat(e.target.value)})} /></div>
          <div className="pt-4 flex justify-end gap-2">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-300">Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Product</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
