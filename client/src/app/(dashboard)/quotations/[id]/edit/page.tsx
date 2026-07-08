'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch, API_BASE } from '@/lib/auth';

const getImageUrl = (url?: string) => {
  if (!url || url === 'null' || url === 'undefined') return '';
  if (url.startsWith('/uploads')) {
    const baseUrl = API_BASE.replace('/api/v1', '');
    return `${baseUrl}${url}`;
  }
  if (url.startsWith('uploads/')) {
    const baseUrl = API_BASE.replace('/api/v1', '');
    return `${baseUrl}/${url}`;
  }
  return url;
};
import { useBranch } from '@/components/BranchProvider';

export default function EditQuotationPage() {
  const router = useRouter();
  const params = useParams();
  const quotationId = params.id as string;
  const { selectedBranchId, branches } = useBranch();

  // Loading State for fetching existing quotation
  const [isLoading, setIsLoading] = useState(true);
  const [quotationNumber, setQuotationNumber] = useState('');

  // 1. Core State
  const [formData, setFormData] = useState({
    customerId: '',
    quotationDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    shippingSameAsBilling: true,
    discountConfiguration: { mode: 'FIXED', type: 'PERCENTAGE', value: 0 },
    taxConfiguration: { mode: 'FIXED', customTaxActive: false, label: '', value: 0 },
    notes: '',
    followUpDate: '',
    termsAndConditions: '1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged if payment is delayed.',
  });

  // Customer State
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState<any[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState<any>(null);

  // Address State
  const [billingAddress, setBillingAddress] = useState({ address: '', city: '', state: '', pincode: '' });
  const [shippingAddress, setShippingAddress] = useState({ address: '', city: '', state: '', pincode: '' });

  // Items State
  const [items, setItems] = useState([
    { id: Math.random().toString(), productId: '', name: '', description: '', price: 0, originalPrice: 0, originalDescription: '', quantity: 1, discount: { type: 'PERCENTAGE', value: 0 }, tax: 0, image: '', sku: '', hsnCode: '' }
  ]);
  const [productSearchRows, setProductSearchRows] = useState<{ [key: string]: { query: string, results: any[], show: boolean } }>({});

  // Attachments State
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);

  // Branch Settings
  const [branchTaxConfig, setBranchTaxConfig] = useState({ label: 'GST', tax: 0 });

  // Preview & Processing State
  const [calculatedTotals, setCalculatedTotals] = useState({ subtotal: 0, discountAmount: 0, taxAmount: 0, grandTotal: 0 });
  const [calculatedItems, setCalculatedItems] = useState<any[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Track if initial data has been loaded (to avoid overwriting with branch defaults)
  const initialLoadDone = useRef(false);

  // Fetch existing quotation data on mount
  useEffect(() => {
    if (quotationId) {
      fetchQuotation();
    }
  }, [quotationId]);

  const fetchQuotation = async () => {
    try {
      setIsLoading(true);
      const res = await apiFetch(`/quotations/${quotationId}`);
      if (!res.ok) throw new Error('Failed to fetch quotation');
      const data = await res.json();

      // Set quotation number for display
      setQuotationNumber(data.quotationNumber);

      // Map API response back to form state
      setFormData({
        customerId: data.customer?.id || '',
        quotationDate: data.quotationDate ? new Date(data.quotationDate).toISOString().split('T')[0] : '',
        expiryDate: data.expiryDate ? new Date(data.expiryDate).toISOString().split('T')[0] : '',
        shippingSameAsBilling: data.shippingSameAsBilling ?? true,
        discountConfiguration: {
          mode: data.discountConfiguration?.mode || 'FIXED',
          type: data.discountConfiguration?.type || 'PERCENTAGE',
          value: data.discountConfiguration?.value || 0,
        },
        taxConfiguration: {
          mode: data.taxConfiguration?.mode || 'FIXED',
          customTaxActive: data.taxConfiguration?.customTaxActive || false,
          label: data.taxConfiguration?.label || '',
          value: data.taxConfiguration?.value || 0,
        },
        notes: data.notes || '',
        followUpDate: data.followUpDate ? data.followUpDate.split('T')[0] : '',
        termsAndConditions: typeof data.termsAndConditions === 'object'
          ? (data.termsAndConditions?.text || data.termsAndConditions?.editedSnapshot || data.termsAndConditions?.defaultSnapshot || '')
          : (data.termsAndConditions || ''),
      });

      // Set customer
      if (data.customer) {
        setCustomerSearch(data.customer.customerName || '');
        setSelectedCustomerDetails(data.customer);
      }

      // Set addresses
      if (data.billingAddress) {
        setBillingAddress({
          address: data.billingAddress.address || '',
          city: data.billingAddress.city || '',
          state: data.billingAddress.state || '',
          pincode: data.billingAddress.pincode || '',
        });
      }
      if (data.shippingAddress && !data.shippingSameAsBilling) {
        setShippingAddress({
          address: data.shippingAddress.address || '',
          city: data.shippingAddress.city || '',
          state: data.shippingAddress.state || '',
          pincode: data.shippingAddress.pincode || '',
        });
      }

      // Set items
      if (data.items && data.items.length > 0) {
        const mappedItems = data.items.map((item: any) => ({
          id: item.id || Math.random().toString(),
          productId: item.productId || '',
          name: item.productSnapshot?.name || '',
          description: item.description || '',
          price: item.price || 0,
          originalPrice: item.productSnapshot?.price || item.price || 0,
          originalDescription: item.productSnapshot?.description || item.description || '',
          quantity: item.quantity || 1,
          discount: item.discount || { type: 'PERCENTAGE', value: 0 },
          tax: item.tax || 0,
          image: item.image || item.productSnapshot?.image || '',
          sku: item.productSnapshot?.skuNumber || '',
          hsnCode: item.productSnapshot?.hsnNumber || '',
        }));
        setItems(mappedItems);

        // Initialize product search rows with existing names
        const searchRows: any = {};
        mappedItems.forEach((item: any) => {
          searchRows[item.id] = { query: item.name, results: [], show: false };
        });
        setProductSearchRows(searchRows);
      }

      // Set existing attachments
      if (data.attachments && data.attachments.length > 0) {
        setExistingAttachments(data.attachments);
      }

      // Set calculated totals from existing data
      if (data.totals) {
        setCalculatedTotals({
          subtotal: data.totals.subtotal || 0,
          discountAmount: data.totals.discountAmount || 0,
          taxAmount: data.totals.taxAmount || 0,
          grandTotal: data.totals.grandTotal || 0,
        });
      }

      initialLoadDone.current = true;
    } catch (err: any) {
      setError(err.message || 'Failed to load quotation');
    } finally {
      setIsLoading(false);
    }
  };

  // Setup branch defaults (only if not initial load from existing data)
  useEffect(() => {
    if (selectedBranchId) {
      const branch: any = branches.find(b => b.id === selectedBranchId);
      if (branch?.taxLabel) setBranchTaxConfig({ label: branch.taxLabel, tax: branch.tax || 0 });
    }
  }, [selectedBranchId, branches]);

  useEffect(() => {
    if (!initialLoadDone.current) return; // Don't override with branch defaults during initial load
    if (selectedBranchId && branchTaxConfig.tax > 0) {
      setFormData(prev => ({
        ...prev,
        taxConfiguration: { ...prev.taxConfiguration, label: branchTaxConfig.label, value: branchTaxConfig.tax }
      }));
    }
  }, [branchTaxConfig]);

  // Preview API Trigger
  useEffect(() => {
    if (!selectedBranchId || !initialLoadDone.current) return;
    const handler = setTimeout(() => { fetchPreview(); }, 500);
    return () => clearTimeout(handler);
  }, [formData, items, selectedBranchId, branchTaxConfig]);

  const fetchPreview = async () => {
    try {
      setIsCalculating(true);

      let effectiveTaxConfig = {
        mode: formData.taxConfiguration.mode,
        label: formData.taxConfiguration.customTaxActive ? formData.taxConfiguration.label : branchTaxConfig.label,
        value: formData.taxConfiguration.customTaxActive ? formData.taxConfiguration.value : branchTaxConfig.tax
      };

      const payload = {
        branchId: selectedBranchId,
        customerId: formData.customerId || 'preview-customer-id',
        quotationDate: new Date(formData.quotationDate).toISOString(),
        billingAddress: billingAddress,
        shippingAddress: formData.shippingSameAsBilling ? billingAddress : shippingAddress,
        shippingSameAsBilling: formData.shippingSameAsBilling,
        discountConfiguration: formData.discountConfiguration,
        taxConfiguration: effectiveTaxConfig,
        items: items.map(i => ({
          productId: i.productId || undefined, price: i.price, description: i.description || '', quantity: i.quantity, discount: i.discount, tax: i.tax
        }))
      };

      const res = await apiFetch('/quotations/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setCalculatedTotals(data.summary);
        setCalculatedItems(data.items);
      }
    } catch (err) {
      console.error('Preview Calculation failed', err);
    } finally {
      setIsCalculating(false);
    }
  };

  // Customer Lookup
  useEffect(() => {
    if (!selectedCustomerDetails || customerSearch !== selectedCustomerDetails.customerName) {
      const delayFn = setTimeout(() => {
        const fetchCust = async () => {
          const res = await apiFetch(`/quotations/customers/search?q=${customerSearch}&branchId=${selectedBranchId}`);
          if (res.ok) setCustomerResults(await res.json());
        };
        fetchCust();
      }, 300);
      return () => clearTimeout(delayFn);
    }
  }, [customerSearch, selectedBranchId]);

  const handleCustomerSelect = (customer: any) => {
    setFormData({ ...formData, customerId: customer.id });
    setCustomerSearch(customer.customerName);
    setSelectedCustomerDetails(customer);
    setBillingAddress({ address: customer.address || '', city: '', state: '', pincode: '' });
    setShowCustomerDropdown(false);
  };

  // Product Lookup
  const handleProductSearch = async (query: string, rowId: string) => {
    setProductSearchRows(prev => ({ ...prev, [rowId]: { ...prev[rowId], query, show: true } }));
    const res = await apiFetch(`/quotations/products/search?q=${query}&branchId=${selectedBranchId}`);
    if (res.ok) {
      const results = await res.json();
      setProductSearchRows(prev => ({ ...prev, [rowId]: { ...prev[rowId], results } }));
    }
  };

  const handleProductSelect = (product: any, rowId: string) => {
    setItems(items.map(i => i.id === rowId ? {
      ...i, productId: product.id, name: product.name, description: product.description, price: product.price,
      originalPrice: product.price, originalDescription: product.description, image: product.image || '',
      sku: product.sku || '', hsnCode: product.hsnCode || ''
    } : i));
    setProductSearchRows(prev => ({ ...prev, [rowId]: { ...prev[rowId], show: false, query: product.name } }));
  };

  const updateItem = (id: string, field: string, value: any) => setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  const addItem = () => setItems([...items, { id: Math.random().toString(), productId: '', name: '', description: '', price: 0, originalPrice: 0, originalDescription: '', quantity: 1, discount: { type: 'PERCENTAGE', value: 0 }, tax: 0, image: '', sku: '', hsnCode: '' }]);
  const removeItem = (id: string) => { if (items.length > 1) setItems(items.filter(i => i.id !== id)); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(f => ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'].includes(f.type));
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const handleSave = async () => {
    if (!formData.customerId || items.length === 0) {
      setError('Please select a customer and add at least one item.');
      return;
    }
    try {
      setIsSaving(true); setError('');

      const payload = {
        branchId: selectedBranchId,
        customerId: formData.customerId,
        quotationDate: new Date(formData.quotationDate).toISOString(),
        expiryDate: new Date(formData.expiryDate).toISOString(),
        billingAddress,
        shippingAddress: formData.shippingSameAsBilling ? billingAddress : shippingAddress,
        shippingSameAsBilling: formData.shippingSameAsBilling,
        discountConfiguration: formData.discountConfiguration,
        taxConfiguration: formData.taxConfiguration,
        notes: formData.notes,
        followUpDate: formData.followUpDate ? new Date(formData.followUpDate).toISOString() : undefined,
        termsAndConditions: { text: formData.termsAndConditions },
        items: items.map(i => ({ productId: i.productId || undefined, price: i.price, description: i.description, quantity: i.quantity, discount: i.discount, tax: i.tax }))
      };

      const res = await apiFetch(`/quotations/${quotationId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update quotation');

      // Upload any new attachments
      for (const file of attachments) {
        const formData = new FormData();
        formData.append('file', file);
        await apiFetch(`/quotations/${quotationId}/attachments`, { method: 'POST', body: formData, headers: {} });
      }

      router.push('/quotations');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-8 z-0 relative custom-scrollbar bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <span className="material-symbols-outlined animate-spin text-primary text-[40px]">refresh</span>
            <p className="text-on-surface-variant font-semibold">Loading quotation...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 z-0 relative custom-scrollbar bg-background">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <button onClick={() => router.back()} className="text-on-surface-variant hover:text-primary flex items-center gap-1 text-sm font-semibold transition-colors mb-2">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to List
          </button>
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">edit_document</span>
            </div>
            Edit Quotation
          </h1>
          {quotationNumber && (
            <span className="text-sm font-semibold text-primary mt-1 inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">tag</span> {quotationNumber}
            </span>
          )}
        </div>
        <button onClick={handleSave} disabled={isSaving || !selectedBranchId} className="glass-button-primary rounded-lg py-2.5 px-6 flex items-center gap-2 text-sm font-semibold transition-all shadow-[0_0_15px_rgba(125,211,252,0.1)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
          {isSaving ? <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span> : <span className="material-symbols-outlined text-[18px]">save</span>}
          Update Quotation
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 flex items-start gap-3">
          <span className="material-symbols-outlined text-error mt-0.5">error</span>
          <p className="text-sm text-error font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10">
        <div className="col-span-2 space-y-6">

          {/* Customer & Address Section */}
          <div className="glass-panel rounded-xl p-6 shadow-md border border-primary/10 overflow-visible relative">
            <h2 className="text-lg font-bold text-on-surface mb-4 border-b border-primary/10 pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person</span> Customer Information
            </h2>

            <div className="mb-6 relative">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Search Customer *</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">search</span>
                <input 
                  type="text" 
                  value={customerSearch} 
                  onChange={(e) => { setCustomerSearch(e.target.value); if (e.target.value === '') setSelectedCustomerDetails(null); }} 
                  onFocus={() => setShowCustomerDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                  className="glass-input pl-10 pr-4 py-2.5 rounded-lg text-sm text-on-surface w-full focus:ring-primary/50 font-semibold" 
                  placeholder="Type to search..." 
                />
                {showCustomerDropdown && customerResults.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-surface/95 backdrop-blur-xl shadow-2xl rounded-xl border border-outline-variant/30 z-[100] max-h-60 overflow-y-auto overflow-x-hidden flex flex-col p-1">
                    {customerResults.map(c => (
                      <div key={c.id} onMouseDown={(e) => { e.preventDefault(); handleCustomerSelect(c); }} className="px-3 py-2.5 hover:bg-primary/5 rounded-lg cursor-pointer transition-all duration-200 group flex items-center gap-3 border-b border-outline-variant/10 last:border-0">
                        <div className="text-primary/70 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[20px]">person</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">{c.customerName}</span>
                          <span className="text-[11px] text-on-surface-variant">
                            {[c.companyName, c.email, c.mobileNumber].filter(Boolean).join(' • ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {selectedCustomerDetails && (
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-lg bg-surface-container/30 border border-outline-variant/20">
                <div>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant">Email</span>
                  <div className="text-sm text-on-surface font-semibold">{selectedCustomerDetails.email || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant">Phone</span>
                  <div className="text-sm text-on-surface font-semibold">{selectedCustomerDetails.mobileNumber || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant">Company Name</span>
                  <div className="text-sm text-on-surface font-semibold">{selectedCustomerDetails.companyName || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant">{selectedCustomerDetails.businessLabel || 'Business Label'}</span>
                  <div className="text-sm text-on-surface font-semibold">{selectedCustomerDetails.businessLabelValue || 'N/A'}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant">Billing Address (Read Only)</span>
                  <div className="text-sm text-on-surface">{billingAddress.address || 'N/A'}</div>
                </div>
              </div>
            )}

            <div className="border-t border-primary/10 pt-4">
              <label className="flex items-center gap-2 cursor-pointer mb-4">
                <input type="checkbox" checked={formData.shippingSameAsBilling} onChange={(e) => setFormData({ ...formData, shippingSameAsBilling: e.target.checked })} className="rounded text-primary focus:ring-primary/50 bg-surface-container" />
                <span className="text-sm font-semibold text-on-surface">Shipping address is same as billing address</span>
              </label>

              {!formData.shippingSameAsBilling && (
                <div className="p-4 rounded-lg bg-surface-container/30 border border-outline-variant/20 space-y-3">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Manual Shipping Address</label>
                  <textarea value={shippingAddress.address} onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })} className="glass-input w-full p-3 rounded-lg text-sm text-on-surface" placeholder="Enter complete shipping address..." rows={3}></textarea>
                </div>
              )}
            </div>
          </div>

          {/* Master Configurations */}
          <div className="glass-panel rounded-xl p-6 shadow-md border border-primary/10">
            <h2 className="text-lg font-bold text-on-surface mb-4 border-b border-primary/10 pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">settings</span> Discount & Tax Rules
            </h2>
            <div className="grid grid-cols-2 gap-10">
              {/* Discount Rules */}
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">Discount Method</h3>
                <div className="flex gap-6 mb-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="discMode" checked={formData.discountConfiguration.mode === 'FIXED'} onChange={() => setFormData({ ...formData, discountConfiguration: { ...formData.discountConfiguration, mode: 'FIXED' } })} className="text-primary w-4 h-4" />
                    <span className="text-sm font-semibold text-on-surface">Fixed for all</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="discMode" checked={formData.discountConfiguration.mode === 'PER_PRODUCT'} onChange={() => setFormData({ ...formData, discountConfiguration: { ...formData.discountConfiguration, mode: 'PER_PRODUCT' } })} className="text-primary w-4 h-4" />
                    <span className="text-sm font-semibold text-on-surface">Per Product</span>
                  </label>
                </div>
                
                <div className="h-[70px]">
                  {formData.discountConfiguration.mode === 'FIXED' && (
                    <div className="flex">
                      <input type="number" value={formData.discountConfiguration.value} onChange={(e) => setFormData({ ...formData, discountConfiguration: { ...formData.discountConfiguration, value: parseFloat(e.target.value) || 0 } })} className="glass-input px-4 py-2.5 rounded-l-lg w-full text-sm font-semibold border-r-0 focus:ring-0 focus:border-primary/50" placeholder="Amount" />
                      <select value={formData.discountConfiguration.type} onChange={(e: any) => setFormData({ ...formData, discountConfiguration: { ...formData.discountConfiguration, type: e.target.value } })} className="glass-input px-3 py-2.5 rounded-r-lg text-sm font-bold bg-surface-container cursor-pointer focus:ring-0 focus:border-primary/50">
                        <option value="PERCENTAGE">%</option>
                        <option value="AMOUNT">₹</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Tax Rules */}
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">Tax Method</h3>
                <div className="flex gap-6 mb-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="taxMode" checked={formData.taxConfiguration.mode === 'FIXED'} onChange={() => setFormData({ ...formData, taxConfiguration: { ...formData.taxConfiguration, mode: 'FIXED' } })} className="text-primary w-4 h-4" />
                    <span className="text-sm font-semibold text-on-surface">Fixed for all</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="taxMode" checked={formData.taxConfiguration.mode === 'PER_PRODUCT'} onChange={() => setFormData({ ...formData, taxConfiguration: { ...formData.taxConfiguration, mode: 'PER_PRODUCT' } })} className="text-primary w-4 h-4" />
                    <span className="text-sm font-semibold text-on-surface">Per Product</span>
                  </label>
                </div>
                
                <div className="h-[70px]">
                  {formData.taxConfiguration.mode === 'FIXED' && (
                    <div className="flex flex-col gap-2 relative">
                      {formData.taxConfiguration.customTaxActive ? (
                        <div className="flex items-center gap-2">
                          <input type="text" placeholder="Custom Tax Name" value={formData.taxConfiguration.label} onChange={(e) => setFormData({ ...formData, taxConfiguration: { ...formData.taxConfiguration, label: e.target.value } })} className="glass-input px-4 py-2.5 rounded-lg w-full text-sm font-semibold focus:ring-0 focus:border-primary/50" />
                          <div className="relative w-32">
                            <input type="number" placeholder="0" value={formData.taxConfiguration.value} onChange={(e) => setFormData({ ...formData, taxConfiguration: { ...formData.taxConfiguration, value: parseFloat(e.target.value) || 0 } })} className="glass-input pl-4 pr-8 py-2.5 rounded-lg w-full text-sm font-semibold focus:ring-0 focus:border-primary/50 text-right" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-on-surface-variant">%</span>
                          </div>
                        </div>
                      ) : (
                        <select className="glass-input px-4 py-2.5 rounded-lg w-full text-sm font-semibold cursor-pointer focus:ring-0 focus:border-primary/50 appearance-none bg-surface-container/30">
                          <option value={branchTaxConfig.tax}>{branchTaxConfig.label} ({branchTaxConfig.tax}%)</option>
                        </select>
                      )}
                      
                      <label className="absolute -top-7 right-0 flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={formData.taxConfiguration.customTaxActive} onChange={(e) => setFormData({ ...formData, taxConfiguration: { ...formData.taxConfiguration, customTaxActive: e.target.checked } })} className="rounded text-primary w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold text-on-surface-variant uppercase">Custom</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="glass-panel rounded-xl shadow-md border border-primary/10 overflow-hidden relative overflow-visible">
            <h2 className="text-lg font-bold text-on-surface m-6 mb-2 border-b border-primary/10 pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">inventory_2</span> Quotation Items
            </h2>
            <div className="p-6 pt-2 flex flex-col gap-4">
              {items.map((item, index) => {
                const calcItem = calculatedItems[index];
                return (
                  <div key={item.id} className="relative group bg-surface-container/20 border border-outline-variant/10 rounded-xl p-4 md:p-5 hover:bg-surface-container/40 transition-colors shadow-sm">
                    {/* Delete Button */}
                    <button onClick={() => removeItem(item.id)} className="absolute top-2 right-2 text-error hover:bg-error/10 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10" title="Remove Item">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>

                    <div className="flex flex-col md:flex-row gap-5">
                      {/* Left: Image Box */}
                      <div className="relative group/img w-20 h-20 md:w-24 md:h-24 rounded-lg border border-outline-variant/30 bg-surface-container overflow-hidden shrink-0 shadow-sm mx-auto md:mx-0 mt-2">
                        {/* Placeholder (Always in background) */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 z-0">
                          <span className="material-symbols-outlined text-primary/40 text-3xl mb-1">inventory_2</span>
                          <span className="text-[9px] font-bold text-primary/50 uppercase tracking-widest">No Image</span>
                        </div>
                        
                        {/* Image (Renders on top if available) */}
                        {item.image && item.image !== 'null' && item.image !== 'undefined' && (
                          <img src={getImageUrl(item.image)} alt="Product" className="absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-300" onError={(e) => { e.currentTarget.style.opacity = '0'; }} />
                        )}

                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm z-20">
                          <span className="material-symbols-outlined text-white text-[24px]">upload</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => updateItem(item.id, 'image', reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }} />
                        </label>
                      </div>

                      {/* Right: Grid of Inputs */}
                      <div className="flex-1 flex flex-col gap-4">
                        {/* Row 1: Search, Qty, Price */}
                        <div className="grid grid-cols-12 gap-3 md:gap-4 items-start">
                          <div className="col-span-12 md:col-span-6 relative">
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Product Search</label>
                            <input 
                              type="text" 
                              value={productSearchRows[item.id]?.query ?? item.name} 
                              onChange={(e) => handleProductSearch(e.target.value, item.id)} 
                              onFocus={() => handleProductSearch(productSearchRows[item.id]?.query ?? item.name, item.id)}
                              onBlur={() => setTimeout(() => setProductSearchRows(prev => ({ ...prev, [item.id]: { ...prev[item.id], show: false } })), 200)}
                              className="glass-input px-3 py-2 rounded-lg text-sm w-full font-bold text-primary" 
                              placeholder="Type to search..." 
                            />
                            {productSearchRows[item.id]?.show && (productSearchRows[item.id]?.results?.length || 0) > 0 && (
                              <div className="absolute top-full left-0 w-full mt-2 bg-surface/95 backdrop-blur-xl shadow-2xl rounded-xl border border-outline-variant/30 z-[100] max-h-60 overflow-y-auto overflow-x-hidden p-1">
                                {productSearchRows[item.id].results.map(p => (
                                  <div key={p.id} onMouseDown={(e) => { e.preventDefault(); handleProductSelect(p, item.id); }} className="px-3 py-2.5 hover:bg-primary/5 rounded-lg cursor-pointer transition-all duration-200 group flex justify-between items-center border-b border-outline-variant/10 last:border-0">
                                    <div className="flex items-center gap-3">
                                      <div className="text-primary/70 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                                      </div>
                                      <div className="flex flex-col gap-0.5">
                                        <span className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">{p.name}</span>
                                        {(p.sku || p.hsnCode) && (
                                          <span className="text-[11px] text-on-surface-variant">
                                            {[p.sku && `SKU: ${p.sku}`, p.hsnCode && `HSN: ${p.hsnCode}`].filter(Boolean).join(' • ')}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded">₹{p.price}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {(item.sku || item.hsnCode) && (
                              <div className="flex gap-2 mt-2">
                                {item.sku && <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container/80 border border-outline-variant/20 px-2 py-0.5 rounded uppercase tracking-widest shadow-sm">SKU: {item.sku}</span>}
                                {item.hsnCode && <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container/80 border border-outline-variant/20 px-2 py-0.5 rounded uppercase tracking-widest shadow-sm">HSN: {item.hsnCode}</span>}
                              </div>
                            )}
                          </div>
                          <div className="col-span-4 md:col-span-2">
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Qty</label>
                            <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)} className="glass-input px-3 py-2 rounded-lg text-sm w-full text-center font-semibold" />
                          </div>
                          <div className="col-span-8 md:col-span-4">
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Unit Price (₹)</label>
                            <input type="number" step="0.01" value={item.price} onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)} className="glass-input px-3 py-2 rounded-lg text-sm w-full text-right font-bold text-on-surface" />
                            {item.productId && item.price !== item.originalPrice && (
                              <div className="text-[10px] text-on-surface-variant/50 italic mt-1 text-right line-through">₹{item.originalPrice}</div>
                            )}
                          </div>
                        </div>

                        {/* Row 2: Description, Discount, Tax, Total */}
                        <div className="grid grid-cols-12 gap-3 md:gap-4 items-end">
                          <div className={`col-span-12 ${
                            (formData.discountConfiguration.mode === 'PER_PRODUCT' && formData.taxConfiguration.mode === 'PER_PRODUCT') ? 'md:col-span-4' :
                            (formData.discountConfiguration.mode === 'PER_PRODUCT' ? 'md:col-span-6' :
                            (formData.taxConfiguration.mode === 'PER_PRODUCT' ? 'md:col-span-7' : 'md:col-span-9'))
                          }`}>
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Description</label>
                            <input type="text" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="glass-input px-3 py-2 rounded-lg text-sm w-full text-on-surface" placeholder="Line item details..." />
                            {item.productId && item.description !== item.originalDescription && (
                              <div className="text-[10px] text-on-surface-variant/50 italic mt-1 truncate max-w-full">Orig: {item.originalDescription}</div>
                            )}
                          </div>

                          {formData.discountConfiguration.mode === 'PER_PRODUCT' && (
                            <div className="col-span-6 md:col-span-3">
                              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Discount</label>
                              <div className="flex items-center gap-1">
                                <input type="number" value={item.discount?.value || 0} onChange={(e) => updateItem(item.id, 'discount', { ...item.discount, value: parseFloat(e.target.value) || 0 })} className="glass-input px-3 py-2 rounded-lg text-sm w-full font-semibold" />
                                <select value={item.discount?.type || 'PERCENTAGE'} onChange={(e) => updateItem(item.id, 'discount', { ...item.discount, type: e.target.value })} className="glass-input p-2 rounded-lg text-xs font-bold bg-surface-container cursor-pointer">
                                  <option value="PERCENTAGE">%</option>
                                  <option value="AMOUNT">₹</option>
                                </select>
                              </div>
                            </div>
                          )}

                          {formData.taxConfiguration.mode === 'PER_PRODUCT' && (
                            <div className="col-span-6 md:col-span-2">
                              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Tax %</label>
                              <div className="relative">
                                <input type="number" step="0.1" value={item.tax} onChange={(e) => updateItem(item.id, 'tax', parseFloat(e.target.value) || 0)} className="glass-input pl-3 pr-7 py-2 rounded-lg text-sm w-full text-center font-semibold" placeholder="0" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant">%</span>
                              </div>
                            </div>
                          )}

                          <div className="col-span-12 md:col-span-3 text-right mt-4 md:mt-0 flex flex-col justify-end">
                            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mb-1">Item Total (Preview)</span>
                            <div className="text-xl font-bold text-primary relative inline-block self-end">
                              {isCalculating && <span className="absolute -left-4 top-1/2 -translate-y-1/2 flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span></span>}
                              ₹ {calcItem?.total?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button onClick={addItem} className="mt-2 text-sm font-bold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 border-dashed py-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
                <span className="material-symbols-outlined text-[20px]">add_circle</span> Add Another Item
              </button>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="glass-panel rounded-xl p-6 shadow-md border border-primary/10">
            <h2 className="text-lg font-bold text-on-surface mb-4 border-b border-primary/10 pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">description</span> Terms & Conditions
            </h2>
            <textarea value={formData.termsAndConditions} onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })} className="glass-input w-full p-4 rounded-xl text-sm text-on-surface font-medium leading-relaxed" rows={4} placeholder="Enter quotation-specific terms here..."></textarea>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="glass-panel rounded-xl p-6 shadow-md border border-primary/10">
            <h3 className="text-sm font-bold text-on-surface mb-4 uppercase tracking-wide">Quotation Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center text-on-surface-variant">
                <span>Subtotal</span>
                <span className="font-semibold text-on-surface">₹ {calculatedTotals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-on-surface-variant">
                <span>Total Discount</span>
                <span className="font-semibold text-error">- ₹ {calculatedTotals.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-on-surface-variant">
                <span>Total Tax</span>
                <span className="font-semibold text-on-surface">₹ {calculatedTotals.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="pt-4 mt-2 border-t border-primary/10 flex justify-between items-center">
                <span className="font-bold text-on-surface text-base">Grand Total</span>
                <div className="flex items-center gap-2">
                  {isCalculating && <span className="material-symbols-outlined animate-spin text-primary text-[16px]">refresh</span>}
                  <span className="font-bold text-primary text-xl tracking-tight">₹ {calculatedTotals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="glass-panel rounded-xl p-6 shadow-md border border-primary/10">
            <h3 className="text-sm font-bold text-on-surface mb-4 uppercase tracking-wide">Timeline</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Quotation Date</label>
                <input type="date" value={formData.quotationDate} onChange={(e) => setFormData({ ...formData, quotationDate: e.target.value })} className="glass-input px-4 py-2.5 rounded-lg text-sm text-on-surface w-full font-semibold" />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Expiry Date (+2 Months)</label>
                <input type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} className="glass-input px-4 py-2.5 rounded-lg text-sm text-error w-full font-semibold" />
              </div>
            </div>
          </div>

          {/* Existing Attachments */}
          {existingAttachments.length > 0 && (
            <div className="glass-panel rounded-xl p-6 shadow-md border border-primary/10">
              <h3 className="text-sm font-bold text-on-surface mb-4 uppercase tracking-wide">Existing Attachments</h3>
              <div className="space-y-2">
                {existingAttachments.map((att: any) => (
                  <div key={att.id} className="flex justify-between items-center p-3 rounded-lg bg-surface-container/50 border border-outline-variant/10">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">attach_file</span>
                      <span className="text-xs text-on-surface font-semibold truncate max-w-[180px]">{att.fileName}</span>
                    </div>
                    <span className="text-[10px] text-on-surface-variant">{(att.fileSize / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments Dropzone */}
          <div className="glass-panel rounded-xl p-6 shadow-md border border-primary/10">
            <h3 className="text-sm font-bold text-on-surface mb-4 uppercase tracking-wide">Add Attachments</h3>
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-6 text-center hover:bg-primary/5 transition-colors relative group cursor-pointer">
              <input type="file" multiple accept=".pdf,.xlsx,.docx,.png,.jpg,.jpeg,.ppt,.pptx" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <span className="material-symbols-outlined text-primary text-[32px] mb-2 group-hover:scale-110 transition-transform">cloud_upload</span>
              <p className="text-sm font-bold text-on-surface">Click or drag files to attach</p>
              <p className="text-xs text-on-surface-variant mt-1">PDF, Excel, Word, PPT, Images</p>
            </div>

            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachments.map((file, i) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded-md bg-surface-container/50 border border-outline-variant/10">
                    <span className="text-xs text-on-surface font-semibold truncate max-w-[200px]">{file.name}</span>
                    <button onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} className="text-on-surface-variant hover:text-error">
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes & Reminder */}
          <div className="glass-panel rounded-xl p-6 shadow-md border border-primary/10">
            <h3 className="text-sm font-bold text-on-surface mb-4 uppercase tracking-wide">Notes & Reminder</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="glass-input w-full p-3 rounded-lg text-sm text-on-surface" placeholder="Internal notes..." rows={2}></textarea>
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Follow Up Date</label>
                <input type="date" value={formData.followUpDate} onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })} className="glass-input px-4 py-2.5 rounded-lg text-sm text-on-surface w-full font-semibold" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
