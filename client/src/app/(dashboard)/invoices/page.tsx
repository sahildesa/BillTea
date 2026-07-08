'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';
import { useBranch } from '@/components/BranchProvider';

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  invoiceDate: string;
  dueDate: string;
  customer: {
    customerName: string;
    companyName: string;
  };
  totals: {
    grandTotal: number;
  };
}

export default function InvoicesPage() {
  const { selectedBranchId, isLoadingBranches } = useBranch();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [viewerPdfUrl, setViewerPdfUrl] = useState<{url: string, title: string, id: string} | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);

  useEffect(() => {
    if (selectedBranchId) {
      fetchInvoices();
    } else {
      setInvoices([]);
      setLoading(false);
    }
  }, [selectedBranchId]);

  const fetchInvoices = async () => {
    if (!selectedBranchId) return;
    try {
      setLoading(true);
      setError('');
      const res = await apiFetch(`/invoices?branchId=${selectedBranchId}`);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      } else {
        throw new Error('Failed to fetch invoices');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this invoice? Note: You can only delete the most recent invoice.')) return;
    try {
      const res = await apiFetch(`/invoices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchInvoices();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to delete invoice');
      }
    } catch (err: any) {
      alert('Failed to delete invoice');
    }
  };

  const handleDownloadPdf = async (id: string, invoiceNumber: string) => {
    try {
      const res = await apiFetch(`/invoices/${id}/pdf`, {
        method: 'GET',
      });
      
      if (!res.ok) {
        throw new Error('Failed to download PDF');
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to download PDF. Please try again.');
    }
  };

  const handleViewPdf = async (id: string, invoiceNumber: string) => {
    try {
      setIsLoadingPdf(true);
      const res = await apiFetch(`/invoices/${id}/pdf`, {
        method: 'GET',
      });
      
      if (!res.ok) {
        throw new Error('Failed to load PDF preview');
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setViewerPdfUrl({ url, title: `Invoice-${invoiceNumber}.pdf`, id });
    } catch (err) {
      alert('Failed to load PDF preview. Please try again.');
    } finally {
      setIsLoadingPdf(false);
    }
  };

  const closePdfViewer = () => {
    if (viewerPdfUrl) {
      window.URL.revokeObjectURL(viewerPdfUrl.url);
      setViewerPdfUrl(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-surface-container text-on-surface-variant border-outline-variant/30';
      case 'SENT': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'UNPAID': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'PARTIAL': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'PAID': return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20';
      case 'OVERDUE': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'CANCELLED': return 'bg-surface-container text-on-surface-variant/50 border-outline-variant/20';
      default: return 'bg-surface-container text-on-surface-variant border-outline-variant/30';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">Invoices</h1>
          <p className="text-on-surface-variant text-sm mt-1">Manage and track your invoices.</p>
        </div>
        <Link href="/invoices/new">
          <button 
            disabled={!selectedBranchId}
            className="glass-button-primary rounded-lg py-2.5 px-5 flex items-center gap-2 text-sm font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(125,211,252,0.1)] hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
            Create Invoice
          </button>
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 flex items-start gap-3 relative z-10">
          <span className="material-symbols-outlined text-error mt-0.5">error</span>
          <p className="text-sm text-error font-medium">{error}</p>
        </div>
      )}

      {/* Glassmorphic Data Table Container */}
      <div className="glass-panel rounded-xl overflow-hidden shadow-lg border border-primary/10 relative z-10">
        {/* Glow Accent */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        
        {/* Table Controls */}
        <div className="p-6 border-b border-primary/10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container/30">
          <div className="flex items-center gap-3 text-sm text-on-surface-variant">
            <span>Show</span>
            <select className="glass-input rounded-md py-1.5 px-3 text-on-surface focus:ring-0 focus:border-primary/50 text-sm cursor-pointer appearance-none pr-8 relative bg-surface-container-highest">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span>entries</span>
          </div>
          <div className="relative w-full sm:w-auto">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input className="glass-input pl-9 pr-4 py-2 rounded-lg text-sm text-on-surface placeholder-on-surface-variant/50 w-full sm:w-72 focus:outline-none transition-all" placeholder="Search invoices..." type="text" />
          </div>
        </div>
        
        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-xs text-on-surface-variant uppercase bg-surface-container-low/50 border-b border-primary/10">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:text-primary transition-colors group" scope="col">
                  <div className="flex items-center gap-1">
                    Invoice Number <span className="material-symbols-outlined text-[12px] opacity-50 group-hover:opacity-100">unfold_more</span>
                  </div>
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:text-primary transition-colors group" scope="col">
                  <div className="flex items-center gap-1">
                    Customer <span className="material-symbols-outlined text-[12px] opacity-50 group-hover:opacity-100">unfold_more</span>
                  </div>
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:text-primary transition-colors group" scope="col">
                  <div className="flex items-center gap-1">
                    Date & Status <span className="material-symbols-outlined text-[12px] opacity-50 group-hover:opacity-100">unfold_more</span>
                  </div>
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:text-primary transition-colors group" scope="col">
                  <div className="flex items-center gap-1">
                    Total Amount <span className="material-symbols-outlined text-[12px] opacity-50 group-hover:opacity-100">unfold_more</span>
                  </div>
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right pr-8" scope="col">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {isLoadingBranches || loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                    <div className="flex justify-center items-center gap-2">
                      <span className="material-symbols-outlined animate-spin">refresh</span> Loading invoices...
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                      <span className="material-symbols-outlined text-[32px]">request_quote</span>
                    </div>
                    <h3 className="text-lg font-bold text-on-surface">No invoices yet</h3>
                    <p className="text-sm text-on-surface-variant mt-1">Create your first invoice for this branch.</p>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-primary/5 transition-colors duration-200">
                    <td className="px-6 py-4 font-semibold text-primary">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                        {invoice.customer?.customerName?.substring(0, 2).toUpperCase() || 'NA'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-on-surface font-semibold">{invoice.customer?.customerName || 'Unknown'}</span>
                        <span className="text-[11px] text-on-surface-variant/70">{invoice.customer?.companyName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-on-surface-variant mb-1">
                        {new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-on-surface">
                      ₹ {invoice.totals?.grandTotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                    </td>
                    <td className="px-6 py-4">
                      {openActionId === invoice.id ? (
                        <div className="flex items-center justify-end gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                          <button onClick={() => handleViewPdf(invoice.id, invoice.invoiceNumber)} className="glass-button-icon p-1 rounded-md transition-all hover:text-blue-400 hover:bg-blue-400/10 tooltip cursor-pointer" title="View">
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                          </button>
                          <Link href={`/invoices/${invoice.id}/edit`}>
                            <button className="glass-button-icon p-1 rounded-md transition-all hover:text-primary hover:border-primary/30 hover:bg-primary/10 tooltip cursor-pointer" title="Edit">
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                          </Link>
                          <button className="glass-button-icon p-1 rounded-md transition-all hover:text-purple-400 hover:border-purple-400/30 hover:bg-purple-400/10 tooltip cursor-pointer" title="Add Payment">
                            <span className="material-symbols-outlined text-[16px]">payments</span>
                          </button>
                          <button className="glass-button-icon p-1 rounded-md transition-all hover:text-emerald-400 hover:border-emerald-400/30 hover:bg-emerald-400/10 tooltip cursor-pointer" title="Send">
                            <span className="material-symbols-outlined text-[16px]">send</span>
                          </button>
                          <Link href={`/invoices/new?copyFrom=${invoice.id}`}>
                            <button className="glass-button-icon p-1 rounded-md transition-all hover:text-blue-400 hover:border-blue-400/30 hover:bg-blue-400/10 tooltip cursor-pointer" title="Copy">
                              <span className="material-symbols-outlined text-[16px]">content_copy</span>
                            </button>
                          </Link>
                          <button onClick={() => handleDownloadPdf(invoice.id, invoice.invoiceNumber)} className="glass-button-icon p-1 rounded-md transition-all hover:text-indigo-400 hover:border-indigo-400/30 hover:bg-indigo-400/10 tooltip cursor-pointer" title="Download PDF">
                            <span className="material-symbols-outlined text-[16px]">download</span>
                          </button>
                          <button onClick={() => handleDelete(invoice.id)} className="glass-button-icon p-1 rounded-md transition-all hover:text-error hover:border-error/30 hover:bg-error/10 tooltip cursor-pointer" title="Delete">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                          <div className="w-px h-4 bg-primary/20 mx-1"></div>
                          <button 
                            onClick={() => setOpenActionId(null)}
                            className="glass-button-icon p-1 rounded-md transition-all hover:text-on-surface-variant hover:bg-surface-container-highest tooltip cursor-pointer" title="Close">
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2 animate-in fade-in duration-300">
                          <button onClick={() => handleViewPdf(invoice.id, invoice.invoiceNumber)} className="glass-button-icon p-1 rounded-md transition-all hover:text-blue-400 hover:bg-blue-400/10 tooltip cursor-pointer" title="View">
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                          </button>
                          <Link href={`/invoices/${invoice.id}/edit`}>
                            <button className="glass-button-icon p-1 rounded-md transition-all hover:text-primary hover:border-primary/30 hover:bg-primary/10 tooltip cursor-pointer" title="Edit">
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                          </Link>
                          <button className="glass-button-icon p-1 rounded-md transition-all hover:text-purple-400 hover:border-purple-400/30 hover:bg-purple-400/10 tooltip cursor-pointer" title="Add Payment">
                            <span className="material-symbols-outlined text-[16px]">payments</span>
                          </button>
                          <button className="glass-button-icon p-1 rounded-md transition-all hover:text-emerald-400 hover:border-emerald-400/30 hover:bg-emerald-400/10 tooltip cursor-pointer" title="Send">
                            <span className="material-symbols-outlined text-[16px]">send</span>
                          </button>
                          <div className="w-px h-4 bg-primary/20 mx-1"></div>
                          <button 
                            onClick={() => setOpenActionId(invoice.id)}
                            className="glass-button-icon p-1 rounded-md transition-all hover:text-primary hover:bg-primary/10 tooltip cursor-pointer" title="More Actions">
                            <span className="material-symbols-outlined text-[16px]">more_horiz</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-6 border-t border-primary/10 bg-surface-container/30 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-2">
            <span className="text-sm text-on-surface-variant">Showing 1 to {invoices.length} entries</span>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1.5 text-sm font-medium rounded-md text-on-surface-variant hover:bg-surface-container-highest border border-transparent transition-colors disabled:opacity-50 cursor-pointer" disabled>
                Previous
              </button>
              <button className="px-3 py-1.5 text-sm font-medium rounded-md bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(125,211,252,0.1)] cursor-pointer">
                1
              </button>
              <button className="px-3 py-1.5 text-sm font-medium rounded-md text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface border border-transparent transition-colors disabled:opacity-50 cursor-pointer" disabled>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {viewerPdfUrl && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-xl transition-opacity" onClick={closePdfViewer}></div>
          <div className="bg-surface/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] w-full max-w-6xl overflow-hidden relative z-10 flex flex-col h-[90vh] animate-in zoom-in-95 fade-in duration-300 border border-white/10">
            
            {/* Premium Toolbar */}
            <div className="px-6 py-4 bg-gradient-to-r from-surface-container/50 to-surface-container/10 flex items-center justify-between border-b border-white/10 relative">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 text-primary flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
                </div>
                <div>
                  <h3 className="text-lg font-headline font-bold text-on-surface tracking-tight leading-tight">Document Preview</h3>
                  <p className="text-sm text-on-surface-variant font-medium mt-0.5">{viewerPdfUrl.title}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {(() => {
                  const activeInvoice = invoices.find(q => q.id === viewerPdfUrl.id);
                  if (!activeInvoice) return null;
                  
                  return (
                    <div className="flex items-center gap-2 hidden lg:flex">
                      <Link href={`/invoices/${activeInvoice.id}/edit`}>
                        <button onClick={closePdfViewer} className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-highest/50 hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 text-on-surface-variant transition-all cursor-pointer tooltip" title="Edit">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                      </Link>
                      <Link href={`/invoices/new?copyFrom=${activeInvoice.id}`}>
                        <button onClick={closePdfViewer} className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-highest/50 hover:bg-blue-400/10 hover:text-blue-400 border border-transparent hover:border-blue-400/20 text-on-surface-variant transition-all cursor-pointer tooltip" title="Copy">
                          <span className="material-symbols-outlined text-[20px]">content_copy</span>
                        </button>
                      </Link>
                      <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-highest/50 hover:bg-purple-400/10 hover:text-purple-400 border border-transparent hover:border-purple-400/20 text-on-surface-variant transition-all cursor-pointer tooltip" title="Add Payment">
                        <span className="material-symbols-outlined text-[20px]">payments</span>
                      </button>
                      <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-highest/50 hover:bg-emerald-400/10 hover:text-emerald-400 border border-transparent hover:border-emerald-400/20 text-on-surface-variant transition-all cursor-pointer tooltip" title="Send">
                        <span className="material-symbols-outlined text-[20px]">send</span>
                      </button>
                      <div className="w-px h-6 bg-white/10 mx-1"></div>
                    </div>
                  );
                })()}

                <a 
                  href={viewerPdfUrl.url} 
                  download={viewerPdfUrl.title}
                  className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-semibold overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:-translate-y-0.5 active:translate-y-0"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                  <span className="material-symbols-outlined text-[18px] relative z-10">download</span>
                  <span className="relative z-10 text-sm hidden sm:inline-block">Download</span>
                </a>
                <div className="w-px h-8 bg-white/10 mx-1"></div>
                <button onClick={closePdfViewer} className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-highest/50 hover:bg-error/10 hover:text-error border border-transparent hover:border-error/20 text-on-surface-variant transition-all cursor-pointer">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            
            {/* Content Area with sophisticated framing */}
            <div className="flex-1 bg-black/40 p-2 sm:p-6 flex items-center justify-center overflow-hidden">
              {isLoadingPdf ? (
                <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in-95 duration-500">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                    <span className="absolute inset-0 flex items-center justify-center material-symbols-outlined text-primary text-2xl animate-pulse">description</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <h3 className="text-lg font-bold text-on-surface tracking-wide text-white">Generating PDF</h3>
                    <p className="text-sm text-white/70 mt-1">Please wait while we render your document...</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full max-w-[800px] bg-white rounded-xl shadow-2xl overflow-hidden relative border border-white/20">
                  <iframe 
                    src={viewerPdfUrl.url} 
                    className="w-full h-full border-none"
                    title="PDF Viewer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
