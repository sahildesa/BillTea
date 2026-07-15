import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { apiFetch } from '@/lib/auth';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    id: string;
    invoiceNumber: string;
    amountDue: number; // passed directly to simplify
  } | null;
  onSuccess: () => void;
}

const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(newFile);
            } else {
              reject(new Error('Canvas to Blob failed'));
            }
          },
          'image/jpeg',
          0.8
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function PaymentModal({ isOpen, onClose, invoice, onSuccess }: PaymentModalProps) {
  const [mounted, setMounted] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: 0, method: 'CASH', date: '', note: '' });
  const [paymentAttachment, setPaymentAttachment] = useState<File | null>(null);
  const [paymentError, setPaymentError] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && invoice) {
      setPaymentForm({
        amount: invoice.amountDue,
        method: 'CASH',
        date: new Date().toISOString().split('T')[0],
        note: ''
      });
      setPaymentAttachment(null);
      setPaymentError('');
    }
  }, [isOpen, invoice]);

  if (!mounted || !isOpen || !invoice) return null;

  const handleSubmitPayment = async () => {
    if (paymentForm.amount <= 0) {
      setPaymentError('Payment amount must be greater than 0');
      return;
    }
    const amountDue = invoice.amountDue;
    const paymentAmount = Number(paymentForm.amount.toFixed(2));
    if (paymentAmount > amountDue) {
      setPaymentError(`Payment amount cannot exceed the due amount`);
      return;
    }

    try {
      setIsSubmittingPayment(true);
      setPaymentError('');

      const res = await apiFetch(`/invoices/${invoice.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add payment');
      }

      const data = await res.json();

      // Upload attachment if present
      if (paymentAttachment && data.id) {
        const formData = new FormData();
        formData.append('file', paymentAttachment);

        await apiFetch(`/invoices/${invoice.id}/payments/${data.id}/attachment`, {
          method: 'POST',
          body: formData,
          headers: {} // Let browser set multipart boundary
        });
      }

      onClose();
      onSuccess();
    } catch (err: any) {
      setPaymentError(err.message || 'An error occurred while adding the payment');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-md transition-opacity" onClick={onClose}></div>
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden relative z-10 flex flex-col animate-in zoom-in-95 fade-in duration-200 border border-outline-variant/20">

        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">payments</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-on-surface">Record Payment</h3>
              <p className="text-xs text-on-surface-variant">Invoice {invoice.invoiceNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-highest text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar space-y-5">
          {paymentError && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/20 flex items-start gap-2">
              <span className="material-symbols-outlined text-error text-[18px]">error</span>
              <p className="text-sm text-error font-medium">{paymentError}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Amount (₹)</label>
              <input type="number" step="0.01" max={invoice.amountDue} value={paymentForm.amount} onChange={(e) => setPaymentForm({...paymentForm, amount: parseFloat(e.target.value) || 0})} className="glass-input px-4 py-2.5 rounded-lg text-sm font-bold text-on-surface w-full" />
              <p className="text-[10px] text-on-surface-variant mt-1">Max: ₹{invoice.amountDue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Payment Date</label>
              <input type="date" value={paymentForm.date} onChange={(e) => setPaymentForm({...paymentForm, date: e.target.value})} className="glass-input px-4 py-2.5 rounded-lg text-sm font-semibold text-on-surface w-full" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Payment Method</label>
              <div className="flex flex-wrap gap-2">
                {['CASH', 'BANK_TRANSFER', 'CHEQUE', 'CREDIT_CARD', 'UPI', 'OTHER'].map(method => (
                  <button
                    key={method}
                    onClick={() => setPaymentForm({...paymentForm, method})}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-all ${
                      paymentForm.method === method
                        ? 'bg-primary/20 text-primary border-primary/50'
                        : 'bg-surface-container border-transparent text-on-surface-variant hover:bg-surface-container-highest'
                    }`}
                  >
                    {method.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Transaction Note / Reference</label>
              <input type="text" placeholder="e.g. UPI Ref #12345678" value={paymentForm.note} onChange={(e) => setPaymentForm({...paymentForm, note: e.target.value})} className="glass-input px-4 py-2.5 rounded-lg text-sm text-on-surface w-full" />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Payment Proof (Optional)</label>
              {paymentAttachment ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-outline-variant/20">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">
                        {paymentAttachment.type === 'application/pdf' ? 'picture_as_pdf' : 'image'}
                      </span>
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-on-surface truncate">{paymentAttachment.name}</p>
                      <p className="text-xs text-on-surface-variant">{(paymentAttachment.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button onClick={() => setPaymentAttachment(null)} className="p-2 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors shrink-0">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-outline-variant/30 rounded-xl p-4 text-center hover:bg-surface-container-highest transition-colors relative group cursor-pointer">
                  <span className="material-symbols-outlined text-on-surface-variant text-[24px] mb-1 group-hover:text-primary transition-colors">upload_file</span>
                  <p className="text-sm font-semibold text-on-surface-variant group-hover:text-primary transition-colors">Attach Receipt</p>
                  <input
                    type="file"
                    accept=".pdf,image/jpeg,image/png,image/gif,image/webp,.heic,.heif"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                      const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');

                      if (!allowedTypes.includes(file.type) && !isHeic && !file.type.startsWith('image/')) {
                        setPaymentError('Attachment must be a PDF or an Image.');
                        e.target.value = '';
                        return;
                      }

                      if (file.size > 5 * 1024 * 1024) {
                        setPaymentError('Attachment must be less than 5MB.');
                        e.target.value = '';
                        return;
                      }

                      setPaymentError('');
                      if (isHeic || file.type.startsWith('image/')) {
                        try {
                          const compressed = await compressImage(file);
                          setPaymentAttachment(compressed);
                        } catch (err) {
                          setPaymentAttachment(file); // fallback
                        }
                      } else {
                        setPaymentAttachment(file);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/10 bg-surface-container-lowest/50 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container transition-colors text-sm">
            Cancel
          </button>
          <button onClick={handleSubmitPayment} disabled={isSubmittingPayment} className="px-5 py-2.5 rounded-xl font-bold bg-primary text-on-primary hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all flex items-center gap-2 text-sm disabled:opacity-50">
            {isSubmittingPayment ? <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span> : <span className="material-symbols-outlined text-[20px]">save</span>}
            Save Payment
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
