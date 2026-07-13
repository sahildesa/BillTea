'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useBranch } from '../../../components/BranchProvider';
import { apiFetch } from '../../../lib/auth';

export default function SettingsPage() {
  const { selectedBranchId } = useBranch();
  const [showQuotationSettings, setShowQuotationSettings] = useState(false);
  const [quotationTheme, setQuotationTheme] = useState('INDUX_MODERN');
  const [themeColor, setThemeColor] = useState('#0ea5e9');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  // Fetch branch details when modal opens
  useEffect(() => {
    if (showQuotationSettings && selectedBranchId) {
      setIsLoadingSettings(true);
      apiFetch('/branches')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.branches) {
            const branch = data.branches.find((b: any) => b.id === selectedBranchId);
            if (branch) {
              if (branch.quotationTheme) setQuotationTheme(branch.quotationTheme);
              if (branch.themeColor) setThemeColor(branch.themeColor);
            }
          }
        })
        .finally(() => setIsLoadingSettings(false));
    }
  }, [showQuotationSettings, selectedBranchId]);

  const handleSaveQuotationSettings = async () => {
    if (!selectedBranchId) return;
    setIsSaving(true);
    try {
      const res = await apiFetch(`/branches/${selectedBranchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotationTheme,
          themeColor
        })
      });
      if (res.ok) {
        setShowQuotationSettings(false);
      } else {
        alert('Failed to save settings');
      }
    } catch (err) {
      alert('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="flex-1 overflow-y-auto p-8 z-0 relative overflow-x-hidden selection:bg-primary/30">
      {/* Mesh Background */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(125,211,252,0.05)_0%,_transparent_40%),_radial-gradient(circle_at_80%_80%,_rgba(200,160,240,0.05)_0%,_transparent_40%)] pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-8 pb-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
          <div>
             <h1 className="text-3xl md:text-4xl font-black tracking-tight font-display mb-2">
              <span className="bg-gradient-to-br from-primary to-tertiary bg-clip-text text-transparent">Settings
                </span>
              </h1>
            <p className="text-on-surface-variant text-lg">
              Manage your company identity, theme preferences, invoice structures, and integration access points from a single command center.
            </p>
          </div>
          <div className="hidden lg:block relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-tertiary rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500 pointer-events-none"></div>
            <div className="relative px-4 py-2 glass-panel rounded-xl flex items-center gap-3 border border-primary/20">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-sm font-medium text-on-surface-variant">System Status: Optimal</span>
            </div>
          </div>
        </header>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Update Profile */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col h-full group hover:border-primary/40 hover:shadow-[0_0_30px_rgba(125,211,252,0.1)] hover:-translate-y-1 transition-all duration-300 hover:bg-surface-container/70">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform bg-[rgba(125,211,252,0.1)] shadow-[0_0_15px_rgba(125,211,252,0.05)]">
              <span className="material-symbols-outlined text-3xl">account_circle</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">Update Profile</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-8 flex-grow">
              Update your personal information, manage security settings, and change your password.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/settings/profile" className="border border-[rgba(160,180,196,0.2)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(160,180,196,0.4)] transition-all ease-in-out duration-300 px-5 py-2.5 rounded-lg text-sm font-medium text-on-surface flex items-center gap-2 cursor-pointer w-full justify-center">
                <span className="material-symbols-outlined text-lg">settings</span> Manage
              </Link>
            </div>
          </div>

          {/* User Management */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col h-full group hover:border-primary/40 hover:shadow-[0_0_30px_rgba(125,211,252,0.1)] hover:-translate-y-1 transition-all duration-300 hover:bg-surface-container/70">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform bg-[rgba(125,211,252,0.1)] shadow-[0_0_15px_rgba(125,211,252,0.05)]">
              <span className="material-symbols-outlined text-3xl">manage_accounts</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">User Management</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-8 flex-grow">
              Invite team members, assign roles, and manage access permissions across your organization.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/settings/users" className="border border-[rgba(160,180,196,0.2)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(160,180,196,0.4)] transition-all ease-in-out duration-300 px-3 py-2.5 rounded-lg text-sm font-medium text-on-surface flex items-center gap-2 cursor-pointer flex-1 justify-center whitespace-nowrap">
                <span className="material-symbols-outlined text-lg">settings</span> Manage
              </Link>
              <button className="bg-[rgba(125,211,252,0.15)] border border-[rgba(125,211,252,0.3)] hover:bg-[rgba(125,211,252,0.3)] hover:shadow-[0_0_20px_rgba(125,211,252,0.2)] transition-all ease-in-out duration-300 px-3 py-2.5 rounded-lg text-sm font-medium text-primary flex items-center gap-2 cursor-pointer flex-1 justify-center whitespace-nowrap">
                <span className="material-symbols-outlined text-lg">add</span> Create User
              </button>
            </div>
          </div>
          {/* Company Settings */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col h-full group hover:border-primary/40 hover:shadow-[0_0_30px_rgba(125,211,252,0.1)] hover:-translate-y-1 transition-all duration-300 hover:bg-surface-container/70">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform bg-[rgba(125,211,252,0.1)] shadow-[0_0_15px_rgba(125,211,252,0.05)]">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 0" }}>corporate_fare</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">Company Settings</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-8 flex-grow">
              Company name, brand, logo, tax entries (company-wide). Maintain your professional presence and legal identification.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/settings/company" className="border border-[rgba(160,180,196,0.2)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(160,180,196,0.4)] transition-all ease-in-out duration-300 px-5 py-2.5 rounded-lg text-sm font-medium text-on-surface flex items-center gap-2 cursor-pointer w-full justify-center">
                <span className="material-symbols-outlined text-lg">settings</span> Manage
              </Link>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col h-full group hover:border-tertiary/40 hover:shadow-[0_0_30px_rgba(200,160,240,0.1)] hover:-translate-y-1 transition-all duration-300 hover:bg-surface-container/70">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-tertiary group-hover:scale-110 transition-transform bg-[rgba(200,160,240,0.1)] shadow-[0_0_15px_rgba(200,160,240,0.05)]">
              <span className="material-symbols-outlined text-3xl">palette</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">Theme Settings</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-8 flex-grow">
              Button, navigation and table header colors. Personalize the Glacier interface to match your corporate visual identity.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/settings/theme" className="border border-[rgba(160,180,196,0.2)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(160,180,196,0.4)] transition-all ease-in-out duration-300 px-5 py-2.5 rounded-lg text-sm font-medium text-on-surface flex items-center gap-2 cursor-pointer w-full justify-center">
                <span className="material-symbols-outlined text-lg">settings</span> Manage
              </Link>
            </div>
          </div>

          {/* Invoice Settings */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col h-full group hover:border-primary/40 hover:shadow-[0_0_30px_rgba(125,211,252,0.1)] hover:-translate-y-1 transition-all duration-300 hover:bg-surface-container/70">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform bg-[rgba(125,211,252,0.1)] shadow-[0_0_15px_rgba(125,211,252,0.05)]">
              <span className="material-symbols-outlined text-3xl">receipt_long</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">Invoice Settings</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-8 flex-grow">
              Invoice prefix, start number and terms & conditions. Standardize your billing cycle and financial documentation.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/settings/invoice-settings" className="border border-[rgba(160,180,196,0.2)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(160,180,196,0.4)] transition-all ease-in-out duration-300 px-3 py-2.5 rounded-lg text-sm font-medium text-on-surface flex items-center gap-2 cursor-pointer flex-1 justify-center whitespace-nowrap">
                <span className="material-symbols-outlined text-lg">settings</span> Manage
              </Link>
              <button className="bg-[rgba(125,211,252,0.15)] border border-[rgba(125,211,252,0.3)] hover:bg-[rgba(125,211,252,0.3)] hover:shadow-[0_0_20px_rgba(125,211,252,0.2)] transition-all ease-in-out duration-300 px-3 py-2.5 rounded-lg text-sm font-medium text-primary flex items-center gap-2 cursor-pointer flex-1 justify-center whitespace-nowrap">
                <span className="material-symbols-outlined text-lg">add</span> Create Invoice
              </button>
            </div>
          </div>

          {/* Quotation Settings */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col h-full group hover:border-primary/40 hover:shadow-[0_0_30px_rgba(125,211,252,0.1)] hover:-translate-y-1 transition-all duration-300 hover:bg-surface-container/70">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform bg-[rgba(125,211,252,0.1)] shadow-[0_0_15px_rgba(125,211,252,0.05)]">
              <span className="material-symbols-outlined text-3xl">request_quote</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">Quotation Settings</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-8 flex-grow">
              Quotation prefix, start number and terms. Define how you present estimates and proposals to prospective clients.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/settings/quotation-settings" className="border border-[rgba(160,180,196,0.2)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(160,180,196,0.4)] transition-all ease-in-out duration-300 px-3 py-2.5 rounded-lg text-sm font-medium text-on-surface flex items-center gap-2 cursor-pointer flex-1 justify-center whitespace-nowrap">
                <span className="material-symbols-outlined text-lg">settings</span> Manage
              </Link>
              <button className="bg-[rgba(125,211,252,0.15)] border border-[rgba(125,211,252,0.3)] hover:bg-[rgba(125,211,252,0.3)] hover:shadow-[0_0_20px_rgba(125,211,252,0.2)] transition-all ease-in-out duration-300 px-3 py-2.5 rounded-lg text-sm font-medium text-primary flex items-center gap-2 cursor-pointer flex-1 justify-center whitespace-nowrap">
                <span className="material-symbols-outlined text-lg">add</span> Create Quotation
              </button>
            </div>
          </div>

          {/* Plan & Subscription */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col h-full group hover:border-secondary/40 hover:shadow-[0_0_30px_rgba(136,180,204,0.1)] hover:-translate-y-1 transition-all duration-300 hover:bg-surface-container/70">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-secondary group-hover:scale-110 transition-transform bg-[rgba(136,180,204,0.1)] shadow-[0_0_15px_rgba(136,180,204,0.05)]">
              <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">Plan & Subscription</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-8 flex-grow">
              View your current plan and subscription. Access tiered features and license limits. Managed by administrative roles.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/settings/subscription" className="border border-[rgba(160,180,196,0.2)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(160,180,196,0.4)] transition-all ease-in-out duration-300 px-5 py-2.5 rounded-lg text-sm font-medium text-on-surface flex items-center gap-2 w-full justify-center cursor-pointer">
                <span className="material-symbols-outlined text-lg">settings</span> Manage
              </Link>
            </div>
          </div>

          {/* WhatsApp Settings */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col h-full group hover:border-[#25D366]/40 hover:shadow-[0_0_30px_rgba(37,211,102,0.1)] hover:-translate-y-1 transition-all duration-300 hover:bg-surface-container/70">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-[#25D366] group-hover:scale-110 transition-transform bg-[rgba(37,211,102,0.1)] shadow-[0_0_15px_rgba(37,211,102,0.05)]">
              <span className="material-symbols-outlined text-3xl">chat</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">WhatsApp Settings</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-8 flex-grow">
              Instance ID and access token for sending invoices and quotations via WhatsApp. Streamline client communication.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/settings/whatsapp" className="border border-[rgba(160,180,196,0.2)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(160,180,196,0.4)] transition-all ease-in-out duration-300 px-5 py-2.5 rounded-lg text-sm font-medium text-on-surface flex items-center gap-2 cursor-pointer w-full justify-center">
                <span className="material-symbols-outlined text-lg">settings</span> Manage
              </Link>
            </div>
          </div>

          {/* Branch Settings */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col h-full group hover:border-primary/40 hover:shadow-[0_0_30px_rgba(125,211,252,0.1)] hover:-translate-y-1 transition-all duration-300 hover:bg-surface-container/70">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform bg-[rgba(125,211,252,0.1)] shadow-[0_0_15px_rgba(125,211,252,0.05)]">
              <span className="material-symbols-outlined text-3xl">store</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">Branch Settings</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-8 flex-grow">
              Contact, address, bank, UPI, signature (per branch). Create and manage multiple operational branches with unique financial profiles.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/settings/branches" className="border border-[rgba(160,180,196,0.2)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(160,180,196,0.4)] transition-all ease-in-out duration-300 px-3 py-2.5 rounded-lg text-sm font-medium text-on-surface flex items-center gap-2 cursor-pointer flex-1 justify-center whitespace-nowrap">
                <span className="material-symbols-outlined text-lg">settings</span> Manage
              </Link>
              <button className="bg-[rgba(125,211,252,0.15)] border border-[rgba(125,211,252,0.3)] hover:bg-[rgba(125,211,252,0.3)] hover:shadow-[0_0_20px_rgba(125,211,252,0.2)] transition-all ease-in-out duration-300 px-3 py-2.5 rounded-lg text-sm font-medium text-primary flex items-center gap-2 cursor-pointer flex-1 justify-center whitespace-nowrap">
                <span className="material-symbols-outlined text-lg">add</span> Add Branch
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quotation Settings Modal */}
      {showQuotationSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl relative border border-primary/20 shadow-[0_0_40px_rgba(125,211,252,0.15)]">
            <button 
              onClick={() => setShowQuotationSettings(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-md transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="text-2xl font-bold text-on-surface mb-2">Quotation Theme Settings</h2>
            <p className="text-on-surface-variant text-sm mb-6">Customize the appearance of your generated Quotation PDFs.</p>
            
            {isLoadingSettings ? (
              <div className="flex justify-center py-8">
                <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-2">Quotation Layout Theme</label>
                  <select 
                    value={quotationTheme}
                    onChange={(e) => setQuotationTheme(e.target.value)}
                    className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                  >
                    <option value="INDUX_MODERN">Indux Modern (Recommended)</option>
                    <option value="CLASSIC">Classic Corporate</option>
                    <option value="MINIMAL">Minimalist</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-2">Brand Accent Color</label>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="color" 
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="h-12 w-20 rounded cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input 
                      type="text" 
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="flex-1 bg-surface-container/50 border border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors uppercase font-mono"
                      placeholder="#0ea5e9"
                    />
                  </div>
                  <p className="text-xs text-on-surface-variant mt-2">This color will be used for headers, dividers, and accents in the PDF.</p>
                </div>
                
                {/* Live Preview Sample */}
                <div className="mt-4 p-4 border border-outline-variant/30 rounded-xl bg-surface-container/30">
                  <div className="flex justify-between items-end border-b-2 pb-2 mb-2" style={{ borderColor: themeColor }}>
                    <div style={{ color: themeColor }} className="text-xl font-bold">QUOTATION</div>
                    <div className="text-xs text-on-surface-variant">Prepared For: Client</div>
                  </div>
                  <div className="bg-surface-container/50 text-xs p-2 rounded text-on-surface" style={{ backgroundColor: `${themeColor}20`, color: themeColor }}>
                    Sample styled block reflecting your selected accent color.
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/20">
                  <button 
                    onClick={() => setShowQuotationSettings(false)}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveQuotationSettings}
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary/90 text-on-primary px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(125,211,252,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSaving ? (
                      <><span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> Saving...</>
                    ) : (
                      'Save Settings'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Decoration */}
      <footer className="relative z-10 max-w-7xl mx-auto px-8 pb-12 opacity-40 text-center">
        <p className="text-sm font-medium tracking-widest text-on-surface-variant uppercase">
          © 2026 Indux Technology • Professional Infrastructure Tier
        </p>
      </footer>
    </div>
  );
}
