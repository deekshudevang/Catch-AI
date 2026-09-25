import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar, Topbar } from './components/Shell';
import { LoadingState } from './components/common';
import './index.css';

// ─── Lazy pages ───────────────────────────────────────────────────────────────
const Dashboard     = lazy(() => import('./pages/Dashboard'));
const CaseList      = lazy(() => import('./pages/CaseList'));
const CaseWorkspace = lazy(() => import('./pages/CaseWorkspace'));
const Recovery      = lazy(() => import('./pages/Recovery'));
const Fragments     = lazy(() => import('./pages/Fragments'));
const GraphPage     = lazy(() => import('./pages/FragmentGraph'));
const Validation    = lazy(() => import('./pages/ValidationUI'));
const EngineMonitor = lazy(() => import('./pages/RecoveryEngines'));
const Reports       = lazy(() => import('./pages/Reports'));
const Timeline      = lazy(() => import('./pages/Timeline'));
const AuditLog      = lazy(() => import('./pages/AuditLog'));
const SettingsPage  = lazy(() => import('./pages/SettingsPage'));

// ─── Page fallback ────────────────────────────────────────────────────────────
function PagePlaceholder({ name }: { name: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '60vh', gap: 12,
    }}>
      <p style={{ color: 'var(--text-3)', fontSize: 'var(--text-sm)' }}>
        {name} — page coming soon
      </p>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <div className="app-shell">
        <Sidebar />
        <div className="app-body">
          <Topbar />
          <main className="page-content" role="main">
            <Suspense fallback={<LoadingState label="Loading page…" />}>
              <Routes>
                <Route path="/"            element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard"   element={<Dashboard />} />
                <Route path="/cases"       element={<CaseList />} />
                <Route path="/cases/:caseId" element={<CaseWorkspace />} />
                <Route path="/cases/:caseId/*" element={<CaseWorkspace />} />
                <Route path="/recovery"    element={<Recovery />} />
                <Route path="/fragments"   element={<Fragments />} />
                <Route path="/graph"       element={<GraphPage />} />
                <Route path="/validation"  element={<Validation />} />
                <Route path="/engines"     element={<EngineMonitor />} />
                <Route path="/reports"     element={<Reports />} />
                <Route path="/timeline"    element={<Timeline />} />
                <Route path="/audit"       element={<AuditLog />} />
                <Route path="/settings"    element={<SettingsPage />} />
                {/* legacy paths */}
                <Route path="/recovery-engines" element={<Navigate to="/engines" replace />} />
                <Route path="*"            element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
