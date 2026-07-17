'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

type SortDirection = 'asc' | 'desc';
interface SortConfig {
  key: string;
  direction: SortDirection;
}

export default function ProductsPage() {
  const { selectedBranchId, isLoadingBranches } = useBranch();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    hsnNumber: '',
    skuNumber: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // ---- Table controls: search, sorting, pagination ----
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const stats = React.useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.isActive).length;
    const inactive = total - active;
    const avgPrice = total > 0 ? products.reduce((sum, p) => sum + (p.price || 0), 0) / total : 0;
    return { total, active, inactive, avgPrice };
  }, [products]);

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

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      setIsDeleting(true);
      const res = await apiFetch(`/products/${productToDelete}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts(products.filter(p => p.id !== productToDelete));
        setProductToDelete(null);
      } else {
        alert(data.message || 'Failed to delete product');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting product');
    } finally {
      setIsDeleting(false);
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

  // ---- Search ----
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const query = searchQuery.toLowerCase();
    return products.filter((p) => {
      const nameMatch = p.name?.toLowerCase().includes(query);
      const skuMatch = p.skuNumber?.toLowerCase().includes(query);
      const hsnMatch = p.hsnNumber?.toLowerCase().includes(query);
      const priceMatch = p.price?.toString().includes(query);
      return nameMatch || skuMatch || hsnMatch || priceMatch;
    });
  }, [products, searchQuery]);

  // ---- Sorting ----
  const handleSort = useCallback((key: string) => {
    setCurrentPage(1);
    setSortConfig((prev) => {
      if (prev?.key === key && prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return { key, direction: 'asc' };
    });
  }, []);

  const sortValue = (row: Product, key: string): string | number => {
    switch (key) {
      case 'name': return row.name || '';
      case 'sku': return row.skuNumber || '';
      case 'hsn': return row.hsnNumber || '';
      case 'price': return row.price || 0;
      case 'status': return row.isActive ? 1 : 0;
      default: return '';
    }
  };

  const sortedProducts = useMemo(() => {
    if (!sortConfig) return filteredProducts;
    return [...filteredProducts].sort((a, b) => {
      const aVal = sortValue(a, sortConfig.key);
      const bVal = sortValue(b, sortConfig.key);
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortConfig.direction === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredProducts, sortConfig]);

  // ---- Pagination ----
  const totalCount = sortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / entriesPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const startIndex = totalCount === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1;
  const endIndex = Math.min(currentPage * entriesPerPage, totalCount);

  const paginatedProducts = useMemo(() => {
    return sortedProducts.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);
  }, [sortedProducts, currentPage, entriesPerPage]);

  const handleEntriesPerPageChange = (n: number) => {
    setEntriesPerPage(n);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const renderSortableHeader = (label: string, key: string, align: 'left' | 'right' | 'center' = 'left') => {
    const isActive = sortConfig?.key === key;
    const icon = !isActive ? 'unfold_more' : sortConfig!.direction === 'asc' ? 'expand_less' : 'expand_more';
    const ariaSort = isActive ? (sortConfig!.direction === 'asc' ? 'ascending' : 'descending') : 'none';
    
    let justify = 'justify-start';
    if (align === 'right') justify = 'justify-end';
    if (align === 'center') justify = 'justify-center';

    return (
      <th
        className={`px-6 py-4 font-semibold tracking-wider cursor-pointer hover:text-primary transition-colors group select-none ${isActive ? 'text-primary' : ''} ${align === 'right' ? 'text-right pr-6' : align === 'center' ? 'text-center' : 'text-left'}`}
        scope="col"
        role="columnheader"
        aria-sort={ariaSort as React.AriaAttributes['aria-sort']}
        onClick={() => handleSort(key)}
      >
        <div className={`flex items-center gap-1 ${justify}`}>
          {label}
          <span className={`material-symbols-outlined text-[12px] transition-opacity ${isActive ? 'opacity-100 text-primary' : 'opacity-50 group-hover:opacity-100'}`}>
            {icon}
          </span>
        </div>
      </th>
    );
  };

  return (
    <div
      className="flex-1 overflow-y-auto p-4 md:p-8 z-0 relative overflow-x-hidden selection:bg-primary/30 [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
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
              <span className="material-symbols-outlined text-[14px]">inventory_2</span>
              Products Management
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight font-display mb-4">
              <span className="bg-gradient-to-br from-primary via-secondary to-tertiary bg-clip-text text-transparent">
                Products
              </span>
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              Manage inventory items and services for your branch. Add new products, update prices, and track statuses.
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            disabled={!selectedBranchId}
            className="group relative h-14 px-8 rounded-2xl bg-primary text-on-primary font-bold flex items-center gap-3 overflow-hidden shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 w-full h-full bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
            <span className="material-symbols-outlined">add</span>
            <span>New Product</span>
          </button>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 flex items-start gap-3 relative z-10 animate-fade-slide-up">
            <span className="material-symbols-outlined text-error mt-0.5">error</span>
            <p className="text-sm text-error font-medium">{error}</p>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:border-primary/40 hover:shadow-[0_20px_40px_-15px_rgba(125,211,252,0.15)] hover:-translate-y-1 transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <p className="text-on-surface-variant text-sm font-medium uppercase tracking-wider">Total Products</p>
              <span className="material-symbols-outlined text-primary p-2 rounded-lg bg-primary/10">inventory_2</span>
            </div>
            <p className="text-3xl font-bold text-on-surface tracking-tight relative z-10">{stats.total}</p>
            <p className="mt-2 text-sm text-on-surface-variant/60 relative z-10">for this branch</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:border-emerald-500/40 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors duration-500"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <p className="text-on-surface-variant text-sm font-medium uppercase tracking-wider">Active</p>
              <span className="material-symbols-outlined text-emerald-500 p-2 rounded-lg bg-emerald-500/10">task_alt</span>
            </div>
            <p className="text-3xl font-bold text-on-surface tracking-tight relative z-10">{stats.active}</p>
            <p className="mt-2 text-sm text-on-surface-variant/60 relative z-10">
              {stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}% of catalog` : 'no data yet'}
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:border-error/40 hover:shadow-[0_20px_40px_-15px_rgba(239,68,68,0.15)] hover:-translate-y-1 transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-error/5 rounded-full blur-2xl group-hover:bg-error/10 transition-colors duration-500"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <p className="text-on-surface-variant text-sm font-medium uppercase tracking-wider">Inactive</p>
              <span className="material-symbols-outlined text-error p-2 rounded-lg bg-error/10">block</span>
            </div>
            <p className="text-3xl font-bold text-on-surface tracking-tight relative z-10">{stats.inactive}</p>
            <p className="mt-2 text-sm text-on-surface-variant/60 relative z-10">not currently sellable</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:border-secondary/40 hover:shadow-[0_20px_40px_-15px_rgba(125,211,252,0.15)] hover:-translate-y-1 transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-colors duration-500"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <p className="text-on-surface-variant text-sm font-medium uppercase tracking-wider">Average Price</p>
              <span className="material-symbols-outlined text-secondary p-2 rounded-lg bg-secondary/10">payments</span>
            </div>
            <p className="text-3xl font-bold text-on-surface tracking-tight relative z-10">
              ₹ {stats.avgPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
            <p className="mt-2 text-sm text-on-surface-variant/60 relative z-10">across all products</p>
          </div>
        </div>

        {/* Glassmorphic Data Table Container */}
        <div className="glass-panel rounded-3xl overflow-hidden relative z-10 animate-fade-slide-up shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)]" style={{ animationDelay: '0.3s' }}>
          {/* Glow Accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
          
          {/* Table Controls */}
          <div className="p-6 border-b border-outline-variant/20 flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container-lowest">
            <div className="flex items-center gap-3 text-sm font-medium text-on-surface-variant">
              <span>Show</span>
              <div className="relative">
                <select
                  value={entriesPerPage}
                  onChange={(e) => handleEntriesPerPageChange(Number(e.target.value))}
                  className="bg-surface-container border border-outline-variant/30 rounded-xl py-2 pl-4 pr-10 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 text-sm cursor-pointer appearance-none hover:bg-surface-container-high transition-colors font-semibold"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">expand_more</span>
              </div>
              <span>entries</span>
            </div>
            <div className="relative w-full sm:w-auto">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input 
                className="w-full sm:w-80 bg-surface-container border border-outline-variant/30 pl-11 pr-4 py-2.5 rounded-xl text-sm font-medium text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:bg-surface focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all" 
                placeholder="Search products..." 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* High-Fidelity Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-left text-sm whitespace-nowrap border-separate border-spacing-0">
              <thead className="text-xs text-on-surface-variant uppercase bg-surface-container-low/50 border-b border-primary/10">
                <tr>
                  {renderSortableHeader('Product Details', 'name', 'left')}
                  {renderSortableHeader('SKU', 'sku', 'left')}
                  {renderSortableHeader('HSN', 'hsn', 'left')}
                  {renderSortableHeader('Price', 'price', 'right')}
                  {renderSortableHeader('Status', 'status', 'center')}
                  <th className="px-6 py-4 font-semibold tracking-wider text-right pr-8" scope="col">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {isLoadingBranches || loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">
                      <div className="flex justify-center items-center gap-2">
                        <span className="material-symbols-outlined animate-spin">refresh</span> Loading products...
                      </div>
                    </td>
                  </tr>
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-24 text-center">
                      <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-5xl text-on-surface-variant opacity-60">inventory_2</span>
                      </div>
                      <h3 className="text-2xl text-on-surface font-bold mb-3">{searchQuery ? 'No matching products found' : 'No products yet'}</h3>
                      <p className="text-on-surface-variant max-w-md mx-auto text-lg">{searchQuery ? 'Try adjusting your search filters.' : 'Create your first product for this branch.'}</p>
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-primary/5 transition-colors duration-200 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-2xl bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center text-on-surface-variant/40 shadow-sm overflow-hidden shrink-0 group-hover:border-primary/30 transition-all">
                            {product.image ? (
                              <img src={getImageUrl(product.image)!} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                              <span className="material-symbols-outlined text-[24px]">inventory_2</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[15px] font-semibold text-on-surface truncate group-hover:text-primary transition-colors">{product.name}</div>
                            <div className="text-xs text-on-surface-variant/70 truncate mt-0.5" title={product.description}>
                              {product.description || 'No description provided'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {product.skuNumber ? (
                          <span className="text-on-surface font-medium">
                            {product.skuNumber}
                          </span>
                        ) : (
                          <span className="text-on-surface-variant/40 italic">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {product.hsnNumber ? (
                          <span className="text-on-surface font-medium">
                            {product.hsnNumber}
                          </span>
                        ) : (
                          <span className="text-on-surface-variant/40 italic">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right pr-6">
                        <div className="font-bold text-on-surface">₹ {product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {product.isActive ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border bg-emerald-400/10 text-emerald-400 border-emerald-400/20">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border bg-red-500/10 text-red-500 border-red-500/20">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right pr-8">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleOpenEditModal(product)} className="glass-button-icon p-1 rounded-md transition-all hover:text-primary hover:border-primary/30 hover:bg-primary/10 tooltip cursor-pointer" title="Edit">
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button onClick={() => setProductToDelete(product.id)} className="glass-button-icon p-1 rounded-md transition-all hover:text-error hover:border-error/30 hover:bg-error/10 tooltip cursor-pointer" title="Delete">
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
          <div className="p-6 border-t border-outline-variant/20 bg-surface-container-lowest flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-2">
              <span className="text-sm text-on-surface-variant">
                {totalCount === 0 ? 'Showing 0 entries' : `Showing ${startIndex} to ${endIndex} of ${totalCount} entries`}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm font-medium rounded-md text-on-surface-variant hover:bg-surface-container-highest border border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>
                <span className="w-8 h-8 rounded-lg flex items-center justify-center font-bold bg-primary text-on-primary shadow-[0_0_10px_rgba(125,211,252,0.3)]">
                  {currentPage}
                </span>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm font-medium rounded-md text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface border border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Decoration */}
        <footer className="relative z-10 w-full opacity-40 text-center flex items-center justify-center gap-4 mt-8">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-on-surface-variant to-transparent"></div>
          <p className="text-xs font-bold tracking-[0.2em] text-on-surface-variant uppercase">
            BillTea Dashboard • Products
          </p>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-on-surface-variant to-transparent"></div>
        </footer>
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-md animate-fade-slide-up" style={{ animationDuration: '0.3s' }}>
          <div className="bg-surface w-full max-w-md rounded-[2rem] p-8 shadow-2xl shadow-error/10 border border-outline-variant/20 relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-error/50 to-transparent"></div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center shrink-0 border border-error/20">
                <span className="material-symbols-outlined text-error text-[24px]">warning</span>
              </div>
              <div>
                <h3 className="text-xl font-headline font-bold text-on-surface mb-2">Delete Product?</h3>
                <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">
                  Are you sure you want to delete this product? This will permanently remove the item from your branch inventory. This action cannot be undone.
                </p>
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button 
                    onClick={() => setProductToDelete(null)}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeleteProduct}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <><span className="material-symbols-outlined animate-spin text-[16px]">refresh</span> Deleting...</>
                    ) : (
                      <><span className="material-symbols-outlined text-[16px]">delete</span> Delete Product</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-md animate-fade-slide-up" style={{ animationDuration: '0.3s' }}>
          <div className="bg-surface w-full max-w-2xl rounded-[2rem] border border-outline-variant/20 shadow-2xl flex flex-col max-h-[90vh] relative overflow-hidden">
            {/* Modal Ambient Glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-primary/5 rounded-full blur-[60px] pointer-events-none"></div>

            <div className="p-6 sm:px-8 sm:pt-8 sm:pb-6 border-b border-outline-variant/20 flex justify-between items-center relative z-10 bg-surface-container-lowest">
              <div>
                <h2 className="text-2xl font-bold text-on-surface tracking-tight">{editProductId ? 'Edit Product' : 'New Product'}</h2>
                <p className="text-sm text-on-surface-variant/80 mt-1">{editProductId ? 'Update inventory item details.' : 'Add a new item to your branch inventory.'}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all group cursor-pointer border border-outline-variant/30">
                <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform">close</span>
              </button>
            </div>
            
            <div className="p-6 sm:px-8 overflow-y-auto custom-scrollbar relative z-10 bg-surface">
              {error && (
                <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-xl text-sm flex items-start gap-3 animate-in slide-in-from-top-2">
                  <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
                  <p>{error}</p>
                </div>
              )}
              
              <form id="productForm" onSubmit={handleSaveProduct} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">inventory_2</span> Product Name *
                    </label>
                    <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant/30 px-4 py-3 rounded-xl text-sm font-medium text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:bg-surface focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all" placeholder="e.g. Premium Widget" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">payments</span> Selling Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm font-medium">₹</span>
                      <input required type="number" step="0.01" min="0" name="price" value={formData.price} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant/30 pl-8 pr-4 py-3 rounded-xl text-sm font-medium text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:bg-surface focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all" placeholder="0.00" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">image</span> Default Product Image
                    </label>
                    {editProductId && products.find(p => p.id === editProductId)?.image && (
                      <div className="flex items-center gap-3 mb-2 p-3 rounded-xl border border-outline-variant/20 bg-surface-container shadow-sm">
                        <img src={getImageUrl(products.find(p => p.id === editProductId)?.image || '')!} alt="Current" className="w-10 h-10 rounded-lg object-cover ring-1 ring-outline-variant/30" />
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-on-surface">Current Image Uploaded</span>
                          <span className="text-[11px] font-medium text-on-surface-variant/70">Uploading a new image will replace this one.</span>
                        </div>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all file:cursor-pointer cursor-pointer border border-outline-variant/30 rounded-xl bg-surface-container" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">qr_code_2</span> SKU Number
                    </label>
                    <input name="skuNumber" value={formData.skuNumber} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant/30 px-4 py-3 rounded-xl text-sm font-medium text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:bg-surface focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all" placeholder="e.g. WDGT-001" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">account_balance</span> HSN / SAC Code
                    </label>
                    <input name="hsnNumber" value={formData.hsnNumber} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant/30 px-4 py-3 rounded-xl text-sm font-medium text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:bg-surface focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all" placeholder="e.g. 84439990" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">notes</span> Description
                  </label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full bg-surface-container border border-outline-variant/30 px-4 py-3 rounded-xl text-sm font-medium text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:bg-surface focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all resize-none custom-scrollbar" placeholder="Detailed product description..."></textarea>
                </div>
              </form>
            </div>
            
            <div className="p-6 sm:px-8 border-t border-outline-variant/20 bg-surface-container-lowest flex justify-end gap-3 relative z-10">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl bg-surface-container text-sm font-semibold text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/30">
                Cancel
              </button>
              <button type="submit" form="productForm" disabled={saving} className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-[0_0_15px_rgba(125,211,252,0.4)] hover:shadow-[0_0_25px_rgba(125,211,252,0.6)] hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                {saving ? (
                  <><span className="material-symbols-outlined animate-spin text-[18px]">refresh</span> Saving...</>
                ) : (
                  <><span className="material-symbols-outlined text-[18px]">check_circle</span> Save Product</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}