import React from 'react';
import { Menu } from 'lucide-react';
import { StaffMember, Business, DocumentType } from '../types';
import { useTranslation } from '../context/LocaleContext';
import { TranslationKey } from '../locales/translations';

interface HeaderProps {
  view: string;
  currentUser: StaffMember;
  currentBusiness: Business;
  onMenuClick: () => void;
  onProfileClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ view, currentUser, currentBusiness, onMenuClick, onProfileClick }) => {
  const { t } = useTranslation();

  // Helper to map view name to translation key
  const getViewTitle = () => {
    const keyMap: Record<string, TranslationKey> = {
      dashboard: 'dashboard',
      docs: 'documents',
      customers: 'customers',
      products: 'products',
      expenses: 'expenses',
      vendors: 'vendors',
      reports: 'reports',
      profile: 'profile',
      businesses: 'businesses',
      users: 'users',
      settings: 'settings',
      editor: 'edit'
    };
    return t(keyMap[view] || (view as TranslationKey));
  };

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center shadow-sm z-10 no-print sticky top-0">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden text-slate-500 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
          <Menu size={20}/>
        </button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 capitalize truncate">
          {getViewTitle()}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={onProfileClick} className="flex items-center gap-3 hover:opacity-80 transition-opacity p-1 rounded-xl">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{currentBusiness.name}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold border border-blue-200/50 dark:border-blue-800/50 shadow-sm">
            {currentUser.name.charAt(0)}
          </div>
        </button>
      </div>
    </header>
  );
};