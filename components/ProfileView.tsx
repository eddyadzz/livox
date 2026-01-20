import React, { useState } from 'react';
import { User, Lock, Loader2, Save, KeyRound } from 'lucide-react';
import { StaffMember } from '../types';
import { api } from '../services/apiService';

interface ProfileViewProps {
  user: StaffMember;
  onUpdate: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateProfile(name);
      onUpdate();
    } catch (e) { console.error(e); } finally { setLoading(true); }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMsg('');
    if (newPassword !== confirmPassword) return setError("New passwords don't match");
    if (newPassword.length < 6) return setError("Password must be at least 6 characters");
    
    setPassLoading(true);
    try {
      await api.changePassword(oldPassword, newPassword);
      setMsg('Password updated successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      setError(e.message || 'Failed to update password');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-slide-up">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800/50">
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
             <User className="text-blue-600" size={24}/> General Profile
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage your basic account identity</p>
        </div>
        <form onSubmit={handleUpdateName} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label-text">Display Name</label>
              <input className="input-field" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="label-text">Email Address (Read Only)</label>
              <input className="input-field bg-slate-50 dark:bg-slate-800 cursor-not-allowed opacity-60" value={user.email} disabled />
            </div>
          </div>
          <div className="flex justify-end">
            <button disabled={loading} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all">
               {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
               Save Identity
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800/50">
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
             <KeyRound className="text-indigo-600" size={24}/> Security & Password
          </h2>
          <p className="text-sm text-slate-500 mt-1">Keep your account secure with a strong password</p>
        </div>
        <form onSubmit={handleUpdatePassword} className="p-8 space-y-6">
          {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">{error}</div>}
          {msg && <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-100">{msg}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="label-text">Current Password</label>
              <input type="password" required className="input-field" placeholder="Verify your current password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
            </div>
            <div>
              <label className="label-text">New Password</label>
              <input type="password" required className="input-field" placeholder="Minimum 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <div>
              <label className="label-text">Confirm New Password</label>
              <input type="password" required className="input-field" placeholder="Repeat new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <button disabled={passLoading} type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all">
               {passLoading ? <Loader2 className="animate-spin" size={18}/> : <Lock size={18}/>}
               Update Credentials
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
