import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Activity, LayoutDashboard,
  Share2, ShieldCheck, Clock,
  BarChart2, Settings, ChevronRight,
  Cpu, GitMerge, List,
} from 'lucide-react';
import { recoveryApi, backendApi } from '../api/client';
import type { HealthResponse } from '../api/client';
import { StatusDot } from './common';
import type { StatusLevel } from './common';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  to:    string;
  icon:  React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'Recovery',
    items: [
      { to: '/recovery',   icon: Activity,   label: 'Recovery Jobs' },
      { to: '/fragments',  icon: GitMerge,   label: 'Fragments' },
      { to: '/graph',      icon: Share2,      label: 'Fragment Graph' },
    ],
  },
  {
    label: 'Investigation',
    items: [
      { to: '/validation', icon: ShieldCheck, label: 'Validation' },
      { to: '/timeline',   icon: Clock,       label: 'Timeline' },
      { to: '/reports',    icon: BarChart2,   label: 'Reports' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/engines',    icon: Cpu,         label: 'Engine Monitor' },
      { to: '/audit',      icon: List,        label: 'Audit Log' },
      { to: '/settings',   icon: Settings,    label: 'Settings' },
    ],
  },
];

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export function Sidebar() {
  return (
    <nav className="sidebar" aria-label="Primary navigation">
      {/* Logo */}
      <div style={{
        padding: 'var(--sp-4)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 28, height: 28,
          background: 'var(--cyan-dim)',
          border: '1px solid var(--cyan-border)',
          borderRadius: 'var(--r-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Activity size={16} color="var(--cyan)" />
        </div>
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text)' }}>
            CATCH-AI
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)' }}>
            Recovery Platform
          </div>
        </div>
      </div>

      {/* Nav groups */}
      <div style={{ flex: 1, padding: 'var(--sp-3) 0 var(--sp-6)' }}>
        {NAV.map(group => (
          <div key={group.label}>
            <div className="section-label">{group.label}</div>
            {group.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '7px 16px',
                  fontSize: 'var(--text-base)',
                  color: isActive ? 'var(--cyan)' : 'var(--text-2)',
                  background: isActive ? 'var(--cyan-dim)' : 'transparent',
                  borderRight: isActive ? '2px solid var(--cyan)' : '2px solid transparent',
                  textDecoration: 'none',
                  fontWeight: isActive ? 500 : 400,
                  transition: 'all var(--t-fast)',
                })}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  if (!el.dataset.active) {
                    el.style.color = 'var(--text)';
                    el.style.background = 'var(--surface-2)';
                  }
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  if (!el.dataset.active) {
                    el.style.color = '';
                    el.style.background = '';
                  }
                }}
              >
                <item.icon size={15} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </div>
    </nav>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

function levelFor(s?: string): StatusLevel {
  if (!s) return 'unknown';
  const u = s.toLowerCase();
  if (u === 'ok' || u === 'connected' || u === 'ready') return 'ok';
  if (u === 'running' || u === 'online') return 'running';
  if (u === 'degraded') return 'warning';
  if (u === 'failed' || u === 'disconnected') return 'error';
  return 'unknown';
}

export function Topbar() {
  const [recovery, setRecovery] = useState<HealthResponse | null>(null);
  const [backend,  setBackend]  = useState<HealthResponse | null>(null);
  const location = useLocation();

  // Page title derived from route
  const routeLabel: Record<string, string> = {
    '/dashboard':  'Dashboard',
    '/recovery':   'Recovery Jobs',
    '/fragments':  'Fragments',
    '/graph':      'Fragment Graph',
    '/validation': 'Validation',
    '/timeline':   'Timeline',
    '/reports':    'Reports',
    '/engines':    'Engine Monitor',
    '/audit':      'Audit Log',
    '/settings':   'Settings',
  };
  const pageLabel = routeLabel[location.pathname] ?? 'CATCH-AI';

  useEffect(() => {
    let mounted = true;

    const poll = async () => {
      try {
        const r = await recoveryApi.health();
        if (mounted) setRecovery(r);
      } catch { /* service down */ }

      try {
        const b = await backendApi.health();
        if (mounted) setBackend(b);
      } catch { /* service down */ }
    };

    poll();
    const id = setInterval(poll, 15_000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const engineCount = recovery?.engines
    ? Object.values(recovery.engines).filter(v => v === 'READY').length
    : null;
  const totalEngines = recovery?.engines ? Object.keys(recovery.engines).length : 8;

  return (
    <header className="topbar" role="banner">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-1" style={{ minWidth: 0 }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-3)', fontWeight: 500 }}>
          CATCH-AI
        </span>
        <ChevronRight size={14} color="var(--text-3)" />
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-2)', fontWeight: 500 }}>
          {pageLabel}
        </span>
      </div>

      {/* Status indicators */}
      <div className="flex items-center gap-4">
        {/* PostgreSQL via backend */}
        <TopbarStatus
          label="PostgreSQL"
          level={backend ? levelFor(backend.database ?? backend.status) : 'unknown'}
        />
        {/* Recovery service */}
        <TopbarStatus
          label="Recovery Service"
          level={recovery ? levelFor(recovery.status) : 'unknown'}
        />
        {/* Engines */}
        {engineCount !== null && (
          <TopbarStatus
            label={`${engineCount}/${totalEngines} Engines`}
            level={engineCount === totalEngines ? 'ok' : engineCount > 0 ? 'warning' : 'error'}
          />
        )}
      </div>
    </header>
  );
}

function TopbarStatus({ label, level }: { label: string; level: StatusLevel }) {
  return (
    <div className="flex items-center gap-2"
      style={{ fontSize: 'var(--text-sm)', color: 'var(--text-2)' }}>
      <StatusDot level={level} />
      <span>{label}</span>
    </div>
  );
}
