'use client';

import { useState, useEffect, useRef } from 'react';
import { apiFetch, API_BASE } from '@/lib/auth';
import { useBranch } from '@/components/BranchProvider';

interface ExpenseCategory {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  createdBy: { fullName: string } | null;
}

interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory | null;
  paymentMethod: string;
  note: string;
  date: string;
  attachment: string;
  createdBy: { fullName: string } | null;
  createdAt: string;
}

export default function ExpensesPage() {
  const { selectedBranchId, isLoadingBranches } = useBranch();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  
  const [loading, setLoading] = useState(true);
  
  // Expense Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editExpenseId, setEditExpenseId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Category Management Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryError, setCategoryError] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  // Attachment Viewer Modal
  const [viewerAttachment, setViewerAttachment] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    paymentMethod: 'Cash',
    note: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  
  // Combobox State
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedBranchId) {
      fetchExpenses();
      fetchCategories();
    } else {
      setExpenses([]);
    }
  }, [selectedBranchId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchExpenses = async () => {
    if (!selectedBranchId) return;
    try {
      setLoading(true);
      const res = await apiFetch(`/expenses?branchId=${selectedBranchId}`);
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch (err) {
      console.error('Failed to fetch expenses', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!selectedBranchId) return;
    try {
      const res = await apiFetch(`/expense-categories?branchId=${selectedBranchId}`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const openNewModal = () => {
    setIsEditMode(false);
    setEditExpenseId(null);
    setFormData({
      amount: '',
      category: '',
      paymentMethod: 'Cash',
      note: '',
      date: new Date().toISOString().split('T')[0],
    });
    setCategorySearch('');
    setAttachmentFile(null);
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (expense: Expense) => {
    setIsEditMode(true);
    setEditExpenseId(expense.id);
    setFormData({
      amount: expense.amount.toString(),
      category: expense.category?.name || '',
      paymentMethod: expense.paymentMethod,
      note: expense.note || '',
      date: new Date(expense.date).toISOString().split('T')[0],
    });
    setCategorySearch(expense.category?.name || '');
    setAttachmentFile(null);
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachmentFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.category || !formData.date) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const submitData = new FormData();
      submitData.append('branchId', selectedBranchId!);
      submitData.append('amount', formData.amount);
      submitData.append('category', formData.category);
      submitData.append('paymentMethod', formData.paymentMethod);
      submitData.append('note', formData.note);
      submitData.append('date', formData.date);
      
      if (attachmentFile) {
        submitData.append('attachment', attachmentFile);
      }

      const url = isEditMode ? `/expenses/${editExpenseId}` : '/expenses';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        body: submitData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save expense');
      }

      await fetchExpenses();
      await fetchCategories(); // Refresh categories in case a new one was created
      closeModal();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const res = await apiFetch(`/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchExpenses();
      }
    } catch (err) {
      console.error('Failed to delete expense', err);
    }
  };

  const getAttachmentUrl = (filePath: string) => {
    if (!filePath) return null;
    const baseUrl = API_BASE.replace('/api/v1', '');
    const normalizedPath = filePath.replace(/\\/g, '/');
    const path = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
    return `${baseUrl}${path}`;
  };

  const isPdf = (filePath: string) => {
    return filePath.toLowerCase().endsWith('.pdf');
  };

  // --- Category Management ---
  const handleSaveCategory = async (id: string) => {
    try {
      const res = await apiFetch(`/expense-categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editCategoryName })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update category');
      }
      setEditingCategoryId(null);
      await fetchCategories();
      await fetchExpenses(); // Refresh expenses to show updated names
    } catch (err: any) {
      setCategoryError(err.message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await apiFetch(`/expense-categories/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete category');
      }
      await fetchCategories();
    } catch (err: any) {
      setCategoryError(err.message);
    }
  };

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-theme(spacing.16))] bg-background overflow-hidden relative">
      <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
        <div className="max-w-[1600px] mx-auto w-full space-y-8 pb-20">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
               <h1 className="text-3xl md:text-4xl font-black tracking-tight font-display mb-2">
              <span className="bg-gradient-to-br from-primary to-tertiary bg-clip-text text-transparent">
              Expenses
              </span>
              </h1>
              <p className="text-on-surface-variant text-lg">Track and manage your branch expenditures</p>
            </div>
            <button 
              onClick={openNewModal}
              disabled={!selectedBranchId}
              className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-semibold overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="material-symbols-outlined text-[20px] relative z-10">add</span>
              <span className="relative z-10">Add Expense</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-surface rounded-3xl shadow-sm border border-outline-variant/30 overflow-hidden flex flex-col">
            <div className="p-4 md:p-6 border-b border-outline-variant/30 bg-surface-container-lowest/50 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/30 flex-1 md:flex-none">
                  <span className="material-symbols-outlined text-on-surface-variant/50 text-[20px]">storefront</span>
                  <span className="text-sm font-semibold text-on-surface">Branch Expenses</span>
                </div>
              </div>
            </div>

            {/* High-Fidelity Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-primary/10">
                    <th className="px-6 py-4 w-1/6">Date</th>
                    <th className="px-6 py-4 text-left w-1/6">Amount</th>
                    <th className="px-6 py-4 w-1/6">Payment Method</th>
                    <th className="px-6 py-4 w-[25%]">Category & Note</th>
                    <th className="px-6 py-4 text-center w-1/6">Attachment</th>
                    <th className="px-6 py-4 text-right pr-8 w-1/6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5 text-sm">
                  {isLoadingBranches || loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">
                        <div className="flex justify-center items-center gap-2">
                          <span className="material-symbols-outlined animate-spin">refresh</span> Loading expenses...
                        </div>
                      </td>
                    </tr>
                  ) : expenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                          <span className="material-symbols-outlined text-[32px]">receipt_long</span>
                        </div>
                        <h3 className="text-lg font-bold text-on-surface">No expenses yet</h3>
                        <p className="text-sm text-on-surface-variant mt-1">Start tracking your branch expenditures.</p>
                      </td>
                    </tr>
                  ) : (
                    expenses.map((expense) => (
                      <tr key={expense.id} className="group hover:bg-surface-container-highest/50 transition-all duration-300">
                        <td className="px-6 py-4">
                          <div className="text-[14px] font-medium text-on-surface">
                            {new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-left">
                          <div className="text-[15px] font-bold text-red-500 tracking-tight">- ₹ {expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container text-[12px] font-medium text-on-surface-variant border border-outline-variant/20 w-fit">
                            {expense.paymentMethod === 'Cash' && <span className="material-symbols-outlined text-[14px] text-green-500">payments</span>}
                            {expense.paymentMethod === 'UPI' && <span className="material-symbols-outlined text-[14px] text-blue-500">qr_code_scanner</span>}
                            {expense.paymentMethod === 'Bank Transfer' && <span className="material-symbols-outlined text-[14px] text-purple-500">account_balance</span>}
                            {expense.paymentMethod === 'Cheque' && <span className="material-symbols-outlined text-[14px] text-orange-500">request_quote</span>}
                            {expense.paymentMethod}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="min-w-0 flex-1">
                            <div className="text-[14px] font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                              {expense.category?.name || 'Uncategorized'}
                            </div>
                            {expense.note && (
                              <div className="text-xs text-on-surface-variant/70 truncate mt-0.5" title={expense.note}>
                                {expense.note}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {expense.attachment ? (
                            <button 
                              onClick={() => setViewerAttachment(expense.attachment)}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-colors"
                              title={isPdf(expense.attachment) ? "View PDF" : "View Image"}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {isPdf(expense.attachment) ? 'picture_as_pdf' : 'image'}
                              </span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-on-surface-variant/40 italic">No file</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right pr-8">
                          {/* Always visible action icons now */}
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEditModal(expense)} className="w-8 h-8 rounded-full bg-surface-container hover:bg-primary/10 text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors shadow-sm border border-outline-variant/20">
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button onClick={() => handleDelete(expense.id)} className="w-8 h-8 rounded-full bg-surface-container hover:bg-error/10 text-on-surface-variant hover:text-error flex items-center justify-center transition-colors shadow-sm border border-outline-variant/20">
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
          </div>
        </div>
      </div>

      {/* Main Expense Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
          <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-lg overflow-visible relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-lowest rounded-t-3xl">
              <h2 className="text-xl font-bold text-on-surface">{isEditMode ? 'Edit Expense' : 'Add New Expense'}</h2>
              <button onClick={closeModal} className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-visible">
              {error && (
                <div className="mb-6 p-4 rounded-2xl bg-error/10 border border-error/20 flex items-start gap-3">
                  <span className="material-symbols-outlined text-error mt-0.5">error</span>
                  <p className="text-sm text-error font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Amount (₹) *</label>
                    <input type="number" step="0.01" name="amount" required value={formData.amount} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface focus:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm font-semibold" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Date *</label>
                    <input type="date" name="date" required value={formData.date} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface focus:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm font-semibold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 relative" ref={dropdownRef}>
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Category *</label>
                    <input 
                      type="text" 
                      name="category" 
                      required 
                      value={categorySearch} 
                      onChange={(e) => {
                        setCategorySearch(e.target.value);
                        setFormData({ ...formData, category: e.target.value });
                        setShowCategoryDropdown(true);
                      }}
                      onFocus={() => setShowCategoryDropdown(true)}
                      className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface focus:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm font-semibold" 
                      placeholder="e.g. Travel, Office" 
                      autoComplete="off"
                    />
                    
                    {/* Category Combobox Dropdown */}
                    {showCategoryDropdown && (
                      <div className="absolute top-[100%] left-0 w-full mt-2 bg-surface rounded-xl shadow-lg border border-outline-variant/30 overflow-hidden z-[100] max-h-60 flex flex-col">
                        <div className="overflow-y-auto custom-scrollbar flex-1">
                          {filteredCategories.length > 0 ? (
                            filteredCategories.map(c => (
                              <div 
                                key={c.id} 
                                onClick={() => {
                                  setCategorySearch(c.name);
                                  setFormData({ ...formData, category: c.name });
                                  setShowCategoryDropdown(false);
                                }}
                                className="px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container cursor-pointer transition-colors"
                              >
                                {c.name}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-on-surface-variant/70 italic bg-surface-container-lowest/50 border-b border-outline-variant/10">
                              "{categorySearch}" will be created
                            </div>
                          )}
                        </div>
                        <div 
                          onClick={() => {
                            setShowCategoryDropdown(false);
                            setIsCategoryModalOpen(true);
                          }}
                          className="px-4 py-3 bg-surface-container-low border-t border-outline-variant/20 text-sm font-bold text-primary hover:bg-surface-container cursor-pointer flex items-center gap-2 transition-colors shrink-0"
                        >
                          <span className="material-symbols-outlined text-[18px]">settings</span>
                          Manage Categories...
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Payment Method *</label>
                    <select name="paymentMethod" required value={formData.paymentMethod} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface focus:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm font-semibold appearance-none">
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Note (Optional)</label>
                  <textarea name="note" value={formData.note} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface focus:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm min-h-[80px] resize-none" placeholder="Details about this expense..." />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">attach_file</span> Attachment (Img/PDF)
                  </label>
                  {isEditMode && editExpenseId && expenses.find(e => e.id === editExpenseId)?.attachment && (
                    <div className="flex items-center gap-3 mb-2 p-3 rounded-xl border border-outline-variant/20 bg-surface-container-highest shadow-sm">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">{isPdf(expenses.find(e => e.id === editExpenseId)?.attachment!) ? 'picture_as_pdf' : 'image'}</span>
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[13px] font-bold text-on-surface truncate">Existing attachment</span>
                        <span className="text-[11px] font-medium text-on-surface-variant/70">Upload new to replace</span>
                      </div>
                      <button type="button" onClick={() => setViewerAttachment(expenses.find(e => e.id === editExpenseId)?.attachment!)} className="text-primary hover:underline text-xs font-bold bg-transparent border-none cursor-pointer">View</button>
                    </div>
                  )}
                  <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all file:cursor-pointer cursor-pointer border border-outline-variant/30 rounded-xl bg-surface-container/50" />
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-outline-variant/20">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl font-semibold text-on-surface-variant hover:bg-surface-container transition-colors text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-semibold hover:shadow-md hover:shadow-primary/20 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  {submitting ? (
                    <><span className="material-symbols-outlined animate-spin text-[18px]">refresh</span> Saving...</>
                  ) : (
                    <><span className="material-symbols-outlined text-[18px]">save</span> {isEditMode ? 'Save Changes' : 'Save Expense'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsCategoryModalOpen(false)}></div>
          <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="px-6 py-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-lowest">
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">category</span>
                Manage Expense Categories
              </h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-surface-container-lowest/30">
              {categoryError && (
                <div className="mb-4 p-4 rounded-xl bg-error/10 border border-error/20 flex items-start gap-3">
                  <span className="material-symbols-outlined text-error text-[18px] mt-0.5">error</span>
                  <p className="text-sm text-error font-medium">{categoryError}</p>
                </div>
              )}

              <table className="w-full text-left border-collapse bg-surface border border-outline-variant/20 rounded-xl overflow-hidden shadow-sm">
                <thead>
                  <tr className="bg-surface-container-low text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/20">
                    <th className="px-4 py-3">Category Name</th>
                    <th className="px-4 py-3">Created By</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-sm">
                  {categories.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-6 text-center text-on-surface-variant">No categories found.</td></tr>
                  ) : (
                    categories.map(cat => (
                      <tr key={cat.id} className="hover:bg-surface-container-highest/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-on-surface w-1/2">
                          {editingCategoryId === cat.id ? (
                            <input 
                              type="text" 
                              value={editCategoryName} 
                              onChange={e => setEditCategoryName(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg border border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                              autoFocus
                              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveCategory(cat.id); else if (e.key === 'Escape') setEditingCategoryId(null); }}
                            />
                          ) : (
                            cat.name
                          )}
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant text-xs">
                          {cat.createdBy?.fullName || 'System'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {editingCategoryId === cat.id ? (
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => handleSaveCategory(cat.id)} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors" title="Save">
                                <span className="material-symbols-outlined text-[16px]">check</span>
                              </button>
                              <button onClick={() => setEditingCategoryId(null)} className="p-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors" title="Cancel">
                                <span className="material-symbols-outlined text-[16px]">close</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => { setEditingCategoryId(cat.id); setEditCategoryName(cat.name); setCategoryError(''); }} className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors" title="Edit">
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                              </button>
                              <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors" title="Delete">
                                <span className="material-symbols-outlined text-[16px]">delete</span>
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
          </div>
        </div>
      )}

      {/* Attachment Viewer Modal */}
      {viewerAttachment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={() => setViewerAttachment(null)}></div>
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden relative z-10 flex flex-col h-[85vh] animate-in zoom-in-95 duration-200 border border-outline-variant/10">
            
            {/* Toolbar */}
            <div className="px-4 py-3 bg-surface-container flex items-center justify-between border-b border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">{isPdf(viewerAttachment) ? 'picture_as_pdf' : 'image'}</span>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-on-surface leading-tight">Attachment Preview</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">{viewerAttachment.split('/').pop()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={getAttachmentUrl(viewerAttachment)!} 
                  download 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-primary text-on-primary rounded-xl font-semibold text-sm flex items-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Download File
                </a>
                <button onClick={() => setViewerAttachment(null)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container-high text-on-surface-variant transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 bg-surface-container-lowest p-6 flex items-center justify-center overflow-auto">
              {isPdf(viewerAttachment) ? (
                <iframe 
                  src={getAttachmentUrl(viewerAttachment)!} 
                  className="w-full h-full rounded-xl border border-outline-variant/20 shadow-inner bg-white"
                  title="PDF Viewer"
                />
              ) : (
                <img 
                  src={getAttachmentUrl(viewerAttachment)!} 
                  alt="Attachment" 
                  className="max-w-full max-h-full object-contain rounded-xl shadow-lg border border-outline-variant/10"
                />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
