import React from 'react';
import { Business } from '../../types';
import { Modal } from '../ui/Modal';

interface BusinessSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  businesses: Business[];
  currentBusinessId: string;
  onSwitch: (id: string) => void;
  onManage: () => void;
}

export const BusinessSwitchModal: React.FC<BusinessSwitchModalProps> = ({ isOpen, onClose, businesses, currentBusinessId, onSwitch, onManage }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Switch Business">
      <div className="space-y-2">
        {businesses.map(b => (
          <button 
            key={b.id} 
            onClick={() => { onSwitch(b.id); onClose(); }} 
            className={`block w-full text-left p-3 rounded-xl transition-colors ${b.id === currentBusinessId ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            {b.name}
          </button>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t">
        <button 
          onClick={() => { onManage(); onClose(); }} 
          className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl font-bold"
        >
          Manage All Businesses
        </button>
      </div>
    </Modal>
  );
};
