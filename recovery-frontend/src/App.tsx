import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar, Topbar } from './components/Shell';
import { LoadingState } from './components/common';
import './index.css';

// ─── Lazy pages ───────────────────────────────────────────────────────────────
const Dashboard     = lazy(() => import('./pages/Dashboard'));
const Recovery      = lazy(() => import('./pages/RecoveryWorkspace'));
const Landing       = lazy(() => import('./pages/Landing'));

import {
  Cases,
  Fragments,
  Graph,
  Validation,
  Engines,
  Reports,
  Timeline,
  AuditLog,
  Settings
} from './pages/Prototypes';

// ─── Page fallback removed ────────────────────────────────────────────────────────────
// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingState label="Loading page…" />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/*" element={
            <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
              <Sidebar />
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-auto bg-muted/30 p-6" role="main">
                  <Routes>
                    <Route path="/dashboard"   element={<Dashboard />} />
                    <Route path="/cases"       element={<Cases />} />
                    <Route path="/cases/:caseId" element={<Cases />} />
                    <Route path="/cases/:caseId/*" element={<Cases />} />
                    <Route path="/recovery/:recoveryId" element={<Recovery />} />
                    <Route path="/recovery/:recoveryId/*" element={<Recovery />} />
                    <Route path="/fragments"   element={<Fragments />} />
                    <Route path="/graph"       element={<Graph />} />
                    <Route path="/validation"  element={<Validation />} />
                    <Route path="/engines"     element={<Engines />} />
                    <Route path="/reports"     element={<Reports />} />
                    <Route path="/timeline"    element={<Timeline />} />
                    <Route path="/audit"       element={<AuditLog />} />
                    <Route path="/settings"    element={<Settings />} />
                    {/* legacy paths */}
                    <Route path="/recovery-engines" element={<Navigate to="/engines" replace />} />
                    <Route path="*"            element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </main>
              </div>
            </div>
          } />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
