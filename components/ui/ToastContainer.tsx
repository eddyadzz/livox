import React from 'react';
import { CheckCircle, AlertCircle, Bell, X } from 'lucide-react';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: number) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => (
  <div className="fixed bottom-6 right-6 z-[70] flex flex-col gap-3">
    {toasts.map(toast => (
      <div key={toast.id} className={`min-w-[300px] p-4 rounded-lg shadow-lg flex items-center justify-between animate-slide-up ${toast.type === 'success' ? 'bg-green-600 text-white' : toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-800 dark:bg-slate-700 text-white'}`}>
        <div className="flex items-center gap-2">
           {toast.type === 'success' && <CheckCircle size={18} />}
           {toast.type === 'error' && <AlertCircle size={18} />}
           {toast.type === 'info' && <Bell size={18} />}
           <span className="text-sm font-medium">{toast.message}</span>
        </div>
        <button onClick={() => removeToast(toast.id)} className="opacity-70 hover:opacity-100 ms-4"><X size={16}/></button>
      </div>
    ))}
  </div>
);