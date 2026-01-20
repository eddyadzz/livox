import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Loader2, ArrowLeft, Building2 } from 'lucide-react';
import { api } from '../services/apiService';

interface AuthViewProps {
  onLogin: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [viewState, setViewState] = useState<'login' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      if (viewState === 'login') {
        await api.login(email, password);
        onLogin();
      } else if (viewState === 'forgot') {
        const res = await api.forgotPassword(email);
        setInfo(res.message || 'If an account exists, a reset link has been sent.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
      if (viewState === 'forgot') {
          return (
              <>
                 <div className="group">
                    <label className="label-text">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input type="email" required className="input-field pl-11" placeholder="you@business.com" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                </div>
                <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-6">
                    {loading ? <Loader2 className="animate-spin" size={20}/> : 'Send Reset Link'}
                </button>
                <div className="text-center mt-6">
                    <button type="button" onClick={() => { setViewState('login'); setError(''); setInfo(''); }} className="text-sm font-semibold text-slate-500 hover:text-blue-600 flex items-center justify-center gap-2 mx-auto transition-colors">
                        <ArrowLeft size={16} /> Back to Sign In
                    </button>
                </div>
              </>
          );
      }

      return (
        <>
          <div className="group">
            <label className="label-text">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input type="email" required className="input-field pl-11" placeholder="you@business.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
          
          <div className="group">
            <div className="flex justify-between items-center mb-1">
                <label className="label-text">Password</label>
                {viewState === 'login' && <button type="button" onClick={() => setViewState('forgot')} className="text-[10px] font-bold text-blue-600 uppercase tracking-wider hover:underline">Forgot Password?</button>}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input type="password" required className="input-field pl-11" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4">
            {loading ? <Loader2 className="animate-spin" size={20}/> : <>{'Sign In'} <ArrowRight size={20} /></>}
          </button>
        </>
      );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-indigo-100/50 dark:from-blue-900/20 dark:to-indigo-900/20 pointer-events-none"></div>
      
      <div className="w-full max-w-md relative animate-slide-up">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-10 pb-6 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-6 shadow-xl shadow-blue-600/30">B</div>
              <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                  {viewState === 'login' ? 'BizDocs AI' : 'Account Recovery'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                  {viewState === 'login' ? 'The all-in-one business documentation tool' : 'Enter your email to reset your secure password'}
              </p>
          </div>
          
          <form onSubmit={handleSubmit} className="px-10 pb-10 space-y-5">
            {error && <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl border border-red-100 dark:border-red-900/30">{error}</div>}
            {info && <div className="p-4 bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 text-sm font-semibold rounded-xl border border-blue-100 dark:border-blue-900/30">{info}</div>}
            
            {renderForm()}
          </form>
          
          <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-center items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
             <Building2 size={12}/> Secure Business Document Management
          </div>
        </div>
      </div>
    </div>
  );
};