'use client';

// ============================================================
// ⬢ DIALOG
// Confirmation dialog built on <Modal>.
// Covers: destructive confirms, neutral confirms, info alerts.
//
// Usage:
//   <Dialog
//     open={open}
//     onClose={() => setOpen(false)}
//     onConfirm={handleDelete}
//     variant="danger"
//     title="Remove opponent?"
//     description="This will remove SilentDestroyer from your tracked list."
//     confirmLabel="Remove"
//   />
// ============================================================

import { Modal }   from '@/components/ui/Modal';
import { Button }  from '@/components/ui/Button';
import { PiWarning, PiInfo, PiCheckCircle } from 'react-icons/pi';

// ─── TYPES ───────────────────────────────────────────────────

type DialogVariant = 'danger' | 'confirm' | 'info';

type DialogProps = {
  open:          boolean;
  onClose:       () => void;
  onConfirm:     () => void | Promise<void>;
  title:         string;
  description?:  string;
  variant?:      DialogVariant;
  confirmLabel?: string;
  cancelLabel?:  string;
  loading?:      boolean;
};

// ─── CONSTANTS ───────────────────────────────────────────────

const VARIANT_CONFIG: Record<
  DialogVariant,
  { icon: typeof PiWarning; iconColor: string; confirmVariant: 'primary' | 'danger' | 'secondary' }
> = {
  danger:  { icon: PiWarning,      iconColor: '#CC2222', confirmVariant: 'danger'    },
  confirm: { icon: PiCheckCircle,  iconColor: '#22AA44', confirmVariant: 'primary'   },
  info:    { icon: PiInfo,         iconColor: '#0099AA', confirmVariant: 'secondary' },
};

// ─── COMPONENT ───────────────────────────────────────────────

export function Dialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  variant      = 'confirm',
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  loading      = false,
}: DialogProps) {
  const { icon: Icon, iconColor, confirmVariant } = VARIANT_CONFIG[variant];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            size="sm"
            loading={loading}
            loadingLabel="Working…"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-start gap-4">

        {/* Icon */}
        <div
          style={{ border: '1.5px solid currentColor', color: iconColor }}
          className="w-10 h-10 flex items-center justify-center shrink-0"
        >
          <Icon size={20} color={iconColor} />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1.5">
          <p
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            className="text-[13px] font-semibold tracking-[0.04em] text-[#1A1A1A]"
          >
            {title}
          </p>
          {description && (
            <p
              style={{ fontFamily: "'Spectral', serif" }}
              className="text-[13px] text-[#9B9088] leading-[1.65]"
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}