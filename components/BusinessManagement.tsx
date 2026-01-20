import React, { useState } from 'react';
import { Plus, Building2, Store, MapPin, Mail, ChevronRight, Loader2 } from 'lucide-react';
import { Business } from '../types';
import { Modal } from './ui/Modal';

interface BusinessManagementProps {
  businesses: Business[];
  onCreate: (data: any) => Promise<void>;
  onSwitch: (id: string) => void;
  currentBusinessId: string;
}

export const BusinessManagement: React.FC<BusinessManagementProps> = ({ businesses, onCreate, onSwitch, currentBusinessId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onCreate(formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', address: '' });
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-8 animate-slide-up">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800">
          <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Your Businesses</h2>
              <p className="text-slate-500 mt-1">Manage and switch between your multiple business profiles</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl flex items-center gap-2 shadow-xl shadow-blue-600/20 transition-all transform active:scale-95">
              <Plus size={20} /> Create New Profile
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((biz) => (
             <div 
               key={biz.id} 
               onClick={() => onSwitch(biz.id)}
               className={`group p-6 rounded-[2rem] bg-white dark:bg-slate-900 border-2 transition-all cursor-pointer relative overflow-hidden ${biz.id === currentBusinessId ? 'border-blue-600 shadow-xl shadow-blue-600/5' : 'border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900'}`}
             >
                {biz.id === currentBusinessId && <div className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">Active</div>}
                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 mb-6 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 transition-colors">
                    {biz.settings.logoUrl ? <img src={biz.settings.logoUrl} className="w-10 h-10 object-contain" /> : <Store size={28}/>}
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-2">{biz.name}</h3>
                <div className="space-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-2"><Mail size={14} className="opacity-50"/> {biz.email}</div>
                    <div className="flex items-center gap-2"><MapPin size={14} className="opacity-50"/> {biz.address || 'No address set'}</div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between text-blue-600 dark:text-blue-400 font-bold text-sm">
                    {biz.id === currentBusinessId ? 'Already viewing' : 'Switch to this business'}
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                </div>
             </div>
          ))}
       </div>

       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Business">
          <form onSubmit={handleSubmit} className="space-y-5">
             <div><label className="label-text">Business Name</label><input required className="input-field" placeholder="e.g. Acme Maldives Ltd." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
             <div><label className="label-text">Official Email</label><input required type="email" className="input-field" placeholder="billing@company.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
             <div className="grid grid-cols-2 gap-4">
                <div><label className="label-text">Phone</label><input className="input-field" placeholder="+960..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
             </div>
             <div><label className="label-text">Address</label><textarea className="input-field" rows={2} placeholder="Full head office address..." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
             
             <div className="pt-6 border-t dark:border-slate-800 flex justify-end gap-3">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 font-bold text-slate-500 hover:text-slate-800">Cancel</button>
                 <button disabled={loading} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-8 rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2">
                     {loading ? <Loader2 className="animate-spin" size={18}/> : <Building2 size={18}/>}
                     Establish Business
                 </button>
             </div>
          </form>
       </Modal>
    </div>
  );
};
