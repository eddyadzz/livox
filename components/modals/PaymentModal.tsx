import React from 'react';
import { Modal } from '../ui/Modal';
import { PaymentRecord } from '../../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  paymentData: Partial<PaymentRecord>;
  setPaymentData: (data: Partial<PaymentRecord>) => void;
  onRecord: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, currency, paymentData, setPaymentData, onRecord }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Payment">
      <div className="space-y-4">
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center mb-4">
          <p className="text-sm text-slate-500">Amount Due</p>
          <p className="text-2xl font-bold">{currency} {paymentData.amount?.toFixed(2)}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Amount</label>
            <input 
              type="number" 
              className="input-field" 
              value={paymentData.amount || 0} 
              onChange={e => setPaymentData({...paymentData, amount: parseFloat(e.target.value)})} 
            />
          </div>
          <div>
            <label className="label-text">Date</label>
            <input 
              type="date" 
              className="input-field" 
              value={paymentData.date || ''} 
              onChange={e => setPaymentData({...paymentData, date: e.target.value})} 
            />
          </div>
        </div>
        <div>
          <label className="label-text">Method</label>
          <select 
            className="input-field" 
            value={paymentData.method || 'Bank Transfer'} 
            onChange={e => setPaymentData({...paymentData, method: e.target.value})}
          >
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Check">Check</option>
          </select>
        </div>
        <div>
          <label className="label-text">Notes</label>
          <textarea 
            className="input-field" 
            rows={2} 
            value={paymentData.notes || ''} 
            onChange={e => setPaymentData({...paymentData, notes: e.target.value})} 
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded-xl">Cancel</button>
          <button onClick={onRecord} className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold">Record Payment</button>
        </div>
      </div>
    </Modal>
  );
};
