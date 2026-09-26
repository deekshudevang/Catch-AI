import React from 'react';

// ─── StatusDot ────────────────────────────────────────────────────────────────

export type StatusLevel = 'ok' | 'running' | 'warning' | 'warn' | 'error' | 'unknown' | 'info' | 'neutral';

export function StatusDot({ level }: { level: StatusLevel }) {
  const cls: Record<StatusLevel, string> = {
    ok:      'dot dot-green',
    running: 'dot dot-crimson',
    warning: 'dot dot-amber',
    warn:    'dot dot-amber',
    error:   'dot dot-red',
    unknown: 'dot dot-muted',
    info:    'dot dot-crimson',
    neutral: 'dot dot-muted',
  };
  return <span className={cls[level]} aria-label={level} />;
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

export function StatusBadge({ label, level }: { label: string; level: StatusLevel }) {
  const cls: Record<StatusLevel, string> = {
    ok:      'badge badge-ready',
    running: 'badge badge-running',
    warning: 'badge badge-warning',
    warn:    'badge badge-warning',
    error:   'badge badge-failed',
    unknown: 'badge badge-unknown',
    info:    'badge badge-unknown',
    neutral: 'badge badge-unknown',
  };
  return <span className={cls[level]}>{label}</span>;
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="state-center" role="status">
      {icon && <span className="state-icon">{icon}</span>}
      <p className="state-title">{title}</p>
      {description && <p className="state-desc">{description}</p>}
      {action}
    </div>
  );
}

// ─── ErrorState ───────────────────────────────────────────────────────────────

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Error', message, onRetry }: ErrorStateProps) {
  return (
    <div className="state-center" role="alert">
      <p className="state-title" style={{ color: 'var(--red)' }}>{title}</p>
      <p className="state-desc">{message}</p>
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

// ─── LoadingState ─────────────────────────────────────────────────────────────

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="state-center" role="status" aria-live="polite">
      <div className="spin" style={{ color: 'var(--crimson)', width: 28, height: 28 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
      </div>
      <p className="state-desc">{label}</p>
    </div>
  );
}

// ─── SkeletonRow ─────────────────────────────────────────────────────────────

export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '12px 16px' }}>
          <div className="skeleton" style={{ height: 12, width: `${60 + (i % 3) * 20}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="page-header flex items-center justify-between">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2 items-center">{actions}</div>}
    </div>
  );
}

// ─── KVRow ────────────────────────────────────────────────────────────────────

export function KVRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="kv-row">
      <span className="kv-label">{label}</span>
      <span className="kv-value">{value ?? <span style={{ color: 'var(--text-3)' }}>—</span>}</span>
    </div>
  );
}

// ─── SectionCard ─────────────────────────────────────────────────────────────

interface SectionCardProps {
  title?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function SectionCard({ title, icon, actions, children, style, className }: SectionCardProps) {
  return (
    <div className={`card ${className || ''}`.trim()} style={style}>
      {(title || actions || icon) && (
        <div className="flex items-center justify-between"
          style={{ padding: 'var(--sp-4)', borderBottom: '1px solid var(--border)' }}>
          {(title || icon) && (
            <div className="flex items-center gap-2">
              {icon && <span style={{ color: 'var(--text-3)' }}>{icon}</span>}
              {title && (
                <span style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text)' }}>
                  {title}
                </span>
              )}
            </div>
          )}
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
