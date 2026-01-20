import React from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailData: { to: string; subject: string; body: string };
  setEmailData: (data: { to: string; subject: string; body: string }) => void;
  onSend: () => void;
  sendingEmail: boolean;
}

export const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, emailData, setEmailData, onSend, sendingEmail }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Email Document">
      <div className="space-y-4">
        <div>
          <label className="label-text">To</label>
          <input 
            className="input-field" 
            value={emailData.to} 
            onChange={e => setEmailData({...emailData, to: e.target.value})} 
          />
        </div>
        <div>
          <label className="label-text">Subject</label>
          <input 
            className="input-field" 
            value={emailData.subject} 
            onChange={e => setEmailData({...emailData, subject: e.target.value})} 
          />
        </div>
        <div>
          <label className="label-text">Message</label>
          <textarea 
            className="input-field" 
            rows={8} 
            value={emailData.body} 
            onChange={e => setEmailData({...emailData, body: e.target.value})} 
          />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded-xl">Cancel</button>
          <button 
            onClick={onSend} 
            disabled={sendingEmail} 
            className="px-4 py-2 bg-blue-600 text-white rounded-xl flex items-center gap-2 font-bold"
          >
            {sendingEmail ? <Loader2 className="animate-spin" size={16}/> : 'Send Email'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
