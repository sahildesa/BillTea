"use client";

import React, { useState } from "react";

// ---- Design tokens (mirrors the original tailwind.config extend) ----
const colors = {
  background: "#081326",
  surface: "#081326",
  surfaceDim: "#081326",
  surfaceBright: "#2f394e",
  surfaceContainerLowest: "#040e21",
  surfaceContainerLow: "#111b2f",
  surfaceContainer: "#151f33",
  surfaceContainerHigh: "#202a3e",
  surfaceContainerHighest: "#2b354a",
  surfaceVariant: "#2b354a",
  onSurface: "#d8e2fd",
  onSurfaceVariant: "#bec8ce",
  inverseSurface: "#d8e2fd",
  inverseOnSurface: "#263045",
  primary: "#c5eaff",
  onPrimary: "#003547",
  primaryContainer: "#7dd3fc",
  onPrimaryContainer: "#005b78",
  primaryFixed: "#c0e8ff",
  primaryFixedDim: "#7bd1fa",
  onPrimaryFixed: "#001e2b",
  onPrimaryFixedVariant: "#004d66",
  secondary: "#a0cde5",
  onSecondary: "#003548",
  secondaryContainer: "#1f4e63",
  onSecondaryContainer: "#92bed7",
  secondaryFixed: "#c0e8ff",
  secondaryFixedDim: "#a0cde5",
  onSecondaryFixed: "#001e2b",
  onSecondaryFixedVariant: "#1c4c60",
  tertiary: "#f1ddff",
  onTertiary: "#411e65",
  tertiaryContainer: "#ddbaff",
  onTertiaryContainer: "#66438b",
  tertiaryFixed: "#f0dbff",
  tertiaryFixedDim: "#dcb8ff",
  onTertiaryFixed: "#2b024f",
  onTertiaryFixedVariant: "#59367d",
  error: "#ffb4ab",
  onError: "#690005",
  errorContainer: "#93000a",
  onErrorContainer: "#ffdad6",
  outline: "#899298",
  outlineVariant: "#3f484e",
  surfaceTint: "#7bd1fa",
  inversePrimary: "#006686",
};

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
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer z-10 top-0.5 transition-all duration-300"
        style={{
          left: checked ? "auto" : "2px",
          right: checked ? "2px" : "auto",
          borderColor: checked ? colors.primary : "#d1d5db",
        }}
        id={id}
        name={id}
        type="checkbox"
      />
      <label
        className="block overflow-hidden h-6 rounded-full border cursor-pointer transition-colors duration-300"
        style={{
          backgroundColor: checked ? "rgba(197, 234, 255, 0.2)" : colors.surfaceVariant,
          borderColor: checked ? colors.primary : colors.outlineVariant,
          boxShadow: checked ? "0 0 8px rgba(197,234,255,0.4)" : "none",
        }}
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
  const [hsn, setHsn] = useState(true);
  const [sku, setSku] = useState(false);
  const [payment, setPayment] = useState(true);
  const [personalName, setPersonalName] = useState(false);

  const [prefix, setPrefix] = useState("QT-");
  const [startingNumber, setStartingNumber] = useState("1001");
  const [topMessage, setTopMessage] = useState(
    "Thank you for considering Glacier Corp for your enterprise needs. The following estimate is valid for 30 days."
  );
  const [bottomMessage, setBottomMessage] = useState(
    "If you have any questions regarding this quotation, please contact our support team at support@glacier.corp."
  );
  const [terms, setTerms] = useState(
    `1. VALIDITY: This quotation is valid for 30 days from the date of issue.
2. PAYMENT TERMS: 50% advance along with Purchase Order, 50% prior to delivery.
3. TAXES: All applicable taxes are exclusive and will be charged extra as per government regulations at the time of billing.
4. DELIVERY: 4-6 weeks from receipt of firm order and advance payment.`
  );

  return (
    // FIX 1: use a fixed-height (h-screen) flex frame instead of `minHeight: 100vh` + `overflow-hidden`.
    // The old combo let the outer box grow past the viewport while still clipping (overflow-hidden),
    // which is what made the bottom of the page look like it was "cut off" mid-scroll.
    // With h-screen + overflow-hidden, the outer box is a true fixed viewport frame, and the
    // <main> below becomes the only scrollable region, so it scrolls all the way to its real end.
    <div
      className="flex h-screen overflow-hidden"
      style={{
        color: colors.onSurface,
        backgroundColor: "#1a2438",
        backgroundImage:
          "radial-gradient(at 0% 0%, rgba(197,234,255,0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(197,234,255,0.03) 0px, transparent 50%)",
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
                <Icon name="settings" className="text-[rgba(197,234,255,0.7)]" />
                <span
                  className="text-sm tracking-wider uppercase"
                  style={{ color: colors.onSurfaceVariant }}
                >
                  Settings
                </span>
                <Icon
                  name="chevron_right"
                  className="text-sm"
                  style={{ color: "rgba(190,200,206,0.5)" } as React.CSSProperties}
                />
                <span className="text-sm" style={{ color: colors.primary }}>
                  Quotation
                </span>
              </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight font-display mb-2">
                <span className="text-on-surface">Quatation </span>
              <span className="bg-gradient-to-br from-primary to-tertiary bg-clip-text text-transparent">Settings
                </span>
              </h1>
            <p className="text-on-surface-variant text-lg">
                Configure default behaviors, display preferences, and legal
                messaging for all newly generated quotes.
              </p>
            </div>

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
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                          style={{ color: "rgba(197,234,255,0.5)" } as React.CSSProperties}
                        />
                        <input
                          className="w-full pl-9 pr-4 py-3 rounded-lg font-mono focus:ring-0 focus:outline-none"
                          style={inputStyle}
                          type="text"
                          value={prefix}
                          onChange={(e) => setPrefix(e.target.value)}
                        />
                      </div>
                      <p className="text-[12px]" style={{ color: "rgba(190,200,206,0.7)" }}>
                        Appears before the quotation number (e.g., QT-001).
                      </p>
                    </div>
                    <div className="space-y-2">
                      <FieldLabel>Starting Number</FieldLabel>
                      <div className="relative">
                        <Icon
                          name="numbers"
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                          style={{ color: "rgba(197,234,255,0.5)" } as React.CSSProperties}
                        />
                        <input
                          className="w-full pl-9 pr-4 py-3 rounded-lg font-mono focus:ring-0 focus:outline-none"
                          style={inputStyle}
                          type="number"
                          value={startingNumber}
                          onChange={(e) => setStartingNumber(e.target.value)}
                        />
                      </div>
                      <p className="text-[12px]" style={{ color: "rgba(190,200,206,0.7)" }}>
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
                        className="w-full p-4 rounded-lg resize-none focus:ring-0 focus:outline-none"
                        style={textareaStyle}
                        placeholder="Thank you for your inquiry. Please find our quotation attached below..."
                        rows={3}
                        value={topMessage}
                        onChange={(e) => setTopMessage(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel>Bottom Message (Footer)</FieldLabel>
                      <textarea
                        className="w-full p-4 rounded-lg resize-none focus:ring-0 focus:outline-none"
                        style={textareaStyle}
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
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-[rgba(197,234,255,0.05)] rounded-full blur-3xl group-hover:bg-[rgba(197,234,255,0.1)] transition-colors duration-500" />
                  <div
                    className="flex items-center justify-between pb-4 mb-4 relative z-10"
                    style={{ borderBottom: "1px solid rgba(197,234,255,0.1)" }}
                  >
                    <div className="flex items-center gap-2">
                      <Icon name="gavel" style={{ color: colors.primary }} />
                      <h3
                        className="font-semibold text-xl"
                        style={{ color: colors.onSurface }}
                      >
                        Legal
                      </h3>
                    </div>
                    </div>
                  <div className="space-y-2 relative z-10">
                    <FieldLabel>Terms &amp; Conditions</FieldLabel>
                    <textarea
                      className="w-full p-4 rounded-lg text-sm font-mono leading-relaxed focus:ring-0 focus:outline-none"
                      style={textareaStyle}
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
                      description="Display Harmonized System Nomenclature codes for items."
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
                    <PreferenceRow
                      title="Payment Method"
                      description="Display accepted payment options on the quote footer."
                      checked={payment}
                      onChange={setPayment}
                      id="toggle_payment"
                    />
                    <PreferenceRow
                      title="Display Personal Name"
                      description="Show the generating agent's name instead of just the company."
                      checked={personalName}
                      onChange={setPersonalName}
                      id="toggle_name"
                    />
                  </div>
                </GlassPanel>

                {/* Status Summary Panel */}
                <GlassPanel className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[rgba(160,205,229,0.05)] rounded-full blur-2xl -mr-10 -mt-10" />
                  <h3
                    className="font-semibold text-lg mb-4 relative z-10"
                    style={{ color: colors.onSurface }}
                  >
                    Configuration Status
                  </h3>
                  <div className="space-y-4 relative z-10">
                    <div
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{
                        backgroundColor: "rgba(8,19,38,0.5)",
                        border: "1px solid rgba(63,72,78,0.3)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                        <span className="text-sm" style={{ color: colors.onSurface }}>
                          Auto-Sync Enabled
                        </span>
                      </div>
                    </div>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "rgba(190,200,206,0.7)" }}
                    >
                      Changes made here are applied instantly to all newly
                      generated draft quotations. Existing finalized quotes
                      remain unaffected.
                    </p>
                  </div>
                </GlassPanel>
              </div>
            </div>

            {/* Action Bar */}
            <div
              className="pt-6 flex justify-end gap-4 mt-8"
              style={{ borderTop: "1px solid rgba(197,234,255,0.1)" }}
            >
              <button
                className="px-6 py-3 rounded-lg font-medium text-sm transition-colors hover:bg-[rgba(43,53,74,0.5)]"
                style={{ color: colors.onSurfaceVariant }}
                onMouseEnter={(e) => (e.currentTarget.style.color = colors.onSurface)}
                onMouseLeave={(e) => (e.currentTarget.style.color = colors.onSurfaceVariant)}
              >
                Discard Changes
              </button>
              <button
                className="px-8 py-3 rounded-lg font-medium text-sm transition-all hover:shadow-[0_0_15px_rgba(197,234,255,0.25)] relative overflow-hidden group"
                style={{
                  backgroundColor: "rgba(197,234,255,0.2)",
                  border: "1px solid rgba(197,234,255,0.4)",
                  color: colors.primary,
                }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                Save Configuration
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

// ---- Shared style objects ----
const inputStyle: React.CSSProperties = {
  backgroundColor: "rgba(17,27,47,0.4)",
  border: "1px solid rgba(197,234,255,0.1)",
  color: colors.onSurface,
};

const textareaStyle: React.CSSProperties = {
  backgroundColor: "rgba(17,27,47,0.4)",
  border: "1px solid rgba(197,234,255,0.1)",
  color: colors.onSurface,
};

// ---- Reusable pieces ----
function GlassPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl p-6 ${className}`}
      style={{
        backgroundColor: "rgba(26,36,56,0.6)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(197,234,255,0.1)",
      }}
    >
      {children}
    </section>
  );
}

function PanelHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div
      className="flex items-center gap-2 pb-4 mb-4"
      style={{ borderBottom: "1px solid rgba(197,234,255,0.1)" }}
    >
      <Icon name={icon} style={{ color: colors.primary }} />
      <h3 className="font-semibold text-xl" style={{ color: colors.onSurface }}>
        {title}
      </h3>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="block text-sm font-medium"
      style={{ color: colors.onSurfaceVariant }}
    >
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
        <h4 className="text-sm font-medium" style={{ color: colors.onSurface }}>
          {title}
        </h4>
        <p className="text-[12px] mt-1" style={{ color: colors.onSurfaceVariant }}>
          {description}
        </p>
      </div>
      <Toggle id={id} checked={checked} onChange={onChange} />
    </div>
  );
}