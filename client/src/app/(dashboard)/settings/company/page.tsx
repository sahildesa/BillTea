"use client";

import React, { useState } from 'react';

export default function CompanySettingsPage() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-8 space-y-8 pb-24 relative selection:bg-primary/30 bg-background">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(125, 211, 252, 0.1) 0%, transparent 70%)' }}></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-primary/40 to-surface-container-low border border-primary/20 shadow-[0_0_20px_rgba(125,211,252,0.1)]">
                <img
                  className="w-full h-full rounded-full object-cover"
                  alt="Indux Tech"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJaHtTihiwas3FJ3PPqnlT74NRg2lOOOvc21MCHeu0XGwRK8mHSf999ihlWFGBcjizOpjQf8pqv_7s6sPdUP0V0pnElMnk3qCYHJalKzL3D79A7L21kIwG9-UCaKfI6gUp6xlszM60fotwjxpDQMuiJ_2upIe2h7ku3IUsgxVJDP8UfeUlhsYZy8Zc4CPUYE5KVP2GWEF-L9UsaCepIuISz-R9WlmLqI_5klTZnlcByd6-YyLwPIKe"
                />
              </div>
              <button className="absolute bottom-0 right-0 p-1 bg-surface-container border border-primary/30 rounded-full text-primary hover:bg-primary/20 transition-colors cursor-pointer flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-on-surface mb-1">Indux Tech</h2>
              <div className="flex items-center gap-4">
                <span className="px-2 py-1 bg-secondary-container/30 border border-secondary/20 rounded-full text-sm font-medium text-secondary">
                  Technology & Software
                </span>
                <div className="flex items-center gap-1 text-on-surface-variant text-sm font-medium">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  Mumbai, India
                </div>
              </div>
            </div>
          </div>
          {/* Status Toggle */}
          <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-4">
            <span className="text-sm font-medium text-on-surface-variant">Account Status</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"></div>
              <span className="ml-3 text-sm text-primary font-medium">Active</span>
            </label>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel rounded-xl p-6 flex flex-col gap-2 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors"></div>
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-on-surface-variant">Total Branches</span>
              <div className="p-1 bg-primary/10 rounded-lg text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">domain</span>
              </div>
            </div>
            <div className="text-3xl font-semibold tracking-tight text-on-surface mt-2">4</div>
            <div className="text-sm text-secondary flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>+1 this year</span>
            </div>
          </div>
          <div className="glass-panel rounded-xl p-6 flex flex-col gap-2 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/5 rounded-full blur-xl group-hover:bg-secondary/10 transition-colors"></div>
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-on-surface-variant">Total Customers</span>
              <div className="p-1 bg-secondary/10 rounded-lg text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined">groups</span>
              </div>
            </div>
            <div className="text-3xl font-semibold tracking-tight text-on-surface mt-2">1,092</div>
            <div className="text-sm text-secondary flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>+12% this month</span>
            </div>
          </div>
          <div className="glass-panel rounded-xl p-6 flex flex-col gap-2 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/5 rounded-full blur-xl group-hover:bg-tertiary/10 transition-colors"></div>
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-on-surface-variant">Total Staff</span>
              <div className="p-1 bg-tertiary/10 rounded-lg text-tertiary flex items-center justify-center">
                <span className="material-symbols-outlined">badge</span>
              </div>
            </div>
            <div className="text-3xl font-semibold tracking-tight text-on-surface mt-2">28</div>
            <div className="text-sm text-on-surface-variant flex items-center gap-1">
              <span>Across all branches</span>
            </div>
          </div>
        </div>

        {/* Detailed Configuration */}
        <div className="glass-panel rounded-xl p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-primary/10">
            <h3 className="text-2xl font-semibold tracking-tight text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">corporate_fare</span>
              Business Details
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Field 1 */}
            <div className="flex flex-col gap-1 group">
              <label className="text-sm font-medium text-on-surface-variant pl-1">Business Unique ID</label>
              <div className="relative">
                <input
                  className="w-full bg-surface-container-low/40 border border-primary/10 rounded-lg py-2 px-4 text-on-surface font-mono focus:outline-none focus:border-primary/50 transition-all glass-input"
                  readOnly
                  type="text"
                  defaultValue="IDX-9982-BT"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">lock</span>
              </div>
            </div>
            {/* Field 2 */}
            <div className="flex flex-col gap-1 group">
              <label className="text-sm font-medium text-on-surface-variant pl-1">Owner Name</label>
              <div className="relative">
                <input
                  className="w-full bg-surface-container-low/40 border border-primary/10 rounded-lg py-2 px-4 text-on-surface focus:outline-none focus:border-primary/50 transition-all glass-input"
                  type="text"
                  defaultValue="Sarang Wagh"
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
              </div>
            </div>
            {/* Field 3 */}
            <div className="flex flex-col gap-1 group">
              <label className="text-sm font-medium text-on-surface-variant pl-1">GST Number</label>
              <div className="relative">
                <input
                  className="w-full bg-surface-container-low/40 border border-primary/10 rounded-lg py-2 px-4 text-on-surface font-mono uppercase focus:outline-none focus:border-primary/50 transition-all glass-input"
                  type="text"
                  defaultValue="27AAAAA0000A1Z5"
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
              </div>
            </div>
            {/* Field 4 */}
            <div className="flex flex-col gap-1 group">
              <label className="text-sm font-medium text-on-surface-variant pl-1">VAT Registration</label>
              <div className="relative">
                <input
                  className="w-full bg-surface-container-low/40 border border-primary/10 rounded-lg py-2 px-4 text-on-surface font-mono uppercase focus:outline-none focus:border-primary/50 transition-all glass-input"
                  type="text"
                  defaultValue="VAT-77281-X"
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
              </div>
            </div>
            {/* Field 5 */}
            <div className="flex flex-col gap-1 group md:col-span-2 lg:col-span-1">
              <label className="text-sm font-medium text-on-surface-variant pl-1">FSSI License</label>
              <div className="relative">
                <input
                  className="w-full bg-surface-container-low/40 border border-primary/10 rounded-lg py-2 px-4 text-on-surface font-mono uppercase focus:outline-none focus:border-primary/50 transition-all glass-input"
                  type="text"
                  defaultValue="FSSAI-10022022000123"
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Area */}
        <div className="flex justify-end pt-6">
          <button className="px-8 py-2 bg-primary/20 text-primary border border-primary/50 rounded-lg text-sm font-medium hover:bg-primary/30 hover:shadow-[0_0_20px_rgba(125,211,252,0.3)] transition-all duration-300 flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">save</span>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
