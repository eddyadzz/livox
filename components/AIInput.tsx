import React, { useState } from 'react';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';

interface AIInputProps {
  onGenerate: (text: string) => Promise<void>;
  placeholder: string;
  buttonLabel?: string;
}

export const AIInput: React.FC<AIInputProps> = ({ onGenerate, placeholder, buttonLabel = "Generate" }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    await onGenerate(input);
    setLoading(false);
    setInput('');
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-white dark:from-indigo-950/20 dark:via-blue-950/10 dark:to-transparent p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 mb-8 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
          <Sparkles size={18} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300">AI Assistant</h4>
          <p className="text-[10px] text-indigo-500 uppercase tracking-widest font-bold">Draft items instantly</p>
        </div>
      </div>
      <textarea
        className="input-field min-h-[100px] mb-3 resize-none border-indigo-200 focus:ring-indigo-500/10 dark:border-indigo-900/40"
        rows={3}
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="flex justify-end">
        <button
          onClick={handleGenerate}
          disabled={loading || !input.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
          {buttonLabel}
        </button>
      </div>
    </div>
  );
};