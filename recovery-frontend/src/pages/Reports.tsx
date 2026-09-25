import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, FileJson, Search, Filter, Printer, Calendar } from 'lucide-react';
import './Reports.css';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

export default function Reports() {
  const [reports] = useState([
    {
      id: 'REP-99201',
      caseName: 'Operation Silvershadow',
      date: '2026-09-24',
      size: '2.4 MB',
      type: 'Full Recovery',
      status: 'Ready'
    },
    {
      id: 'REP-99202',
      caseName: 'Mobile Dump (Samsung S23)',
      date: '2026-09-25',
      size: '1.1 MB',
      type: 'Fragment Analysis',
      status: 'Ready'
    },
    {
      id: 'REP-99203',
      caseName: 'Server Logs Triage',
      date: '2026-09-25',
      size: '0.8 MB',
      type: 'Integrity Check',
      status: 'Generating...'
    }
  ]);

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="page-container reports-page"
    >
      <header className="page-header">
        <div>
          <h1>Recovery Reports</h1>
          <p className="text-muted">Generate, view, and export chain-of-custody compliant reports.</p>
        </div>
        <div className="toolbar glass-panel flex items-center gap-2">
          <div className="search-box">
            <Search size={16} />
            <input type="text" placeholder="Search reports..." />
          </div>
          <button className="icon-btn"><Filter size={18} /></button>
          <button className="btn-primary">Generate Report</button>
        </div>
      </header>

      <div className="reports-content glass-panel">
        <table className="reports-table">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Case / Target</th>
              <th>Date</th>
              <th>Type</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td className="text-mono font-medium">{report.id}</td>
                <td>{report.caseName}</td>
                <td>
                  <div className="flex items-center gap-2 text-muted">
                    <Calendar size={14} />
                    {report.date}
                  </div>
                </td>
                <td>
                  <span className="type-badge">{report.type}</span>
                </td>
                <td>
                  <span className={`status-dot ${report.status === 'Ready' ? 'bg-success' : 'bg-warning pulse'}`}></span>
                  {report.status}
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="Download PDF" disabled={report.status !== 'Ready'}>
                      <FileText size={18} />
                    </button>
                    <button className="btn-icon" title="Download JSON" disabled={report.status !== 'Ready'}>
                      <FileJson size={18} />
                    </button>
                    <button className="btn-icon" title="Print" disabled={report.status !== 'Ready'}>
                      <Printer size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="reports-footer glass-panel">
        <div className="info-box">
          <FileText size={24} className="text-info" />
          <div className="info-content">
            <h4>Chain of Custody Compliant</h4>
            <p className="text-muted">All exported reports include cryptographic hashes of the reconstructed files and the original image sources, digitally signed by the CATCH-AI Orchestrator.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
