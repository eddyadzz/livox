
import React, { useState, useMemo } from 'react';
import { Doc, Expense, DocumentType, Vendor } from '../types';
import { Download, Filter, Search, Calendar, Package, User, ChevronRight } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../constants';

interface ReportsViewProps {
  docs: Doc[];
  expenses: Expense[];
  vendors: Vendor[];
  currency: string;
}

type ReportTab = 'summary' | 'expense_analysis' | 'tax';

export const ReportsView: React.FC<ReportsViewProps> = ({ docs, expenses, vendors, currency }) => {
  const [reportType, setReportType] = useState<ReportTab>('summary');
  
  // Filters State
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedVendor, setSelectedVendor] = useState('ALL');

  // Basic Totals (Global)
  const totalRevenue = useMemo(() => docs.filter(d => d.type === DocumentType.INVOICE).reduce((sum, d) => sum + d.total, 0), [docs]);
  const totalExpenses = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  
  // Tax Calculations
  const totalTaxCollected = useMemo(() => docs.filter(d => d.type === DocumentType.INVOICE).reduce((sum, d) => sum + d.taxTotal, 0), [docs]);
  const totalTaxPaid = useMemo(() => expenses.reduce((sum, e) => sum + (e.taxAmount || 0), 0), [expenses]);

  // Advanced Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
        const matchesDate = (!dateStart || e.date >= dateStart) && (!dateEnd || e.date <= dateEnd);
        const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
        const matchesVendor = selectedVendor === 'ALL' || e.vendorId === selectedVendor;
        return matchesDate && matchesCategory && matchesVendor;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, dateStart, dateEnd, selectedCategory, selectedVendor]);

  const filteredExpenseTotal = useMemo(() => filteredExpenses.reduce((sum, e) => sum + e.amount, 0), [filteredExpenses]);

  const handleDownloadCSV = () => {
    let rows: string[][] = [];
    let filename = "report.csv";

    if (reportType === 'expense_analysis') {
        filename = "expense_analysis_report.csv";
        rows = [
            ['Date', 'Vendor', 'Category', 'Description', 'Amount', 'Tax Amount', 'Status'],
            ...filteredExpenses.map(e => [
                e.date,
                vendors.find(v => v.id === e.vendorId)?.name || 'N/A',
                e.category,
                e.description,
                e.amount.toFixed(2),
                (e.taxAmount || 0).toFixed(2),
                e.status
            ])
        ];
    } else {
        rows = [
            ['Type', 'Date', 'Description', 'Amount', 'Tax'],
            ...docs.filter(d => d.type === DocumentType.INVOICE).map(d => ['Invoice', d.date, d.clientName, d.total.toFixed(2), d.taxTotal.toFixed(2)]),
            ...expenses.map(e => ['Expense', e.date, e.description, (-e.amount).toFixed(2), (e.taxAmount || 0).toFixed(2)])
        ];
    }

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const SummaryCard = ({ title, value, colorClass }: any) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700 transition-all hover:shadow-md">
        <h4 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">{title}</h4>
        <p className={`text-2xl font-black ${colorClass || 'text-slate-900 dark:text-slate-100'}`}>
            {currency} {value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
    </div>
  );

  return (
    <div className="space-y-6 animate-slide-up">
        {/* Navigation & Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-2 rounded-2xl border border-slate-200/60 dark:border-slate-700 shadow-sm sticky top-0 z-20">
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full lg:w-auto">
                <button 
                  onClick={() => setReportType('summary')} 
                  className={`flex-1 lg:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${reportType === 'summary' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    Financial Summary
                </button>
                <button 
                  onClick={() => setReportType('expense_analysis')} 
                  className={`flex-1 lg:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${reportType === 'expense_analysis' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    Expense Analysis
                </button>
                <button 
                  onClick={() => setReportType('tax')} 
                  className={`flex-1 lg:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${reportType === 'tax' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    Tax Report
                </button>
            </div>
            <button 
              onClick={handleDownloadCSV} 
              className="w-full lg:w-auto flex items-center justify-center gap-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg"
            >
                <Download size={18} /> Export Data (CSV)
            </button>
        </div>

        {/* Filters for Expense Analysis */}
        {reportType === 'expense_analysis' && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
                <div>
                    <label className="label-text flex items-center gap-2"><Calendar size={12}/> Start Date</label>
                    <input type="date" className="input-field" value={dateStart} onChange={e => setDateStart(e.target.value)} />
                </div>
                <div>
                    <label className="label-text flex items-center gap-2"><Calendar size={12}/> End Date</label>
                    <input type="date" className="input-field" value={dateEnd} onChange={e => setDateEnd(e.target.value)} />
                </div>
                <div>
                    <label className="label-text flex items-center gap-2"><Package size={12}/> Category</label>
                    <select className="input-field" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                        <option value="ALL">All Categories</option>
                        {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className="label-text flex items-center gap-2"><User size={12}/> Vendor</label>
                    <select className="input-field" value={selectedVendor} onChange={e => setSelectedVendor(e.target.value)}>
                        <option value="ALL">All Vendors</option>
                        {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                </div>
            </div>
        )}

        {/* Global Summary Content */}
        {reportType === 'summary' && (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SummaryCard title="Total Revenue (All Time)" value={totalRevenue} colorClass="text-blue-600 dark:text-blue-400" />
                    <SummaryCard title="Total Expenses (All Time)" value={totalExpenses} colorClass="text-rose-600 dark:text-rose-400" />
                    <SummaryCard title="Net Profit (All Time)" value={totalRevenue - totalExpenses} colorClass={totalRevenue - totalExpenses >= 0 ? 'text-emerald-600' : 'text-rose-600'} />
                </div>
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700 text-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BarChart size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Detailed Financial Summary</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">This summary calculates your total business health based on all recorded Invoices and Expenses. Switch to Expense Analysis for detailed spend tracking.</p>
                </div>
            </div>
        )}

        {/* Expense Analysis Content */}
        {reportType === 'expense_analysis' && (
            <div className="space-y-6 animate-slide-up">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-xl shadow-blue-600/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Search size={80}/></div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Total Filtered Spend</h4>
                        <p className="text-4xl font-black">{currency} {filteredExpenseTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <p className="text-xs mt-4 font-medium opacity-80">{filteredExpenses.length} transactions match your current filters</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200/60 dark:border-slate-700 shadow-sm flex flex-col justify-center">
                         <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-2xl text-slate-600 dark:text-slate-300"><Filter size={24}/></div>
                            <div className="text-start">
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Filtered Analysis</h4>
                                <p className="text-xs text-slate-400">Showing expenses {dateStart || 'ever'} to {dateEnd || 'now'}</p>
                            </div>
                         </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Detailed Transaction Log</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/80 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Vendor</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4 text-end">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/50 dark:divide-slate-700/50">
                                {filteredExpenses.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No expenses match these filters.</td>
                                    </tr>
                                ) : (
                                    filteredExpenses.map(e => (
                                        <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-slate-500">{e.date}</td>
                                            <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">
                                                {vendors.find(v => v.id === e.vendorId)?.name || <span className="text-slate-300">N/A</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-lg uppercase tracking-tight">
                                                    {e.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 truncate max-w-[200px]">{e.description}</td>
                                            <td className="px-6 py-4 text-end font-black text-slate-900 dark:text-slate-100">
                                                {currency} {e.amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* Tax Report Content */}
        {reportType === 'tax' && (
            <div className="space-y-6 animate-slide-up">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SummaryCard title="Output Tax (Collected)" value={totalTaxCollected} colorClass="text-rose-600" />
                    <SummaryCard title="Input Tax (Paid)" value={totalTaxPaid} colorClass="text-emerald-600" />
                    <SummaryCard title="Net Tax Payable" value={totalTaxCollected - totalTaxPaid} colorClass="text-blue-600" />
                </div>
                
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700 text-start">
                    <h3 className="font-black text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                        <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                        Tax Reconciliation
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-4 border-b border-slate-50 dark:border-slate-700">
                            <span className="text-sm font-medium text-slate-500">Output Tax from Invoices</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{currency} {totalTaxCollected.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center py-4 border-b border-slate-50 dark:border-slate-700">
                            <span className="text-sm font-medium text-slate-500">Input Tax from Expenses</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">({currency} {totalTaxPaid.toFixed(2)})</span>
                        </div>
                        <div className="flex justify-between items-center py-6">
                            <span className="font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">Total Tax Liability</span>
                            <span className="text-2xl font-black text-blue-600">{currency} {(totalTaxCollected - totalTaxPaid).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

const BarChart = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
);
