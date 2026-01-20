import React from 'react';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmConfig {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

interface ConfirmationModalProps {
  config: ConfirmConfig | null;
  onClose: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ config, onClose }) => {
    if (!config || !config.isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 transform scale-100 transition-all">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{config.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">{config.message}</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                        <button onClick={() => { config.onConfirm(); onClose(); }} className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all transform hover:scale-105">Confirm</button>
                    </div>
                </div>
            </div>
        </div>
    );
};