import React, { useState, useEffect } from 'react';
import { Plus, Trash2, User, Shield, Lock } from 'lucide-react';
import { StaffMember } from '../types';
import { api } from '../services/apiService';
import { Modal } from './ui/Modal';

interface UserManagementProps {
  currentUser: StaffMember;
  businessId: string;
}

export const UserManagement: React.FC<UserManagementProps> = ({ currentUser, businessId }) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Viewer' });
  const [error, setError] = useState('');

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await api.getStaff(businessId);
      setStaff(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (businessId) fetchStaff();
  }, [businessId]);

  const handleAdd = async () => {
    setError('');
    if (!formData.name || !formData.email || !formData.password) {
        setError('All fields are required');
        return;
    }
    try {
        await api.createStaff({ ...formData, businessId });
        setIsModalOpen(false);
        setFormData({ name: '', email: '', password: '', role: 'Viewer' });
        fetchStaff();
    } catch (e: any) {
        setError(e.message || 'Failed to create user');
    }
  };

  const handleDelete = async (id: string) => {
      if(!confirm('Are you sure you want to remove this user?')) return;
      try {
          await api.deleteStaff(id);
          fetchStaff();
      } catch (e) { alert('Failed to delete user'); }
  };

  if (currentUser.role !== 'Admin') {
      return (
          <div className="p-8 text-center text-slate-500">
              <Lock size={48} className="mx-auto mb-4 text-slate-300" />
              <h2 className="text-xl font-bold mb-2">Access Restricted</h2>
              <p>Only Administrators can manage team members.</p>
          </div>
      );
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
           <div>
               <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Team & Users</h2>
               <p className="text-slate-500 text-sm">Manage access to your business</p>
           </div>
           <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-blue-700 transition-colors">
               <Plus size={18} /> Add User
           </button>
       </div>

       <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
           {loading ? (
               <div className="p-8 text-center">Loading team...</div>
           ) : (
               <table className="w-full text-left border-collapse">
                   <thead>
                       <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                           <th className="p-4 font-medium">User</th>
                           <th className="p-4 font-medium">Role</th>
                           <th className="p-4 font-medium text-end">Actions</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                       {staff.map(user => (
                           <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                               <td className="p-4">
                                   <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                           {user.name.charAt(0)}
                                       </div>
                                       <div>
                                           <div className="font-medium text-slate-800 dark:text-slate-200">{user.name}</div>
                                           <div className="text-sm text-slate-500">{user.email}</div>
                                       </div>
                                   </div>
                               </td>
                               <td className="p-4">
                                   <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : user.role === 'Editor' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                       {user.role === 'Admin' ? <Shield size={12}/> : <User size={12}/>}
                                       {user.role}
                                   </span>
                               </td>
                               <td className="p-4 text-end">
                                   {user.id !== currentUser.id && (
                                       <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                                           <Trash2 size={18} />
                                       </button>
                                   )}
                               </td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           )}
       </div>

       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Team Member">
            <div className="space-y-4">
                {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded">{error}</div>}
                <div><label className="label-text">Name</label><input className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                <div><label className="label-text">Email</label><input type="email" className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                <div><label className="label-text">Password</label><input type="password" className="input-field" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></div>
                <div>
                    <label className="label-text">Role</label>
                    <select className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                        <option value="Viewer">Viewer (Read Only)</option>
                        <option value="Editor">Editor (Create/Edit Docs)</option>
                        <option value="Admin">Admin (Full Access)</option>
                    </select>
                </div>
                <div className="pt-4 flex justify-end gap-2">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded text-slate-600">Cancel</button>
                    <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add User</button>
                </div>
            </div>
       </Modal>
    </div>
  );
};
