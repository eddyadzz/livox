
import React from 'react';
import { 
  LayoutDashboard, FileText, Users, Package, Receipt, Store, 
  BarChart, Settings, X, Building2, ChevronRight, Lock, UserCog, LogOut, User, Sun, Moon
} from 'lucide-react';
import { Business, StaffMember } from '../types';
import { useTranslation } from '../context/LocaleContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  view: string;
  navigateTo: (view: string) => void;
  currentUser: StaffMember;
  currentBusiness?: Business;
  onOpenBusinessModal: () => void;
  onLogout: () => void;
  // Added theme and setTheme to fix TS error in App.tsx
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick, disabled, restricted }: any) => (
  <button onClick={disabled ? undefined : onClick} className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${active ? 'bg-blue-50/80 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-e-4 border-blue-600 dark:border-blue-400 shadow-sm' : disabled ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'}`}>
    <div className="flex items-center gap-3"><Icon size={18} />{label}</div>
    {restricted && <Lock size={14} className="text-slate-300 dark:text-slate-600"/>}
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, view, navigateTo, currentUser, currentBusiness, onOpenBusinessModal, onLogout, theme, setTheme }) => {
  const { t } = useTranslation();

  return (
    <aside className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 border-e border-slate-200 dark:border-slate-800 flex flex-col z-30 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-blue-600/20">B</div>
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">BizDocs AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400"><X size={20}/></button>
        </div>
        
        <div className="p-4 border-b border-slate-50 dark:border-slate-800">
            <button onClick={onOpenBusinessModal} className="w-full flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl border border-slate-200/60 dark:border-slate-700 transition-colors text-start shadow-sm">
                <div className="flex items-center gap-2 overflow-hidden">
                    <Building2 size={16} className="text-slate-400 dark:text-slate-400 flex-shrink-0" />
                    <span className="font-semibold text-sm truncate text-slate-700 dark:text-slate-200">{currentBusiness?.name}</span>
                </div>
                <ChevronRight size={14} className="text-slate-300 rtl:rotate-180" />
            </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 overflow-y-auto no-scrollbar">
            <SidebarItem icon={LayoutDashboard} label={t('dashboard')} active={view === 'dashboard'} onClick={() => navigateTo('dashboard')} />
            <SidebarItem icon={FileText} label={t('documents')} active={view === 'docs'} onClick={() => navigateTo('docs')} />
            <SidebarItem icon={Users} label={t('customers')} active={view === 'customers'} onClick={() => navigateTo('customers')} />
            <SidebarItem icon={Package} label={t('products')} active={view === 'products'} onClick={() => navigateTo('products')} />
            <SidebarItem icon={Receipt} label={t('expenses')} active={view === 'expenses'} onClick={() => navigateTo('expenses')} />
            <SidebarItem icon={Store} label={t('vendors')} active={view === 'vendors'} onClick={() => navigateTo('vendors')} />
            <SidebarItem icon={BarChart} label={t('reports')} active={view === 'reports'} onClick={() => navigateTo('reports')} />
            
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <SidebarItem icon={User} label={t('profile')} active={view === 'profile'} onClick={() => navigateTo('profile')} />
                
                {currentUser.role === 'Admin' && (
                    <>
                        <SidebarItem icon={Building2} label={t('businesses')} active={view === 'businesses'} onClick={() => navigateTo('businesses')} />
                        <SidebarItem icon={UserCog} label={t('users')} active={view === 'users'} onClick={() => navigateTo('users')} />
                        <SidebarItem icon={Settings} label={t('settings')} active={view === 'settings'} onClick={() => navigateTo('settings')} />
                    </>
                )}
                
                <div className="px-4 py-3 border-t border-slate-50 dark:border-slate-800/50 mt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Theme</span>
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button 
                      onClick={() => setTheme('light')} 
                      className={`p-1.5 rounded transition-all ${theme === 'light' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                      title="Light Mode"
                    >
                      <Sun size={14}/>
                    </button>
                    <button 
                      onClick={() => setTheme('dark')} 
                      className={`p-1.5 rounded transition-all ${theme === 'dark' ? 'bg-slate-700 shadow-sm text-blue-400' : 'text-slate-400 hover:text-slate-300'}`}
                      title="Dark Mode"
                    >
                      <Moon size={14}/>
                    </button>
                  </div>
                </div>

                <button onClick={onLogout} className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 dark:text-red-400 mt-2">
                    <div className="flex items-center gap-3"><LogOut size={18} />{t('logout')}</div>
                </button>
            </div>
        </nav>
    </aside>
  );
};
