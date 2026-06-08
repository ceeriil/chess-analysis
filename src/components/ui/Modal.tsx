'use client';

// ============================================================
// ⬢ MODAL
// Portal-based modal. Handles:
//   - Focus trap
//   - Escape to close
//   - Backdrop click to close (optional)
//   - Body scroll lock
//   - Size variants: sm | md | lg | xl
//
// Usage:
//   <Modal open={open} onClose={() => setOpen(false)} title="…">
//     content
//   </Modal>
// ============================================================

import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { PiX } from 'react-icons/pi';

// ─── TYPES ───────────────────────────────────────────────────

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

type ModalProps = {
  open:              boolean;
  onClose:           () => void;
  title?:            string;
  description?:      string;
  children:          ReactNode;
  size?:             ModalSize;
  closeOnBackdrop?:  boolean;
  showCloseButton?:  boolean;
  footer?:           ReactNode;
};

// ─── STYLE MAPS ──────────────────────────────────────────────

const SIZE_STYLES: Record<ModalSize, string> = {
  sm: 'max-w-sm  w-full',
  md: 'max-w-lg  w-full',
  lg: 'max-w-2xl w-full',
  xl: 'max-w-4xl w-full',
};

// ─── COMPONENT ───────────────────────────────────────────────

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size             = 'md',
  closeOnBackdrop  = true,
  showCloseButton  = true,
  footer,
}: ModalProps) {
  const overlayRef  = useRef<HTMLDivElement>(null);
  const contentRef  = useRef<HTMLDivElement>(null);

  // ── Lock body scroll ──
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // ── Escape to close ──
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // ── Focus trap: move focus into modal on open ──
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    contentRef.current?.focus();
    return () => { prev?.focus(); };
  }, [open]);

  if (!open) return null;

  const modal = (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'pm-modal-title' : undefined}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      onClick={(e) => {
        if (closeOnBackdrop && e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#1A1A1A]/60" aria-hidden="true" />

      {/* Panel */}
      <div
        ref={contentRef}
        tabIndex={-1}
        style={{ border: '1.5px solid #1A1A1A' }}
        className={`
          relative z-10 flex flex-col bg-[#F8F3E8] outline-none
          max-h-[90vh]
          ${SIZE_STYLES[size]}
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            style={{ borderBottom: '1.5px solid #1A1A1A' }}
            className="flex items-start justify-between gap-4 px-6 py-4 shrink-0"
          >
            <div className="flex flex-col gap-1">
              {title && (
                <h2
                  id="pm-modal-title"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  className="text-[12px] font-semibold tracking-[0.12em] uppercase text-[#1A1A1A]"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  style={{ fontFamily: "'Spectral', serif" }}
                  className="text-[13px] text-[#9B9088] leading-[1.6]"
                >
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="shrink-0 text-[#9B9088] hover:text-[#1A1A1A]
                           transition-colors duration-150 mt-0.5"
              >
                <PiX size={18} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{ borderTop: '1.5px solid #1A1A1A' }}
            className="shrink-0 px-6 py-4 flex items-center justify-end gap-3"
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}