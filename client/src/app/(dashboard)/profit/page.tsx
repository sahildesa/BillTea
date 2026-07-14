'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/auth';
import { useBranch } from '@/components/BranchProvider';

interface Invoice {
  invoiceDate: string;
  totals: {
    grandTotal: number;
  };
}

interface Expense {
  date: string;
  amount: number;
}

type SortDirection = 'asc' | 'desc';
type SortKey = 'date' | 'income' | 'expense' | 'profit';
interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatCurrency(value: number) {
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ProfitReportPage() {
  const { selectedBranchId } = useBranch();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // ---- Table controls: search, sorting, pagination ----
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setFromDate(formatDateInput(firstDayOfMonth));
    setToDate(formatDateInput(today));
  }, []);

  useEffect(() => {
    if (!selectedBranchId) {
      setInvoices([]);
      setExpenses([]);
      return;
    }

    let mounted = true;

    async function loadData() {
      try {
        const [invoicesRes, expensesRes] = await Promise.all([
          apiFetch(`/invoices?branchId=${selectedBranchId}`),
          apiFetch(`/expenses?branchId=${selectedBranchId}`),
        ]);

        if (!mounted) return;

        if (invoicesRes.ok) {
          const data = await invoicesRes.json();
          setInvoices(Array.isArray(data) ? data : []);
        } else {
          setInvoices([]);
        }

        if (expensesRes.ok) {
          const data = await expensesRes.json();
          setExpenses(Array.isArray(data) ? data : []);
        } else {
          setExpenses([]);
        }
      } catch (err) {
        if (mounted) {
          setInvoices([]);
          setExpenses([]);
        }
      } finally {
        // no-op; data updates above drive the UI
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [selectedBranchId]);

  const filteredInvoices = useMemo(() => {
    if (!fromDate && !toDate) return invoices;

    return invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.invoiceDate);
      invoiceDate.setHours(0, 0, 0, 0);

      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        if (invoiceDate < from) return false;
      }

      if (toDate) {
        const to = new Date(toDate);
        to.setHours(0, 0, 0, 0);
        if (invoiceDate > to) return false;
      }

      return true;
    });
  }, [fromDate, invoices, toDate]);

  const filteredExpenses = useMemo(() => {
    if (!fromDate && !toDate) return expenses;

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      expenseDate.setHours(0, 0, 0, 0);

      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        if (expenseDate < from) return false;
      }

      if (toDate) {
        const to = new Date(toDate);
        to.setHours(0, 0, 0, 0);
        if (expenseDate > to) return false;
      }

      return true;
    });
  }, [expenses, fromDate, toDate]);

  const groupedRows = useMemo(() => {
    const rows = new Map<
      string,
      { date: string; income: number; expense: number }
    >();

    filteredInvoices.forEach((invoice) => {
      const key = new Date(invoice.invoiceDate).toISOString().split('T')[0];
      const existing = rows.get(key) || { date: key, income: 0, expense: 0 };
      existing.income += invoice.totals?.grandTotal || 0;
      rows.set(key, existing);
    });

    filteredExpenses.forEach((expense) => {
      const key = new Date(expense.date).toISOString().split('T')[0];
      const existing = rows.get(key) || { date: key, income: 0, expense: 0 };
      existing.expense += expense.amount || 0;
      rows.set(key, existing);
    });

    return Array.from(rows.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [filteredExpenses, filteredInvoices]);

  const totalIncome = useMemo(
    () => filteredInvoices.reduce((sum, invoice) => sum + (invoice.totals?.grandTotal || 0), 0),
    [filteredInvoices],
  );

  const totalExpense = useMemo(
    () => filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0),
    [filteredExpenses],
  );

  const netProfit = totalIncome - totalExpense;
  const totalIncomeBar = totalIncome > 0 ? 100 : 0;
  const totalExpenseBar = totalIncome > 0
    ? Math.min((totalExpense / totalIncome) * 100, 100)
    : 0;
  const netProfitBar = totalIncome > 0
    ? Math.max(0, Math.min((netProfit / totalIncome) * 100, 100))
    : 0;

  // ---- Search (by formatted date string) ----
  const searchedRows = useMemo(() => {
    if (!searchQuery) return groupedRows;
    const query = searchQuery.toLowerCase();
    return groupedRows.filter((row) => {
      const formatted = new Date(row.date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).toLowerCase();
      return formatted.includes(query);
    });
  }, [groupedRows, searchQuery]);

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

  const sortValue = (row: { date: string; income: number; expense: number }, key: SortKey): number => {
    switch (key) {
      case 'date': return new Date(row.date).getTime();
      case 'income': return row.income;
      case 'expense': return row.expense;
      case 'profit': return row.income - row.expense;
      default: return 0;
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortConfig) return searchedRows;
    return [...searchedRows].sort((a, b) => {
      const aVal = sortValue(a, sortConfig.key);
      const bVal = sortValue(b, sortConfig.key);
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchedRows, sortConfig]);

  // ---- Pagination ----
  const totalEntries = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, fromDate, toDate]);

  const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1;
  const endIndex = Math.min(currentPage * entriesPerPage, totalEntries);

  const paginatedRows = useMemo(() => {
    return sortedRows.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);
  }, [sortedRows, currentPage, entriesPerPage]);

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

  const handleEntriesPerPageChange = (n: number) => {
    setEntriesPerPage(n);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setFromDate(formatDateInput(firstDayOfMonth));
    setToDate(formatDateInput(today));
    setSearchQuery('');
    setSortConfig(null);
    setCurrentPage(1);
  };

  const sortHeaderClass = (key: SortKey, align: 'left' | 'right' = 'left') =>
    `px-6 py-4 text-xs font-bold uppercase tracking-widest border-b border-outline/10 cursor-pointer hover:text-primary transition-colors group select-none ${
      align === 'right' ? 'text-right' : ''
    } ${sortConfig?.key === key ? 'text-primary' : 'text-on-surface-variant'}`;

  const sortIconClass = (key: SortKey) =>
    `material-symbols-outlined text-[12px] transition-opacity ${
      sortConfig?.key === key ? 'opacity-100 text-primary' : 'opacity-50 group-hover:opacity-100'
    }`;

  return (
    <div className="flex-1 overflow-y-auto p-8 z-0 relative overflow-x-hidden">
      {/* Background Ambient Effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,_rgba(125,211,252,0.03)_0%,_transparent_70%)] pointer-events-none z-0 blur-[60px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle,_rgba(200,160,240,0.02)_0%,_transparent_70%)] pointer-events-none z-0 blur-[50px]"></div>

      <div className="relative z-10 max-w-[1440px] mx-auto flex flex-col gap-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
           <h1 className="text-3xl md:text-4xl font-black tracking-tight font-display mb-2">
                <span className="text-on-surface">Profit </span>
              <span className="bg-gradient-to-br from-primary to-tertiary bg-clip-text text-transparent">Report
                </span>
              </h1>
            <p className="text-on-surface-variant text-lg">Financial performance and net earnings analysis</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="glass-panel px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium text-on-surface hover:bg-primary/10 transition-all duration-300 cursor-pointer">
              <span className="material-symbols-outlined text-primary text-xl">picture_as_pdf</span>
              Export PDF
            </button>
            <button className="glass-panel px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium text-on-surface hover:bg-primary/10 transition-all duration-300 cursor-pointer">
              <span className="material-symbols-outlined text-primary text-xl">csv</span>
              Export CSV
            </button>
            <button className="glass-panel px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium text-on-surface hover:bg-primary/10 transition-all duration-300 cursor-pointer">
              <span className="material-symbols-outlined text-primary text-xl">table_view</span>
              Export Excel
            </button>
          </div>
        </header>

        {/* Filters Section */}
        <section className="glass-elevated rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01]">
          <div className="flex flex-wrap items-end gap-6">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2 ml-1">From Date</label>
            <div className="relative">
                <input className="w-full bg-surface-container/50 border border-outline/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2 ml-1">To Date</label>
              <div className="relative">
                <input className="w-full bg-surface-container/50 border border-outline/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCurrentPage(1)} className="bg-primary/20 text-primary border border-primary/40 px-8 py-3 rounded-xl font-bold hover:bg-primary/30 active:scale-95 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(125,211,252,0.2)] cursor-pointer">
                <span className="material-symbols-outlined">filter_list</span>
                Apply Filter
              </button>
              <button onClick={handleResetFilters} className="glass-panel px-8 py-3 rounded-xl font-medium text-on-surface-variant hover:text-on-surface transition-all cursor-pointer">
                Reset
              </button>
            </div>
          </div>
        </section>

        {/* Summary Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Income */}
          <div className="glass-elevated rounded-2xl p-6 relative overflow-hidden group transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-primary">currency_rupee</span>
            </div>
            <p className="text-on-surface-variant text-sm font-semibold uppercase tracking-widest mb-4">Total Income</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
              </div>
              <h3 className="text-3xl font-bold text-on-surface tracking-tight">₹{formatCurrency(totalIncome)}</h3>
            </div>
            <div className="mt-4 h-1 w-full bg-primary/5 rounded-full overflow-hidden">
              <div className="h-full bg-primary opacity-40" style={{ width: `${totalIncomeBar}%` }}></div>
            </div>
          </div>
          {/* Total Expense */}
          <div className="glass-elevated rounded-2xl p-6 relative overflow-hidden group transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-error">currency_rupee</span>
            </div>
            <p className="text-on-surface-variant text-sm font-semibold uppercase tracking-widest mb-4">Total Expense</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center border border-error/20">
                <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
              </div>
              <h3 className="text-3xl font-bold text-on-surface tracking-tight">₹{formatCurrency(totalExpense)}</h3>
            </div>
            <div className="mt-4 h-1 w-full bg-error/5 rounded-full overflow-hidden">
              <div className="h-full bg-error opacity-40" style={{ width: `${totalExpenseBar}%` }}></div>
            </div>
          </div>
          {/* Net Profit */}
          <div className="glass-elevated rounded-2xl p-6 relative overflow-hidden group border-primary/30 shadow-[0_0_20px_rgba(125,211,252,0.2)] transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01]">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <span className="material-symbols-outlined text-6xl text-primary">analytics</span>
            </div>
            <p className="text-on-surface-variant text-sm font-semibold uppercase tracking-widest mb-4">Net Profit</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/40">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
              </div>
              <h3 className="text-3xl font-bold text-primary tracking-tight">₹{formatCurrency(netProfit)}</h3>
            </div>
            <div className="mt-4 h-1 w-full bg-primary/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${netProfitBar}%` }}></div>
            </div>
          </div>
        </section>

        {/* Data Table Section */}
        <section className="glass-elevated rounded-2xl overflow-hidden border border-outline/10 transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01] flex flex-col mb-12">
          {/* Table Header Controls */}
          <div className="p-6 border-b border-outline/10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container/30">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg">
                <span className="material-symbols-outlined text-primary text-lg">calendar_month</span>
                <span className="text-sm font-bold text-on-surface whitespace-nowrap">Date-wise Breakdown</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span>Show</span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => handleEntriesPerPageChange(Number(e.target.value))}
                  className="bg-surface-container border border-outline/20 rounded px-2 py-1 text-xs focus:ring-0 focus:border-primary/50 cursor-pointer outline-none"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>entries</span>
              </div>
            </div>
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
              <input
                className="w-full bg-surface-container/50 border border-outline/20 rounded-xl pl-10 pr-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-all placeholder:text-on-surface-variant/50"
                placeholder="Search dates..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          {/* Table Body */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-surface-container/30">
                <tr>
                  <th className={sortHeaderClass('date')} onClick={() => handleSort('date')}>
                    <div className="flex items-center gap-1">
                      Date <span className={sortIconClass('date')}>{getSortIcon('date')}</span>
                    </div>
                  </th>
                  <th className={sortHeaderClass('income', 'right')} onClick={() => handleSort('income')}>
                    <div className="flex items-center justify-end gap-1">
                      Income (₹) <span className={sortIconClass('income')}>{getSortIcon('income')}</span>
                    </div>
                  </th>
                  <th className={sortHeaderClass('expense', 'right')} onClick={() => handleSort('expense')}>
                    <div className="flex items-center justify-end gap-1">
                      Expense (₹) <span className={sortIconClass('expense')}>{getSortIcon('expense')}</span>
                    </div>
                  </th>
                  <th className={sortHeaderClass('profit', 'right')} onClick={() => handleSort('profit')}>
                    <div className="flex items-center justify-end gap-1">
                      Profit (₹) <span className={sortIconClass('profit')}>{getSortIcon('profit')}</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5 text-sm">
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant">
                      {searchQuery ? 'No matching dates found.' : 'No data for the selected date range.'}
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row) => (
                    <tr key={row.date} className="hover:bg-primary/5 transition-colors group cursor-pointer active:scale-[0.995]">
                      <td className="px-6 py-5 font-medium text-on-surface">
                        {new Date(row.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-5 font-bold text-primary text-right">
                        ₹{formatCurrency(row.income)}
                      </td>
                      <td className="px-6 py-5 font-medium text-error text-right">
                        ₹{formatCurrency(row.expense)}
                      </td>
                      <td className="px-6 py-5 font-bold text-on-surface text-right">
                        ₹{formatCurrency(row.income - row.expense)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-surface-container/50 border-t-2 border-primary/20">
                  <td className="px-6 py-5 text-sm font-black uppercase tracking-wider text-on-surface">TOTAL:</td>
                  <td className="px-6 py-5 text-lg font-black text-primary text-right">₹{formatCurrency(totalIncome)}</td>
                  <td className="px-6 py-5 text-lg font-black text-error text-right">₹{formatCurrency(totalExpense)}</td>
                  <td className="px-6 py-5 text-lg font-black text-on-surface text-right">₹{formatCurrency(netProfit)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {/* Pagination Footer */}
          <div className="p-6 border-t border-outline/10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container/10">
            <p className="text-sm text-on-surface-variant">
              {totalEntries === 0
                ? 'Showing 0 entries'
                : `Showing ${startIndex} to ${endIndex} of ${totalEntries} entries`}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg text-on-surface-variant hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {pageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg border font-bold transition-colors cursor-pointer ${
                    page === currentPage
                      ? 'bg-primary/20 border-primary/40 text-primary shadow-[0_0_10px_rgba(125,211,252,0.2)]'
                      : 'border-transparent text-on-surface-variant hover:bg-primary/10 hover:text-on-surface'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg text-on-surface-variant hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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