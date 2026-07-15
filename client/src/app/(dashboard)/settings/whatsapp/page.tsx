'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

type TemplateKey = 'standard' | 'friendly' | 'overdue';

const INITIAL_INSTANCE_ID = 'ins_8f9a2b3c4d5e6f7g8h9i';
const INITIAL_ACCESS_TOKEN = '****************************************';

const INVOICE_TEMPLATES: Record<TemplateKey, string> = {
  standard: `Hello {customer_name},

This is a friendly message from {company_name}.
Your invoice {invoice_number} for the amount of {total_amount} is now ready.

Please find the details attached. The payment is due by {due_date}.

Thank you for your business!
Best regards,
{company_name} Team`,
  friendly: `Hi {customer_name},

Your invoice {invoice_number} from {company_name} is ready.
The amount due is {total_amount}, and the payment is due by {due_date}.

Please review the attached document and let us know if you need any help.

Thank you,
{company_name}`,
  overdue: `Hello {customer_name},

This is a reminder that invoice {invoice_number} from {company_name} is now overdue.
The outstanding amount is {total_amount}.

Kindly arrange payment at your earliest convenience. If you have already paid, please disregard this message.

Regards,
{company_name} Billing Team`,
};

const QUOTATION_TEMPLATE = `Hi {customer_name},

Thank you for requesting a quote from {company_name}.
We have prepared quote {quote_number} for {total_amount} based on your requirements.

Please review the attached document.

Regards,
{company_name}`;

const PLACEHOLDERS = [
  '{customer_name}',
  '{company_name}',
  '{invoice_number}',
  '{quote_number}',
  '{total_amount}',
  '{due_date}',
];

const QUOTATION_PLACEHOLDERS = ['{quote_number}', '{expiry_date}', '{sales_rep}'];

function Toggle({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  id: string;
}) {
  return (
    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in shrink-0">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-on-surface border-4 appearance-none cursor-pointer border-surface-container transition-transform duration-300 translate-x-0 checked:translate-x-6 checked:border-primary"
      />
      <label
        htmlFor={id}
        className="toggle-label block overflow-hidden h-6 rounded-full bg-surface-container-high cursor-pointer transition-colors duration-300 border border-outline-variant/30"
      />
    </div>
  );
}

function PlaceholderChip({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 rounded-full bg-surface-container-highest border border-primary/10 text-xs font-mono text-primary-container hover:bg-primary/20 hover:border-primary/30 transition-all shadow-sm"
    >
      {label}
    </button>
  );
}

export default function WhatsAppSettingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [instanceId] = useState(INITIAL_INSTANCE_ID);
  const [accessToken, setAccessToken] = useState(INITIAL_ACCESS_TOKEN);
  const [showToken, setShowToken] = useState(false);
  const [autoSendInvoice, setAutoSendInvoice] = useState(true);
  const [attachPdf, setAttachPdf] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>('standard');
  const [invoiceTemplate, setInvoiceTemplate] = useState(INVOICE_TEMPLATES.standard);
  const [quotationTemplate, setQuotationTemplate] = useState(QUOTATION_TEMPLATE);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  const invoiceRef = useRef<HTMLTextAreaElement | null>(null);
  const quotationRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setInvoiceTemplate(INVOICE_TEMPLATES[selectedTemplate]);
  }, [selectedTemplate]);

  useEffect(() => {
    if (!saveStatus) return;
    const timer = window.setTimeout(() => setSaveStatus('idle'), 2200);
    return () => window.clearTimeout(timer);
  }, [saveStatus]);

  const currentPreview = useMemo(() => {
    return invoiceTemplate;
  }, [invoiceTemplate]);

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('idle');
    }
  };

  const handleRegenerateCredentials = () => {
    const randomSuffix = Math.random().toString(36).slice(2, 10);
    setAccessToken(`****************************************${randomSuffix}`);
    setShowToken(false);
    setSaveStatus('saved');
  };

  const insertPlaceholder = (
    token: string,
    ref: React.RefObject<HTMLTextAreaElement | null>,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const textarea = ref.current;
    if (!textarea) {
      setter((current) => `${current}${token}`);
      return;
    }

    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    setter((current) => `${current.slice(0, start)}${token}${current.slice(end)}`);

    window.requestAnimationFrame(() => {
      const nextPos = start + token.length;
      textarea.focus();
      textarea.setSelectionRange(nextPos, nextPos);
    });
  };

  const handleResetInvoiceTemplate = () => {
    setSelectedTemplate('standard');
    setInvoiceTemplate(INVOICE_TEMPLATES.standard);
  };

  const handleSave = () => {
    setSaveStatus('saved');
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visiblePlaceholders = PLACEHOLDERS.filter((item) =>
    item.toLowerCase().includes(normalizedQuery),
  );

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-background text-on-surface overflow-x-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[520px] h-[520px] bg-tertiary/5 rounded-full blur-[120px] -z-10 pointer-events-none -translate-x-1/4 translate-y-1/4" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-6 pb-32 space-y-8">
        <div className="glass-panel rounded-3xl border border-outline-variant/30 p-4 md:p-5 flex flex-col gap-4 md:gap-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined">search</span>
              </div>
              <div className="flex-1">
                <label className="sr-only" htmlFor="settings-search">
                  Search settings
                </label>
                <input
                  id="settings-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search settings..."
                  className="w-full bg-surface-container-low rounded-full px-5 py-3 border border-primary/10 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end">
              <button
                type="button"
                className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-variant/30 transition-all duration-300 relative group"
                aria-label="Notifications"
              >
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(197,234,255,0.8)]" />
              </button>
              <button
                type="button"
                className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-variant/30 transition-all duration-300"
                aria-label="Help"
              >
                <span className="material-symbols-outlined">help_outline</span>
              </button>
              <div className="w-px h-8 bg-primary/10 mx-2 hidden md:block" />
              <button
                type="button"
                className="w-10 h-10 rounded-full overflow-hidden border border-primary/30 hover:border-primary shadow-lg shadow-primary/5 transition-all duration-300"
                aria-label="Profile"
              >
                <img
                  alt="User Profile"
                  className="w-full h-full object-cover"
                  src="/images/logo.png"
                />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
          <span className="material-symbols-outlined text-sm">settings</span>
          <span>Settings</span>
          <span className="material-symbols-outlined text-sm">
            chevron_right
          </span>
          <span className="text-primary">WhatsApp Configuration</span>
        </div>

        <div className="flex flex-col gap-2 max-w-4xl">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-on-surface">
            WhatsApp Integration
          </h1>
          <p className="text-on-surface-variant text-base md:text-lg max-w-3xl leading-relaxed">
            Configure your WhatsApp Business API credentials and manage
            automated message templates for invoices and quotations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-sm flex items-center gap-2 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            API Connected
          </span>
          {saveStatus === "saved" && (
            <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold text-sm">
              Saved locally
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="glass-panel rounded-3xl p-6 md:p-8 border border-primary/20 relative overflow-hidden shadow-[0_0_20px_rgba(125,211,252,0.08)]">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">key</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-on-surface">
                    API Credentials
                  </h2>
                  <p className="text-sm text-on-surface-variant">
                    Manage your connection tokens.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                    Instance ID
                  </label>
                  <div className="relative group">
                    <input
                      readOnly
                      value={instanceId}
                      className="w-full bg-surface-container-low/40 rounded-xl py-3 pl-4 pr-12 text-on-surface font-mono text-sm border border-primary/10 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(instanceId)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Copy"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        content_copy
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                    Access Token
                  </label>
                  <div className="relative group">
                    <input
                      readOnly
                      value={
                        showToken
                          ? accessToken
                          : "****************************************"
                      }
                      className="w-full bg-surface-container-low/40 rounded-xl py-3 pl-4 pr-12 text-on-surface font-mono text-sm text-primary border border-primary/10 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken((current) => !current)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                      title={showToken ? "Hide" : "Reveal"}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showToken ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  <p className="text-xs text-on-surface-variant/70 mt-2 flex items-start gap-1">
                    <span className="material-symbols-outlined text-[14px]">
                      info
                    </span>
                    <span>
                      Tokens should be kept secure. Never share them publicly.
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-primary/10">
                <button
                  type="button"
                  onClick={handleRegenerateCredentials}
                  className="w-full py-3 rounded-xl border border-primary/30 text-primary font-semibold text-sm hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    refresh
                  </span>
                  Regenerate Credentials
                </button>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6 md:p-8 border border-outline-variant/30">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <span className="material-symbols-outlined">
                      smartphone
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-on-surface">
                      Connection Status
                    </h2>
                    <p className="text-sm text-on-surface-variant">
                      Last sync: 2 mins ago
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-error hover:bg-error/10 p-2 rounded-xl transition-colors"
                  title="Unlink Device"
                >
                  <span className="material-symbols-outlined">link_off</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="glass-panel rounded-3xl p-6 md:p-8 border border-outline-variant/30">
              <h2 className="text-lg font-bold text-on-surface mb-6">
                Automation Preferences
              </h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low/50 border border-primary/5 hover:border-primary/20 transition-colors cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-0.5">
                      send_time_extension
                    </span>
                    <div>
                      <p className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                        Auto-send on Invoice Creation
                      </p>
                      <p className="text-sm text-on-surface-variant mt-0.5">
                        Automatically trigger WhatsApp message when a new
                        invoice is generated.
                      </p>
                    </div>
                  </div>
                  <Toggle
                    id="auto-send"
                    checked={autoSendInvoice}
                    onChange={setAutoSendInvoice}
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low/50 border border-primary/5 hover:border-primary/20 transition-colors cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-0.5">
                      picture_as_pdf
                    </span>
                    <div>
                      <p className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                        Attach PDF Document
                      </p>
                      <p className="text-sm text-on-surface-variant mt-0.5">
                        Include a generated PDF file along with the text
                        message.
                      </p>
                    </div>
                  </div>
                  <Toggle
                    id="attach-pdf"
                    checked={attachPdf}
                    onChange={setAttachPdf}
                  />
                </label>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6 md:p-8 border border-outline-variant/30 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    description
                  </span>
                  <h2 className="text-lg font-bold text-on-surface">
                    Invoice Template
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTemplate}
                    onChange={(e) =>
                      setSelectedTemplate(e.target.value as TemplateKey)
                    }
                    className="bg-surface-container-low border border-primary/20 text-on-surface text-sm rounded-xl py-2 pl-3 pr-8 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="standard">Standard Professional</option>
                    <option value="friendly">Friendly Reminder</option>
                    <option value="overdue">Overdue Notice</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleResetInvoiceTemplate}
                    className="p-2.5 rounded-xl border border-primary/20 text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Reset to Default"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      restart_alt
                    </span>
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-on-surface-variant mb-2">
                  Click to insert placeholders:
                </p>
                <div className="flex flex-wrap gap-2">
                  {visiblePlaceholders.map((placeholder) => (
                    <PlaceholderChip
                      key={placeholder}
                      label={placeholder}
                      onClick={() =>
                        insertPlaceholder(
                          placeholder,
                          invoiceRef,
                          setInvoiceTemplate,
                        )
                      }
                    />
                  ))}
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-full bg-surface-container border border-dashed border-primary/30 text-xs text-on-surface-variant hover:text-primary hover:border-primary transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      add
                    </span>
                    More
                  </button>
                </div>
              </div>

              <div className="relative flex-grow">
                <textarea
                  ref={invoiceRef}
                  value={currentPreview}
                  onChange={(e) => setInvoiceTemplate(e.target.value)}
                  className="w-full h-56 glacier-input rounded-2xl p-4 text-on-surface text-sm leading-relaxed resize-none font-mono bg-surface-container-low/40 border border-primary/10 focus:outline-none"
                  placeholder="Write your message here..."
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-surface-container-highest/80 backdrop-blur-md rounded-xl p-1 border border-primary/10">
                  <button
                    type="button"
                    className="w-7 h-7 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-variant hover:text-primary transition-colors font-bold text-sm"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    className="w-7 h-7 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-variant hover:text-primary transition-colors italic text-sm"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    className="w-7 h-7 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-variant hover:text-primary transition-colors line-through text-sm"
                  >
                    S
                  </button>
                  <div className="w-px h-4 bg-outline-variant mx-1" />
                  <button
                    type="button"
                    className="w-7 h-7 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-variant hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      mood
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-outline-variant/30 mt-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-secondary">
              request_quote
            </span>
            <h2 className="text-lg font-bold text-on-surface">
              Quotation Template
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <textarea
                ref={quotationRef}
                value={quotationTemplate}
                onChange={(e) => setQuotationTemplate(e.target.value)}
                className="w-full h-40 glacier-input rounded-2xl p-4 text-on-surface text-sm leading-relaxed resize-none font-mono bg-surface-container-low/40 border border-primary/10 focus:outline-none"
                placeholder="Write your quotation message here..."
              />
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-xs text-on-surface-variant">
                Available Placeholders:
              </p>
              <div className="flex flex-col gap-2">
                {QUOTATION_PLACEHOLDERS.map((placeholder) => (
                  <span
                    key={placeholder}
                    className="text-xs font-mono text-secondary-fixed bg-secondary-container/30 px-2 py-1 rounded border border-secondary/20"
                  >
                    {placeholder}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-outline-variant/30">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-primary">
                info
              </span>
              <span>
                Use the placeholders above to personalize WhatsApp messages for
                invoices and quotations.
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-primary/10 bg-surface-container-low/40 p-4">
                <p className="text-xs uppercase tracking-widest text-on-surface-variant font-semibold mb-2">
                  Live settings
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-on-surface-variant">
                    Invoice auto-send
                  </span>
                  <span className="font-semibold text-on-surface">
                    {autoSendInvoice ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-on-surface-variant">Attach PDF</span>
                  <span className="font-semibold text-on-surface">
                    {attachPdf ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-primary/10 bg-surface-container-low/40 p-4">
                <p className="text-xs uppercase tracking-widest text-on-surface-variant font-semibold mb-2">
                  Template preview
                </p>
                <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-4">
                  {invoiceTemplate.split("\n").slice(0, 4).join(" ")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-30 w-full border-t border-primary/10 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_-10px_30px_rgba(4,14,33,0.1)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-4 flex justify-end gap-4">
          <Link
            href="/settings"
            className="px-6 py-2.5 rounded-xl border border-primary/30 text-primary font-semibold hover:bg-primary/10 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSave}
            className="px-8 py-2.5 rounded-xl bg-primary/20 border border-primary text-primary font-semibold hover:bg-primary/30 hover:shadow-[0_0_20px_rgba(197,234,255,0.4)] transition-all flex items-center gap-2 group relative overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              save
            </span>
            Save Settings
          </button>
        </div>
      </div>

      <style jsx global>{`
        .toggle-checkbox:checked + .toggle-label {
          background-color: rgba(125, 211, 252, 0.2);
          border-color: rgba(125, 211, 252, 0.5);
        }
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
