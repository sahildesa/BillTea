'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../../../lib/auth';
import { useBranch } from '../../../components/BranchProvider';

type Customer = {
  id: string;
  customerName: string;
  companyName: string;
  email: string;
  mobileNumber: string;
  businessLabel: string;
  businessLabelValue: string;
  address: string;
  otherInfo: string;
  isActive: boolean;
  _count?: {
    invoices: number;
    quotations: number;
  };
};

type SortDirection = 'asc' | 'desc';
interface SortConfig {
  key: string;
  direction: SortDirection;
}

type StatusFilter = 'all' | 'active' | 'inactive';
type TypeFilter = 'all' | 'company' | 'individual';
type CountFilter = 'all' | 'with' | 'without';

export default function CustomersPage() {
  const { selectedBranchId, isLoadingBranches } = useBranch();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editCustomerId, setEditCustomerId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    companyName: '',
    email: '',
    mobileNumber: '',
    businessLabel: '',
    businessLabelValue: '',
    address: '',
    otherInfo: ''
  });

  // ---- Table controls: search, sorting, pagination ----
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // ---- Filters ----
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [invoiceFilter, setInvoiceFilter] = useState<CountFilter>('all');
  const [quotationFilter, setQuotationFilter] = useState<CountFilter>('all');

  const [activeDropdown, setActiveDropdown] = useState<'status' | 'type' | 'invoice' | 'quotation' | 'entries' | null>(null);

  const toggleDropdown = (name: 'status' | 'type' | 'invoice' | 'quotation' | 'entries') => {
    setActiveDropdown(prev => prev === name ? null : name);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (typeFilter !== 'all') count++;
    if (invoiceFilter !== 'all') count++;
    if (quotationFilter !== 'all') count++;
    return count;
  }, [statusFilter, typeFilter, invoiceFilter, quotationFilter]);

  const handleClearFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setInvoiceFilter('all');
    setQuotationFilter('all');
  };

  const stats = React.useMemo(() => {
    const total = customers.length;
    const active = customers.filter((c) => c.isActive).length;
    const totalInvoices = customers.reduce((sum, c) => sum + (c._count?.invoices || 0), 0);
    const totalQuotations = customers.reduce((sum, c) => sum + (c._count?.quotations || 0), 0);
    return { total, active, totalInvoices, totalQuotations };
  }, [customers]);

  useEffect(() => {
    if (!selectedBranchId) return;

    async function loadCustomers() {
      setLoading(true);
      try {
        const res = await apiFetch(`/customers?branchId=${selectedBranchId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setCustomers(data.customers);
          }
        }
      } catch (err) {
        console.error('Failed to load customers', err);
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, [selectedBranchId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenCreateModal = () => {
    setEditCustomerId(null);
    setFormData({
      customerName: '',
      companyName: '',
      email: '',
      mobileNumber: '',
      businessLabel: '',
      businessLabelValue: '',
      address: '',
      otherInfo: ''
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (customer: Customer) => {
    setEditCustomerId(customer.id);
    setFormData({
      customerName: customer.customerName || '',
      companyName: customer.companyName || '',
      email: customer.email || '',
      mobileNumber: customer.mobileNumber || '',
      businessLabel: customer.businessLabel || '',
      businessLabelValue: customer.businessLabelValue || '',
      address: customer.address || '',
      otherInfo: customer.otherInfo || ''
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranchId) return;

    setSaving(true);
    setError(null);

    try {
      const payload = editCustomerId ? formData : { ...formData, branchId: selectedBranchId };
      const endpoint = editCustomerId ? `/customers/${editCustomerId}` : '/customers';
      const method = editCustomerId ? 'PUT' : 'POST';

      const res = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (editCustomerId) {
          setCustomers(customers.map(c => c.id === editCustomerId ? data.customer : c));
        } else {
          setCustomers([data.customer, ...customers]);
        }
        setIsModalOpen(false);
      } else {
        setError(data.message || 'Failed to save customer');
      }
    } catch (err) {
      setError('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      const res = await apiFetch(`/customers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setCustomers(customers.filter(c => c.id !== id));
      } else {
        alert(data.message || 'Failed to delete customer');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting customer');
    }
  };

  // ---- Search ----
  const searchedCustomers = useMemo(() => {
    if (!searchQuery) return customers;
    const query = searchQuery.toLowerCase();
    return customers.filter((c) => {
      const nameMatch = c.customerName?.toLowerCase().includes(query);
      const companyMatch = c.companyName?.toLowerCase().includes(query);
      const emailMatch = c.email?.toLowerCase().includes(query);
      const mobileMatch = c.mobileNumber?.toLowerCase().includes(query);
      const identifierMatch = c.businessLabelValue?.toLowerCase().includes(query);
      return nameMatch || companyMatch || emailMatch || mobileMatch || identifierMatch;
    });
  }, [customers, searchQuery]);

  // ---- Filters ----
  const filteredCustomers = useMemo(() => {
    return searchedCustomers.filter((c) => {
      if (statusFilter === 'active' && !c.isActive) return false;
      if (statusFilter === 'inactive' && c.isActive) return false;

      if (typeFilter === 'company' && !c.companyName) return false;
      if (typeFilter === 'individual' && c.companyName) return false;

      const invoiceCount = c._count?.invoices || 0;
      if (invoiceFilter === 'with' && invoiceCount === 0) return false;
      if (invoiceFilter === 'without' && invoiceCount > 0) return false;

      const quotationCount = c._count?.quotations || 0;
      if (quotationFilter === 'with' && quotationCount === 0) return false;
      if (quotationFilter === 'without' && quotationCount > 0) return false;

      return true;
    });
  }, [searchedCustomers, statusFilter, typeFilter, invoiceFilter, quotationFilter]);

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

  const sortValue = (row: Customer, key: string): string | number => {
    switch (key) {
      case 'customer': return row.customerName || '';
      case 'contact': return row.email || row.mobileNumber || '';
      case 'identifier': return row.businessLabelValue || '';
      case 'invoices': return row._count?.invoices || 0;
      case 'quotations': return row._count?.quotations || 0;
      default: return '';
    }
  };

  const sortedCustomers = useMemo(() => {
    if (!sortConfig) return filteredCustomers;
    return [...filteredCustomers].sort((a, b) => {
      const aVal = sortValue(a, sortConfig.key);
      const bVal = sortValue(b, sortConfig.key);
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortConfig.direction === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredCustomers, sortConfig]);

  // ---- Pagination ----
  const totalCount = sortedCustomers.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / entriesPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilter, invoiceFilter, quotationFilter]);

  const startIndex = totalCount === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1;
  const endIndex = Math.min(currentPage * entriesPerPage, totalCount);

  const paginatedCustomers = useMemo(() => {
    return sortedCustomers.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);
  }, [sortedCustomers, currentPage, entriesPerPage]);

  const handleEntriesPerPageChange = (n: number) => {
    setEntriesPerPage(n);
    setCurrentPage(1);
  };

  const sortHeaderClass = (key: string) =>
    `px-6 py-4 cursor-pointer hover:text-primary transition-colors group outline-none focus:outline-none select-none [-webkit-tap-highlight-color:transparent] [-webkit-user-select:none] ${
      sortConfig?.key === key ? 'text-primary' : ''
    }`;

  const sortIconClass = (key: string) =>
    `material-symbols-outlined text-[12px] transition-opacity ${
      sortConfig?.key === key ? 'opacity-100 text-primary' : 'opacity-50 group-hover:opacity-100'
    }`;

  return (
    <>
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-40 cursor-default" 
          onClick={() => setActiveDropdown(null)} 
        />
      )}
      <div
        className="flex-1 overflow-y-auto p-8 z-0 relative no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
      <style jsx global>{`
  * {
    -webkit-tap-highlight-color: transparent !important;
  }
  button, th, select, input, a, tr, td, span, div, [role='button'] {
    -webkit-tap-highlight-color: transparent !important;
    -webkit-touch-callout: none !important;
    outline: none !important;
  }
  th::selection, th *::selection,
  button::selection, button *::selection,
  span::selection {
    background: transparent !important;
  }
  button::-moz-focus-inner {
    border: 0 !important;
  }
  button,
  button:focus,
  button:focus-visible,
  button:active,
  th,
  th:focus,
  th:focus-visible,
  th:active,
  select,
  select:focus,
  select:focus-visible,
  select:active,
  a,
  a:focus,
  a:focus-visible,
  a:active,
  tr,
  tr:focus,
  tr:active,
  td,
  td:focus,
  td:active,
  span,
  span:focus,
  span:active,
  [role='button'],
  [role='button']:focus,
  [role='button']:focus-visible,
  [role='button']:active {
    outline: none !important;
    box-shadow: none !important;
    -webkit-appearance: none;
    appearance: none;
  }
`}</style>
        {/* Background Ambient Effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,_rgba(125,211,252,0.03)_0%,_transparent_70%)] pointer-events-none z-0 blur-[60px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle,_rgba(200,160,240,0.02)_0%,_transparent_70%)] pointer-events-none z-0 blur-[50px]"></div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative z-10">
        <div className="space-y-1">
         <h1 className="text-3xl md:text-4xl font-black tracking-tight font-display mb-2">
              <span className="bg-gradient-to-br from-primary to-tertiary bg-clip-text text-transparent">
            Customers
            </span>
          </h1>
          <p className="text-on-surface-variant text-lg">Manage your business connections and relationship data.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          disabled={!selectedBranchId}
          className="glass-button-primary group flex items-center gap-2 px-5 py-2.5 rounded-lg text-primary font-semibold text-sm transition-all duration-300 shadow-[0_0_15px_rgba(125,211,252,0.1)] hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
          New Customer
        </button>
      </div>

{/* Metrics Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10">
  <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500"></div>
    <div className="flex justify-between items-start mb-4">
      <p className="text-on-surface-variant text-sm font-medium uppercase tracking-wider">Total Customers</p>
      <span className="material-symbols-outlined text-primary p-2 rounded-lg bg-primary/10">group</span>
    </div>
    <p className="text-3xl font-bold text-on-surface tracking-tight">{stats.total}</p>
    <p className="mt-2 text-sm text-on-surface-variant/60">for this branch</p>
  </div>

  <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/5 rounded-full blur-2xl group-hover:bg-tertiary/10 transition-colors duration-500"></div>
    <div className="flex justify-between items-start mb-4">
      <p className="text-on-surface-variant text-sm font-medium uppercase tracking-wider">Active Customers</p>
      <span className="material-symbols-outlined text-emerald-400 p-2 rounded-lg bg-emerald-400/10">task_alt</span>
    </div>
    <p className="text-3xl font-bold text-on-surface tracking-tight">{stats.active}</p>
    <p className="mt-2 text-sm text-on-surface-variant/60">
      {stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}% of total` : 'no data yet'}
    </p>
  </div>

  <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500"></div>
    <div className="flex justify-between items-start mb-4">
      <p className="text-on-surface-variant text-sm font-medium uppercase tracking-wider">Total Invoices</p>
      <span className="material-symbols-outlined text-primary p-2 rounded-lg bg-primary/10">receipt_long</span>
    </div>
    <p className="text-3xl font-bold text-on-surface tracking-tight">{stats.totalInvoices}</p>
    <p className="mt-2 text-sm text-on-surface-variant/60">across all customers</p>
  </div>

  <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/5 rounded-full blur-2xl group-hover:bg-tertiary/10 transition-colors duration-500"></div>
    <div className="flex justify-between items-start mb-4">
      <p className="text-on-surface-variant text-sm font-medium uppercase tracking-wider">Total Quotations</p>
      <span className="material-symbols-outlined text-tertiary p-2 rounded-lg bg-tertiary/10">request_quote</span>
    </div>
    <p className="text-3xl font-bold text-on-surface tracking-tight">{stats.totalQuotations}</p>
    <p className="mt-2 text-sm text-on-surface-variant/60">across all customers</p>
  </div>
</div>

      {/* Filters Section */}
      <section className="glass-panel p-6 md:p-8 rounded-3xl relative overflow-visible animate-fade-slide-up shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] mb-8 z-20" style={{ animationDelay: '0.2s' }}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap relative z-10">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary p-2 rounded-lg bg-primary/10">filter_list</span>
            <h2 className="text-xl font-bold text-on-surface">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-on-primary text-[11px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </div>
          <div className="flex gap-2">
           
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {/* Status Filter */}
          <div className="space-y-2 relative" style={{ zIndex: activeDropdown === 'status' ? 50 : 10 }}>
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Status</label>
            <div className="relative">
              <button
                type="button"
                className="w-full h-12 px-4 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-medium flex items-center justify-between"
                onClick={() => toggleDropdown('status')}
              >
                <span>
                  {statusFilter === 'all' ? 'All status' : statusFilter === 'active' ? 'Active' : 'Inactive'}
                </span>
                <span className={`material-symbols-outlined text-on-surface-variant text-[18px] transition-transform duration-200 ${activeDropdown === 'status' ? 'rotate-180' : ''}`}>expand_more</span>
              </button>
              
              {activeDropdown === 'status' && (
                <div className="absolute top-full left-0 right-0 mt-2 z-[60] bg-surface-container-highest rounded-xl border border-primary/10 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
                  <div 
                    onClick={() => { setStatusFilter('all'); setActiveDropdown(null); }} 
                    className={`px-4 py-3 text-sm cursor-pointer transition-colors ${statusFilter === 'all' ? 'bg-primary/20 text-primary font-semibold' : 'text-on-surface hover:bg-primary/10'}`}
                  >
                    All status
                  </div>
                  <div 
                    onClick={() => { setStatusFilter('active'); setActiveDropdown(null); }} 
                    className={`px-4 py-3 text-sm cursor-pointer transition-colors ${statusFilter === 'active' ? 'bg-primary/20 text-primary font-semibold' : 'text-on-surface hover:bg-primary/10'}`}
                  >
                    Active
                  </div>
                  <div 
                    onClick={() => { setStatusFilter('inactive'); setActiveDropdown(null); }} 
                    className={`px-4 py-3 text-sm cursor-pointer transition-colors ${statusFilter === 'inactive' ? 'bg-primary/20 text-primary font-semibold' : 'text-on-surface hover:bg-primary/10'}`}
                  >
                    Inactive
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customer Type Filter */}
          <div className="space-y-2 relative" style={{ zIndex: activeDropdown === 'type' ? 50 : 10 }}>
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Customer Type</label>
            <div className="relative">
              <button
                type="button"
                className="w-full h-12 px-4 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-medium flex items-center justify-between"
                onClick={() => toggleDropdown('type')}
              >
                <span>
                  {typeFilter === 'all' ? 'All types' : typeFilter === 'company' ? 'Company' : 'Individual'}
                </span>
                <span className={`material-symbols-outlined text-on-surface-variant text-[18px] transition-transform duration-200 ${activeDropdown === 'type' ? 'rotate-180' : ''}`}>expand_more</span>
              </button>
              
              {activeDropdown === 'type' && (
                <div className="absolute top-full left-0 right-0 mt-2 z-[60] bg-surface-container-highest rounded-xl border border-primary/10 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
                  <div 
                    onClick={() => { setTypeFilter('all'); setActiveDropdown(null); }} 
                    className={`px-4 py-3 text-sm cursor-pointer transition-colors ${typeFilter === 'all' ? 'bg-primary/20 text-primary font-semibold' : 'text-on-surface hover:bg-primary/10'}`}
                  >
                    All types
                  </div>
                  <div 
                    onClick={() => { setTypeFilter('company'); setActiveDropdown(null); }} 
                    className={`px-4 py-3 text-sm cursor-pointer transition-colors ${typeFilter === 'company' ? 'bg-primary/20 text-primary font-semibold' : 'text-on-surface hover:bg-primary/10'}`}
                  >
                    Company
                  </div>
                  <div 
                    onClick={() => { setTypeFilter('individual'); setActiveDropdown(null); }} 
                    className={`px-4 py-3 text-sm cursor-pointer transition-colors ${typeFilter === 'individual' ? 'bg-primary/20 text-primary font-semibold' : 'text-on-surface hover:bg-primary/10'}`}
                  >
                    Individual
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Invoices Filter */}
          <div className="space-y-2 relative" style={{ zIndex: activeDropdown === 'invoice' ? 50 : 10 }}>
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Invoices</label>
            <div className="relative">
              <button
                type="button"
                className="w-full h-12 px-4 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-medium flex items-center justify-between"
                onClick={() => toggleDropdown('invoice')}
              >
                <span>
                  {invoiceFilter === 'all' ? 'Any' : invoiceFilter === 'with' ? 'With invoices' : 'Without invoices'}
                </span>
                <span className={`material-symbols-outlined text-on-surface-variant text-[18px] transition-transform duration-200 ${activeDropdown === 'invoice' ? 'rotate-180' : ''}`}>expand_more</span>
              </button>
              
              {activeDropdown === 'invoice' && (
                <div className="absolute top-full left-0 right-0 mt-2 z-[60] bg-surface-container-highest rounded-xl border border-primary/10 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
                  <div 
                    onClick={() => { setInvoiceFilter('all'); setActiveDropdown(null); }} 
                    className={`px-4 py-3 text-sm cursor-pointer transition-colors ${invoiceFilter === 'all' ? 'bg-primary/20 text-primary font-semibold' : 'text-on-surface hover:bg-primary/10'}`}
                  >
                    Any
                  </div>
                  <div 
                    onClick={() => { setInvoiceFilter('with'); setActiveDropdown(null); }} 
                    className={`px-4 py-3 text-sm cursor-pointer transition-colors ${invoiceFilter === 'with' ? 'bg-primary/20 text-primary font-semibold' : 'text-on-surface hover:bg-primary/10'}`}
                  >
                    With invoices
                  </div>
                  <div 
                    onClick={() => { setInvoiceFilter('without'); setActiveDropdown(null); }} 
                    className={`px-4 py-3 text-sm cursor-pointer transition-colors ${invoiceFilter === 'without' ? 'bg-primary/20 text-primary font-semibold' : 'text-on-surface hover:bg-primary/10'}`}
                  >
                    Without invoices
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quotations Filter */}
          <div className="space-y-2 relative" style={{ zIndex: activeDropdown === 'quotation' ? 50 : 10 }}>
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Quotations</label>
            <div className="relative">
              <button
                type="button"
                className="w-full h-12 px-4 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-medium flex items-center justify-between"
                onClick={() => toggleDropdown('quotation')}
              >
                <span>
                  {quotationFilter === 'all' ? 'Any' : quotationFilter === 'with' ? 'With quotations' : 'Without quotations'}
                </span>
                <span className={`material-symbols-outlined text-on-surface-variant text-[18px] transition-transform duration-200 ${activeDropdown === 'quotation' ? 'rotate-180' : ''}`}>expand_more</span>
              </button>
              
              {activeDropdown === 'quotation' && (
                <div className="absolute top-full left-0 right-0 mt-2 z-[60] bg-surface-container-highest rounded-xl border border-primary/10 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
                  <div 
                    onClick={() => { setQuotationFilter('all'); setActiveDropdown(null); }} 
                    className={`px-4 py-3 text-sm cursor-pointer transition-colors ${quotationFilter === 'all' ? 'bg-primary/20 text-primary font-semibold' : 'text-on-surface hover:bg-primary/10'}`}
                  >
                    Any
                  </div>
                  <div 
                    onClick={() => { setQuotationFilter('with'); setActiveDropdown(null); }} 
                    className={`px-4 py-3 text-sm cursor-pointer transition-colors ${quotationFilter === 'with' ? 'bg-primary/20 text-primary font-semibold' : 'text-on-surface hover:bg-primary/10'}`}
                  >
                    With quotations
                  </div>
                  <div 
                    onClick={() => { setQuotationFilter('without'); setActiveDropdown(null); }} 
                    className={`px-4 py-3 text-sm cursor-pointer transition-colors ${quotationFilter === 'without' ? 'bg-primary/20 text-primary font-semibold' : 'text-on-surface hover:bg-primary/10'}`}
                  >
                    Without quotations
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 relative z-10">
          <button
            disabled={activeFilterCount === 0}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface border border-outline-variant/20 hover:border-outline-variant/40 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-on-surface-variant disabled:hover:border-outline-variant/20"
            onClick={handleClearFilters}
          >
                  <span className="material-symbols-outlined text-[18px]">undo</span>
            Reset Filters
          </button>
        </div>
      </section>


      {/* Main Content Glass Card */}
      <section className="glass-panel rounded-xl overflow-hidden mb-12 relative z-10 border border-primary/10 shadow-lg">
        {/* Table Controls */}
        <div className="p-6 border-b border-primary/10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container/30">
          <div className="flex items-center gap-3 relative" style={{ zIndex: activeDropdown === 'entries' ? 50 : 10 }}>
            <span className="text-sm text-on-surface-variant">Show</span>
            <div className="relative">
              <button
                type="button"
                className="glass-input text-sm pl-3 pr-9 py-1.5 rounded-lg text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/50 cursor-pointer bg-surface-container-highest flex items-center justify-between min-w-[70px]"
                onClick={() => toggleDropdown('entries')}
              >
                <span>{entriesPerPage}</span>
                <span className={`material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] transition-transform duration-200 ${activeDropdown === 'entries' ? 'rotate-180' : ''}`}>expand_more</span>
              </button>
              
              {activeDropdown === 'entries' && (
                <div className="absolute top-full left-0 mt-1 z-[60] bg-surface-container-highest rounded-lg border border-primary/10 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150 min-w-[70px]">
                  <div 
                    onClick={() => { handleEntriesPerPageChange(10); setActiveDropdown(null); }} 
                    className={`px-3 py-2 text-sm cursor-pointer transition-colors ${entriesPerPage === 10 ? 'bg-primary/20 text-primary font-semibold' : 'text-on-surface hover:bg-primary/10'}`}
                  >
                    10
                  </div>
                  <div 
                    onClick={() => { handleEntriesPerPageChange(25); setActiveDropdown(null); }} 
                    className={`px-3 py-2 text-sm cursor-pointer transition-colors ${entriesPerPage === 25 ? 'bg-primary/20 text-primary font-semibold' : 'text-on-surface hover:bg-primary/10'}`}
                  >
                    25
                  </div>
                  <div 
                    onClick={() => { handleEntriesPerPageChange(50); setActiveDropdown(null); }} 
                    className={`px-3 py-2 text-sm cursor-pointer transition-colors ${entriesPerPage === 50 ? 'bg-primary/20 text-primary font-semibold' : 'text-on-surface hover:bg-primary/10'}`}
                  >
                    50
                  </div>
                </div>
              )}
            </div>
            <span className="text-sm text-on-surface-variant">entries</span>
          </div>
          <div className="relative w-full sm:w-80 group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-sm">search</span>
            <input
              className="glass-input w-full pl-10 pr-4 py-2 rounded-lg text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none transition-all"
              placeholder="Search customers..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Desktop-Only Data Table */}
        <div className="hidden md:block overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <table className="w-full text-left border-separate border-spacing-0 whitespace-nowrap">
            <thead>
              <tr className="bg-surface-container-low/50 text-xs font-semibold text-on-surface-variant uppercase tracking-wider border-b border-primary/10">
                <th className={sortHeaderClass('customer')} onClick={() => handleSort('customer')} tabIndex={-1}>
                  <div className="flex items-center gap-1">
                    Customer <span className={sortIconClass('customer')}>{getSortIcon('customer')}</span>
                  </div>
                </th>
                <th className={sortHeaderClass('contact')} onClick={() => handleSort('contact')} tabIndex={-1}>
                  <div className="flex items-center gap-1">
                    Contact <span className={sortIconClass('contact')}>{getSortIcon('contact')}</span>
                  </div>
                </th>
                <th className={sortHeaderClass('identifier')} onClick={() => handleSort('identifier')} tabIndex={-1}>
                  <div className="flex items-center gap-1">
                    Identifier <span className={sortIconClass('identifier')}>{getSortIcon('identifier')}</span>
                  </div>
                </th>
                <th className={`${sortHeaderClass('invoices')} text-center`} onClick={() => handleSort('invoices')} tabIndex={-1}>
                  <div className="flex items-center justify-center gap-1">
                    Invoices <span className={sortIconClass('invoices')}>{getSortIcon('invoices')}</span>
                  </div>
                </th>
                <th className={`${sortHeaderClass('quotations')} text-center`} onClick={() => handleSort('quotations')} tabIndex={-1}>
                  <div className="flex items-center justify-center gap-1">
                    Quotations <span className={sortIconClass('quotations')}>{getSortIcon('quotations')}</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-right pr-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5 text-sm">
              {isLoadingBranches || loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">
                    <div className="flex justify-center items-center gap-2">
                      <span className="material-symbols-outlined animate-spin">refresh</span> Loading customers...
                    </div>
                  </td>
                </tr>
              ) : paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">
                    {searchQuery || activeFilterCount > 0 ? 'No matching customers found.' : 'No customers found for this branch. Create one to get started!'}
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer) => (
                  <tr key={customer.id} className="group hover:bg-primary/5 transition-colors duration-200">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-400/20 flex items-center justify-center text-primary font-bold shadow-lg">
                          {customer.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-on-surface">{customer.customerName}</div>
                          <div className="text-xs text-on-surface-variant/70">{customer.companyName || 'Individual'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-on-surface-variant">{customer.mobileNumber}</div>
                      <div className="text-xs text-on-surface-variant/60">{customer.email}</div>
                    </td>
                    <td className="px-6 py-5">
                      {customer.businessLabel ? (
                        <div>
                          <div className="text-xs text-on-surface-variant/80 uppercase">{customer.businessLabel}</div>
                          <div className="text-sm text-on-surface font-medium">{customer.businessLabelValue}</div>
                        </div>
                      ) : (
                        <span className="text-on-surface-variant/50 text-xs italic">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary-container/45 text-secondary text-xs font-medium border border-secondary/10">
                        <span className="material-symbols-outlined text-sm">description</span> {customer._count?.invoices || 0}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-tertiary-container/45 text-tertiary text-xs font-medium border border-tertiary/10">
                        <span className="material-symbols-outlined text-sm">request_quote</span> {customer._count?.quotations || 0}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right pr-8">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenEditModal(customer)} className="glass-button-icon p-1 rounded-md transition-all cursor-pointer hover:text-primary hover:border-primary/30 hover:bg-primary/10 outline-none focus:outline-none [-webkit-tap-highlight-color:transparent]" title="Edit">
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button onClick={() => handleDeleteCustomer(customer.id)} className="glass-button-icon p-1 rounded-md transition-all hover:text-error hover:border-error/30 hover:bg-error/10 cursor-pointer" title="Delete">
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile-Only Customer Card List */}
        <div className="block md:hidden divide-y divide-primary/5">
          {isLoadingBranches || loading ? (
            <div className="px-6 py-8 text-center text-on-surface-variant">
              <div className="flex justify-center items-center gap-2">
                <span className="material-symbols-outlined animate-spin">refresh</span> Loading customers...
              </div>
            </div>
          ) : paginatedCustomers.length === 0 ? (
            <div className="px-6 py-8 text-center text-on-surface-variant">
              {searchQuery || activeFilterCount > 0 ? 'No matching customers found.' : 'No customers found for this branch. Create one to get started!'}
            </div>
          ) : (
            paginatedCustomers.map((customer) => (
              <div key={customer.id} className="p-5 space-y-4 hover:bg-primary/5 transition-colors duration-200">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-400/20 flex items-center justify-center text-primary font-bold shadow-lg shrink-0">
                      {customer.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-on-surface">{customer.customerName}</div>
                      <div className="text-xs text-on-surface-variant/70">{customer.companyName || 'Individual'}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleOpenEditModal(customer)} className="glass-button-icon p-2 rounded-md transition-all hover:text-primary hover:border-primary/30 hover:bg-primary/10 cursor-pointer outline-none focus:outline-none [-webkit-tap-highlight-color:transparent]" title="Edit">
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button onClick={() => handleDeleteCustomer(customer.id)} className="glass-button-icon p-2 rounded-md transition-all hover:text-error hover:border-error/30 hover:bg-error/10 cursor-pointer outline-none focus:outline-none [-webkit-tap-highlight-color:transparent]" title="Delete">
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-t border-primary/5 pt-3">
                  <div className="space-y-1">
                    <span className="text-on-surface-variant/60 block text-[10px] uppercase font-bold tracking-wider">Contact Details</span>
                    <div className="text-on-surface flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">phone_iphone</span> {customer.mobileNumber || 'N/A'}
                    </div>
                    {customer.email && (
                      <div className="text-on-surface-variant/80 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">mail</span> {customer.email}
                      </div>
                    )}
                  </div>
                  
                  {customer.businessLabel ? (
                    <div className="space-y-1">
                      <span className="text-on-surface-variant/60 block text-[10px] uppercase font-bold tracking-wider">{customer.businessLabel}</span>
                      <div className="text-on-surface font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">sell</span> {customer.businessLabelValue}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary-container/45 text-secondary text-xs font-medium border border-secondary/10">
                    <span className="material-symbols-outlined text-xs">description</span> Invoices: {customer._count?.invoices || 0}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-tertiary-container/45 text-tertiary text-xs font-medium border border-tertiary/10">
                    <span className="material-symbols-outlined text-xs">request_quote</span> Quotations: {customer._count?.quotations || 0}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-primary/10 flex flex-col md:flex-row items-center justify-between gap-4 bg-surface-container/30">
          <span className="text-sm text-on-surface-variant/70">
            {totalCount === 0
              ? 'Showing 0 entries'
              : <>Showing <span className="text-on-surface font-semibold">{startIndex}</span> to <span className="text-on-surface font-semibold">{endIndex}</span> of <span className="text-on-surface font-semibold">{totalCount}</span> entries</>}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium rounded-md text-on-surface-variant hover:bg-surface-container-highest border border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer outline-none focus:outline-none [-webkit-tap-highlight-color:transparent]"
            >
              Previous
            </button>
            <span className="w-8 h-8 rounded-lg flex items-center justify-center font-bold bg-primary text-on-primary shadow-[0_0_10px_rgba(125,211,252,0.3)]">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium rounded-md text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface border border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer outline-none focus:outline-none [-webkit-tap-highlight-color:transparent]"
            >
              Next
            </button>
          </div>
        </div>
      </section>
      </div>

      {/* New Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border border-primary/20 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 relative overflow-hidden">
            {/* Modal Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-primary/10 rounded-full blur-[60px] pointer-events-none"></div>

            <div className="p-6 sm:px-8 sm:pt-8 sm:pb-6 border-b border-primary/10 flex justify-between items-center relative z-10">
              <div>
                <h2 className="text-2xl font-bold text-on-surface tracking-tight">{editCustomerId ? 'Edit Customer' : 'New Customer'}</h2>
                <p className="text-sm text-on-surface-variant/80 mt-1">{editCustomerId ? 'Update the details for this connection.' : 'Add a new connection to your selected branch.'}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-error/10 text-on-surface-variant hover:text-error transition-all group cursor-pointer">
                <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform">close</span>
              </button>
            </div>
            
            <div className="p-6 sm:px-8 overflow-y-auto custom-scrollbar relative z-10">
              {error && (
                <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-xl text-sm flex items-start gap-3 animate-in slide-in-from-top-2">
                  <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
                  <p>{error}</p>
                </div>
              )}
              
              <form id="customerForm" onSubmit={handleSaveCustomer} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">person</span> Customer Name *
                    </label>
                    <input required name="customerName" value={formData.customerName} onChange={handleInputChange} className="glass-input w-full px-4 py-3 rounded-xl text-sm border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all bg-surface-container/50 hover:bg-surface-container" placeholder="e.g. John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">phone_iphone</span> Mobile Number *
                    </label>
                    <input required name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} className="glass-input w-full px-4 py-3 rounded-xl text-sm border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all bg-surface-container/50 hover:bg-surface-container" placeholder="+1 234 567 8900" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">mail</span> Email
                    </label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="glass-input w-full px-4 py-3 rounded-xl text-sm border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all bg-surface-container/50 hover:bg-surface-container" placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">corporate_fare</span> Company Name
                    </label>
                    <input name="companyName" value={formData.companyName} onChange={handleInputChange} className="glass-input w-full px-4 py-3 rounded-xl text-sm border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all bg-surface-container/50 hover:bg-surface-container" placeholder="Doe Enterprises" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">sell</span> Business Label
                    </label>
                    <input name="businessLabel" value={formData.businessLabel} onChange={handleInputChange} className="glass-input w-full px-4 py-3 rounded-xl text-sm border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all bg-surface-container/50 hover:bg-surface-container" placeholder="e.g., GST No, VAT No" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">pin</span> Label Value
                    </label>
                    <input name="businessLabelValue" value={formData.businessLabelValue} onChange={handleInputChange} className="glass-input w-full px-4 py-3 rounded-xl text-sm border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all bg-surface-container/50 hover:bg-surface-container" placeholder="Number/Value" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">location_on</span> Address
                  </label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} rows={2} className="glass-input w-full px-4 py-3 rounded-xl text-sm resize-none custom-scrollbar border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all bg-surface-container/50 hover:bg-surface-container" placeholder="Full address"></textarea>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">notes</span> Other Info
                  </label>
                  <textarea name="otherInfo" value={formData.otherInfo} onChange={handleInputChange} rows={2} className="glass-input w-full px-4 py-3 rounded-xl text-sm resize-none custom-scrollbar border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all bg-surface-container/50 hover:bg-surface-container" placeholder="Additional notes or info"></textarea>
                </div>
              </form>
            </div>
            
            <div className="p-6 sm:px-8 border-t border-primary/10 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-surface-container/30 relative z-10">
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-6 py-2.5 rounded-xl glass-button text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer text-center">
                Cancel
              </button>
              <button type="submit" form="customerForm" disabled={saving} className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-[0_0_15px_rgba(125,211,252,0.4)] hover:shadow-[0_0_25px_rgba(125,211,252,0.6)] hover:brightness-110 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                {saving ? (
                  <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Saving...</>
                ) : (
                  <><span className="material-symbols-outlined text-[18px]">check_circle</span> Save Customer</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}