'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/auth';
import { useBranch } from '@/components/BranchProvider';

interface ExpenseCategory {
  id: string;
  name: string;
}
interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory | null;
  paymentMethod: string;
}

export default function Page() {
  const { selectedBranchId } = useBranch();
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    if (selectedBranchId) {
      fetchExpenses();
    } else {
      setExpenses([]);
    }
  }, [selectedBranchId]);

  const fetchExpenses = async () => {
    if (!selectedBranchId) return;
    try {
      const res = await apiFetch(`/expenses?branchId=${selectedBranchId}`);
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch (err) {
      console.error('Failed to fetch expenses', err);
    }
  };

  // Derived stats
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const topCategories = expenses
    .filter(e => e.category?.name)
    .map(e => e.category!.name)
    .slice(0, 3);
  const topPaymentMethods = expenses.map(e => e.paymentMethod).slice(0, 2);

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50 overflow-hidden font-sans">
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-[1600px] mx-auto w-full space-y-8 pb-20">

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Expenses */}
            <div className="bg-white rounded-xl px-6 py-6 shadow flex flex-col">
              <div className="flex items-center gap-2">
                {/* Rupee Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6h12M6 12h12M6 18h12" />
                </svg>
                <p className="text-sm font-bold text-gray-700 uppercase">TOTAL EXPENSES</p>
              </div>
              <h2 className="text-4xl font-extrabold text-gray-900 mt-2">
                ₹{expenses.length > 0 ? totalExpenses : 0}
              </h2>
              <div className="mt-3">
                <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
                  ↑12%
                </span>
                <span className="text-xs text-gray-500 ml-2">vs last month</span>
              </div>
            </div>

            {/* Top Categories */}
            <div className="bg-white rounded-xl px-6 py-6 shadow flex flex-col">
              <div className="flex items-center gap-2">
                {/* Bar Chart Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h4v12H4zM10 10h4v8h-4zM16 4h4v14h-4z" />
                </svg>
                <p className="text-sm font-bold text-gray-700 uppercase">TOP CATEGORIES</p>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">
                {expenses.length > 0 ? topCategories.join(', ') : '—'}
              </h2>
              <div className="mt-3">
                <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
                  ↑5%
                </span>
                <span className="text-xs text-gray-500 ml-2">vs last month</span>
              </div>
            </div>

            {/* Top Payment Methods */}
            <div className="bg-white rounded-xl px-6 py-6 shadow flex flex-col">
              <div className="flex items-center gap-2">
                {/* Credit Card Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect x="2" y="5" width="20" height="14" rx="2" ry="2" strokeWidth={2} />
                  <line x1="2" y1="9" x2="22" y2="9" strokeWidth={2} />
                </svg>
                <p className="text-sm font-bold text-gray-700 uppercase">TOP PAYMENT METHODS</p>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">
                {expenses.length > 0 ? topPaymentMethods.join(', ') : '—'}
              </h2>
              <div className="mt-3">
                <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
                  ↑3%
                </span>
                <span className="text-xs text-gray-500 ml-2">vs last month</span>
              </div>
            </div>
          </div>

          {/* Expenses Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-[28px] font-bold text-gray-800 tracking-tight">Expenses</h1>
              <p className="text-sm text-gray-500">Track and manage your branch expenditures</p>
            </div>
            <button
              onClick={() => alert('Open modal here')}
              disabled={!selectedBranchId}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-lg">+</span>
              <span>Add Expense</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-3xl shadow border overflow-hidden flex flex-col">
            {/* ... your table/list code here ... */}
          </div>
        </div>
      </div>
    </div>
  );
}
