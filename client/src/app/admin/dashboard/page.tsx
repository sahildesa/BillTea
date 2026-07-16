"use client";

import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/auth';

type AdminStats = {
  totalCompanies: number;
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/admin/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } else {
        setError('Failed to load dashboard statistics.');
      }
    } catch (err) {
      setError('An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Companies',
      value: stats?.totalCompanies ?? '-',
      icon: 'corporate_fare',
      color: 'from-blue-500/20 to-blue-600/5',
      textColor: 'text-blue-500'
    },
    {
      title: 'Active Subscriptions',
      value: stats?.activeSubscriptions ?? '-',
      icon: 'card_membership',
      color: 'from-emerald-500/20 to-emerald-600/5',
      textColor: 'text-emerald-500'
    },
    {
      title: 'Total Revenue',
      value: stats ? `₹${stats.totalRevenue.toLocaleString('en-IN')}` : '-',
      icon: 'account_balance_wallet',
      color: 'from-amber-500/20 to-amber-600/5',
      textColor: 'text-amber-500'
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers ?? '-',
      icon: 'groups',
      color: 'from-purple-500/20 to-purple-600/5',
      textColor: 'text-purple-500'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 relative">
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

      {/* Decorative background blurs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-error/10 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-10 animate-fade-slide-up">
          <h1 className="text-4xl md:text-5xl font-black text-on-surface mb-4 tracking-tight drop-shadow-sm">System Overview</h1>
          <p className="text-on-surface-variant text-lg leading-relaxed max-w-2xl">
            Welcome to the BillTea Administration Panel. Here you can monitor platform usage, revenue, and active subscriptions in real-time.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-xl border border-error/30 bg-error/10 text-error flex items-center gap-3 animate-fade-slide-up">
            <span className="material-symbols-outlined">error</span>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-slide-up" style={{ animationDelay: '0.1s' }}>
            {statCards.map((card, idx) => (
              <div 
                key={idx}
                className="group relative bg-surface border border-outline-variant/30 rounded-3xl p-1 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative h-full bg-surface-container-lowest rounded-[1.4rem] p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center border border-outline-variant/10 shadow-inner`}>
                      <span className={`material-symbols-outlined text-[28px] ${card.textColor}`}>{card.icon}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      {card.title}
                    </h3>
                    <p className="text-4xl font-black text-on-surface tracking-tight">
                      {card.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 p-8 rounded-3xl border border-outline-variant/30 bg-surface-container-lowest relative overflow-hidden animate-fade-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <span className="material-symbols-outlined text-[120px]">admin_panel_settings</span>
          </div>
          <div className="relative z-10 max-w-xl">
            <h2 className="text-2xl font-bold text-on-surface mb-3">Security Notice</h2>
            <p className="text-on-surface-variant leading-relaxed mb-6">
              You are logged in with Super Admin privileges. Any changes made to subscription plans or platform configurations will be reflected immediately across all tenant companies. Please proceed with caution.
            </p>
            <button className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined">security</span>
              View Audit Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
