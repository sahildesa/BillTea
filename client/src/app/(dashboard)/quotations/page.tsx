'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/auth';
import { useBranch } from '@/components/BranchProvider';

interface Quotation {
  id: string;
  quotationNumber: string;
  status: string;
  quotationDate: string;
  expiryDate: string;
  customer: {
    customerName: string;
    companyName: string;
  };
  totals: {
    grandTotal: number;
  };
}

export default function QuotationsPage() {
  const { selectedBranchId, isLoadingBranches } = useBranch();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedBranchId) {
      fetchQuotations();
    } else {
      setQuotations([]);
      setLoading(false);
    }
  }, [selectedBranchId]);

  const fetchQuotations = async () => {
    if (!selectedBranchId) return;
    try {
      setLoading(true);
      setError('');
      const res = await apiFetch(`/quotations?branchId=${selectedBranchId}`);
      if (res.ok) {
        const data = await res.json();
        setQuotations(data);
      } else {
        throw new Error('Failed to fetch quotations');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this quotation? Note: You can only delete the most recent quotation.')) return;
    try {
      const res = await apiFetch(`/quotations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchQuotations();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to delete quotation');
      }
    } catch (err: any) {
      alert('Failed to delete quotation');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-surface-container text-on-surface-variant border-outline-variant/30';
      case 'SENT': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'ACCEPTED': return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20';
      case 'EXPIRED': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-surface-container text-on-surface-variant border-outline-variant/30';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 z-0 relative custom-scrollbar">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">Quotations</h1>
          <p className="text-on-surface-variant text-sm mt-1">Manage and track your customer quotes.</p>
        </div>
        <Link href="/quotations/new">
          <button 
            disabled={!selectedBranchId}
            className="glass-button-primary rounded-lg py-2.5 px-5 flex items-center gap-2 text-sm font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(125,211,252,0.1)] hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
            Create Quotation
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
            <input className="glass-input pl-9 pr-4 py-2 rounded-lg text-sm text-on-surface placeholder-on-surface-variant/50 w-full sm:w-72 focus:outline-none transition-all" placeholder="Search quotations..." type="text" />
          </div>
        </div>
        
        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-xs text-on-surface-variant uppercase bg-surface-container-low/50 border-b border-primary/10">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:text-primary transition-colors group" scope="col">
                  <div className="flex items-center gap-1">
                    Quotation Number <span className="material-symbols-outlined text-[12px] opacity-50 group-hover:opacity-100">unfold_more</span>
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
                      <span className="material-symbols-outlined animate-spin">refresh</span> Loading quotations...
                    </div>
                  </td>
                </tr>
              ) : quotations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                      <span className="material-symbols-outlined text-[32px]">request_quote</span>
                    </div>
                    <h3 className="text-lg font-bold text-on-surface">No quotations yet</h3>
                    <p className="text-sm text-on-surface-variant mt-1">Create your first quotation for this branch.</p>
                  </td>
                </tr>
              ) : (
                quotations.map((quotation) => (
                  <tr key={quotation.id} className="hover:bg-primary/5 transition-colors duration-200">
                    <td className="px-6 py-4 font-semibold text-primary">{quotation.quotationNumber}</td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                        {quotation.customer?.customerName?.substring(0, 2).toUpperCase() || 'NA'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-on-surface font-semibold">{quotation.customer?.customerName || 'Unknown'}</span>
                        <span className="text-[11px] text-on-surface-variant/70">{quotation.customer?.companyName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-on-surface-variant mb-1">
                        {new Date(quotation.quotationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(quotation.status)}`}>
                        {quotation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-on-surface">
                      ₹ {quotation.totals?.grandTotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="glass-button-icon p-1 rounded-md transition-all tooltip cursor-pointer" title="View">
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </button>
                        <Link href={`/quotations/${quotation.id}/edit`}>
                          <button className="glass-button-icon p-1 rounded-md transition-all hover:text-primary hover:border-primary/30 hover:bg-primary/10 tooltip cursor-pointer" title="Edit">
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                        </Link>
                        <Link href={`/quotations/new?copyFrom=${quotation.id}`}>
                          <button className="glass-button-icon p-1 rounded-md transition-all hover:text-blue-400 hover:border-blue-400/30 hover:bg-blue-400/10 tooltip cursor-pointer" title="Copy">
                            <span className="material-symbols-outlined text-[16px]">content_copy</span>
                          </button>
                        </Link>
                        <button className="glass-button-icon p-1 rounded-md transition-all hover:text-emerald-400 hover:border-emerald-400/30 hover:bg-emerald-400/10 tooltip cursor-pointer" title="Send">
                          <span className="material-symbols-outlined text-[16px]">send</span>
                        </button>
                        <button onClick={() => handleDelete(quotation.id)} className="glass-button-icon p-1 rounded-md transition-all hover:text-error hover:border-error/30 hover:bg-error/10 tooltip cursor-pointer" title="Delete">
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
        
        {/* Pagination */}
        <div className="p-6 border-t border-primary/10 bg-surface-container/30 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-2">
            <span className="text-sm text-on-surface-variant">Showing 1 to {quotations.length} entries</span>
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
    </div>
  );
}
