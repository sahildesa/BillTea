'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  amountPaid: number;
}

type SortDirection = 'asc' | 'desc';
interface SortConfig {
  key: string;
  direction: SortDirection;
}

export default function InvoicesPage() {
  const { selectedBranchId, isLoadingBranches } = useBranch();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [viewerPdfUrl, setViewerPdfUrl] = useState<{url: string, title: string, id: string} | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);

  // Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: 'CASH',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  // ---- Sorting + Pagination state (inlined, no external hook needed) ----
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const stats = React.useMemo(() => {
    const total = invoices.length;
    const unpaid = invoices.filter((i) => i.status === 'UNPAID' || i.status === 'OVERDUE').length;
    const paid = invoices.filter((i) => i.status === 'PAID').length;
    const totalBilled = invoices.reduce((sum, i) => sum + (i.totals?.grandTotal || 0), 0);
    const totalOutstanding = invoices.reduce(
      (sum, i) => sum + Math.max((i.totals?.grandTotal || 0) - (i.amountPaid || 0), 0),
      0
    );
    return { total, unpaid, paid, totalBilled, totalOutstanding };
  }, [invoices]);

  const [paymentAttachment, setPaymentAttachment] = useState<File | null>(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1080;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }, 'image/jpeg', 0.8);
        };
      };
    });
  };

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
      case 'UNPAID': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'PARTIAL': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'PAID': return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20';
      case 'OVERDUE': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-surface-container text-on-surface-variant border-outline-variant/30';
    }
  };

  const handleOpenPaymentModal = (invoice: Invoice) => {
    setSelectedInvoiceForPayment(invoice);
    const amountDue = Number((invoice.totals.grandTotal - invoice.amountPaid).toFixed(2));
    setPaymentForm({
      amount: amountDue, // Default to due amount
      method: 'CASH',
      date: new Date().toISOString().split('T')[0],
      note: ''
    });
    setPaymentAttachment(null);
    setPaymentError('');
    setPaymentModalOpen(true);
    setOpenActionId(null);
  };

  const handleSubmitPayment = async () => {
    if (!selectedInvoiceForPayment) return;
    if (paymentForm.amount <= 0) {
      setPaymentError('Payment amount must be greater than 0');
      return;
    }
    const amountDue = Number((selectedInvoiceForPayment.totals.grandTotal - selectedInvoiceForPayment.amountPaid).toFixed(2));
    const paymentAmount = Number(paymentForm.amount.toFixed(2));
    if (paymentAmount > amountDue) {
      setPaymentError(`Payment amount cannot exceed the due amount`);
      return;
    }

    try {
      setIsSubmittingPayment(true);
      setPaymentError('');

      const res = await apiFetch(`/invoices/${selectedInvoiceForPayment.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add payment');
      }

      const data = await res.json();

      // Upload attachment if present
      if (paymentAttachment && data.id) {
        const formData = new FormData();
        formData.append('file', paymentAttachment);

        await apiFetch(`/invoices/${selectedInvoiceForPayment.id}/payments/${data.id}/attachment`, {
          method: 'POST',
          body: formData,
          headers: {} // Let browser set multipart boundary
        });
      }

      setPaymentModalOpen(false);
      fetchInvoices(); // Refresh list to update status/amounts
    } catch (err: any) {
      setPaymentError(err.message || 'An error occurred while adding the payment');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();

    const nameMatch = invoice.customer?.customerName?.toLowerCase().includes(query) ||
                      invoice.customer?.companyName?.toLowerCase().includes(query);
    const amountMatch = invoice.totals?.grandTotal?.toString().includes(query);
    const invoiceNumberMatch = invoice.invoiceNumber?.toLowerCase().includes(query);

    return nameMatch || amountMatch || invoiceNumberMatch;
  });

  // The "most recent" invoice is the one you're allowed to delete/fully-edit inline.
  // Derived from actual invoice dates (not row position), so it stays correct
  // no matter how the table is sorted or paginated.
  const mostRecentInvoiceId = useMemo(() => {
    if (invoices.length === 0) return null;
    return invoices.reduce((latest, inv) =>
      new Date(inv.invoiceDate) > new Date(latest.invoiceDate) ? inv : latest
    ).id;
  }, [invoices]);

  // ---- Sorting ----
  const handleSort = (key: string) => {
    setCurrentPage(1);
    setSortConfig((prev) => {
      if (prev?.key === key && prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortIcon = (key: string): string => {
    if (sortConfig?.key !== key) return 'unfold_more';
    return sortConfig.direction === 'asc' ? 'expand_less' : 'expand_more';
  };

  const sortValue = (row: Invoice, key: string): string | number => {
    switch (key) {
      case 'invoiceNumber': return row.invoiceNumber || '';
      case 'customer': return row.customer?.customerName || '';
      case 'date': return new Date(row.invoiceDate).getTime() || 0;
      case 'amount': return row.totals?.grandTotal || 0;
      default: return '';
    }
  };

  const sortedInvoices = useMemo(() => {
    if (!sortConfig) return filteredInvoices;
    return [...filteredInvoices].sort((a, b) => {
      const aVal = sortValue(a, sortConfig.key);
      const bVal = sortValue(b, sortConfig.key);
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortConfig.direction === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredInvoices, sortConfig]);

  // ---- Pagination ----
  const totalCount = sortedInvoices.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / entriesPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  // Reset to page 1 whenever the search query changes.
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const startIndex = totalCount === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1;
  const endIndex = Math.min(currentPage * entriesPerPage, totalCount);

  const paginatedInvoices = useMemo(() => {
    return sortedInvoices.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);
  }, [sortedInvoices, currentPage, entriesPerPage]);

  const handleEntriesPerPageChange = (n: number) => {
    setEntriesPerPage(n);
    setCurrentPage(1);
  };

  const sortHeaderClass = (key: string) =>
    `px-6 py-4 font-semibold tracking-wider cursor-pointer hover:text-primary transition-colors group outline-none focus:outline-none [-webkit-tap-highlight-color:transparent] ${
      sortConfig?.key === key ? 'text-primary' : ''
    }`;

  const sortIconClass = (key: string) =>
    `material-symbols-outlined text-[12px] transition-opacity ${
      sortConfig?.key === key ? 'opacity-100 text-primary' : 'opacity-50 group-hover:opacity-100'
    }`;

  return (
    <div
      className="flex-1 overflow-y-auto p-8 [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
    <style jsx global>{`
  table, thead, tbody, tr, td, th {
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    user-select: none !important;
  }
  table ::selection,
  tr::selection, tr *::selection,
  td::selection, td *::selection,
  th::selection, th *::selection,
  button::selection, button *::selection,
  span::selection {
    background: transparent !important;
    color: inherit !important;
  }
  button, th, select, input, a, tr, td, span, [role='button'] {
    -webkit-tap-highlight-color: transparent !important;
    -webkit-touch-callout: none !important;
    outline: none !important;
  }
  button::-moz-focus-inner {
    border: 0 !important;
  }
  th, th:focus, th:active,
  button:focus, button:active,
  select:focus, select:active {
    outline: none !important;
    box-shadow: none !important;
  }
`}</style>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 relative z-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight font-display mb-2">
              <span className="bg-gradient-to-br from-primary to-tertiary bg-clip-text text-transparent">Invoices</span></h1>
          <p className="text-on-surface-variant text-lg">Manage and track your invoices.</p>
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

     {/* Metrics Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10">
  <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500"></div>
    <div className="flex justify-between items-start mb-4">
      <p className="text-on-surface-variant text-sm font-medium uppercase tracking-wider">Total Invoices</p>
      <span className="material-symbols-outlined text-primary p-2 rounded-lg bg-primary/10">receipt_long</span>
    </div>
    <p className="text-3xl font-bold text-on-surface tracking-tight">{stats.total}</p>
    <p className="mt-2 text-sm text-on-surface-variant/60">for this branch</p>
  </div>

  <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/5 rounded-full blur-2xl group-hover:bg-tertiary/10 transition-colors duration-500"></div>
    <div className="flex justify-between items-start mb-4">
      <p className="text-on-surface-variant text-sm font-medium uppercase tracking-wider">Unpaid / Overdue</p>
      <span className="material-symbols-outlined text-red-500 p-2 rounded-lg bg-red-500/10">error_outline</span>
    </div>
    <p className="text-3xl font-bold text-on-surface tracking-tight">{stats.unpaid}</p>
    <p className="mt-2 text-sm text-on-surface-variant/60">
      {stats.total > 0 ? `${Math.round((stats.unpaid / stats.total) * 100)}% of total` : 'no data yet'}
    </p>
  </div>

  <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500"></div>
    <div className="flex justify-between items-start mb-4">
      <p className="text-on-surface-variant text-sm font-medium uppercase tracking-wider">Total Billed</p>
      <span className="material-symbols-outlined text-primary p-2 rounded-lg bg-primary/10">payments</span>
    </div>
    <p className="text-3xl font-bold text-on-surface tracking-tight">
      ₹ {stats.totalBilled.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
    </p>
    <p className="mt-2 text-sm text-on-surface-variant/60">across all invoices</p>
  </div>

  <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/5 rounded-full blur-2xl group-hover:bg-tertiary/10 transition-colors duration-500"></div>
    <div className="flex justify-between items-start mb-4">
      <p className="text-on-surface-variant text-sm font-medium uppercase tracking-wider">Outstanding</p>
      <span className="material-symbols-outlined text-tertiary p-2 rounded-lg bg-tertiary/10">account_balance_wallet</span>
    </div>
    <p className="text-3xl font-bold text-on-surface tracking-tight">
      ₹ {stats.totalOutstanding.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
    </p>
    <p className="mt-2 text-sm text-on-surface-variant/60">yet to be collected</p>
  </div>
</div>

      {/* Glassmorphic Data Table Container */}
      <div className="glass-panel rounded-xl overflow-hidden shadow-lg border border-primary/10 relative z-10">
        {/* Glow Accent */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

        {/* Table Controls */}
        <div className="p-6 border-b border-primary/10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container/30">
          <div className="flex items-center gap-3 text-sm text-on-surface-variant">
            <span>Show</span>
            <div className="relative">
              <select
                value={entriesPerPage}
                onChange={(e) => handleEntriesPerPageChange(Number(e.target.value))}
                className="glass-input rounded-md py-1.5 pl-3 pr-8 text-on-surface focus:ring-0 focus:border-primary/50 text-sm cursor-pointer appearance-none bg-surface-container-highest outline-none [-webkit-tap-highlight-color:transparent]"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">expand_more</span>
            </div>
            <span>entries</span>
          </div>
          <div className="relative w-full sm:w-auto">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input
              className="glass-input pl-9 pr-4 py-2 rounded-lg text-sm text-on-surface placeholder-on-surface-variant/50 w-full sm:w-72 focus:outline-none transition-all"
              placeholder="Search invoices..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
         <table className="w-full text-left text-sm whitespace-nowrap border-separate border-spacing-0">
            <thead className="text-xs text-on-surface-variant uppercase bg-surface-container-low/50 border-b border-primary/10">
              <tr>
                <th className={sortHeaderClass('invoiceNumber')} scope="col" onClick={() => handleSort('invoiceNumber')}>
                  <div className="flex items-center gap-1">
                    Invoice Number <span className={sortIconClass('invoiceNumber')}>{getSortIcon('invoiceNumber')}</span>
                  </div>
                </th>
                <th className={sortHeaderClass('customer')} scope="col" onClick={() => handleSort('customer')}>
                  <div className="flex items-center gap-1">
                    Customer <span className={sortIconClass('customer')}>{getSortIcon('customer')}</span>
                  </div>
                </th>
                <th className={sortHeaderClass('date')} scope="col" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-1">
                    Date & Status <span className={sortIconClass('date')}>{getSortIcon('date')}</span>
                  </div>
                </th>
                <th className={sortHeaderClass('amount')} scope="col" onClick={() => handleSort('amount')}>
                  <div className="flex items-center gap-1">
                    Total Amount <span className={sortIconClass('amount')}>{getSortIcon('amount')}</span>
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
              ) : paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                      <span className="material-symbols-outlined text-[32px]">request_quote</span>
                    </div>
                    <h3 className="text-lg font-bold text-on-surface">{searchQuery ? 'No matching invoices found' : 'No invoices yet'}</h3>
                    <p className="text-sm text-on-surface-variant mt-1">{searchQuery ? 'Try adjusting your search filters.' : 'Create your first invoice for this branch.'}</p>
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((invoice) => {
                  const isMostRecent = invoice.id === mostRecentInvoiceId;
                  return (
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
                      ₹ {invoice.totals?.grandTotal?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </td>
                    <td className="px-6 py-4">
                      {isMostRecent ? (
                        openActionId === invoice.id ? (
                          <div className="flex items-center justify-end gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                            <button onClick={() => handleViewPdf(invoice.id, invoice.invoiceNumber)} className="glass-button-icon p-1 rounded-md transition-all hover:text-blue-400 hover:bg-blue-400/10 tooltip cursor-pointer" title="View">
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                            </button>
                            <Link href={`/invoices/${invoice.id}/edit`}>
                              <button className="glass-button-icon p-1 rounded-md transition-all hover:text-primary hover:border-primary/30 hover:bg-primary/10 tooltip cursor-pointer" title="Edit">
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                              </button>
                            </Link>
                            <button onClick={() => handleOpenPaymentModal(invoice)} className="glass-button-icon p-1 rounded-md transition-all hover:text-purple-400 hover:border-purple-400/30 hover:bg-purple-400/10 tooltip cursor-pointer" title="Add Payment">
                              <span className="material-symbols-outlined text-[16px]">payments</span>
                            </button>
                            <button className="glass-button-icon p-1 rounded-md transition-all hover:text-emerald-400 hover:border-emerald-400/30 hover:bg-emerald-400/10 tooltip cursor-pointer" title="Send">
                              <span className="material-symbols-outlined text-[16px]">send</span>
                            </button>
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
                            <button onClick={() => handleOpenPaymentModal(invoice)} className="glass-button-icon p-1 rounded-md transition-all hover:text-purple-400 hover:border-purple-400/30 hover:bg-purple-400/10 tooltip cursor-pointer" title="Add Payment">
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
                        )
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
                          <button onClick={() => handleOpenPaymentModal(invoice)} className="glass-button-icon p-1 rounded-md transition-all hover:text-purple-400 hover:border-purple-400/30 hover:bg-purple-400/10 tooltip cursor-pointer" title="Add Payment">
                            <span className="material-symbols-outlined text-[16px]">payments</span>
                          </button>
                          <button className="glass-button-icon p-1 rounded-md transition-all hover:text-emerald-400 hover:border-emerald-400/30 hover:bg-emerald-400/10 tooltip cursor-pointer" title="Send">
                            <span className="material-symbols-outlined text-[16px]">send</span>
                          </button>
                          <button onClick={() => handleDownloadPdf(invoice.id, invoice.invoiceNumber)} className="glass-button-icon p-1 rounded-md transition-all hover:text-indigo-400 hover:border-indigo-400/30 hover:bg-indigo-400/10 tooltip cursor-pointer" title="Download PDF">
                            <span className="material-symbols-outlined text-[16px]">download</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-primary/10 bg-surface-container/30 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-2">
            <span className="text-sm text-on-surface-variant">
              {totalCount === 0
                ? 'Showing 0 entries'
                : `Showing ${startIndex} to ${endIndex} of ${totalCount} entries`}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm font-medium rounded-md text-on-surface-variant hover:bg-surface-container-highest border border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <span className="w-8 h-8 rounded-lg flex items-center justify-center font-bold bg-primary text-on-primary shadow-[0_0_10px_rgba(125,211,252,0.3)]">
                {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm font-medium rounded-md text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface border border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
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

                      <button onClick={() => { closePdfViewer(); handleOpenPaymentModal(activeInvoice); }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-highest/50 hover:bg-purple-400/10 hover:text-purple-400 border border-transparent hover:border-purple-400/20 text-on-surface-variant transition-all cursor-pointer tooltip" title="Add Payment">
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

      {/* Add Payment Modal */}
      {paymentModalOpen && selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-md transition-opacity" onClick={() => setPaymentModalOpen(false)}></div>
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden relative z-10 flex flex-col animate-in zoom-in-95 fade-in duration-200 border border-outline-variant/20">

            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">payments</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface">Record Payment</h3>
                  <p className="text-xs text-on-surface-variant">Invoice {selectedInvoiceForPayment.invoiceNumber}</p>
                </div>
              </div>
              <button onClick={() => setPaymentModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-highest text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar space-y-5">
              {paymentError && (
                <div className="p-3 rounded-lg bg-error/10 border border-error/20 flex items-start gap-2">
                  <span className="material-symbols-outlined text-error text-[18px]">error</span>
                  <p className="text-sm text-error font-medium">{paymentError}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Amount (₹)</label>
                  <input type="number" step="0.01" max={Number((selectedInvoiceForPayment.totals.grandTotal - selectedInvoiceForPayment.amountPaid).toFixed(2))} value={paymentForm.amount} onChange={(e) => setPaymentForm({...paymentForm, amount: parseFloat(e.target.value) || 0})} className="glass-input px-4 py-2.5 rounded-lg text-sm font-bold text-on-surface w-full" />
                  <p className="text-[10px] text-on-surface-variant mt-1">Max: ₹{(selectedInvoiceForPayment.totals.grandTotal - selectedInvoiceForPayment.amountPaid).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Payment Date</label>
                  <input type="date" value={paymentForm.date} onChange={(e) => setPaymentForm({...paymentForm, date: e.target.value})} className="glass-input px-4 py-2.5 rounded-lg text-sm font-semibold text-on-surface w-full" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Payment Method</label>
                  <div className="flex flex-wrap gap-2">
                    {['CASH', 'BANK_TRANSFER', 'CHEQUE', 'CREDIT_CARD', 'UPI', 'OTHER'].map(method => (
                      <button
                        key={method}
                        onClick={() => setPaymentForm({...paymentForm, method})}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-all ${
                          paymentForm.method === method
                            ? 'bg-primary/20 text-primary border-primary/50'
                            : 'bg-surface-container border-transparent text-on-surface-variant hover:bg-surface-container-highest'
                        }`}
                      >
                        {method.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Transaction Note / Reference</label>
                  <input type="text" placeholder="e.g. UPI Ref #12345678" value={paymentForm.note} onChange={(e) => setPaymentForm({...paymentForm, note: e.target.value})} className="glass-input px-4 py-2.5 rounded-lg text-sm text-on-surface w-full" />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Payment Proof (Optional)</label>
                  {paymentAttachment ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-outline-variant/20">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px]">
                            {paymentAttachment.type === 'application/pdf' ? 'picture_as_pdf' : 'image'}
                          </span>
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-semibold text-on-surface truncate">{paymentAttachment.name}</p>
                          <p className="text-xs text-on-surface-variant">{(paymentAttachment.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button onClick={() => setPaymentAttachment(null)} className="p-2 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors shrink-0">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-outline-variant/30 rounded-xl p-4 text-center hover:bg-surface-container-highest transition-colors relative group cursor-pointer">
                      <span className="material-symbols-outlined text-on-surface-variant text-[24px] mb-1 group-hover:text-primary transition-colors">upload_file</span>
                      <p className="text-sm font-semibold text-on-surface-variant group-hover:text-primary transition-colors">Attach Receipt</p>
                      <input
                        type="file"
                        accept=".pdf,image/jpeg,image/png,image/gif,image/webp,.heic,.heif"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                          const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');

                          if (!allowedTypes.includes(file.type) && !isHeic && !file.type.startsWith('image/')) {
                            setPaymentError('Attachment must be a PDF or an Image.');
                            e.target.value = '';
                            return;
                          }

                          if (file.size > 5 * 1024 * 1024) {
                            setPaymentError('Attachment must be less than 5MB.');
                            e.target.value = '';
                            return;
                          }

                          setPaymentError('');
                          if (isHeic || file.type.startsWith('image/')) {
                            try {
                              const compressed = await compressImage(file);
                              setPaymentAttachment(compressed);
                            } catch (err) {
                              setPaymentAttachment(file); // fallback
                            }
                          } else {
                            setPaymentAttachment(file);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-outline-variant/10 bg-surface-container-low/30 flex justify-end gap-3">
              <button onClick={() => setPaymentModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container-highest transition-colors">
                Cancel
              </button>
              <button onClick={handleSubmitPayment} disabled={isSubmittingPayment} className="glass-button-primary px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50">
                {isSubmittingPayment ? <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span> : <span className="material-symbols-outlined text-[18px]">check</span>}
                Save Payment
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}