'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch, API_BASE } from '../../../lib/auth';
import { useBranch } from '../../../components/BranchProvider';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  hsnNumber: string;
  skuNumber: string;
  image: string;
  isActive: boolean;
};

export default function ProductsPage() {
  const { selectedBranchId, isLoadingBranches } = useBranch();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editProductId, setEditProductId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    hsnNumber: '',
    skuNumber: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!selectedBranchId) return;

    async function loadProducts() {
      setLoading(true);
      try {
        const res = await apiFetch(`/products?branchId=${selectedBranchId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setProducts(data.products);
          }
        }
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [selectedBranchId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleOpenCreateModal = () => {
    setEditProductId(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      hsnNumber: '',
      skuNumber: '',
    });
    setImageFile(null);
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditProductId(product.id);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price ? product.price.toString() : '',
      hsnNumber: product.hsnNumber || '',
      skuNumber: product.skuNumber || '',
    });
    setImageFile(null);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranchId) return;

    setSaving(true);
    setError(null);

    try {
      const endpoint = editProductId ? `/products/${editProductId}` : '/products';
      const method = editProductId ? 'PUT' : 'POST';

      const payload = new FormData();
      if (!editProductId) {
        payload.append('branchId', selectedBranchId);
      } else {
        // Always include branchId on update too just in case backend checks it
        payload.append('branchId', selectedBranchId);
      }
      
      payload.append('name', formData.name);
      if (formData.description) payload.append('description', formData.description);
      payload.append('price', formData.price);
      if (formData.hsnNumber) payload.append('hsnNumber', formData.hsnNumber);
      if (formData.skuNumber) payload.append('skuNumber', formData.skuNumber);
      
      if (imageFile) {
        payload.append('image', imageFile);
      }

      const res = await apiFetch(endpoint, {
        method,
        body: payload
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (editProductId) {
          setProducts(products.map(p => p.id === editProductId ? data.product : p));
        } else {
          setProducts([data.product, ...products]);
        }
        setIsModalOpen(false);
      } else {
        setError(data.message || 'Failed to save product');
      }
    } catch (err) {
      setError('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await apiFetch(`/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts(products.filter(p => p.id !== id));
      } else {
        alert(data.message || 'Failed to delete product');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting product');
    }
  };

  // Helper to format image URL correctly by pointing directly to the backend
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    const baseUrl = API_BASE.replace('/api/v1', '');
    const normalizedPath = imagePath.replace(/\\/g, '/');
    const path = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
    return `${baseUrl}${path}`;
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-8 z-0 relative">
        {/* Background Ambient Effects */}
        <div className="absolute top-1/4 right-1/4 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,_rgba(251,146,60,0.03)_0%,_transparent_70%)] pointer-events-none z-0 blur-[60px]"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle,_rgba(125,211,252,0.02)_0%,_transparent_70%)] pointer-events-none z-0 blur-[50px]"></div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative z-10">
          <div className="space-y-1">
            <h1 className="text-3xl font-headline font-bold tracking-tight text-on-surface">
              Products
            </h1>
            <p className="text-on-surface-variant/80 text-sm font-body">Manage inventory items and services for your branch.</p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            disabled={!selectedBranchId}
            className="glass-button-primary group flex items-center gap-2 px-5 py-2.5 rounded-lg text-primary font-semibold text-sm transition-all duration-300 shadow-[0_0_15px_rgba(125,211,252,0.1)] hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
            New Product
          </button>
        </div>

        {/* Main Content Glass Card */}
        <section className="glass-panel rounded-xl overflow-hidden mb-12 relative z-10 border border-primary/10 shadow-lg">
          {/* Table Controls */}
          <div className="p-6 border-b border-primary/10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container/30">
            <div className="flex items-center gap-3">
              <span className="text-sm text-on-surface-variant">Show</span>
              <select className="glass-input text-sm px-3 py-1.5 rounded-lg text-on-surface focus:ring-0 cursor-pointer bg-surface-container-highest">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <span className="text-sm text-on-surface-variant">entries</span>
            </div>
            <div className="relative w-full sm:w-80 group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-sm">search</span>
              <input className="glass-input w-full pl-10 pr-4 py-2 rounded-lg text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none transition-all" placeholder="Search products..." type="text" />
            </div>
          </div>

          {/* High-Fidelity Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-primary/10">
                  <th className="px-6 py-4 w-1/6">Product Details</th>
                  <th className="px-6 py-4 w-1/6">SKU</th>
                  <th className="px-6 py-4 w-1/6">HSN</th>
                  <th className="px-6 py-4 text-right w-1/6">Price</th>
                  <th className="px-6 py-4 text-center w-1/6">Status</th>
                  <th className="px-6 py-4 text-right pr-8 w-1/6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5 text-sm">
                {isLoadingBranches || loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">
                      <div className="flex justify-center items-center gap-2">
                        <span className="material-symbols-outlined animate-spin">refresh</span> Loading products...
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">
                      No products found for this branch. Create one to get started!
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="group hover:bg-surface-container-highest/50 transition-all duration-300">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-5">
                          <div className="relative w-14 h-14 rounded-2xl bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center text-on-surface-variant/40 shadow-sm overflow-hidden shrink-0 group-hover:shadow-md group-hover:border-primary/30 transition-all">
                            {product.image ? (
                              <img src={getImageUrl(product.image)!} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                              <span className="material-symbols-outlined text-[28px]">inventory_2</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[15px] font-bold text-on-surface truncate group-hover:text-primary transition-colors">{product.name}</div>
                            <div className="text-xs text-on-surface-variant/70 truncate mt-1" title={product.description}>
                              {product.description || 'No description provided'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {product.skuNumber ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-surface-container text-[12px] font-medium text-on-surface-variant border border-outline-variant/20 w-fit">
                            {product.skuNumber}
                          </span>
                        ) : (
                          <span className="text-[12px] text-on-surface-variant/40 italic">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {product.hsnNumber ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-surface-container text-[12px] font-medium text-on-surface-variant border border-outline-variant/20 w-fit">
                            {product.hsnNumber}
                          </span>
                        ) : (
                          <span className="text-[12px] text-on-surface-variant/40 italic">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-[15px] font-bold text-primary tracking-tight">₹ {product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {product.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 text-green-500 text-xs font-semibold border border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-error/10 text-error text-xs font-semibold border border-error/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-error"></span> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right pr-8">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleOpenEditModal(product)} className="glass-button-icon p-1 rounded-md transition-all cursor-pointer hover:text-primary hover:border-primary/30 hover:bg-primary/10" title="Edit">
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="glass-button-icon p-1 rounded-md transition-all hover:text-error hover:border-error/30 hover:bg-error/10 cursor-pointer" title="Delete">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 border-t border-primary/10 flex flex-col md:flex-row items-center justify-between gap-4 bg-surface-container/30">
            <span className="text-sm text-on-surface-variant/70">
              Showing <span className="text-on-surface font-semibold">{products.length > 0 ? 1 : 0}</span> to <span className="text-on-surface font-semibold">{products.length}</span> of <span className="text-on-surface font-semibold">{products.length}</span> entries
            </span>
          </div>
        </section>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border border-primary/20 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 relative overflow-hidden">
            {/* Modal Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-primary/10 rounded-full blur-[60px] pointer-events-none"></div>

            <div className="p-6 sm:px-8 sm:pt-8 sm:pb-6 border-b border-primary/10 flex justify-between items-center relative z-10">
              <div>
                <h2 className="text-2xl font-bold text-on-surface tracking-tight">{editProductId ? 'Edit Product' : 'New Product'}</h2>
                <p className="text-sm text-on-surface-variant/80 mt-1">{editProductId ? 'Update inventory item details.' : 'Add a new item to your branch inventory.'}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-error/10 text-on-surface-variant hover:text-error transition-all group cursor-pointer">
                <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform">close</span>
              </button>
            </div>
            
            <div className="p-6 sm:px-8 overflow-y-auto custom-scrollbar relative z-10">
              {error && (
                <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-xl text-sm flex items-start gap-3 animate-in slide-in-from-top-2">
                  <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
                  <p>{error}</p>
                </div>
              )}
              
              <form id="productForm" onSubmit={handleSaveProduct} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">inventory_2</span> Product Name *
                    </label>
                    <input required name="name" value={formData.name} onChange={handleInputChange} className="glass-input w-full px-4 py-3 rounded-xl text-sm border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all bg-surface-container/50 hover:bg-surface-container" placeholder="e.g. Premium Widget" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">payments</span> Selling Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm font-medium">₹</span>
                      <input required type="number" step="0.01" min="0" name="price" value={formData.price} onChange={handleInputChange} className="glass-input w-full pl-8 pr-4 py-3 rounded-xl text-sm border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all bg-surface-container/50 hover:bg-surface-container" placeholder="0.00" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">image</span> Default Product Image
                    </label>
                    {editProductId && products.find(p => p.id === editProductId)?.image && (
                      <div className="flex items-center gap-3 mb-2 p-3 rounded-xl border border-outline-variant/20 bg-surface-container-highest shadow-sm">
                        <img src={getImageUrl(products.find(p => p.id === editProductId)?.image || '')!} alt="Current" className="w-10 h-10 rounded-lg object-cover ring-1 ring-outline-variant/30" />
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-on-surface">Current Image Uploaded</span>
                          <span className="text-[11px] font-medium text-on-surface-variant/70">Uploading a new image will replace this one.</span>
                        </div>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all file:cursor-pointer cursor-pointer border border-outline-variant/30 rounded-xl bg-surface-container/50" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">qr_code_2</span> SKU Number
                    </label>
                    <input name="skuNumber" value={formData.skuNumber} onChange={handleInputChange} className="glass-input w-full px-4 py-3 rounded-xl text-sm border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all bg-surface-container/50 hover:bg-surface-container" placeholder="e.g. WDGT-001" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">account_balance</span> HSN / SAC Code
                    </label>
                    <input name="hsnNumber" value={formData.hsnNumber} onChange={handleInputChange} className="glass-input w-full px-4 py-3 rounded-xl text-sm border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all bg-surface-container/50 hover:bg-surface-container" placeholder="e.g. 84439990" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">notes</span> Description
                  </label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="glass-input w-full px-4 py-3 rounded-xl text-sm resize-none custom-scrollbar border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all bg-surface-container/50 hover:bg-surface-container" placeholder="Detailed product description..."></textarea>
                </div>
              </form>
            </div>
            
            <div className="p-6 sm:px-8 border-t border-primary/10 flex justify-end gap-4 bg-surface-container/30 relative z-10">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl glass-button text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
                Cancel
              </button>
              <button type="submit" form="productForm" disabled={saving} className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-[0_0_15px_rgba(125,211,252,0.4)] hover:shadow-[0_0_25px_rgba(125,211,252,0.6)] hover:brightness-110 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                {saving ? (
                  <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Saving...</>
                ) : (
                  <><span className="material-symbols-outlined text-[18px]">check_circle</span> Save Product</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
