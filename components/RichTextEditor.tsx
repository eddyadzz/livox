import React, { useEffect, useRef, useState } from 'react';
import { Bold, Italic, Underline, List } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, label, className }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync value to innerHTML when value changes externally
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== value) {
        // Simple check to prevent cursor jumping on every keystroke if parent updates prop
        // Only update if the content is drastically different or empty
        if (value === '' || !contentRef.current.innerHTML || value !== contentRef.current.innerHTML) {
             contentRef.current.innerHTML = value;
        }
    }
  }, [value]);

  const handleInput = () => {
    if (contentRef.current) {
      onChange(contentRef.current.innerHTML);
    }
  };

  const execCmd = (command: string) => {
    document.execCommand(command, false);
    if (contentRef.current) contentRef.current.focus();
  };

  return (
    <div className={`mb-4 ${className || ''}`}>
      {label && <label className="label-text mb-1 block">{label}</label>}
      <div className={`border rounded-lg overflow-hidden bg-white dark:bg-slate-800 transition-colors ${isFocused ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-300 dark:border-slate-600'}`}>
        <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <button onClick={() => execCmd('bold')} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300" type="button" title="Bold">
            <Bold size={16} />
          </button>
          <button onClick={() => execCmd('italic')} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300" type="button" title="Italic">
            <Italic size={16} />
          </button>
          <button onClick={() => execCmd('underline')} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300" type="button" title="Underline">
            <Underline size={16} />
          </button>
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
          <button onClick={() => execCmd('insertUnorderedList')} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300" type="button" title="Bullet List">
            <List size={16} />
          </button>
        </div>
        <div
          ref={contentRef}
          contentEditable
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="p-3 min-h-[120px] outline-none text-sm text-slate-800 dark:text-slate-200 prose prose-sm max-w-none dark:prose-invert"
          style={{ minHeight: '120px' }}
        />
      </div>
    </div>
  );
};
