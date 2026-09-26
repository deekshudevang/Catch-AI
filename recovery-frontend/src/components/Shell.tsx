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
    <nav className="w-64 bg-card border-r border-border flex flex-col h-full shrink-0" aria-label="Primary navigation">
      {/* Logo */}
      <div className="flex items-center gap-3 p-5 border-b border-border">
        <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-md flex items-center justify-center">
          <Activity size={18} className="text-primary" />
        </div>
        <div className="leading-tight">
          <div className="text-base font-bold text-foreground font-display">
            CATCH-AI
          </div>
          <div className="text-xs text-muted-foreground">
            Recovery Platform
          </div>
        </div>
      </div>

      {/* Nav groups */}
      <div className="flex-1 py-4 overflow-y-auto">
        {NAV.map(group => (
          <div key={group.label} className="mb-6 px-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
              {group.label}
            </div>
            <div className="flex flex-col space-y-1">
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`
                  }
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
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
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur flex items-center px-6 justify-between shrink-0" role="banner">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-sm text-muted-foreground font-medium">
          CATCH-AI
        </span>
        <ChevronRight size={14} className="text-muted-foreground" />
        <span className="text-sm text-foreground font-medium">
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
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <StatusDot level={level} />
      <span>{label}</span>
    </div>
  );
}
