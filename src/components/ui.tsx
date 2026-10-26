import { useEffect, useRef, type ReactNode } from "react";
import { useStore } from "../store";

// Toast stack. An Undo button stays for six seconds on reversible actions.
export function Toasts() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className="toast">
          <span>{t.message}</span>
          {t.undo && (
            <button className="link" onClick={() => { t.undo?.(); dismissToast(t.id); }}>Undo</button>
          )}
        </div>
      ))}
    </div>
  );
}

// Confirmation dialog. Escape or Cancel closes it.
export function Confirm({
  title, children, confirmLabel, onConfirm, onCancel, danger,
}: {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", onKey);
    ref.current?.querySelector<HTMLElement>("button")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} ref={ref} onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        <div>{children}</div>
        <div className="row end">
          <button onClick={onCancel}>Cancel</button>
          <button className={danger ? "danger" : "primary"} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export type Tone = "ok" | "warn" | "flag" | "neutral" | "info";
export function Chip({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`chip ${tone}`}>{children}</span>;
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="progress-wrap" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)} aria-label={label}>
      <div className="progress-bar" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-title">{title}</div>
      {children && <div className="muted small">{children}</div>}
    </div>
  );
}

export function PageHead({ eyebrow, title, right }: { eyebrow?: string; title: string; right?: ReactNode }) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2>{title}</h2>
      </div>
      {right && <div className="page-head-right">{right}</div>}
    </div>
  );
}
