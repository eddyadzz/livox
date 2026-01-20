import React, { useState } from 'react';
import { Lock, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { api } from '../services/apiService';

interface ResetPasswordViewProps {
  token: string;
  onSuccess: () => void;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({ token, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword(token, password);
      setSuccess(true);
      setTimeout(onSuccess, 2000);
    } catch (err: any) {
      setError(err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-8 text-center">
        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
            {success ? <CheckCircle size={24} /> : <Lock size={24} />}
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Reset Password</h1>
        
        {success ? (
             <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                Password updated successfully! Redirecting...
             </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left mt-6">
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
            
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <input type="password" required className="input-field w-full" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                <input type="password" required className="input-field w-full" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>

            <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4">
                {loading ? <Loader2 className="animate-spin" size={20}/> : <>Reset Password <ArrowRight size={18} /></>}
            </button>
            </form>
        )}
      </div>
    </div>
  );
};
