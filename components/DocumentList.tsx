import React, { useState, useRef, useEffect } from 'react';
import { Plus, FileText, Trash2, ChevronDown } from 'lucide-react';
import { Doc, DocumentType } from '../types';

interface DocumentListProps {
  filteredDocs: Doc[];
  filterType: DocumentType | 'ALL';
  setFilterType: (type: DocumentType | 'ALL') => void;
  onCreateNew: (type: DocumentType) => void;
  onEdit: (doc: Doc) => void;
  onDelete: (id: string) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ 
  filteredDocs, filterType, setFilterType, onCreateNew, onEdit, onDelete 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700 overflow-hidden h-full flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center shrink-0">
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                <button onClick={() => setFilterType('ALL')} className={`px-5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${filterType === 'ALL' ? 'bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900 shadow-md' : 'bg-slate-100/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>All</button>
                {Object.values(DocumentType).map(t => (
                    <button key={t} onClick={() => setFilterType(t)} className={`px-5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${filterType === t ? 'bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900 shadow-md' : 'bg-slate-100/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>{t}s</button>
                ))}
            </div>
            
            <div className="relative" ref={dropdownRef}>
                <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                    <Plus size={16}/> Create New <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-10 overflow-hidden animate-slide-up">
                        {Object.values(DocumentType).map((type) => (
                            <button
                                key={type}
                                onClick={() => { onCreateNew(type); setIsDropdownOpen(false); }}
                                className="w-full text-left px-5 py-3.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-50 dark:border-slate-700 last:border-0 transition-colors"
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
        <div className="divide-y divide-slate-100/50 dark:divide-slate-700/50 overflow-y-auto flex-1 no-scrollbar">
                {filteredDocs.length === 0 && (
                    <div className="p-16 text-center text-slate-500 flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900/40 rounded-full flex items-center justify-center mb-6">
                          <FileText size={40} className="text-slate-200" />
                        </div>
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-lg">No documents found.</p>
                        <p className="text-sm text-slate-400 mt-1">Ready to scale? Create your first professional document now.</p>
                    </div>
                )}
                {filteredDocs.map(doc => (
                <div key={doc.id} className="p-5 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 flex flex-col sm:flex-row items-center justify-between group gap-4 transition-all border-l-4 border-transparent hover:border-blue-600">
                    <div className="flex items-center gap-4 cursor-pointer flex-1 w-full" onClick={() => onEdit(doc)}>
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm
                            ${doc.type === DocumentType.INVOICE ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                              doc.type === DocumentType.QUOTATION ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                              doc.type === DocumentType.DELIVERY_NOTE ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                              'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
                            <FileText size={20}/>
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                {doc.type} #{doc.number}
                                <span className={`text-[10px] px-2 py-0.5 rounded-lg font-black uppercase tracking-wider ${
                                    doc.status === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                    doc.status === 'Overdue' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                    doc.status === 'Sent' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                    'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                                }`}>
                                    {doc.status}
                                </span>
                            </p>
                            <p className="text-[13px] font-medium text-slate-400 mt-0.5">{doc.clientName || 'Unnamed Client'} • <span className="text-slate-300 font-normal">{doc.date}</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            {doc.type === DocumentType.DELIVERY_NOTE ? '-' : `${doc.currency} ${doc.total.toFixed(2)}`}
                        </span>
                        <div className="flex gap-1">
                          <button onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }} className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all">
                              <Trash2 size={18}/>
                          </button>
                        </div>
                    </div>
                </div>
                ))}
        </div>
    </div>
  );
};