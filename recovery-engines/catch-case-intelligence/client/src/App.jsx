import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Cases from './pages/Cases'
import CaseDetail from './pages/CaseDetail'
import EvidenceUpload from './pages/EvidenceUpload'
import Timeline from './pages/Timeline'
import Reports from './pages/Reports'
import ReportDetail from './pages/ReportDetail'
import Settings from './pages/Settings'
import Legal from './pages/Legal'
import Login from './pages/Login'
import MitreAttack from './pages/MitreAttack'
import CaseChat from './pages/CaseChat'
import ThreatIocs from './pages/ThreatIocs'
import AnomalyDashboard from './pages/AnomalyDashboard'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <Routes>
      {/* Public routes — always accessible */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/legal" element={<Legal />} />

      {/* Protected app routes — with sidebar + header */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <div className="app-layout">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="main-wrapper">
              <Header onMenuToggle={() => setSidebarOpen(prev => !prev)} />
              <main className="main-content"><Dashboard /></main>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/cases" element={
        <ProtectedRoute>
          <div className="app-layout">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="main-wrapper">
              <Header onMenuToggle={() => setSidebarOpen(prev => !prev)} />
              <main className="main-content"><Cases /></main>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/cases/:id" element={
        <ProtectedRoute>
          <div className="app-layout">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="main-wrapper">
              <Header onMenuToggle={() => setSidebarOpen(prev => !prev)} />
              <main className="main-content"><CaseDetail /></main>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/evidence" element={
        <ProtectedRoute>
          <div className="app-layout">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="main-wrapper">
              <Header onMenuToggle={() => setSidebarOpen(prev => !prev)} />
              <main className="main-content"><EvidenceUpload /></main>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/timeline" element={
        <ProtectedRoute>
          <div className="app-layout">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="main-wrapper">
              <Header onMenuToggle={() => setSidebarOpen(prev => !prev)} />
              <main className="main-content"><Timeline /></main>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/mitre" element={
        <ProtectedRoute>
          <div className="app-layout">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="main-wrapper">
              <Header onMenuToggle={() => setSidebarOpen(prev => !prev)} />
              <main className="main-content"><MitreAttack /></main>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/iocs" element={
        <ProtectedRoute>
          <div className="app-layout">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="main-wrapper">
              <Header onMenuToggle={() => setSidebarOpen(prev => !prev)} />
              <main className="main-content"><ThreatIocs /></main>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/anomalies" element={
        <ProtectedRoute>
          <div className="app-layout">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="main-wrapper">
              <Header onMenuToggle={() => setSidebarOpen(prev => !prev)} />
              <main className="main-content"><AnomalyDashboard /></main>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/chat" element={
        <ProtectedRoute>
          <div className="app-layout">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="main-wrapper">
              <Header onMenuToggle={() => setSidebarOpen(prev => !prev)} />
              <main className="main-content"><CaseChat /></main>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute>
          <div className="app-layout">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="main-wrapper">
              <Header onMenuToggle={() => setSidebarOpen(prev => !prev)} />
              <main className="main-content"><Reports /></main>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/reports/:id" element={
        <ProtectedRoute>
          <div className="app-layout">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="main-wrapper">
              <Header onMenuToggle={() => setSidebarOpen(prev => !prev)} />
              <main className="main-content"><ReportDetail /></main>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <div className="app-layout">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="main-wrapper">
              <Header onMenuToggle={() => setSidebarOpen(prev => !prev)} />
              <main className="main-content"><Settings /></main>
            </div>
          </div>
        </ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App
