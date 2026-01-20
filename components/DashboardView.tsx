import React from 'react';
import { Doc, DocumentType, DocumentStatus, Expense } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import { useTranslation } from '../context/LocaleContext';

interface DashboardViewProps {
  docs: Doc[];
  expenses: Expense[];
  currency: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ docs, expenses, currency }) => {
  const { t } = useTranslation();

  // Calculations
  const totalInvoiced = docs
    .filter(d => d.type === DocumentType.INVOICE)
    .reduce((sum, d) => sum + d.total, 0);

  const totalPaid = docs
    .filter(d => d.type === DocumentType.INVOICE)
    .reduce((sum, d) => {
        const paidAmount = d.payments?.reduce((pSum, p) => pSum + p.amount, 0) || 0;
        return sum + paidAmount;
    }, 0);

  const totalOutstanding = totalInvoiced - totalPaid;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalInvoiced - totalExpenses;

  const StatCard = ({ title, value, icon: Icon, colorClass, subValue }: any) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <div className="text-start">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{currency} {value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>
            <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 text-opacity-100 shadow-sm`}>
                <Icon size={24} />
            </div>
        </div>
        {subValue && <p className="text-xs text-slate-400 text-start font-medium">{subValue}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title={t('total_invoiced')} value={totalInvoiced} icon={DollarSign} colorClass="bg-blue-100 text-blue-600" />
            <StatCard title={t('total_received')} value={totalPaid} icon={TrendingUp} colorClass="bg-green-100 text-green-600" />
            <StatCard title={t('outstanding')} value={totalOutstanding} icon={Wallet} colorClass="bg-amber-100 text-amber-600" />
            <StatCard title={t('total_expenses')} value={totalExpenses} icon={TrendingDown} colorClass="bg-rose-100 text-rose-600" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700 text-start flex flex-col justify-center">
                <h3 className="font-bold text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider mb-6">{t('net_profit')}</h3>
                <div className="flex items-center gap-4">
                     <span className={`text-5xl font-black ${netProfit >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                        {currency} {netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                     </span>
                </div>
                <div className="flex items-center gap-2 mt-4 text-slate-400">
                  <div className={`w-2 h-2 rounded-full ${netProfit >= 0 ? 'bg-green-500' : 'bg-rose-500'}`}></div>
                  <p className="text-sm font-medium">{t('revenue_vs_expenses')}</p>
                </div>
             </div>
        </div>
    </div>
  );
};