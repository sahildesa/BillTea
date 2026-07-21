'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/auth';

interface Plan {
  id: string;
  name: string;
  rank: 'TRIAL' | 'BRONZE' | 'SILVER' | 'GOLD';
  description: string;
  displayOrder: number;
  isActive: boolean;
  isDeleted: boolean;
  isRecommended: boolean;
  price: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  branchLimit: number;
  staffLimit: number;
  customerLimit: number;
  productLimit: number;
  invoiceLimit: number;
  quotationLimit: number;
  whatsappMessageLimit: number;
  customQuotationThemes: boolean;
  customInvoiceThemes: boolean;
  whatsappIntegration: boolean;
  _count?: { subscriptions: number };
}

type PlanFormData = {
  name: string;
  rank: 'TRIAL' | 'BRONZE' | 'SILVER' | 'GOLD';
  description: string;
  displayOrder: number;
  isActive: boolean;
  isRecommended: boolean;
  price: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  branchLimit: number;
  staffLimit: number;
  customerLimit: number;
  productLimit: number;
  invoiceLimit: number;
  quotationLimit: number;
  whatsappMessageLimit: number;
  customQuotationThemes: boolean;
  customInvoiceThemes: boolean;
  whatsappIntegration: boolean;
};

const defaultFormData: PlanFormData = {
  name: '',
  rank: 'BRONZE',
  description: '',
  displayOrder: 1,
  isActive: true,
  isRecommended: false,
  price: 0,
  billingCycle: 'MONTHLY',
  branchLimit: 1,
  staffLimit: 5,
  customerLimit: 100,
  productLimit: 100,
  invoiceLimit: 50,
  quotationLimit: 50,
  whatsappMessageLimit: 0,
  customQuotationThemes: false,
  customInvoiceThemes: false,
  whatsappIntegration: false,
};

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const [formData, setFormData] = useState<PlanFormData>({ ...defaultFormData });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await apiFetch(`/subscription-plans`);
      if (!response.ok) throw new Error('Failed to load plans');
      const data = await response.json();
      setPlans(data.plans || []);
    } catch (err) {
      console.error('Failed to fetch plans', err);
      setError('Failed to load subscription plans.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        rank: plan.rank,
        description: plan.description || '',
        displayOrder: plan.displayOrder,
        isActive: plan.isActive,
        isRecommended: plan.isRecommended,
        price: plan.price,
        billingCycle: plan.billingCycle,
        branchLimit: plan.branchLimit,
        staffLimit: plan.staffLimit,
        customerLimit: plan.customerLimit,
        productLimit: plan.productLimit,
        invoiceLimit: plan.invoiceLimit,
        quotationLimit: plan.quotationLimit,
        whatsappMessageLimit: plan.whatsappMessageLimit,
        customQuotationThemes: plan.customQuotationThemes,
        customInvoiceThemes: plan.customInvoiceThemes,
        whatsappIntegration: plan.whatsappIntegration,
      });
    } else {
      setEditingPlan(null);
      setFormData({ ...defaultFormData });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        const res = await apiFetch(`/subscription-plans/${editingPlan.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.message ? (Array.isArray(errData.message) ? errData.message.join(', ') : errData.message) : 'Failed to update plan';
          throw new Error(errMsg);
        }
      } else {
        const res = await apiFetch(`/subscription-plans`, {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.message ? (Array.isArray(errData.message) ? errData.message.join(', ') : errData.message) : 'Failed to create plan';
          throw new Error(errMsg);
        }
      }
      fetchPlans();
      handleCloseModal();
    } catch (err: any) {
      console.error('Failed to save plan:', err);
      alert(err.message || 'Failed to save plan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
      const res = await apiFetch(`/subscription-plans/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete plan');
      fetchPlans();
    } catch (err: any) {
      alert(err.message || 'Failed to delete plan');
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const action = isActive ? 'deactivate' : 'activate';
      const res = await apiFetch(`/subscription-plans/${id}/${action}`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to toggle status');
      fetchPlans();
    } catch (err: any) {
      alert(err.message || 'Failed to update plan status');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Plan Management</h1>
            <p className="text-on-surface-variant text-sm mt-1">Create and manage subscription plans for BillTea.</p>
          </div>
          <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
            <span className="material-symbols-outlined">add</span>
            New Plan
          </button>
        </div>

        {error && (
          <div className="bg-error/10 text-error px-4 py-3 rounded-lg border border-error/30 text-sm">
            {error}
          </div>
        )}

        <div className="glass-panel border border-outline-variant/30 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-container/50 border-b border-outline-variant/30">
              <tr>
                <th className="px-6 py-4 font-semibold text-on-surface">Plan Name</th>
                <th className="px-6 py-4 font-semibold text-on-surface">Rank & Cycle</th>
                <th className="px-6 py-4 font-semibold text-on-surface text-right">Price</th>
                <th className="px-6 py-4 font-semibold text-on-surface text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-on-surface text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {plans.map(plan => (
                <tr key={plan.id} className={`hover:bg-surface-container/30 transition-colors ${plan.isDeleted ? 'opacity-40' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-on-surface">{plan.name}</div>
                    <div className="text-xs text-on-surface-variant mt-0.5 truncate max-w-[200px]">{plan.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] uppercase font-bold rounded-full border border-primary/20">{plan.rank}</span>
                      <span className="text-on-surface-variant text-xs">{plan.billingCycle}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-medium">₹{plan.price.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {plan.isDeleted ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-error/10 text-error">Deleted</span>
                    ) : (
                      <button 
                        onClick={() => handleToggleStatus(plan.id, plan.isActive)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${plan.isActive ? 'bg-success/10 text-success hover:bg-error/10 hover:text-error' : 'bg-surface-container text-on-surface-variant hover:bg-success/10 hover:text-success'}`}
                        title={plan.isActive ? 'Click to deactivate' : 'Click to activate'}
                      >
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {!plan.isDeleted && (
                        <>
                          <button onClick={() => handleOpenModal(plan)} className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          {plan.rank !== 'TRIAL' && (
                            <button onClick={() => handleDelete(plan.id)} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {plans.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">No plans found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-surface border border-outline-variant/30 rounded-2xl shadow-2xl w-full max-w-3xl my-8">
              <div className="flex items-center justify-between p-6 border-b border-outline-variant/30">
                <h3 className="text-xl font-bold text-on-surface">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-error p-1 rounded-lg transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-primary text-sm uppercase tracking-wider mb-2 border-b border-outline-variant/20 pb-2">Basic Details</h4>
                    
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Plan Name</label>
                      <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm" placeholder="e.g. Gold Plan" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Rank</label>
                        <select value={formData.rank} onChange={e => setFormData({...formData, rank: e.target.value as any})} className="w-full bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none transition-all text-sm">
                          <option value="TRIAL">Trial</option>
                          <option value="BRONZE">Bronze</option>
                          <option value="SILVER">Silver</option>
                          <option value="GOLD">Gold</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Billing Cycle</label>
                        <select value={formData.billingCycle} onChange={e => setFormData({...formData, billingCycle: e.target.value as any})} className="w-full bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none transition-all text-sm">
                          <option value="MONTHLY">Monthly</option>
                          <option value="YEARLY">Yearly</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Description</label>
                      <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm" rows={2}></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Price (₹)</label>
                        <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none transition-all text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Display Order</label>
                        <input required type="number" min="1" value={formData.displayOrder} onChange={e => setFormData({...formData, displayOrder: Number(e.target.value)})} className="w-full bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none transition-all text-sm" />
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="flex gap-6 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.isRecommended} onChange={e => setFormData({...formData, isRecommended: e.target.checked})} className="accent-primary" />
                        <span className="text-sm text-on-surface-variant">Recommended</span>
                      </label>
                    </div>
                  </div>

                  {/* Limits */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-primary text-sm uppercase tracking-wider mb-2 border-b border-outline-variant/20 pb-2">Limits (0 = Unlimited)</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Branches</label>
                        <input required type="number" min="0" value={formData.branchLimit} onChange={e => setFormData({...formData, branchLimit: Number(e.target.value)})} className="w-full bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none transition-all text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Staff</label>
                        <input required type="number" min="0" value={formData.staffLimit} onChange={e => setFormData({...formData, staffLimit: Number(e.target.value)})} className="w-full bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none transition-all text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Customers</label>
                        <input required type="number" min="0" value={formData.customerLimit} onChange={e => setFormData({...formData, customerLimit: Number(e.target.value)})} className="w-full bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none transition-all text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Products</label>
                        <input required type="number" min="0" value={formData.productLimit} onChange={e => setFormData({...formData, productLimit: Number(e.target.value)})} className="w-full bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none transition-all text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Invoices / Mo</label>
                        <input required type="number" min="0" value={formData.invoiceLimit} onChange={e => setFormData({...formData, invoiceLimit: Number(e.target.value)})} className="w-full bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none transition-all text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Quotations / Mo</label>
                        <input required type="number" min="0" value={formData.quotationLimit} onChange={e => setFormData({...formData, quotationLimit: Number(e.target.value)})} className="w-full bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none transition-all text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">WhatsApp Msgs</label>
                        <input required type="number" min="0" value={formData.whatsappMessageLimit} onChange={e => setFormData({...formData, whatsappMessageLimit: Number(e.target.value)})} className="w-full bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none transition-all text-sm" />
                      </div>
                    </div>

                    <h4 className="font-semibold text-primary text-sm uppercase tracking-wider mt-4 mb-2 border-b border-outline-variant/20 pb-2">Features</h4>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.customQuotationThemes} onChange={e => setFormData({...formData, customQuotationThemes: e.target.checked})} className="accent-primary" />
                        <span className="text-sm text-on-surface-variant">Custom Quotation Themes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.customInvoiceThemes} onChange={e => setFormData({...formData, customInvoiceThemes: e.target.checked})} className="accent-primary" />
                        <span className="text-sm text-on-surface-variant">Custom Invoice Themes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.whatsappIntegration} onChange={e => setFormData({...formData, whatsappIntegration: e.target.checked})} className="accent-primary" />
                        <span className="text-sm text-on-surface-variant">WhatsApp Integration</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant/30 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container-highest transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-on-primary shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5">
                    {editingPlan ? 'Save Changes' : 'Create Plan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
