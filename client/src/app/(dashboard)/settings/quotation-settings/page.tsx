"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/auth";
import { useBranch } from "../../../../components/BranchProvider";

// ---- Toggle switch (custom, matches .toggle-checkbox / .toggle-label) ----
function Toggle({
  id,
  checked,
  onChange,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in mt-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={`absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer z-10 top-0.5 transition-all duration-300 ${checked ? 'border-primary' : 'border-outline-variant'}`}
        style={{
          left: checked ? "auto" : "2px",
          right: checked ? "2px" : "auto",
        }}
        id={id}
        name={id}
        type="checkbox"
      />
      <label
        className={`block overflow-hidden h-6 rounded-full border cursor-pointer transition-colors duration-300 ${checked ? 'bg-primary/20 border-primary shadow-[0_0_8px_var(--color-primary)]' : 'bg-surface-variant border-outline-variant'}`}
        htmlFor={id}
      />
    </div>
  );
}

function Icon({
  name,
  className = "",
  style,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={style}
    >
      {name}
    </span>
  );
}

export default function QuotationConfigurationPage() {
  const { selectedBranchId } = useBranch();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: "", text: "" });

  const [hsn, setHsn] = useState(true);
  const [sku, setSku] = useState(false);

  const [prefix, setPrefix] = useState("QT-");
  const [startingNumber, setStartingNumber] = useState("1");
  const [topMessage, setTopMessage] = useState("");
  const [bottomMessage, setBottomMessage] = useState("");
  const [terms, setTerms] = useState("");

  useEffect(() => {
    if (!selectedBranchId) return;

    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/document-settings/${selectedBranchId}?type=QUOTATION`);
        const data = await res.json();
        if (data && data.settings) {
          setHsn(data.settings.showHsn);
          setSku(data.settings.showSku);
          setPrefix(data.settings.prefix || "QT-");
          setStartingNumber(data.settings.nextNumber?.toString() || "1");
          setTopMessage(data.settings.topMessage || "");
          setBottomMessage(data.settings.bottomMessage || "");
          setTerms(data.settings.terms || "");
        }
      } catch (error) {
        setSaveMessage({ type: 'error', text: 'Failed to load settings' });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [selectedBranchId]);

  const handleSave = async () => {
    if (!selectedBranchId) {
      setSaveMessage({ type: 'error', text: 'No branch selected' });
      return;
    }
    setSaving(true);
    setSaveMessage({ type: '', text: '' });
    try {
      const res = await apiFetch(`/document-settings/${selectedBranchId}`, {
        method: "PUT",
        body: JSON.stringify({
          type: "QUOTATION",
          prefix,
          nextNumber: parseInt(startingNumber) || 1,
          topMessage,
          bottomMessage,
          terms,
          showSku: sku,
          showHsn: hsn
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    // FIX 1: use a fixed-height (h-screen) flex frame instead of `minHeight: 100vh` + `overflow-hidden`.
    // The old combo let the outer box grow past the viewport while still clipping (overflow-hidden),
    // which is what made the bottom of the page look like it was "cut off" mid-scroll.
    // With h-screen + overflow-hidden, the outer box is a true fixed viewport frame, and the
    // <main> below becomes the only scrollable region, so it scrolls all the way to its real end.
    <div
      className="flex h-screen overflow-hidden bg-background text-on-surface"
      style={{
        backgroundImage:
          "radial-gradient(at 0% 0%, color-mix(in srgb, var(--primary) 5%, transparent) 0px, transparent 50%), radial-gradient(at 100% 100%, color-mix(in srgb, var(--primary) 3%, transparent) 0px, transparent 50%)",
      }}
    >
      {/* SideNavBar placeholder — original mock left this empty */}

      {/* Main Content Area */}
      {/* FIX: h-full (not min-h-screen) so this column matches the fixed parent height exactly */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* TopNavBar */}

        {/* Canvas */}
        {/* FIX 2: widened max-w-5xl -> max-w-[1600px] and reduced side padding so content
            uses the available width instead of floating in a narrow centered column.
            FIX 1 (cont.): this is the actual scroll container now — flex-1 + min-h-0 lets it
            shrink correctly inside the flex column, and overflow-y-auto lets it scroll its full length.
            Added extra bottom padding so the last panel/action bar is never flush with the edge. */}
        <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-6 py-6 lg:px-10 lg:py-8">
          <div className="max-w-[1600px] mx-auto space-y-6 pb-16">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="settings" className="text-primary/70" />
                <span className="text-sm tracking-wider uppercase text-on-surface-variant">
                  Settings
                </span>
                <Icon
                  name="chevron_right"
                  className="text-sm text-on-surface-variant/50"
                />
                <span className="text-sm text-primary">
                  Quotation
                </span>
              </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight font-display mb-2">
                <span className="text-on-surface">Quotation </span>
              <span className="bg-gradient-to-br from-primary to-tertiary bg-clip-text text-transparent">Settings
                </span>
              </h1>
              <p className="text-on-surface-variant text-lg">
                Configure default behaviors, display preferences, and legal
                messaging for all newly generated quotes.
              </p>
            </div>

            {/* Save message toast */}
            {saveMessage.text && (
              <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between ${saveMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                : 'bg-red-500/10 border-red-500/20 text-red-500'
                }`}>
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined p-1 rounded-full ${saveMessage.type === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                    {saveMessage.type === 'success' ? 'check_circle' : 'error'}
                  </span>
                  <span className="font-medium text-sm">{saveMessage.text}</span>
                </div>
                <button onClick={() => setSaveMessage({ type: '', text: '' })} className="text-current opacity-70 hover:opacity-100 transition-opacity">
                  <Icon name="close" className="text-sm" />
                </button>
              </div>
            )}

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column (Wider) */}
              <div className="lg:col-span-2 space-y-6">
                {/* General Configuration Panel */}
                <GlassPanel>
                  <PanelHeader icon="tune" title="General Configuration" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <FieldLabel>Quotation Prefix</FieldLabel>
                      <div className="relative">
                        <Icon
                          name="tag"
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-primary/50"
                        />
                        <input
                          className="w-full pl-9 pr-4 py-3 rounded-lg font-mono focus:ring-0 focus:outline-none glass-input"
                          type="text"
                          value={prefix}
                          onChange={(e) => setPrefix(e.target.value)}
                        />
                      </div>
                      <p className="text-[12px] text-on-surface-variant/70">
                        Appears before the quotation number (e.g., QT-001).
                      </p>
                    </div>
                    <div className="space-y-2">
                      <FieldLabel>Starting Number</FieldLabel>
                      <div className="relative">
                        <Icon
                          name="numbers"
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-primary/50"
                        />
                        <input
                          className="w-full pl-9 pr-4 py-3 rounded-lg font-mono focus:ring-0 focus:outline-none glass-input"
                          type="number"
                          value={startingNumber}
                          onChange={(e) => setStartingNumber(e.target.value)}
                        />
                      </div>
                      <p className="text-[12px] text-on-surface-variant/70">
                        The next generated quotation will use this number.
                      </p>
                    </div>
                  </div>
                </GlassPanel>

                {/* Messaging Panel */}
                <GlassPanel>
                  <PanelHeader icon="chat_bubble" title="Standard Messaging" />
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <FieldLabel>Top Message (Header)</FieldLabel>
                      <textarea
                        className="w-full p-4 rounded-lg resize-none focus:ring-0 focus:outline-none glass-input"
                        placeholder="Thank you for your inquiry. Please find our quotation attached below..."
                        rows={3}
                        value={topMessage}
                        onChange={(e) => setTopMessage(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel>Bottom Message (Footer)</FieldLabel>
                      <textarea
                        className="w-full p-4 rounded-lg resize-none focus:ring-0 focus:outline-none glass-input"
                        placeholder="We appreciate your business..."
                        rows={3}
                        value={bottomMessage}
                        onChange={(e) => setBottomMessage(e.target.value)}
                      />
                    </div>
                  </div>
                </GlassPanel>

                {/* Legal Panel */}
                <GlassPanel className="relative overflow-hidden group">
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
                  <div className="flex items-center justify-between pb-4 mb-4 relative z-10 border-b border-primary/10">
                    <div className="flex items-center gap-2">
                      <Icon name="gavel" className="text-primary" />
                      <h3 className="font-semibold text-xl text-on-surface">
                        Legal
                      </h3>
                    </div>
                  </div>
                  <div className="space-y-2 relative z-10">
                    <FieldLabel>Terms &amp; Conditions</FieldLabel>
                    <textarea
                      className="w-full p-4 rounded-lg text-sm font-mono leading-relaxed focus:ring-0 focus:outline-none glass-input"
                      rows={6}
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                    />
                  </div>
                </GlassPanel>
              </div>

              {/* Right Column (Narrower) */}
              <div className="space-y-6">
                {/* Display Preferences Panel */}
                <GlassPanel>
                  <PanelHeader icon="visibility" title="Display Preferences" />
                  <div className="space-y-6">
                    <PreferenceRow
                      title="Show HSN Code"
                      description="Display HSN codes for items."
                      checked={hsn}
                      onChange={setHsn}
                      id="toggle_hsn"
                    />
                    <PreferenceRow
                      title="Show SKU"
                      description="Include internal Stock Keeping Unit identifiers."
                      checked={sku}
                      onChange={setSku}
                      id="toggle_sku"
                    />
                  </div>
                </GlassPanel>

              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-6 flex justify-end gap-4 mt-8 border-t border-primary/10">
              <button 
                disabled={saving || loading}
                onClick={handleSave} 
                className="px-8 py-3 rounded-lg font-medium text-sm transition-all relative overflow-hidden group glass-button-primary btn-login-glow"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {saving ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap");

        .material-symbols-outlined {
          font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(137, 146, 152, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(197, 234, 255, 0.3);
        }
      `}</style>
    </div>
  );
}

// ---- Reusable pieces ----
function GlassPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl p-6 glass-panel ${className}`}>
      {children}
    </section>
  );
}

function PanelHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-4 mb-4 border-b border-primary/10">
      <Icon name={icon} className="text-primary" />
      <h3 className="font-semibold text-xl text-on-surface">
        {title}
      </h3>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-on-surface-variant">
      {children}
    </label>
  );
}

function PreferenceRow({
  title,
  description,
  checked,
  onChange,
  id,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}) {
  return (
    <div className="flex items-start justify-between">
      <div className="pr-4">
        <h4 className="text-sm font-medium text-on-surface">
          {title}
        </h4>
        <p className="text-[12px] mt-1 text-on-surface-variant">
          {description}
        </p>
      </div>
      <Toggle id={id} checked={checked} onChange={onChange} />
    </div>
  );
}