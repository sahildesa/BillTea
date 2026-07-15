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
  amountPaid: number;
  amountDue: number;
  customer: {
    id?: string;
    customerName: string;
    companyName: string;
  } | null;
  totals: {
    grandTotal: number;
  };
}

type SortDirection = 'asc' | 'desc';
type SortKey = 'invoiceNumber' | 'date' | 'customer' | 'total' | 'paid' | 'pending' | 'status';
interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

export default function ReportsPage() {
  const { selectedBranchId, isLoadingBranches } = useBranch();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting State
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    if (selectedBranchId) {
      fetchInvoices();
    } else {
      setInvoices([]);
      setLoading(false);
    }
  }, [selectedBranchId]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/invoices?branchId=${selectedBranchId}`);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFromDate('');
    setToDate('');
    setSelectedCustomerId('ALL');
    setSelectedStatus('ALL');
    setSearchQuery('');
    setSortConfig(null);
    setCurrentPage(1);
  };

  // Derived state for Customers Dropdown
  const uniqueCustomers = useMemo(() => {
    const map = new Map<string, Invoice['customer']>();
    invoices.forEach(inv => {
      if (inv.customer && inv.customer.id) {
        map.set(inv.customer.id, inv.customer);
      }
    });
    return Array.from(map.values());
  }, [invoices]);

  // Filter logic
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // Date filter
      if (fromDate) {
        const invDate = new Date(inv.invoiceDate);
        const from = new Date(fromDate);
        // Set time to start of day for comparison
        invDate.setHours(0, 0, 0, 0);
        from.setHours(0, 0, 0, 0);
        if (invDate < from) return false;
      }
      if (toDate) {
        const invDate = new Date(inv.invoiceDate);
        const to = new Date(toDate);
        // Set time to start of day for comparison
        invDate.setHours(0, 0, 0, 0);
        to.setHours(0, 0, 0, 0);
        if (invDate > to) return false;
      }
      // Customer filter
      if (selectedCustomerId !== 'ALL' && inv.customer?.id !== selectedCustomerId) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'ALL' && inv.status !== selectedStatus) {
        return false;
      }
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchInvoice = inv.invoiceNumber?.toLowerCase().includes(query) || false;
        const matchCustomer = inv.customer?.customerName?.toLowerCase().includes(query) || false;
        
        if (!matchInvoice && !matchCustomer) {
          return false;
        }
      }
      return true;
    });
  }, [invoices, fromDate, toDate, selectedCustomerId, selectedStatus, searchQuery]);

  // ---- Sorting ----
  const handleSort = (key: SortKey) => {
    setCurrentPage(1);
    setSortConfig((prev) => {
      if (prev?.key === key && prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortIcon = (key: SortKey): string => {
    if (sortConfig?.key !== key) return 'unfold_more';
    return sortConfig.direction === 'asc' ? 'expand_less' : 'expand_more';
  };

  const sortValue = (inv: Invoice, key: SortKey): string | number => {
    switch (key) {
      case 'invoiceNumber': return inv.invoiceNumber || '';
      case 'date': return new Date(inv.invoiceDate).getTime() || 0;
      case 'customer': return inv.customer?.customerName || '';
      case 'total': return inv.totals?.grandTotal || 0;
      case 'paid': return inv.amountPaid || 0;
      case 'pending': return inv.amountDue || 0;
      case 'status': return inv.status || '';
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

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(sortedInvoices.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const paginatedInvoices = useMemo(() => {
    return sortedInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [sortedInvoices, currentPage, itemsPerPage]);

  const startIndex = sortedInvoices.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, sortedInvoices.length);

  const pageNumbers = useMemo(() => {
    const maxButtons = 5;
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [totalPages, currentPage]);

  const handleItemsPerPageChange = (n: number) => {
    setItemsPerPage(n);
    setCurrentPage(1);
  };

  // Stats calculation
  const stats = useMemo(() => {
    return filteredInvoices.reduce((acc, inv) => {
      acc.totalAmount += inv.totals?.grandTotal || 0;
      acc.totalPaid += inv.amountPaid || 0;
      acc.totalPending += inv.amountDue || 0;
      return acc;
    }, { totalAmount: 0, totalPaid: 0, totalPending: 0 });
  }, [filteredInvoices]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UNPAID': return 'bg-amber-500/10 text-amber-500 border-amber-500/20 text-error shadow-[0_0_10px_rgba(255,107,107,0.1)] border-error/20 bg-error/10'; // using the exact tailwind classes they had for Pending if it's UNPAID/Pending
      case 'PARTIAL': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'PAID': return 'border-secondary/20 bg-secondary/10 text-secondary shadow-[0_0_10px_rgba(136,180,204,0.1)]'; // using exact ones from static
      case 'OVERDUE': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-surface-container text-on-surface-variant border-outline-variant/30';
    }
  };

  const getStatusText = (status: string) => {
    if (status === 'UNPAID') return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const sortHeaderClass = (key: SortKey, align: 'left' | 'right' | 'center' = 'left') =>
    `px-6 py-4 text-xs font-bold uppercase tracking-wider cursor-pointer hover:text-primary transition-colors group select-none ${
      align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : ''
    } ${sortConfig?.key === key ? 'text-primary' : 'text-on-surface-variant'}`;

  const sortIconClass = (key: SortKey) =>
    `material-symbols-outlined text-[12px] transition-opacity ${
      sortConfig?.key === key ? 'opacity-100 text-primary' : 'opacity-50 group-hover:opacity-100'
    }`;

  return (
    <div className="flex-1 overflow-y-auto p-8 z-0 relative">
      {/* Background Ambient Effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,_rgba(125,211,252,0.03)_0%,_transparent_70%)] pointer-events-none z-0 blur-[60px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle,_rgba(200,160,240,0.02)_0%,_transparent_70%)] pointer-events-none z-0 blur-[50px]"></div>

      <div className="flex flex-col gap-8 relative z-10 max-w-[1440px] mx-auto">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight font-display mb-2">
              <span className="text-on-surface">Invoice </span>
              <span className="bg-gradient-to-br from-primary to-tertiary bg-clip-text text-transparent">Reports</span>
            </h1>
            <p className="text-on-surface-variant text-lg">Financial overview and tracking for Indux Technology.</p>
          </div>
          <Link href="/profit">
            <button className="glass-elevated px-6 py-3 rounded-xl border border-primary/30 text-primary font-semibold flex items-center gap-2 hover:bg-primary/10 transition-all duration-300 shadow-[0_0_15px_rgba(125,211,252,0.2)] hover:shadow-[0_0_25px_rgba(125,211,252,0.4)] active:scale-95 group cursor-pointer">
              <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">analytics</span>
              Profit & Loss Report
            </button>
          </Link>
        </header>

        {/* Filters Section */}
        <section className="glass-panel p-6 md:p-8 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary">filter_list</span>
            <h2 className="text-xl font-bold text-on-surface">Filters</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">From Date</label>
              <input 
                className="w-full h-12 px-4 rounded-lg bg-surface-container text-on-surface focus:ring-0 border border-primary/20 focus:border-primary transition-colors focus:shadow-[0_0_10px_rgba(125,211,252,0.3)] outline-none" 
                type="date" 
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">To Date</label>
              <input 
                className="w-full h-12 px-4 rounded-lg bg-surface-container text-on-surface focus:ring-0 border border-primary/20 focus:border-primary transition-colors focus:shadow-[0_0_10px_rgba(125,211,252,0.3)] outline-none" 
                type="date" 
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Customer</label>
              <select 
                className="w-full h-12 px-4 rounded-lg bg-surface-container text-on-surface focus:ring-0 border border-primary/20 focus:border-primary transition-colors focus:shadow-[0_0_10px_rgba(125,211,252,0.3)] outline-none"
                value={selectedCustomerId}
                onChange={(e) => { setSelectedCustomerId(e.target.value); setCurrentPage(1); }}
              >
                <option value="ALL">All Customers</option>
                {uniqueCustomers.map(customer => (
                  <option key={customer?.id} value={customer?.id}>
                    {customer?.customerName} {customer?.companyName ? `(${customer.companyName})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Payment Status</label>
              <select 
                className="w-full h-12 px-4 rounded-lg bg-surface-container text-on-surface focus:ring-0 border border-primary/20 focus:border-primary transition-colors focus:shadow-[0_0_10px_rgba(125,211,252,0.3)] outline-none"
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              >
                <option value="ALL">All Status</option>
                <option value="PAID">Paid</option>
                <option value="UNPAID">Pending</option>
                <option value="PARTIAL">Partial</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <button 
              className="bg-surface-variant text-on-surface px-8 py-3 rounded-lg font-semibold hover:bg-surface-container-highest transition-all cursor-pointer"
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-elevated p-6 rounded-xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-9xl">receipt</span>
            </div>
            <p className="text-on-surface-variant text-sm font-medium mb-1">Total Invoices</p>
            <p className="text-4xl font-black text-on-surface">{filteredInvoices.length}</p>
          </div>
          <div className="glass-elevated p-6 rounded-xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-9xl">payments</span>
            </div>
            <p className="text-on-surface-variant text-sm font-medium mb-1">Total Amount</p>
            <p className="text-4xl font-black text-primary">₹{stats.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="glass-elevated p-6 rounded-xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-9xl">verified_user</span>
            </div>
            <p className="text-on-surface-variant text-sm font-medium mb-1">Total Paid</p>
            <p className="text-4xl font-black text-secondary">₹{stats.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="glass-elevated p-6 rounded-xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-9xl">pending_actions</span>
            </div>
            <p className="text-on-surface-variant text-sm font-medium mb-1">Total Pending</p>
            <p className="text-4xl font-black text-tertiary">₹{stats.totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </section>

        {/* Invoice Details Table */}
        <section className="glass-panel rounded-xl overflow-hidden flex flex-col mb-12">
          <div className="p-6 border-b border-outline-variant/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container/30">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
              <h2 className="text-xl font-bold text-on-surface">Invoice Details</h2>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto flex-wrap">
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span>Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="bg-surface-container border border-primary/20 rounded-lg px-2 py-1.5 text-xs focus:ring-0 focus:border-primary cursor-pointer outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>entries</span>
              </div>
              <div className="relative w-full md:w-64 group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl group-focus-within:text-primary transition-colors">search</span>
                <input 
                  className="glass-input w-full pl-10 pr-4 h-10 rounded-full text-sm outline-none placeholder:text-on-surface-variant/50 transition-all" 
                  placeholder="Search invoices..." 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <div className="flex gap-2">
                <button className="p-2 glass-button-icon rounded-lg hover:bg-primary/10 transition-colors tooltip cursor-pointer" title="Export PDF">
                  <span className="material-symbols-outlined text-primary">picture_as_pdf</span>
                </button>
                <button className="p-2 glass-button-icon rounded-lg hover:bg-primary/10 transition-colors tooltip cursor-pointer" title="Export Excel">
                  <span className="material-symbols-outlined text-primary">table_view</span>
                </button>
                <button className="p-2 glass-button-icon rounded-lg hover:bg-primary/10 transition-colors tooltip cursor-pointer" title="Export CSV">
                  <span className="material-symbols-outlined text-primary">csv</span>
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-surface-container/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">#</th>
                  <th className={sortHeaderClass('invoiceNumber')} onClick={() => handleSort('invoiceNumber')}>
                    <div className="flex items-center gap-1">
                      Invoice Number <span className={sortIconClass('invoiceNumber')}>{getSortIcon('invoiceNumber')}</span>
                    </div>
                  </th>
                  <th className={sortHeaderClass('date')} onClick={() => handleSort('date')}>
                    <div className="flex items-center gap-1">
                      Date <span className={sortIconClass('date')}>{getSortIcon('date')}</span>
                    </div>
                  </th>
                  <th className={sortHeaderClass('customer')} onClick={() => handleSort('customer')}>
                    <div className="flex items-center gap-1">
                      Customer <span className={sortIconClass('customer')}>{getSortIcon('customer')}</span>
                    </div>
                  </th>
                  <th className={sortHeaderClass('total', 'right')} onClick={() => handleSort('total')}>
                    <div className="flex items-center justify-end gap-1">
                      Total Amount <span className={sortIconClass('total')}>{getSortIcon('total')}</span>
                    </div>
                  </th>
                  <th className={sortHeaderClass('paid', 'right')} onClick={() => handleSort('paid')}>
                    <div className="flex items-center justify-end gap-1">
                      Paid Amount <span className={sortIconClass('paid')}>{getSortIcon('paid')}</span>
                    </div>
                  </th>
                  <th className={sortHeaderClass('pending', 'right')} onClick={() => handleSort('pending')}>
                    <div className="flex items-center justify-end gap-1">
                      Pending Amount <span className={sortIconClass('pending')}>{getSortIcon('pending')}</span>
                    </div>
                  </th>
                  <th className={sortHeaderClass('status', 'center')} onClick={() => handleSort('status')}>
                    <div className="flex items-center justify-center gap-1">
                      Status <span className={sortIconClass('status')}>{getSortIcon('status')}</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5 text-sm">
                {isLoadingBranches || loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-on-surface-variant">
                      <div className="flex justify-center items-center gap-2">
                        <span className="material-symbols-outlined animate-spin">refresh</span> Loading invoices...
                      </div>
                    </td>
                  </tr>
                ) : paginatedInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-on-surface-variant">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                        <span className="material-symbols-outlined text-[32px]">search_off</span>
                      </div>
                      <h3 className="text-lg font-bold text-on-surface">No invoices found</h3>
                      <p className="text-sm mt-1">Try adjusting your filters.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedInvoices.map((invoice, idx) => (
                    <tr key={invoice.id} className="hover:bg-primary/5 transition-colors group cursor-pointer active:scale-[0.995]">
                      <td className="px-6 py-5 text-on-surface-variant font-medium">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td className="px-6 py-5 font-bold text-on-surface group-hover:text-primary transition-colors">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-5 text-on-surface-variant">
                        {new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${idx % 2 === 0 ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'} flex items-center justify-center text-xs font-bold`}>
                            {invoice.customer?.customerName?.substring(0, 2).toUpperCase() || 'NA'}
                          </div>
                          <span className="text-on-surface">{invoice.customer?.customerName || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right font-semibold text-on-surface">₹{invoice.totals?.grandTotal?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</td>
                      <td className="px-6 py-5 text-right text-on-surface-variant">₹{(invoice.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-6 py-5 text-right font-bold text-tertiary">₹{(invoice.amountDue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(invoice.status)}`}>
                          {getStatusText(invoice.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-6 border-t border-outline-variant/10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container/30">
            <p className="text-sm text-on-surface-variant">
              {sortedInvoices.length === 0
                ? 'Showing 0 entries'
                : <>Showing <span className="text-on-surface font-semibold">{startIndex}</span> to <span className="text-on-surface font-semibold">{endIndex}</span> of <span className="text-on-surface font-semibold">{sortedInvoices.length}</span> entries</>}
            </p>
            <div className="flex items-center gap-2">
              <button 
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-container-highest disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              
              {pageNumbers.map(page => (
                <button 
                  key={page}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold cursor-pointer transition-all ${currentPage === page ? 'bg-primary text-on-primary shadow-[0_0_10px_rgba(125,211,252,0.3)]' : 'hover:bg-surface-container-highest'}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button 
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-container-highest disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}