"use client";

import React, { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "../../../../lib/auth";

function BranchSettingsContent() {
  const searchParams = useSearchParams();
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const initialFormState = {
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    email: "",
    tax: 0,
    taxLabel: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
    signatureValue: "",
    isActive: true,
    isMainBranch: false,
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchBranches = async () => {
    setLoading(true);
    setPageError("");
    try {
      const res = await apiFetch("/branches?all=true");
      const data = await res.json();
      
      if (!res.ok) {
         let errorMsg = data.message || "Failed to fetch branches.";
         if (Array.isArray(data.message)) errorMsg = data.message.join(", ");
         setPageError(errorMsg);
         return;
      }

      if (data.success) {
        setBranches(data.branches);
      } else {
        setPageError(data.message || "Failed to fetch branches.");
      }
    } catch (err: any) {
      setPageError("A network error occurred while fetching branches. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (searchParams.get("action") === "create" && !loading) {
      openCreateModal();
    }
  }, [searchParams, loading]);

  const filteredBranches = useMemo(() => {
    const value = search.toLowerCase().trim();
    if (!value) return branches;
    return branches.filter((branch) =>
      [branch.name, branch.city, branch.state, branch.phone]
        .join(" ")
        .toLowerCase()
        .includes(value)
    );
  }, [search, branches]);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedBranchId(null);
    setFormData(initialFormState);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (branch: any) => {
    setModalMode('edit');
    setSelectedBranchId(branch.id);
    setFormData({
      name: branch.name || "",
      address: branch.address || "",
      city: branch.city || "",
      state: branch.state || "",
      pincode: branch.pincode || "",
      phone: branch.phone || "",
      email: branch.email || "",
      tax: branch.tax || 0,
      taxLabel: branch.taxLabel || "",
      bankName: branch.bankName || "",
      accountNumber: branch.accountNumber || "",
      ifscCode: branch.ifscCode || "",
      upiId: branch.upiId || "",
      signatureValue: branch.signatureValue || "",
      isActive: branch.isActive !== false,
      isMainBranch: branch.isMainBranch || false,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : (name === 'tax' ? Number(value) : value) 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const url = modalMode === 'create' ? '/branches' : `/branches/${selectedBranchId}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Handle NestJS validation errors which are often in data.message array
        let errorMsg = data.message || "An error occurred.";
        if (Array.isArray(data.message)) {
          errorMsg = data.message.join(", ");
        }
        // Specific user-friendly mapping for common roles error
        if (res.status === 403 && errorMsg.includes('Forbidden')) {
           errorMsg = "You do not have permission to perform this action. Only the OWNER can modify branches.";
        }
        throw new Error(errorMsg);
      }

      setIsModalOpen(false);
      fetchBranches();
    } catch (err: any) {
      setFormError(err.message || "Failed to save branch. Ensure you have the required permissions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate ${name}?`)) return;
    
    setPageError("");
    try {
      const res = await apiFetch(`/branches/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        let errorMsg = data.message || "Failed to deactivate branch.";
        if (Array.isArray(data.message)) errorMsg = data.message.join(", ");
        if (res.status === 403 && errorMsg.includes('Forbidden')) {
           errorMsg = "You do not have permission to perform this action. Only the OWNER can modify branches.";
        }
        setPageError(errorMsg);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      
      fetchBranches();
    } catch (err: any) {
      setPageError("A network error occurred while deactivating branch.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slide-up {
          opacity: 0;
          animation: fadeSlideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}} />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(125,211,252,0.05),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.05),transparent_40%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-6">
          <span>Settings</span>
          <span>/</span>
          <span className="text-primary font-medium">Branch Management</span>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10 animate-fade-slide-up">
          <div>
            <h1 className="text-4xl font-black text-on-surface mb-2">Branch Management</h1>
            <p className="text-on-surface-variant text-lg">Manage all your business branches from one place.</p>
          </div>
          <button onClick={openCreateModal} className="h-12 px-6 rounded-xl bg-primary text-on-primary font-semibold flex items-center gap-2 hover:scale-105 hover:shadow-[0_8px_20px_rgba(3,105,161,0.3)] transition-all">
            <span className="material-symbols-outlined">add</span>
            Add New Branch
          </button>
        </div>

        {/* Global Error Banner */}
        {pageError && (
          <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 flex items-start gap-3 animate-fade-slide-up">
            <span className="material-symbols-outlined mt-0.5">error</span>
            <div>
              <h4 className="font-bold text-lg mb-1">Operation Failed</h4>
              <p className="text-sm opacity-90 leading-relaxed">{pageError}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 justify-between mb-8 animate-fade-slide-up" style={{ animationDelay: '0.1s' }}>
           <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              type="text"
              placeholder="Search branches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 rounded-xl border border-outline-variant/30 bg-surface-container/50 pl-12 pr-4 text-on-surface outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-primary animate-fade-slide-up">
            <span className="material-symbols-outlined animate-spin text-4xl mb-4">progress_activity</span>
            <p className="font-medium">Loading branches...</p>
          </div>
        ) : (
          /* Cards */
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-slide-up" style={{ animationDelay: '0.2s' }}>
            {filteredBranches.length === 0 ? (
               <div className="col-span-full py-16 text-center border-2 border-dashed border-outline-variant/30 rounded-3xl bg-surface-container/20">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4 opacity-50">store_off</span>
                  <p className="text-xl text-on-surface-variant font-bold mb-2">No branches found</p>
                  <p className="text-sm text-on-surface-variant max-w-sm mx-auto">You haven't created any branches yet or your search didn't match any existing branches.</p>
               </div>
            ) : (
              filteredBranches.map((branch) => (
                <div key={branch.id} className="glass-panel rounded-3xl p-8 border border-primary/10 hover:border-primary/40 hover:shadow-[0_20px_40px_-15px_rgba(125,211,252,0.15)] hover:-translate-y-1 transition-all duration-300">
                  {/* Top */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-2xl font-bold text-on-surface">{branch.name}</h2>
                        {branch.isMainBranch && (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary/15 border border-primary/30 text-primary">MAIN</span>
                        )}
                        {branch.isActive ? (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-500">ACTIVE</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-red-500/15 border border-red-500/30 text-red-500">INACTIVE</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-3 text-on-surface-variant font-medium">
                        <span className="material-symbols-outlined text-[18px]">location_on</span>
                        <span>{branch.city || 'N/A'}, {branch.state || 'N/A'}</span>
                      </div>
                    </div>
                    
                    {!branch.isMainBranch && branch.isActive && (
                      <button onClick={() => handleDeactivate(branch.id, branch.name)} className="w-10 h-10 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-500 flex items-center justify-center transition-colors tooltip tooltip-left shadow-sm border border-transparent hover:border-red-500/20" data-tip="Deactivate">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    )}
                  </div>

                  {/* Information Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                    <div className="rounded-2xl bg-surface-container/30 border border-outline-variant/20 p-5 group hover:bg-surface-container/50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">groups</span>
                        <span className="text-[11px] text-on-surface-variant uppercase font-bold tracking-wider">Customers</span>
                      </div>
                      <p className="text-on-surface font-semibold">{branch._count?.customers || 0}</p>
                    </div>
                    
                    <div className="rounded-2xl bg-surface-container/30 border border-outline-variant/20 p-5 group hover:bg-surface-container/50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">receipt_long</span>
                        <span className="text-[11px] text-on-surface-variant uppercase font-bold tracking-wider">Invoices</span>
                      </div>
                      <p className="text-on-surface font-semibold">{branch._count?.invoices || 0}</p>
                    </div>

                    <div className="rounded-2xl bg-surface-container/30 border border-outline-variant/20 p-5 group hover:bg-surface-container/50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">call</span>
                        <span className="text-[11px] text-on-surface-variant uppercase font-bold tracking-wider">Phone</span>
                      </div>
                      <p className="text-on-surface font-semibold">{branch.phone || 'N/A'}</p>
                    </div>
                    
                    <div className="rounded-2xl bg-surface-container/30 border border-outline-variant/20 p-5 group hover:bg-surface-container/50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">email</span>
                        <span className="text-[11px] text-on-surface-variant uppercase font-bold tracking-wider">Email</span>
                      </div>
                      <p className="text-on-surface font-semibold truncate" title={branch.email}>{branch.email || 'N/A'}</p>
                    </div>

                    <div className="col-span-2 lg:col-span-4 rounded-2xl bg-surface-container/30 border border-outline-variant/20 p-5 group hover:bg-surface-container/50 transition-colors">
                       <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">home_work</span>
                        <span className="text-[11px] text-on-surface-variant uppercase font-bold tracking-wider">Address</span>
                      </div>
                      <p className="text-on-surface font-semibold">{branch.address || 'N/A'} {branch.pincode ? `- ${branch.pincode}` : ''}</p>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex items-center justify-end mt-8 pt-6 border-t border-outline-variant/20 gap-3">
                    <button onClick={() => openEditModal(branch)} className="px-6 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface font-semibold hover:bg-primary hover:text-on-primary hover:border-primary transition-all flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">edit</span> Edit Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-slide-up" style={{ animationDuration: '0.3s' }}>
          <div className="glass-elevated w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[28px] relative border border-primary/20 shadow-[0_0_60px_rgba(125,211,252,0.15)] overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <span className="material-symbols-outlined text-[24px]">{modalMode === 'create' ? 'add_business' : 'edit_square'}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-on-surface">{modalMode === 'create' ? 'Create New Branch' : 'Edit Branch'}</h2>
                  <p className="text-sm text-on-surface-variant mt-0.5">{modalMode === 'create' ? 'Add a new operational location to your company.' : 'Update the details for this location.'}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high p-2.5 rounded-full transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-8 overflow-y-auto">
              
              {/* Form Error Banner */}
              {formError && (
                <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 flex items-start gap-3">
                  <span className="material-symbols-outlined mt-0.5">error</span>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Validation Error</h4>
                    <p className="text-sm opacity-90 leading-relaxed">{formError}</p>
                  </div>
                </div>
              )}

              <form id="branch-form" onSubmit={handleSubmit} className="space-y-8">
                
                {/* Branch Identity */}
                <div>
                  <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[18px]">info</span>
                    Basic Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-on-surface mb-1.5">Branch Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text" name="name" required minLength={2}
                        value={formData.name} onChange={handleInputChange}
                        className="w-full bg-surface-container/30 border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition-all"
                        placeholder="e.g. Surat Branch"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-1.5">Phone</label>
                      <input 
                        type="text" name="phone"
                        value={formData.phone} onChange={handleInputChange}
                        className="w-full bg-surface-container/30 border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition-all"
                        placeholder="+91"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-1.5">Email</label>
                      <input 
                        type="email" name="email"
                        value={formData.email} onChange={handleInputChange}
                        className="w-full bg-surface-container/30 border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition-all"
                        placeholder="branch@company.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="h-[1px] w-full bg-outline-variant/20" />

                {/* Location */}
                <div>
                   <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    Location
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-on-surface mb-1.5">Address Line</label>
                      <input 
                        type="text" name="address"
                        value={formData.address} onChange={handleInputChange}
                        className="w-full bg-surface-container/30 border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition-all"
                        placeholder="Street, Building, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-1.5">City</label>
                      <input 
                        type="text" name="city"
                        value={formData.city} onChange={handleInputChange}
                        className="w-full bg-surface-container/30 border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition-all"
                        placeholder="e.g. Surat"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-1.5">State</label>
                      <input 
                        type="text" name="state"
                        value={formData.state} onChange={handleInputChange}
                        className="w-full bg-surface-container/30 border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition-all"
                        placeholder="e.g. Gujarat"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-1.5">Pincode</label>
                      <input 
                        type="text" name="pincode"
                        value={formData.pincode} onChange={handleInputChange}
                        className="w-full bg-surface-container/30 border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition-all"
                        placeholder="e.g. 395007"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-1.5">Tax Label (e.g. GST, VAT)</label>
                      <input 
                        type="text" name="taxLabel"
                        value={formData.taxLabel} onChange={handleInputChange}
                        className="w-full bg-surface-container/30 border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition-all"
                        placeholder="e.g. GST"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-1.5">Default Tax (%)</label>
                      <div className="relative">
                        <input 
                          type="number" name="tax" min={0} max={100}
                          value={formData.tax} onChange={handleInputChange}
                          className="w-full bg-surface-container/30 border border-outline-variant/40 rounded-xl px-4 py-3 pr-10 text-on-surface focus:outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-[1px] w-full bg-outline-variant/20" />

                {/* Bank Details (Optional) */}
                <div>
                  <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[18px]">account_balance</span>
                    Bank Details <span className="text-xs text-on-surface-variant font-normal">(Optional)</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-1.5">Bank Name</label>
                      <input 
                        type="text" name="bankName"
                        value={formData.bankName} onChange={handleInputChange}
                        className="w-full bg-surface-container/30 border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-1.5">Account Number</label>
                      <input 
                        type="text" name="accountNumber"
                        value={formData.accountNumber} onChange={handleInputChange}
                        className="w-full bg-surface-container/30 border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-1.5">IFSC Code</label>
                      <input 
                        type="text" name="ifscCode"
                        value={formData.ifscCode} onChange={handleInputChange}
                        className="w-full bg-surface-container/30 border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-1.5">UPI ID</label>
                      <input 
                        type="text" name="upiId"
                        value={formData.upiId} onChange={handleInputChange}
                        className="w-full bg-surface-container/30 border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="h-[1px] w-full bg-outline-variant/20" />

                {/* Signature (Optional) */}
                <div>
                  <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[18px]">draw</span>
                    Signature <span className="text-xs text-on-surface-variant font-normal">(Optional)</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-1.5">Signature Text</label>
                      <input 
                        type="text" name="signatureValue"
                        value={formData.signatureValue} onChange={handleInputChange}
                        className="w-full bg-surface-container/30 border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition-all"
                        placeholder="e.g. Authorized Signatory"
                      />
                      <p className="text-xs text-on-surface-variant mt-1.5">This text will be printed at the bottom of generated invoices/quotations.</p>
                    </div>
                  </div>
                </div>

                <div className="h-[1px] w-full bg-outline-variant/20" />

                {/* Status Toggles */}
                <div>
                  <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[18px]">toggle_on</span>
                    Status Settings
                  </h3>
                  <div className="flex flex-col gap-4">
                    <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-outline-variant/30 bg-surface-container/30 hover:bg-surface-container/50 transition-colors">
                      <div className="relative">
                        <input type="checkbox" className="sr-only peer" name="isMainBranch" checked={formData.isMainBranch} onChange={handleInputChange} />
                        <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">Set as Main Branch</p>
                        <p className="text-xs text-on-surface-variant">This will replace the current main branch if one exists.</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-outline-variant/30 bg-surface-container/30 hover:bg-surface-container/50 transition-colors">
                      <div className="relative">
                        <input type="checkbox" className="sr-only peer" name="isActive" checked={formData.isActive} onChange={handleInputChange} />
                        <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">Active Status</p>
                        <p className="text-xs text-on-surface-variant">Inactive branches cannot create invoices or quotations.</p>
                      </div>
                    </label>
                  </div>
                </div>

              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-5 border-t border-outline-variant/20 bg-surface-container/50 flex justify-end gap-4">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="branch-form"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary-fixed text-on-primary px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-[0_8px_20px_rgba(3,105,161,0.3)] hover:-translate-y-0.5 hover:shadow-[0_12px_25px_rgba(3,105,161,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
              >
                {isSubmitting ? (
                  <><span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> Saving...</>
                ) : (
                  <><span className="material-symbols-outlined text-[18px]">save</span> Save Branch</>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function BranchSettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-on-surface-variant flex items-center justify-center h-full"><span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span></div>}>
      <BranchSettingsContent />
    </Suspense>
  );
}