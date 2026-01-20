
import React from 'react';
import { Doc, Business, DocumentType, DocumentStatus } from '../types';

interface DocumentPreviewProps {
  doc: Doc;
  business: Business;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ doc, business }) => {
  const { settings } = business;
  const isPaid = doc.status === DocumentStatus.PAID;
  const isPartial = doc.status === DocumentStatus.PARTIALLY_PAID;
  const isDeliveryNote = doc.type === DocumentType.DELIVERY_NOTE;
  const template = settings.template || 'classic';

  // Alignment Helpers
  const logoAlign = settings.logoAlignment || 'left';
  const sealAlign = settings.sealAlignment || 'right';

  // Calculations
  const totalPaid = doc.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const balanceDue = doc.total - totalPaid;

  // Helper to detect if string contains HTML tags
  const isHTML = (str?: string) => /<[a-z][\s\S]*>/i.test(str || '');

  const renderRichText = (text?: string, className?: string) => {
    if (!text) return null;
    if (isHTML(text)) {
      return <div className={`prose prose-sm max-w-none dark:prose-invert text-slate-600 ${className || ''}`} dangerouslySetInnerHTML={{ __html: text }} />;
    }
    return <p className={`whitespace-pre-wrap ${className || ''}`}>{text}</p>;
  };

  // --- Shared Sub-Components ---

  const PaidStamp = () => {
    if (!isPaid && !isPartial) return null;
    return (
      <div className={`absolute right-4 top-[-1rem] opacity-90 pointer-events-none z-10 transform rotate-12 mix-blend-multiply`}>
          {settings.paidStampUrl ? (
            <img src={settings.paidStampUrl} alt="PAID" className="w-32 h-32 object-contain" />
          ) : (
            <div className={`border-4 ${isPaid ? 'border-green-600 text-green-600' : 'border-orange-500 text-orange-500'} font-black text-2xl px-4 py-2 uppercase rounded-lg opacity-80 shadow-sm bg-white/50 backdrop-blur-sm`}>
              {isPaid ? 'PAID' : 'PARTIAL'}
            </div>
          )}
      </div>
    );
  };

  const OfficialSeal = () => {
    if (!settings.sealUrl) return null;
    const justifyClass = sealAlign === 'left' ? 'justify-start' : sealAlign === 'center' ? 'justify-center' : 'justify-end';
    
    return (
      <div className={`flex w-full mt-8 mb-4 ${justifyClass} break-inside-avoid`}>
         <div className="text-center">
            <img src={settings.sealUrl} alt="Seal" className="w-32 h-32 object-contain" />
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">Official Seal</p>
         </div>
      </div>
    );
  };

  const DeliverySignature = () => (
    isDeliveryNote && (
        <div className="mt-16 mb-8 pt-4 flex justify-between break-inside-avoid gap-12">
            <div className="w-5/12">
                <p className="mb-2 border-b-2 border-slate-300 h-8"></p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 text-start">Received By (Signature)</p>
            </div>
            <div className="w-4/12">
                <p className="mb-2 border-b-2 border-slate-300 h-8"></p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 text-start">Date</p>
            </div>
        </div>
    )
  );

  const PaymentsSection = () => {
    if (!doc.payments || doc.payments.length === 0 || doc.type !== DocumentType.INVOICE) return null;
    return (
      <div className="mt-8 mb-8 break-inside-avoid bg-slate-50 rounded-lg p-4 border border-slate-100">
         <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-2">Payments Received</h4>
         <table className="w-full text-sm">
           <tbody>
             {doc.payments.map((p) => (
               <tr key={p.id} className="border-b border-slate-100 last:border-0">
                 <td className="py-2 text-slate-600">{p.date}</td>
                 <td className="py-2 text-slate-600">{p.method}</td>
                 <td className="py-2 text-end font-mono text-slate-700">{doc.currency} {p.amount.toFixed(2)}</td>
               </tr>
             ))}
             <tr>
               <td colSpan={2} className="py-3 text-end font-bold text-slate-700 pt-4">Total Paid</td>
               <td className="py-3 text-end font-bold font-mono text-slate-700 pt-4">{doc.currency} {totalPaid.toFixed(2)}</td>
             </tr>
             {balanceDue > 0 && (
                <tr>
                  <td colSpan={2} className="py-1 text-end font-bold text-red-600 uppercase text-xs tracking-wider">Balance Due</td>
                  <td className="py-1 text-end font-bold font-mono text-red-600">{doc.currency} {balanceDue.toFixed(2)}</td>
                </tr>
             )}
           </tbody>
         </table>
      </div>
    );
  };

  const TermsSection = () => {
      if (!doc.terms) return null;
      return (
        <div className="mt-8 border-t border-slate-100 pt-4 text-sm break-inside-avoid">
           <h4 className="font-bold text-slate-700 mb-2 text-xs uppercase tracking-wider">Terms & Conditions</h4>
           {renderRichText(doc.terms, "text-slate-500 text-xs leading-relaxed")}
        </div>
      );
  };

  // Common wrapper style for A4 PDF consistency
  const containerStyle = { 
    width: '794px', 
    minHeight: '1123px', 
    margin: '0 auto',
    backgroundColor: '#ffffff',
    color: '#1e293b',
  };

  const renderClassic = () => (
    <div id="printable-area" dir="ltr" className={`p-12 shadow-lg flex flex-col bg-white text-slate-800`} style={containerStyle}>
      {/* Header */}
      {logoAlign === 'center' ? (
         <div className="flex flex-col items-center text-center mb-12">
             {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="h-24 object-contain mb-4" />}
             {!settings.logoUrl && <h1 className="text-3xl font-bold text-slate-900 mb-2">{business.name}</h1>}
             <p className="whitespace-pre-line text-sm text-slate-500">{business.address}</p>
             <p className="text-sm text-slate-500">{business.email} • {business.phone}</p>
             {settings.tin && <p className="text-sm text-slate-500">TIN: {settings.tin}</p>}
             
             <div className="mt-8 border-t-2 border-slate-100 pt-6 w-full flex justify-between items-center px-4">
                <h2 className="text-4xl font-light text-slate-400 uppercase tracking-widest">{doc.type}</h2>
                <div className="text-end">
                    <p className="text-slate-900 font-bold"># {doc.number}</p>
                    <p className="text-slate-500 text-sm">Date: {doc.date}</p>
                </div>
             </div>
         </div>
      ) : (
          <div className="flex justify-between items-start mb-12">
            <div className={`w-1/2 ${logoAlign === 'right' ? 'order-2 text-end' : 'text-start'}`}>
               {settings.logoUrl ? (
                 <img src={settings.logoUrl} alt="Logo" className="h-20 object-contain mb-4 inline-block" />
               ) : (
                 <h1 className="text-3xl font-bold text-slate-900 mb-2">{business.name}</h1>
               )}
               <p className="whitespace-pre-line text-sm text-slate-500">{business.address}</p>
               <p className="text-sm text-slate-500">{business.email}</p>
               <p className="text-sm text-slate-500">{business.phone}</p>
               {settings.tin && <p className="text-sm text-slate-500 mt-1">TIN: {settings.tin}</p>}
            </div>
            <div className={`w-1/2 ${logoAlign === 'right' ? 'order-1 text-start' : 'text-end'}`}>
              <h2 className="text-4xl font-light text-slate-300 uppercase tracking-widest mb-2">{doc.type}</h2>
              <div className="inline-block text-start bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="grid grid-cols-2 gap-x-4 text-sm">
                    <span className="text-slate-500">Number:</span>
                    <span className="font-bold text-slate-700 text-end">{doc.number}</span>
                    <span className="text-slate-500">Date:</span>
                    <span className="font-bold text-slate-700 text-end">{doc.date}</span>
                    {doc.dueDate && !isDeliveryNote && (
                        <>
                            <span className="text-slate-500">Due:</span>
                            <span className="font-bold text-slate-700 text-end">{doc.dueDate}</span>
                        </>
                    )}
                </div>
              </div>
            </div>
          </div>
      )}

      <div className="mb-12 flex gap-8 text-start">
        <div className="w-1/2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-200 pb-1">
                {isDeliveryNote ? 'Ship To' : 'Bill To'}
            </h3>
            <p className="text-lg font-bold text-slate-800">{doc.clientName}</p>
            <p className="text-slate-600 whitespace-pre-line text-sm">{doc.clientAddress}</p>
            <p className="text-slate-600 text-sm mt-1">{doc.clientEmail}</p>
            {doc.clientTin && <p className="text-slate-500 text-sm mt-1 font-mono bg-slate-50 inline-block px-1 rounded">Tax ID: {doc.clientTin}</p>}
        </div>
      </div>

      <div className="flex-1">
        <table className="w-full mb-12 border-collapse">
            <thead>
            <tr className="border-b-2 border-slate-200">
                <th className="text-start py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Description</th>
                <th className="text-end py-3 text-xs font-bold uppercase tracking-wider text-slate-500 w-24">Qty</th>
                {!isDeliveryNote && (
                    <>
                        <th className="text-end py-3 text-xs font-bold uppercase tracking-wider text-slate-500 w-32">Price</th>
                        <th className="text-end py-3 text-xs font-bold uppercase tracking-wider text-slate-500 w-32">Amount</th>
                    </>
                )}
            </tr>
            </thead>
            <tbody>
            {doc.items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                <td className="py-4 text-slate-700 text-start pr-4">
                  <div className="font-semibold">{item.description}</div>
                  {item.notes && <div className="text-xs text-slate-500 mt-1 whitespace-pre-wrap">{item.notes}</div>}
                </td>
                <td className="py-4 text-end text-slate-700 align-top">{item.quantity}</td>
                {!isDeliveryNote && (
                    <>
                        <td className="py-4 text-end text-slate-700 align-top">{doc.currency} {item.rate.toFixed(2)}</td>
                        <td className="py-4 text-end text-slate-700 font-bold align-top">{doc.currency} {item.amount.toFixed(2)}</td>
                    </>
                )}
                </tr>
            ))}
            </tbody>
        </table>
      </div>

      {!isDeliveryNote && (
        <div className="flex justify-end mb-8 relative break-inside-avoid">
            <div className="w-1/2 lg:w-5/12 relative text-start">
                <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="text-slate-700 font-medium">{doc.currency} {doc.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                    <span className="text-slate-500">{settings.taxLabel} ({settings.taxRate}%)</span>
                    <span className="text-slate-700 font-medium">{doc.currency} {doc.taxTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-4 items-center">
                    <span className="text-lg font-bold text-slate-800">Total</span>
                    <span className="text-2xl font-bold text-slate-800" style={{ color: settings.primaryColor }}>
                    {doc.currency} {doc.total.toFixed(2)}
                    </span>
                </div>
                <PaidStamp />
            </div>
        </div>
      )}
      
      <PaymentsSection />
      <DeliverySignature />
      <OfficialSeal />
      
      <TermsSection />

      {(doc.notes || business.settings.tin) && (
        <div className="border-t-2 border-slate-100 pt-8 mt-auto text-sm text-slate-500 break-inside-avoid">
           {doc.notes && (
             <div className="mb-8 text-start">
               <h4 className="font-bold text-slate-700 mb-2 text-xs uppercase tracking-wider">Notes</h4>
               {renderRichText(doc.notes, "text-sm text-slate-600")}
             </div>
           )}
           <p className="text-center font-medium opacity-70">Thank you for your business!</p>
        </div>
      )}
    </div>
  );

  const renderModern = () => (
    <div id="printable-area" dir="ltr" className={`shadow-lg flex flex-col font-sans bg-white text-slate-800`} style={containerStyle}>
        {/* Header Bar */}
        <div className="p-12 text-white relative overflow-hidden" style={{ backgroundColor: settings.primaryColor }}>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-black opacity-10 rounded-full blur-xl"></div>
            
            {logoAlign === 'center' ? (
                <div className="text-center relative z-10">
                    {settings.logoUrl && (
                        <div className="bg-white p-3 inline-block rounded-lg shadow-lg mb-6">
                            <img src={settings.logoUrl} alt="Logo" className="h-20 object-contain" />
                        </div>
                    )}
                    <h1 className="text-4xl font-bold mb-2 tracking-tight">{business.name}</h1>
                    <p className="opacity-90 text-sm font-light">{business.address} • {business.email}</p>
                    <div className="mt-8 pt-6 border-t border-white/20 flex justify-between items-center">
                        <h2 className="text-5xl font-black opacity-30 uppercase tracking-tighter mix-blend-overlay">{doc.type}</h2>
                        <div className="text-end">
                            <p className="opacity-90 font-bold text-lg"># {doc.number}</p>
                            <p className="opacity-75 text-sm">{doc.date}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex justify-between items-start relative z-10">
                    <div className={`w-1/2 ${logoAlign === 'right' ? 'order-2 text-end' : 'text-start'}`}>
                        {settings.logoUrl ? (
                            <div className="bg-white p-3 inline-block rounded-lg shadow-md mb-4">
                                <img src={settings.logoUrl} alt="Logo" className="h-16 object-contain" />
                            </div>
                        ) : (
                            <h1 className="text-3xl font-bold mb-4">{business.name}</h1>
                        )}
                        <div className="text-sm font-light opacity-90 space-y-1">
                            <p className="whitespace-pre-line">{business.address}</p>
                            <p>{business.email}</p>
                            <p>{business.phone}</p>
                        </div>
                    </div>
                    <div className={`${logoAlign === 'right' ? 'order-1 text-start' : 'text-end'}`}>
                        <h2 className="text-5xl font-black opacity-20 uppercase tracking-tighter mix-blend-overlay mb-2">{doc.type}</h2>
                        <div className="inline-block bg-white/10 p-3 rounded backdrop-blur-sm border border-white/20">
                            <div className="text-sm font-medium opacity-100">
                                <div className="flex justify-between gap-4"><span>#</span> <span>{doc.number}</span></div>
                                <div className="flex justify-between gap-4"><span>Date</span> <span>{doc.date}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        <div className="p-12 flex-1">
            <div className="mb-12 flex justify-between items-end border-b border-slate-100 pb-8 text-start">
                <div className="w-1/2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                         {isDeliveryNote ? 'Ship To' : 'Bill To'}
                    </h3>
                    <p className="text-xl font-bold text-slate-800 mb-1">{doc.clientName}</p>
                    <p className="text-slate-600 whitespace-pre-line text-sm">{doc.clientAddress}</p>
                    {doc.clientTin && <p className="text-slate-500 text-sm mt-2 bg-slate-50 inline-block px-2 py-0.5 rounded">Tax ID: {doc.clientTin}</p>}
                </div>
                {doc.dueDate && !isDeliveryNote && (
                    <div className="text-end">
                         <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Due Date</h3>
                         <p className="text-xl font-bold text-slate-800">{doc.dueDate}</p>
                    </div>
                )}
            </div>

            <table className="w-full mb-12 border-collapse">
                <thead>
                    <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider">
                        <th className={`text-start py-3 px-4 rounded-l-lg`}>Item / Description</th>
                        <th className="text-end py-3 px-4 w-20">Qty</th>
                        {!isDeliveryNote && (
                            <>
                                <th className="text-end py-3 px-4 w-32">Price</th>
                                <th className={`text-end py-3 px-4 w-32 rounded-r-lg`}>Total</th>
                            </>
                        )}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {doc.items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="py-4 px-4 text-slate-700 text-start">
                                <div className="font-bold text-slate-800">{item.description}</div>
                                {item.notes && <div className="text-xs text-slate-500 mt-1 leading-tight">{item.notes}</div>}
                            </td>
                            <td className="py-4 px-4 text-end text-slate-700 align-top">{item.quantity}</td>
                            {!isDeliveryNote && (
                                <>
                                    <td className="py-4 px-4 text-end text-slate-700 align-top">{doc.currency} {item.rate.toFixed(2)}</td>
                                    <td className="py-4 px-4 text-end font-bold text-slate-700 align-top">{doc.currency} {item.amount.toFixed(2)}</td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            {!isDeliveryNote && (
                <div className="flex justify-end mb-8 relative break-inside-avoid text-start">
                    <div className="w-1/2 lg:w-5/12 relative">
                         <div className="flex justify-between py-2 text-slate-600 text-sm">
                            <span>Subtotal</span>
                            <span className="font-medium">{doc.currency} {doc.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-2 text-slate-600 border-b border-slate-200 mb-4 text-sm">
                            <span>{settings.taxLabel} ({settings.taxRate}%)</span>
                            <span className="font-medium">{doc.currency} {doc.taxTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between p-5 rounded-lg text-white font-bold text-lg shadow-md" style={{ backgroundColor: settings.secondaryColor || settings.primaryColor }}>
                            <span>Total</span>
                            <span>{doc.currency} {doc.total.toFixed(2)}</span>
                        </div>
                        <PaidStamp />
                    </div>
                </div>
            )}
            
            <PaymentsSection />
            <DeliverySignature />
            <OfficialSeal />
            <TermsSection />

            {doc.notes && (
                <div className={`mt-8 bg-slate-50 p-6 rounded-lg text-sm text-slate-600 border-l-4 text-start break-inside-avoid`} style={{ borderColor: settings.primaryColor }}>
                     <h4 className="font-bold mb-2 text-slate-800">Notes</h4>
                     {renderRichText(doc.notes)}
                </div>
            )}
        </div>
        
        {/* Footer Bar */}
        <div className="bg-slate-900 text-slate-400 p-6 text-center text-xs mt-auto">
            <p className="mb-1 font-medium text-slate-300">{business.name}</p>
            <p>{business.address} • {business.phone} • {business.email}</p>
            {settings.tin && <p className="mt-1 opacity-60">Tax ID: {settings.tin}</p>}
        </div>
    </div>
  );

  const renderMinimal = () => (
    <div id="printable-area" dir="ltr" className={`p-12 md:p-16 shadow-lg flex flex-col font-serif bg-white text-slate-800`} style={containerStyle}>
        <div className={`mb-16 ${logoAlign === 'left' ? 'text-start' : logoAlign === 'right' ? 'text-end' : 'text-center'}`}>
             {settings.logoUrl && (
                 <img src={settings.logoUrl} alt="Logo" className={`h-20 object-contain mb-6 grayscale ${logoAlign === 'left' ? 'mr-auto' : logoAlign === 'right' ? 'ml-auto' : 'mx-auto'}`} />
             )}
             <h1 className="text-2xl font-bold uppercase tracking-widest mb-2 text-black">{business.name}</h1>
             <p className="text-xs text-gray-500 uppercase tracking-widest">{business.address}</p>
             <p className="text-xs text-gray-500 uppercase tracking-widest">{business.phone} • {business.email}</p>
        </div>

        <div className="flex justify-between items-end border-b-2 border-black pb-6 mb-12 text-start">
            <div className="w-1/2">
                 <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Prepared For</p>
                 <p className="text-xl font-medium">{doc.clientName}</p>
                 <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{doc.clientAddress}</p>
                 {doc.clientTin && <p className="text-xs text-gray-500 mt-2">ID: {doc.clientTin}</p>}
            </div>
            <div className="text-end">
                 <h2 className="text-4xl font-bold uppercase text-black mb-1">{doc.type}</h2>
                 <p className="text-lg font-mono">#{doc.number}</p>
                 <p className="text-sm text-gray-500 mt-1">{doc.date}</p>
            </div>
        </div>

        <div className="flex-1">
            <table className="w-full mb-12">
                <thead>
                    <tr className="border-b border-gray-300">
                        <th className="text-start py-3 font-bold uppercase text-xs tracking-widest text-black">Description</th>
                        <th className="text-end py-3 font-bold uppercase text-xs tracking-widest text-black w-24">Qty</th>
                        {!isDeliveryNote && (
                            <>
                                <th className="text-end py-3 font-bold uppercase text-xs tracking-widest text-black w-32">Rate</th>
                                <th className="text-end py-3 font-bold uppercase text-xs tracking-widest text-black w-32">Total</th>
                            </>
                        )}
                    </tr>
                </thead>
                <tbody>
                     {doc.items.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 last:border-0">
                            <td className="py-4 text-start pr-4">
                                <p className="font-medium text-black">{item.description}</p>
                                {item.notes && <p className="text-xs text-gray-500 mt-1 italic">{item.notes}</p>}
                            </td>
                            <td className="py-4 text-end font-mono text-gray-700 align-top">{item.quantity}</td>
                            {!isDeliveryNote && (
                                <>
                                    <td className="py-4 text-end font-mono text-gray-700 align-top">{item.rate.toFixed(2)}</td>
                                    <td className="py-4 text-end font-mono text-black align-top">{item.amount.toFixed(2)}</td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {!isDeliveryNote && (
            <div className="flex justify-end mb-16 relative break-inside-avoid text-start">
                <div className="w-1/2 relative">
                    <div className="flex justify-between py-1">
                        <span className="text-xs uppercase tracking-widest text-gray-500">Subtotal</span>
                        <span className="font-mono">{doc.currency} {doc.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                        <span className="text-xs uppercase tracking-widest text-gray-500">{settings.taxLabel} ({settings.taxRate}%)</span>
                        <span className="font-mono">{doc.currency} {doc.taxTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-4 border-t-2 border-black mt-4 items-center">
                        <span className="text-lg font-bold uppercase tracking-widest">Total</span>
                        <span className="text-2xl font-bold font-mono">{doc.currency} {doc.total.toFixed(2)}</span>
                    </div>
                    <PaidStamp />
                </div>
            </div>
        )}

        <PaymentsSection />
        <DeliverySignature />
        <OfficialSeal />
        <TermsSection />

        <div className="text-center mt-12 pt-8 border-t border-gray-100">
            {doc.notes && <div className="text-sm text-gray-600 italic mb-6">{renderRichText(doc.notes)}</div>}
            <p className="text-xs text-gray-400 uppercase tracking-widest">Generated by {business.name}</p>
        </div>
    </div>
  );

  const renderProfessional = () => (
    <div id="printable-area" dir="ltr" className={`shadow-xl flex flex-col font-sans bg-white text-slate-800`} style={containerStyle}>
        {/* Color Strip */}
        <div className="h-3 w-full" style={{ backgroundColor: settings.primaryColor }}></div>
        
        <div className="p-12 pb-6 flex justify-between items-start text-start">
             <div className="w-7/12">
                {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="Logo" className="h-20 object-contain mb-6" />
                ) : (
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight" style={{ color: settings.primaryColor }}>{business.name}</h1>
                )}
                <div className="text-sm text-slate-500 space-y-1">
                    <p className="font-bold text-slate-900">{business.name}</p>
                    <p className="whitespace-pre-line">{business.address}</p>
                    <p>{business.email} • {business.phone}</p>
                </div>
             </div>
             
             <div className="text-end w-5/12">
                 <h2 className="text-5xl font-black text-slate-100 uppercase tracking-tight mb-4 text-end" style={{ color: '#e2e8f0' }}>{doc.type}</h2>
                 <div className="space-y-2 text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100">
                     <div className="flex justify-between gap-4">
                         <span className="text-slate-400 font-bold uppercase text-xs tracking-wider">Number</span>
                         <span className="font-bold text-slate-800">{doc.number}</span>
                     </div>
                     <div className="flex justify-between gap-4">
                         <span className="text-slate-400 font-bold uppercase text-xs tracking-wider">Date</span>
                         <span className="font-bold text-slate-800">{doc.date}</span>
                     </div>
                     {doc.dueDate && (
                         <div className="flex justify-between gap-4">
                            <span className="text-slate-400 font-bold uppercase text-xs tracking-wider">Due Date</span>
                            <span className="font-bold text-slate-800">{doc.dueDate}</span>
                        </div>
                     )}
                 </div>
             </div>
        </div>

        <div className="px-12 py-8 flex gap-8 text-start">
             <div className="w-full bg-slate-50 rounded-lg p-6 border border-slate-100">
                 <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-200 pb-2">Bill To</h3>
                 <p className="text-xl font-bold text-slate-900 mb-1">{doc.clientName}</p>
                 <p className="text-slate-600 text-sm whitespace-pre-line mb-2">{doc.clientAddress}</p>
                 <p className="text-slate-500 text-sm">{doc.clientEmail}</p>
                 {doc.clientTin && <p className="text-slate-500 text-sm mt-3 pt-2 border-t border-slate-200 inline-block font-mono">Tax ID: {doc.clientTin}</p>}
             </div>
        </div>

        <div className="px-12 flex-1">
            <table className="w-full mb-8 border-separate border-spacing-0">
                <thead>
                    <tr>
                        <th className="py-3 text-start text-xs font-bold text-white uppercase tracking-wider px-4 rounded-l-md shadow-sm" style={{ backgroundColor: settings.primaryColor }}>Description</th>
                        <th className="py-3 text-end text-xs font-bold text-white uppercase tracking-wider px-4 shadow-sm" style={{ backgroundColor: settings.primaryColor }}>Qty</th>
                        {!isDeliveryNote && (
                            <>
                                <th className="py-3 text-end text-xs font-bold text-white uppercase tracking-wider px-4 shadow-sm" style={{ backgroundColor: settings.primaryColor }}>Rate</th>
                                <th className="py-3 text-end text-xs font-bold text-white uppercase tracking-wider px-4 rounded-r-md shadow-sm" style={{ backgroundColor: settings.primaryColor }}>Amount</th>
                            </>
                        )}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                     {doc.items.map((item) => (
                        <tr key={item.id}>
                            <td className="py-4 px-4 border-b border-slate-50 text-start">
                                <p className="font-bold text-slate-800">{item.description}</p>
                                {item.notes && <p className="text-xs text-slate-500 mt-1">{item.notes}</p>}
                            </td>
                            <td className="py-4 px-4 text-end text-slate-600 border-b border-slate-50">{item.quantity}</td>
                            {!isDeliveryNote && (
                                <>
                                    <td className="py-4 px-4 text-end text-slate-600 border-b border-slate-50">{doc.currency} {item.rate.toFixed(2)}</td>
                                    <td className="py-4 px-4 text-end font-bold text-slate-800 border-b border-slate-50">{doc.currency} {item.amount.toFixed(2)}</td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            {!isDeliveryNote && (
                <div className="flex justify-end mb-12 break-inside-avoid text-start">
                     <div className="w-5/12 bg-slate-50 p-6 rounded-lg border border-slate-100 relative shadow-sm">
                        <div className="flex justify-between mb-2 text-slate-600 text-sm">
                            <span>Subtotal</span>
                            <span className="font-medium">{doc.currency} {doc.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-4 text-slate-600 text-sm pb-4 border-b border-slate-200">
                            <span>{settings.taxLabel} ({settings.taxRate}%)</span>
                            <span className="font-medium">{doc.currency} {doc.taxTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold" style={{ color: settings.primaryColor }}>
                            <span>Total</span>
                            <span>{doc.currency} {doc.total.toFixed(2)}</span>
                        </div>
                        <PaidStamp />
                     </div>
                </div>
            )}
            
            <PaymentsSection />
            <DeliverySignature />
            <OfficialSeal />
            <TermsSection />

            {doc.notes && (
                <div className="mt-8 border-t-2 border-slate-100 pt-6 break-inside-avoid text-start">
                    <h4 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wider">Notes</h4>
                    {renderRichText(doc.notes, "text-sm text-slate-600 bg-slate-50 p-4 rounded-lg")}
                </div>
            )}
        </div>

        <div className="p-12 pt-0 mt-auto">
             <div className="h-0.5 w-full bg-slate-100 mb-4"></div>
             <div className="flex justify-between items-center text-xs text-slate-400 font-medium uppercase tracking-wider">
                 <p>{business.name}</p>
                 <p>{business.email}</p>
             </div>
        </div>
    </div>
  );

  switch (template) {
      case 'modern': return renderModern();
      case 'minimal': return renderMinimal();
      case 'professional': return renderProfessional();
      default: return renderClassic();
  }
};
