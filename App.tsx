
import React, { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { Business, Doc, DocumentType, Customer, StaffMember, Product, Expense, Vendor, PaymentRecord } from './types';
import { DEFAULT_BUSINESS } from './constants';
import { parseInvoiceItemsFromText, draftDocumentEmail, translateToDhivehi } from './services/geminiService';
import { api, sendEmailViaBackend } from './services/apiService';
import { generatePdfBlob, downloadPdf } from './utils/pdfUtils';
import { createNewDoc, calculateDocTotals, calculateDocStatus, convertDoc } from './utils/docUtils';
import { generateEmailHtml } from './utils/emailTemplate';

// UI Components
import { ConfirmationModal, ConfirmConfig } from './components/ui/ConfirmationModal';
import { ToastContainer, ToastMessage } from './components/ui/ToastContainer';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Layout & Feature Components
import { AuthView } from './components/AuthView';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DocumentEditor } from './components/DocumentEditor';
import { SettingsPanel } from './components/SettingsPanel';
import { DocumentList } from './components/DocumentList';
import { DashboardView } from './components/DashboardView';
import { ResetPasswordView } from './components/ResetPasswordView';
import { ProfileView } from './components/ProfileView';
import { BusinessManagement } from './components/BusinessManagement';

// New Feature Components
import { CustomerList } from './components/CustomerList';
import { VendorList } from './components/VendorList';
import { ProductList } from './components/ProductList';
import { ExpenseList } from './components/ExpenseList';
import { ReportsView } from './components/ReportsView';
import { UserManagement } from './components/UserManagement';

// Extracted Modals
import { BusinessSwitchModal } from './components/modals/BusinessSwitchModal';
import { PaymentModal } from './components/modals/PaymentModal';
import { EmailModal } from './components/modals/EmailModal';

// Localization
import { LocaleProvider } from './context/LocaleContext';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentBusinessId, setCurrentBusinessId] = useState<string>('');
  
  // Feature State
  const [docs, setDocs] = useState<Doc[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  
  // UI States
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [view, setView] = useState('dashboard');
  const [filterType, setFilterType] = useState<DocumentType | 'ALL'>('ALL');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Doc | null>(null);
  
  // Modals
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<Partial<PaymentRecord>>({});
  const [emailData, setEmailData] = useState({ to: '', subject: '', body: '' });

  const refreshData = async () => {
      setLoading(true);
      try {
        const data = await api.fetchBootstrap();
        if (data.length > 0) {
            setBusinesses(data);
            if (!currentBusinessId || !data.find(b => b.id === currentBusinessId)) {
                setCurrentBusinessId(data[0].id);
            }
            setCustomers(data.flatMap(b => b.customers || []));
            setVendors(data.flatMap(b => b.vendors || []));
            setProducts(data.flatMap(b => b.products || []));
            setExpenses(data.flatMap(b => b.expenses || []));
            setStaff(data.flatMap(b => b.staff || []));
            setDocs(data.flatMap(b => b.docs || []));
            
            try {
              const tokenUser = JSON.parse(atob(localStorage.getItem('token')?.split('.')[1] || '{}'));
              if (tokenUser.id) {
                  const currentMember = data.flatMap(b => b.staff || []).find(s => s.id === tokenUser.id || s.email === tokenUser.email);
                  if (currentMember) setCurrentUserId(currentMember.id);
              }
            } catch (e) {
               handleLogout();
            }
        }
      } catch (e) {
        handleLogout();
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
     const urlParams = new URLSearchParams(window.location.search);
     const token = urlParams.get('resetToken');
     if (token) {
         setResetToken(token);
         setLoading(false);
         return;
     }

     const storedToken = localStorage.getItem('token');
     if (storedToken) {
         setIsAuthenticated(true);
         refreshData();
     } else {
         setLoading(false);
     }
  }, []);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  }, []);

  const currentBusiness = useMemo(() => businesses.find(b => b.id === currentBusinessId) || businesses[0] || DEFAULT_BUSINESS, [businesses, currentBusinessId]);
  const currentUser = useMemo<StaffMember>(() => staff.find(s => s.id === currentUserId) || { role: 'Viewer' as const, name: 'Guest', id: 'guest', email: '', businessId: '' }, [staff, currentUserId]);
  
  const filteredCustomers = useMemo(() => customers.filter(c => c.businessId === currentBusinessId), [customers, currentBusinessId]);
  const filteredProducts = useMemo(() => products.filter(p => p.businessId === currentBusinessId), [products, currentBusinessId]);
  const filteredExpenses = useMemo(() => expenses.filter(e => e.businessId === currentBusinessId), [expenses, currentBusinessId]);
  const filteredVendors = useMemo(() => vendors.filter(v => v.businessId === currentBusinessId), [vendors, currentBusinessId]);
  
  const filteredDocs = useMemo(() => {
    let d = docs.filter(doc => doc.businessId === currentBusinessId);
    if (filterType !== 'ALL') d = d.filter(doc => doc.type === filterType);
    return d.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [docs, currentBusinessId, filterType]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };
  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));
  const confirmAction = (title: string, message: string, onConfirm: () => void) => setConfirmConfig({ isOpen: true, title, message, onConfirm });
  const navigateTo = (newView: string) => { setView(newView); setIsSidebarOpen(false); };
  
  const handleLoginSuccess = () => { setIsAuthenticated(true); refreshData(); };
  const handleLogout = () => { localStorage.removeItem('token'); setIsAuthenticated(false); setBusinesses([]); };

  const handleCreateBusiness = async (data: any) => {
    try {
       await api.createBusiness(data);
       showToast('New business created', 'success');
       refreshData();
    } catch(e) { showToast('Failed to create business', 'error'); }
  };

  const handleCreateNewDoc = (type: DocumentType) => {
    const newDoc = createNewDoc(type, currentBusinessId, currentBusiness.settings);
    setEditingDoc(newDoc);
    setView('editor');
  };

  const handleSaveDoc = async (doc: Doc) => {
    if (!doc.clientName) { showToast('Client Name required', 'error'); return; }
    const docWithTotals = calculateDocTotals(doc, currentBusiness.settings.taxRate);
    const finalDoc = { ...docWithTotals, status: calculateDocStatus(docWithTotals) };
    try {
        await api.saveDoc(finalDoc);
        showToast(`${finalDoc.type} saved!`, 'success');
        setView('docs');
        refreshData(); 
    } catch (e: any) { 
        showToast(e.message || 'Failed to save document', 'error'); 
        console.error("Save Doc Error:", e);
    }
  };

  const handleDeleteDoc = async (id: string) => {
      confirmAction("Delete Document?", "This action cannot be undone.", async () => {
          try {
              await api.deleteDoc(id);
              showToast('Document deleted', 'info');
              refreshData();
          } catch(e) { showToast('Delete failed', 'error'); }
      });
  };

  const openPaymentModal = () => {
      if (!editingDoc) return;
      const totalPaid = editingDoc.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      setPaymentData({ amount: parseFloat((editingDoc.total - totalPaid).toFixed(2)), date: new Date().toISOString().split('T')[0], method: 'Bank Transfer' });
      setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = async () => {
      if (!editingDoc || !paymentData.amount) return;
      try {
          await api.recordPayment(editingDoc.id, paymentData.amount, paymentData.date!, paymentData.method!, paymentData.notes);
          setIsPaymentModalOpen(false);
          showToast('Payment Recorded', 'success');
          refreshData();
          setView('docs');
      } catch (e) { showToast('Failed to record payment', 'error'); }
  };

  const openEmailModal = async () => {
      if (!editingDoc) return;
      setIsEmailModalOpen(true);
      
      const subject = `${currentBusiness.name} ${editingDoc.type} ${editingDoc.number}`;
      const defaultBody = `Dear ${editingDoc.clientName},\n\nPlease find the ${editingDoc.type} ${editingDoc.number} from ${currentBusiness.name} attached for your review.\n\nBest regards,\n${currentBusiness.name}`;

      setEmailData({ 
          to: editingDoc.clientEmail || '', 
          subject: subject, 
          body: defaultBody
      });

      try {
          const draft = await draftDocumentEmail(editingDoc.type, editingDoc.number, editingDoc.clientName, `${editingDoc.currency} ${editingDoc.total.toFixed(2)}`, currentBusiness.name);
          if (draft) {
              setEmailData(prev => ({ 
                  ...prev, 
                  body: draft.body || prev.body,
                  subject: draft.subject || prev.subject
              }));
          }
      } catch (e) { 
          console.error("AI Email drafting failed, using manual format:", e);
      }
  };

  const handleSendEmail = async () => {
      setSendingEmail(true); setGeneratingPdf(true);
      try {
          let attachments: any[] = [];
          if (editingDoc) {
             await new Promise(r => setTimeout(r, 300));
             const base64Content = await generatePdfBlob(`${editingDoc.type}_${editingDoc.number}.pdf`);
             if (base64Content) attachments.push({ filename: `${editingDoc.type}_${editingDoc.number}.pdf`, content: base64Content, encoding: 'base64' });
          }
          
          // Wrap the drafted text in the professional HTML template
          const richHtml = generateEmailHtml(emailData.body, currentBusiness, editingDoc || undefined);
          
          await sendEmailViaBackend(emailData.to, emailData.subject, richHtml, attachments);
          showToast('Email Sent', 'success');
          setIsEmailModalOpen(false);
      } catch (e: any) { 
          showToast(e.message || 'Failed to send email', 'error'); 
      } finally { setSendingEmail(false); setGeneratingPdf(false); }
  };

  const handleDownloadPDF = async () => {
      if(!editingDoc) return;
      setGeneratingPdf(true);
      try {
          await new Promise(r => setTimeout(r, 300));
          await downloadPdf(`${editingDoc.type}_${editingDoc.number}.pdf`);
          showToast('PDF Downloaded', 'success');
      } catch (e) { showToast('Failed to generate PDF', 'error'); } finally { setGeneratingPdf(false); }
  };

  const handleSaveCustomer = async (c: Customer) => { await api.saveCustomer(c); refreshData(); showToast('Saved Customer'); };
  const handleDeleteCustomer = async (id: string) => { await api.deleteCustomer(id); refreshData(); showToast('Deleted Customer'); };
  const handleSaveVendor = async (v: Vendor) => { await api.saveVendor(v); refreshData(); showToast('Saved Vendor'); };
  const handleDeleteVendor = async (id: string) => { await api.deleteVendor(id); refreshData(); showToast('Deleted Vendor'); };
  const handleSaveProduct = async (p: Product) => { await api.saveProduct(p); refreshData(); showToast('Saved Product'); };
  const handleDeleteProduct = async (id: string) => { await api.deleteProduct(id); refreshData(); showToast('Deleted Product'); };
  const handleSaveExpense = async (e: Expense) => { await api.saveExpense(e); refreshData(); showToast('Saved Expense'); };
  const handleDeleteExpense = async (id: string) => { await api.deleteExpense(id); refreshData(); showToast('Deleted Expense'); };
  
  const handleConvert = async (doc: Doc, targetType: DocumentType) => { 
      const converted = convertDoc(doc, targetType, currentBusiness.settings);
      setEditingDoc(converted); 
      showToast(`Converted to ${targetType}`, 'info'); 
  };

  const handleAiGenerate = async (text: string) => {
      if (!editingDoc) return;
      try {
          const result = await parseInvoiceItemsFromText(text);
          if (result?.items) {
             const newItems = result.items.map((i: any, idx: number) => ({ id: `ai_${Date.now()}_${idx}`, description: i.description, quantity: i.quantity, rate: i.rate, amount: i.quantity * i.rate }));
             setEditingDoc({ ...editingDoc, items: [...editingDoc.items, ...newItems] });
             showToast('Items drafted', 'success');
          }
      } catch (e) { showToast('AI drafting failed', 'error'); }
  };

  const handleTranslate = async (text: string): Promise<string> => {
      const translated = await translateToDhivehi(text);
      if (translated) { showToast('Translated', 'success'); return translated; }
      return text;
  };

  if (resetToken) return <ResetPasswordView token={resetToken} onSuccess={() => { window.location.href = '/'; }} />;
  if (!isAuthenticated) return <AuthView onLogin={handleLoginSuccess} />;
  if (loading) return <div className="h-screen flex items-center justify-center text-slate-500 gap-2"><Loader2 className="animate-spin" /> Loading BizDocs AI...</div>;

  return (
    <ErrorBoundary>
      <LocaleProvider>
        <div className="flex h-screen bg-slate-100 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 overflow-hidden relative">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <ConfirmationModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />
        {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
        
        {generatingPdf && (
            <div className="fixed inset-0 bg-slate-900/90 z-50 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                <Loader2 size={48} className="animate-spin mb-4 text-blue-400" />
                <p className="text-xl font-medium">Preparing Document...</p>
            </div>
        )}

        <Sidebar 
            isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} view={view} navigateTo={navigateTo} currentUser={currentUser} currentBusiness={currentBusiness}
            onOpenBusinessModal={() => setIsBusinessModalOpen(true)} onLogout={handleLogout}
            theme={theme} setTheme={setTheme}
        />

        <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
            <Header 
              view={view} 
              currentUser={currentUser} 
              currentBusiness={currentBusiness} 
              onMenuClick={() => setIsSidebarOpen(true)} 
              onProfileClick={() => setView('profile')}
            />

            <div className="flex-1 overflow-auto p-4 md:p-8">
                {view === 'dashboard' && <DashboardView docs={filteredDocs} expenses={filteredExpenses} currency={currentBusiness.settings.currency} />}
                {view === 'docs' && <DocumentList filteredDocs={filteredDocs} filterType={filterType} setFilterType={setFilterType} onCreateNew={handleCreateNewDoc} onEdit={(doc) => { setEditingDoc(doc); setView('editor'); }} onDelete={handleDeleteDoc} />}
                {view === 'editor' && editingDoc && <DocumentEditor doc={editingDoc} onUpdate={(u: any) => setEditingDoc(p => p ? { ...p, ...u } : null)} onSave={handleSaveDoc} onPayment={openPaymentModal} business={currentBusiness} customers={filteredCustomers} products={filteredProducts} onConvert={handleConvert} onAiGenerate={handleAiGenerate} onDownload={handleDownloadPDF} onEmail={openEmailModal} isGenerating={generatingPdf} onTranslate={handleTranslate} />}
                {view === 'customers' && <CustomerList customers={filteredCustomers} onSave={handleSaveCustomer} onDelete={handleDeleteCustomer} businessId={currentBusinessId} />}
                {view === 'products' && <ProductList products={filteredProducts} onSave={handleSaveProduct} onDelete={handleDeleteProduct} businessId={currentBusinessId} currency={currentBusiness.settings.currency} />}
                {view === 'vendors' && <VendorList vendors={filteredVendors} onSave={handleSaveVendor} onDelete={handleDeleteVendor} businessId={currentBusinessId} />}
                {view === 'expenses' && <ExpenseList expenses={filteredExpenses} vendors={filteredVendors} onSave={handleSaveExpense} onDelete={handleDeleteExpense} businessId={currentBusinessId} currency={currentBusiness.settings.currency} />}
                {view === 'reports' && <ReportsView docs={filteredDocs} expenses={filteredExpenses} vendors={filteredVendors} currency={currentBusiness.settings.currency} />}
                {view === 'users' && <UserManagement currentUser={currentUser} businessId={currentBusinessId} />}
                {view === 'settings' && <SettingsPanel business={currentBusiness} onUpdate={(updated: Business) => api.updateBusiness(updated).then(() => { showToast('Saved'); setBusinesses(prev => prev.map(b => b.id === updated.id ? updated : b)); })} onSave={() => {}} />}
                {view === 'profile' && <ProfileView user={currentUser} onUpdate={() => { refreshData(); showToast('Profile Updated', 'success'); }} />}
                {view === 'businesses' && <BusinessManagement businesses={businesses} onCreate={handleCreateBusiness} onSwitch={(id) => setCurrentBusinessId(id)} currentBusinessId={currentBusinessId} />}
            </div>
        </main>
        
        <BusinessSwitchModal 
          isOpen={isBusinessModalOpen} 
          onClose={() => setIsBusinessModalOpen(false)} 
          businesses={businesses} 
          currentBusinessId={currentBusinessId} 
          onSwitch={(id) => setCurrentBusinessId(id)}
          onManage={() => setView('businesses')}
        />

        <PaymentModal 
          isOpen={isPaymentModalOpen} 
          onClose={() => setIsPaymentModalOpen(false)} 
          currency={currentBusiness.settings.currency} 
          paymentData={paymentData} 
          setPaymentData={setPaymentData} 
          onRecord={handleRecordPayment}
        />

        <EmailModal 
          isOpen={isEmailModalOpen} 
          onClose={() => setIsEmailModalOpen(false)} 
          emailData={emailData} 
          setEmailData={setEmailData} 
          onSend={handleSendEmail} 
          sendingEmail={sendingEmail}
        />

        </div>
      </LocaleProvider>
    </ErrorBoundary>
  );
};

export default App;
