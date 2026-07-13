"use client";

import React, { useState } from "react";

const QuotationSettings = () => {
  const [prefix, setPrefix] = useState("QUO");
  const [startNumber, setStartNumber] = useState("1");
  const [showHSN, setShowHSN] = useState(true);
  const [showSKU, setShowSKU] = useState(false);
  const [showPayment, setShowPayment] = useState(true);
  const [showName, setShowName] = useState(false);
  const [topMessage, setTopMessage] = useState("");
  const [bottomMessage, setBottomMessage] = useState("");
  const [terms, setTerms] = useState("");

  const handleSave = () => {
    console.log("Saved settings:", {
      prefix,
      startNumber,
      showHSN,
      showSKU,
      showPayment,
      showName,
      topMessage,
      bottomMessage,
      terms,
    });
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-background)] flex flex-col">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
        {/* General Configuration */}
        <SectionHeader title="GENERAL CONFIGURATION" />
        <TextInputRow
          label="Quotation Prefix"
          value={prefix}
          onChange={setPrefix}
          placeholder="Enter prefix (e.g. QUO)"
        />
        <TextInputRow
          label="Starting Number"
          value={startNumber}
          onChange={setStartNumber}
          placeholder="Enter starting number"
        />

        {/* Display Preferences */}
        <SectionHeader title="DISPLAY PREFERENCES" />
        <ToggleRow label="Show HSN Code in quotation" value={showHSN} onChange={setShowHSN} />
        <ToggleRow label="Show SKU in quotation" value={showSKU} onChange={setShowSKU} />
        <ToggleRow label="Show Payment Method in quotation" value={showPayment} onChange={setShowPayment} />
        <ToggleRow label="Display Personal Name" value={showName} onChange={setShowName} />

        {/* Messaging */}
        <SectionHeader title="MESSAGING" />
        <TextInputRow
          label="Top Message"
          value={topMessage}
          onChange={setTopMessage}
          multiline
          placeholder="Add a custom message to appear at the top..."
        />
        <TextInputRow
          label="Bottom Message"
          value={bottomMessage}
          onChange={setBottomMessage}
          multiline
          placeholder="Add a custom message to appear at the bottom..."
        />

        {/* Legal */}
        <SectionHeader title="LEGAL" />
        <TextInputRow
          label="Terms & Conditions"
          value={terms}
          onChange={setTerms}
          multiline
          placeholder="Enter terms and conditions for quotations..."
        />
      </div>

      {/* Sticky Save Button */}
      <div className="sticky bottom-0 bg-[var(--surface)] border-t border-[var(--outline)] p-3">
        <button
          className="btn-primary w-full py-2 rounded font-[var(--font-label)]"
          onClick={handleSave}
        >
          Save Configuration
        </button>
      </div>
    </div>
  );
};

export default QuotationSettings;

/* --- Reusable Components --- */

const SectionHeader = ({ title }: { title: string }) => (
  <h2 className="text-base font-semibold text-[var(--primary)] mt-4 mb-2 font-[var(--font-headline)]">
    {title}
  </h2>
);

const TextInputRow = ({
  label,
  value,
  onChange,
  multiline = false,
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) => (
  <div className="mb-2">
    <label className="block mb-1 font-[var(--font-label)] text-[var(--on-surface)] text-sm">{label}</label>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="glass-input w-full p-2 rounded input-glow font-[var(--font-body)] text-sm"
        rows={2}
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="glass-input w-full p-2 rounded input-glow font-[var(--font-body)] text-sm"
      />
    )}
  </div>
);

const ToggleRow = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (val: boolean) => void;
}) => (
  <div className="flex items-center justify-between mb-2">
    <span className="font-[var(--font-body)] text-[var(--on-surface)] text-sm">{label}</span>
    <span
      className={`material-symbols-outlined cursor-pointer ${
        value ? "text-[var(--primary)]" : "text-[var(--outline)]"
      }`}
      onClick={() => onChange(!value)}
    >
      {value ? "toggle_on" : "toggle_off"}
    </span>
  </div>
);
