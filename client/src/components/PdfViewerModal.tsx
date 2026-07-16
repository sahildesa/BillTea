import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';

interface PdfViewerModalProps {
  url: string;
  title: string;
  documentId: string;
  documentType?: 'quotation' | 'invoice';
  onClose: () => void;
  renderActions?: (documentId: string, documentType: 'quotation' | 'invoice') => React.ReactNode;
}

export default function PdfViewerModal({ url, title, documentId, documentType = 'quotation', onClose, renderActions }: PdfViewerModalProps) {
  const [mounted, setMounted] = useState(false);
  const [timestamp] = useState(Date.now());

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-xl transition-opacity" onClick={onClose}></div>
      <div className="bg-surface/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] w-full max-w-6xl overflow-hidden relative z-10 flex flex-col h-[90vh] animate-in zoom-in-95 fade-in duration-300 border border-white/10">

        {/* Premium Toolbar */}
        <div className="px-6 py-4 bg-gradient-to-r from-surface-container/50 to-surface-container/10 flex items-center justify-between border-b border-white/10 relative">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 text-primary flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
            </div>
            <div>
              <h3 className="text-lg font-headline font-bold text-on-surface tracking-tight leading-tight">Document Preview</h3>
              <p className="text-sm text-on-surface-variant font-medium mt-0.5">{title}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 hidden lg:flex">
              <Link href={`/${documentType}s/${documentId}/edit`}>
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-highest/50 hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 text-on-surface-variant transition-all cursor-pointer tooltip" title="Edit">
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
              </Link>
              <Link href={`/${documentType}s/new?copyFrom=${documentId}`}>
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-highest/50 hover:bg-blue-400/10 hover:text-blue-400 border border-transparent hover:border-blue-400/20 text-on-surface-variant transition-all cursor-pointer tooltip" title="Copy">
                  <span className="material-symbols-outlined text-[20px]">content_copy</span>
                </button>
              </Link>
              {renderActions && renderActions(documentId, documentType)}
            </div>
            
            <div className="w-px h-8 bg-white/10 hidden lg:block mx-1"></div>

            <a href={url} download={title}>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all font-semibold text-sm">
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span className="hidden sm:inline">Download</span>
              </button>
            </a>
            
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-error/10 hover:bg-error/20 text-error border border-error/20 transition-all ml-1">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 w-full bg-surface-container-lowest/50 relative p-4">
          <div className="absolute inset-4 rounded-2xl overflow-hidden border border-white/5 shadow-inner bg-surface">
            <object 
              data={url} 
              type="application/pdf" 
              className="w-full h-full rounded-2xl"
            >
              <div className="flex flex-col items-center justify-center h-full text-on-surface-variant p-8 text-center bg-surface-container-lowest">
                <div className="w-20 h-20 bg-surface-container-highest rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-4xl opacity-50">picture_as_pdf</span>
                </div>
                <p className="font-bold text-lg mb-2">Unable to display PDF inline.</p>
                <p className="text-sm opacity-70 mb-6 max-w-md">Your browser might not support inline PDF viewing, or you are on a mobile device.</p>
                <a href={url} download={title} className="px-6 py-3 rounded-xl bg-primary text-on-primary font-bold shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">download</span>
                  Download PDF Instead
                </a>
              </div>
            </object>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
