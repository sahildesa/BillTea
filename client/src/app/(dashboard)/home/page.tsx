'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/auth';

interface SalesDataPoint {
  date: string;
  sales: string;
  salesRaw: number;
  x: number;
  y: number;
}

export default function DashboardHome() {
  const [hoveredInvoicePoint, setHoveredInvoicePoint] = useState<SalesDataPoint | null>(null);
  const [hoveredQuotationPoint, setHoveredQuotationPoint] = useState<SalesDataPoint | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [branchId, setBranchId] = useState<string>('');
  
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const url = branchId ? `/dashboard/stats?branchId=${branchId}` : `/dashboard/stats`;
        const res = await apiFetch(url);
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [branchId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  };

  // Prepare chart data
  const createSmoothPath = (points: {x: number, y: number}[]) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M${points[0].x},${points[0].y}`;
    let path = `M${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i !== points.length - 2 ? points[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return path;
  };

  let invoiceSalesData: SalesDataPoint[] = [];
  let quotationSalesData: SalesDataPoint[] = [];
  let invoicePath = '';
  let quotationPath = '';
  let maxInvoiceSales = 1;
  let maxQuotationSales = 1;

  if (stats && stats.salesTrend) {
    maxInvoiceSales = Math.max(...stats.salesTrend.map((d: any) => d.invoices), 1);
    maxQuotationSales = Math.max(...stats.salesTrend.map((d: any) => d.quotations), 1);

    const xStep = 400 / 27; // 28 points, 27 intervals

    invoiceSalesData = stats.salesTrend.map((d: any, i: number) => ({
      date: formatDate(d.date),
      sales: formatCurrency(d.invoices),
      salesRaw: d.invoices,
      x: i * xStep,
      y: 100 - (d.invoices / maxInvoiceSales) * 80, // Leave some padding
    }));

    quotationSalesData = stats.salesTrend.map((d: any, i: number) => ({
      date: formatDate(d.date),
      sales: formatCurrency(d.quotations),
      salesRaw: d.quotations,
      x: i * xStep,
      y: 100 - (d.quotations / maxQuotationSales) * 80,
    }));

    invoicePath = createSmoothPath(invoiceSalesData);
    quotationPath = createSmoothPath(quotationSalesData);
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 z-0 relative overflow-x-hidden selection:bg-primary/30">
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slide-up {
          opacity: 0;
          animation: fadeSlideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}} />

      {/* Premium Background */}
      <div className="fixed inset-0 z-0 bg-surface pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-tertiary/10 blur-[120px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-secondary/5 blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-12 pb-16">

        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-4 shadow-[0_0_15px_rgba(125,211,252,0.15)]">
              <span className="material-symbols-outlined text-[14px]">monitoring</span>
              Overview Hub
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight font-display mb-4">
              <span className="bg-gradient-to-br from-primary via-secondary to-tertiary bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              Monitor your business metrics, track sales performance, and manage recent activities in real-time.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 animate-fade-slide-up">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-on-surface-variant font-medium tracking-wide">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:border-primary/40 hover:shadow-[0_20px_40px_-15px_rgba(125,211,252,0.15)] hover:-translate-y-1 transition-all duration-300">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <p className="text-on-surface-variant text-sm font-medium uppercase tracking-wider">Total Invoices</p>
                  <span className="material-symbols-outlined text-primary p-2 rounded-lg bg-primary/10">receipt_long</span>
                </div>
                <p className="text-3xl font-bold text-on-surface tracking-tight">{stats?.kpis?.totalInvoices || 0}</p>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <span className={`${(stats?.kpis?.invoicesChange || 0) >= 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'} px-2 py-0.5 rounded flex items-center`}>
                    <span className="material-symbols-outlined text-[14px]">{(stats?.kpis?.invoicesChange || 0) >= 0 ? 'arrow_upward' : 'arrow_downward'}</span> {Math.abs(stats?.kpis?.invoicesChange || 0)}%
                  </span>
                  <span className="text-on-surface-variant/60">vs last month</span>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:border-tertiary/40 hover:shadow-[0_20px_40px_-15px_rgba(200,160,240,0.15)] hover:-translate-y-1 transition-all duration-300">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/5 rounded-full blur-2xl group-hover:bg-tertiary/10 transition-colors duration-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <p className="text-on-surface-variant text-sm font-medium uppercase tracking-wider">Total Quotations</p>
                  <span className="material-symbols-outlined text-tertiary p-2 rounded-lg bg-tertiary/10">request_quote</span>
                </div>
                <p className="text-3xl font-bold text-on-surface tracking-tight">{stats?.kpis?.totalQuotations || 0}</p>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <span className={`${(stats?.kpis?.quotationsChange || 0) >= 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'} px-2 py-0.5 rounded flex items-center`}>
                    <span className="material-symbols-outlined text-[14px]">{(stats?.kpis?.quotationsChange || 0) >= 0 ? 'arrow_upward' : 'arrow_downward'}</span> {Math.abs(stats?.kpis?.quotationsChange || 0)}%
                  </span>
                  <span className="text-on-surface-variant/60">vs last month</span>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:border-primary/40 hover:shadow-[0_20px_40px_-15px_rgba(125,211,252,0.15)] hover:-translate-y-1 transition-all duration-300">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <p className="text-on-surface-variant text-sm font-medium uppercase tracking-wider">Total Sales</p>
                  <span className="material-symbols-outlined text-primary p-2 rounded-lg bg-primary/10">payments</span>
                </div>
                <p className="text-3xl font-bold text-on-surface tracking-tight">{formatCurrency(stats?.kpis?.totalSales || 0)}</p>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <span className={`${(stats?.kpis?.salesChange || 0) >= 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'} px-2 py-0.5 rounded flex items-center`}>
                    <span className="material-symbols-outlined text-[14px]">{(stats?.kpis?.salesChange || 0) >= 0 ? 'arrow_upward' : 'arrow_downward'}</span> {Math.abs(stats?.kpis?.salesChange || 0)}%
                  </span>
                  <span className="text-on-surface-variant/60">vs last month</span>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:border-tertiary/40 hover:shadow-[0_20px_40px_-15px_rgba(200,160,240,0.15)] hover:-translate-y-1 transition-all duration-300">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/5 rounded-full blur-2xl group-hover:bg-tertiary/10 transition-colors duration-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <p className="text-on-surface-variant text-sm font-medium uppercase tracking-wider">Total Customers</p>
                  <span className="material-symbols-outlined text-tertiary p-2 rounded-lg bg-tertiary/10">group</span>
                </div>
                <p className="text-3xl font-bold text-on-surface tracking-tight">{stats?.kpis?.totalCustomers || 0}</p>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <span className={`${(stats?.kpis?.customersChange || 0) >= 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'} px-2 py-0.5 rounded flex items-center`}>
                    <span className="material-symbols-outlined text-[14px]">{(stats?.kpis?.customersChange || 0) >= 0 ? 'arrow_upward' : 'arrow_downward'}</span> {Math.abs(stats?.kpis?.customersChange || 0)}%
                  </span>
                  <span className="text-on-surface-variant/60">vs last month</span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="glass-panel p-6 rounded-3xl flex flex-wrap items-end gap-6 animate-fade-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Branch</label>
                <div className="relative">
                  <select 
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="glass-input rounded-xl py-2.5 pl-3 pr-10 text-sm font-medium appearance-none cursor-pointer w-48 focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="">All Branches</option>
                    {/* Ideally populate this with actual branches if available */}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-primary">expand_more</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setBranchId('')}
                  className="glass-button p-2.5 rounded-xl flex items-center justify-center cursor-pointer hover:bg-surface-bright transition-colors" 
                  title="Reset Filters"
                >
                  <span className="material-symbols-outlined">restart_alt</span>
                </button>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-slide-up" style={{ animationDelay: '0.4s' }}>
              {/* Invoice Sales Trend */}
              <div className="glass-panel-elevated p-8 rounded-3xl hover:border-primary/30 hover:shadow-[0_20px_40px_-15px_rgba(125,211,252,0.1)] transition-all duration-300">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h3 className="text-on-surface font-bold mb-1">Invoice Sales (28 Days)</h3>
                  </div>
                </div>
                <div className="h-48 w-full relative pb-6">
                  <svg 
                    className="w-full h-full overflow-visible cursor-crosshair" 
                    preserveAspectRatio="none" 
                    viewBox="0 0 400 100"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const relativeX = ((e.clientX - rect.left) / rect.width) * 400;
                      if (invoiceSalesData.length > 0) {
                        const closestPoint = invoiceSalesData.reduce((prev, curr) => 
                          Math.abs(curr.x - relativeX) < Math.abs(prev.x - relativeX) ? curr : prev
                        );
                        setHoveredInvoicePoint(closestPoint);
                      }
                    }}
                    onMouseLeave={() => setHoveredInvoicePoint(null)}
                  >
                    <defs>
                      <linearGradient id="gradient1" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.3"></stop>
                        <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0"></stop>
                      </linearGradient>
                    </defs>
                    <path d={`${invoicePath} L400,100 L0,100 Z`} fill="url(#gradient1)"></path>
                    <path className="path-line" d={invoicePath} fill="none" stroke="#7dd3fc" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    
                    {hoveredInvoicePoint && (
                      <>
                        <line 
                          x1={hoveredInvoicePoint.x} 
                          y1={0} 
                          x2={hoveredInvoicePoint.x} 
                          y2={100} 
                          stroke="#7dd3fc" 
                          strokeWidth="1.5" 
                          strokeDasharray="4 4" 
                          opacity="0.6"
                        />
                        <circle 
                          cx={hoveredInvoicePoint.x} 
                          cy={hoveredInvoicePoint.y} 
                          r="8" 
                          fill="#7dd3fc" 
                          opacity="0.3"
                        />
                        <circle 
                          cx={hoveredInvoicePoint.x} 
                          cy={hoveredInvoicePoint.y} 
                          r="4" 
                          fill="#7dd3fc" 
                          stroke="#ffffff" 
                          strokeWidth="1.5"
                        />
                      </>
                    )}
                  </svg>
                  
                  {hoveredInvoicePoint && (
                    <div 
                      className="absolute pointer-events-none z-30 transition-all duration-150 ease-out glass-panel p-2.5 rounded-xl shadow-lg border border-primary/20 flex flex-col gap-1 text-xs min-w-[140px]"
                      style={{
                        left: `${(hoveredInvoicePoint.x / 400) * 100}%`,
                        top: `${(hoveredInvoicePoint.y / 100) * 100}%`,
                        transform: 'translate(-50%, calc(-100% - 15px))',
                      }}
                    >
                      <div className="text-on-surface-variant font-bold text-[9px] uppercase tracking-wider">{hoveredInvoicePoint.date}</div>
                      <div className="flex items-center gap-1.5 font-bold text-primary text-xs">
                        <span className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(125,211,252,0.8)]"></span>
                        Sales: {hoveredInvoicePoint.sales}
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 w-full flex justify-between text-[10px] font-bold text-on-surface-variant/60 pt-2 border-t border-outline-variant/30 uppercase tracking-wider px-2">
                    <span>W1</span>
                    <span>W2</span>
                    <span>W3</span>
                    <span>W4</span>
                  </div>
                </div>
              </div>

              {/* Quotation Sales Trend */}
              <div className="glass-panel-elevated p-8 rounded-3xl hover:border-tertiary/30 hover:shadow-[0_20px_40px_-15px_rgba(200,160,240,0.1)] transition-all duration-300">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h3 className="text-on-surface font-bold mb-1">Quotation Value (28 Days)</h3>
                  </div>
                </div>
                <div className="h-48 w-full relative pb-6">
                  <svg 
                    className="w-full h-full overflow-visible cursor-crosshair" 
                    preserveAspectRatio="none" 
                    viewBox="0 0 400 100"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const relativeX = ((e.clientX - rect.left) / rect.width) * 400;
                      if (quotationSalesData.length > 0) {
                        const closestPoint = quotationSalesData.reduce((prev, curr) => 
                          Math.abs(curr.x - relativeX) < Math.abs(prev.x - relativeX) ? curr : prev
                        );
                        setHoveredQuotationPoint(closestPoint);
                      }
                    }}
                    onMouseLeave={() => setHoveredQuotationPoint(null)}
                  >
                    <defs>
                      <linearGradient id="gradient2" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="#c8a0f0" stopOpacity="0.3"></stop>
                        <stop offset="100%" stopColor="#c8a0f0" stopOpacity="0"></stop>
                      </linearGradient>
                    </defs>
                    <path d={`${quotationPath} L400,100 L0,100 Z`} fill="url(#gradient2)"></path>
                    <path className="path-line" d={quotationPath} fill="none" stroke="#c8a0f0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    
                    {hoveredQuotationPoint && (
                      <>
                        <line 
                          x1={hoveredQuotationPoint.x} 
                          y1={0} 
                          x2={hoveredQuotationPoint.x} 
                          y2={100} 
                          stroke="#c8a0f0" 
                          strokeWidth="1.5" 
                          strokeDasharray="4 4" 
                          opacity="0.6"
                        />
                        <circle 
                          cx={hoveredQuotationPoint.x} 
                          cy={hoveredQuotationPoint.y} 
                          r="8" 
                          fill="#c8a0f0" 
                          opacity="0.3"
                        />
                        <circle 
                          cx={hoveredQuotationPoint.x} 
                          cy={hoveredQuotationPoint.y} 
                          r="4" 
                          fill="#c8a0f0" 
                          stroke="#ffffff" 
                          strokeWidth="1.5"
                        />
                      </>
                    )}
                  </svg>
                  
                  {hoveredQuotationPoint && (
                    <div 
                      className="absolute pointer-events-none z-30 transition-all duration-150 ease-out glass-panel p-2.5 rounded-xl shadow-lg border border-tertiary/20 flex flex-col gap-1 text-xs min-w-[140px]"
                      style={{
                        left: `${(hoveredQuotationPoint.x / 400) * 100}%`,
                        top: `${(hoveredQuotationPoint.y / 100) * 100}%`,
                        transform: 'translate(-50%, calc(-100% - 15px))',
                      }}
                    >
                      <div className="text-on-surface-variant font-bold text-[9px] uppercase tracking-wider">{hoveredQuotationPoint.date}</div>
                      <div className="flex items-center gap-1.5 font-bold text-tertiary text-xs">
                        <span className="size-1.5 rounded-full bg-tertiary shadow-[0_0_8px_rgba(200,160,240,0.8)]"></span>
                        Quote: {hoveredQuotationPoint.sales}
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 w-full flex justify-between text-[10px] font-bold text-on-surface-variant/60 pt-2 border-t border-outline-variant/30 uppercase tracking-wider px-2">
                    <span>W1</span>
                    <span>W2</span>
                    <span>W3</span>
                    <span>W4</span>
                  </div>
                </div>
              </div>

              {/* Invoice Count Bar (6 weeks) */}
              <div className="glass-panel-elevated p-8 rounded-3xl hover:border-primary/30 hover:shadow-[0_20px_40px_-15px_rgba(125,211,252,0.1)] transition-all duration-300">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h3 className="text-on-surface font-bold mb-1">Invoice Count (6 Weeks)</h3>
                  </div>
                </div>
                <div className="h-48 w-full flex items-end justify-around pb-6 relative">
                  {stats?.weeklyCounts?.map((week: any, i: number) => {
                    const maxCount = Math.max(...stats.weeklyCounts.map((w: any) => w.invoices), 1);
                    const height = (week.invoices / maxCount) * 90; // max 90%
                    return (
                      <div key={i} className="w-10 bg-primary/30 hover:bg-primary/60 border border-primary/40 rounded-t-xl bar-grow transition-colors relative group" style={{ height: `${Math.max(height, 5)}%`, animationDelay: `${0.1 * i}s` }}>
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-surface text-xs font-bold py-1.5 px-2.5 rounded-lg glass-panel transition-opacity shadow-lg border border-primary/20 text-primary z-10">{week.invoices}</div>
                      </div>
                    );
                  })}
                  <div className="absolute bottom-0 w-full flex justify-around text-[10px] font-bold text-on-surface-variant/60 pt-2 border-t border-outline-variant/30 uppercase tracking-wider">
                    {stats?.weeklyCounts?.map((w: any, i: number) => <span key={i}>{w.week}</span>)}
                  </div>
                </div>
              </div>

              {/* Quotation Count Bar (6 weeks) */}
              <div className="glass-panel-elevated p-8 rounded-3xl hover:border-tertiary/30 hover:shadow-[0_20px_40px_-15px_rgba(200,160,240,0.1)] transition-all duration-300">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h3 className="text-on-surface font-bold mb-1">Quotation Count (6 Weeks)</h3>
                  </div>
                </div>
                <div className="h-48 w-full flex items-end justify-around pb-6 relative">
                  {stats?.weeklyCounts?.map((week: any, i: number) => {
                    const maxCount = Math.max(...stats.weeklyCounts.map((w: any) => w.quotations), 1);
                    const height = (week.quotations / maxCount) * 90; // max 90%
                    return (
                      <div key={i} className="w-10 bg-tertiary/30 hover:bg-tertiary/60 border border-tertiary/40 rounded-t-xl bar-grow transition-colors relative group" style={{ height: `${Math.max(height, 5)}%`, animationDelay: `${0.1 * i}s` }}>
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-surface text-xs font-bold py-1.5 px-2.5 rounded-lg glass-panel transition-opacity shadow-lg border border-tertiary/20 text-tertiary z-10">{week.quotations}</div>
                      </div>
                    );
                  })}
                  <div className="absolute bottom-0 w-full flex justify-around text-[10px] font-bold text-on-surface-variant/60 pt-2 border-t border-outline-variant/30 uppercase tracking-wider">
                    {stats?.weeklyCounts?.map((w: any, i: number) => <span key={i}>{w.week}</span>)}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Reminders & Followups */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-slide-up" style={{ animationDelay: '0.5s' }}>
              {/* Invoice Reminders */}
              <div className="xl:col-span-1 glass-panel p-8 rounded-3xl hover:shadow-[0_20px_40px_-15px_rgba(125,211,252,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                      <span className="material-symbols-outlined text-[20px]">warning</span>
                    </div>
                    Invoice Reminders
                  </h3>
                </div>
                <div className="space-y-4 flex-grow flex flex-col">
                  {stats?.invoiceReminders?.length === 0 ? (
                    <div className="text-on-surface-variant text-sm py-8 text-center">No overdue or unpaid invoices.</div>
                  ) : (
                    stats?.invoiceReminders?.map((inv: any) => (
                      <div key={inv.id} className="p-4 rounded-2xl bg-surface-bright/50 border border-outline-variant/30 flex gap-4 hover:bg-surface-bright hover:border-outline-variant/50 transition-all cursor-pointer group hover:-translate-y-0.5">
                        <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20 group-hover:scale-110 transition-transform group-hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                          <span className="material-symbols-outlined text-[24px]">receipt_long</span>
                        </div>
                        <div className="flex flex-col justify-center flex-grow">
                          <p className="text-sm font-bold text-on-surface mb-0.5">{inv.customer?.customerName || 'Unknown Customer'}</p>
                          <p className="text-xs text-on-surface-variant font-medium">#{inv.invoiceNumber} • {formatCurrency(inv.grandTotal)}</p>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs font-bold bg-rose-500/10 text-rose-400 px-2 py-1 rounded border border-rose-500/20">{inv.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quotation Followups */}
              <div className="xl:col-span-1 glass-panel p-8 rounded-3xl hover:shadow-[0_20px_40px_-15px_rgba(200,160,240,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                      <span className="material-symbols-outlined text-[20px]">schedule</span>
                    </div>
                    Quotation Followups
                  </h3>
                </div>
                <div className="space-y-4 flex-grow flex flex-col">
                  {stats?.quotationFollowups?.length === 0 ? (
                    <div className="text-on-surface-variant text-sm py-8 text-center">No quotations need follow-up.</div>
                  ) : (
                    stats?.quotationFollowups?.map((quo: any) => (
                      <div key={quo.id} className="p-4 rounded-2xl bg-surface-bright/50 border border-outline-variant/30 flex gap-4 hover:bg-surface-bright hover:border-outline-variant/50 transition-all cursor-pointer group hover:-translate-y-0.5">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform group-hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                          <span className="material-symbols-outlined text-[24px]">request_quote</span>
                        </div>
                        <div className="flex flex-col justify-center flex-grow">
                          <p className="text-sm font-bold text-on-surface mb-0.5">{quo.customer?.customerName || 'Unknown Customer'}</p>
                          <p className="text-xs text-on-surface-variant font-medium">#{quo.quotationNumber} • {formatCurrency(quo.grandTotal)}</p>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs font-bold bg-amber-500/10 text-amber-400 px-2 py-1 rounded border border-amber-500/20">{quo.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}

      </div>

      {/* Footer Decoration */}
      <footer className="relative z-10 max-w-7xl mx-auto px-8 pb-8 opacity-40 text-center flex items-center justify-center gap-4">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-on-surface-variant to-transparent"></div>
        <p className="text-xs font-bold tracking-[0.2em] text-on-surface-variant uppercase">
          BillTea Dashboard • Overview
        </p>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-on-surface-variant to-transparent"></div>
      </footer>
    </div>
  );
}
