import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, FileCheck, Search, Filter, Shield, Info, Download, Trash2 } from 'lucide-react';
import './ValidationUI.css';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 }
};

export default function ValidationUI() {
  const [selectedItem, setSelectedItem] = useState<number | null>(1);

  const validations = [
    {
      id: 1,
      filename: 'document_recovered_final.pdf',
      type: 'PDF',
      size: '2.4 MB',
      integrityScore: 98,
      status: 'verified',
      fragments: 14,
      hashes: {
        md5: '8b1a9953c4611296a827abf8c47804d7',
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      },
      warnings: []
    },
    {
      id: 2,
      filename: 'IMG_4921_recovered.jpg',
      type: 'JPEG',
      size: '4.1 MB',
      integrityScore: 82,
      status: 'warning',
      fragments: 3,
      hashes: {
        md5: 'd41d8cd98f00b204e9800998ecf8427e',
        sha256: '01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b'
      },
      warnings: ['Missing footer marker (0xFFD9)', 'Suspicious entropy in segment 2']
    },
    {
      id: 3,
      filename: 'financial_records.xlsx',
      type: 'XLSX',
      size: '1.2 MB',
      integrityScore: 45,
      status: 'failed',
      fragments: 22,
      hashes: {
        md5: '—',
        sha256: '—'
      },
      warnings: ['Zip central directory corrupted', 'Multiple missing blocks']
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <ShieldCheck className="text-success" size={20} />;
      case 'warning': return <AlertTriangle className="text-warning" size={20} />;
      case 'failed': return <Shield className="text-danger" size={20} />;
      default: return <Info className="text-muted" size={20} />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-danger';
  };

  const activeDoc = validations.find(v => v.id === selectedItem);

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="page-container validation-page"
    >
      <header className="page-header">
        <div>
          <h1>Integrity Validation</h1>
          <p className="text-muted">Verify the structural and cryptographic integrity of reconstructed files.</p>
        </div>
        <div className="toolbar glass-panel flex items-center gap-2">
          <div className="search-box">
            <Search size={16} />
            <input type="text" placeholder="Search files..." />
          </div>
          <button className="icon-btn"><Filter size={18} /></button>
        </div>
      </header>

      <div className="validation-grid">
        {/* File List */}
        <div className="file-list glass-panel">
          <div className="list-header">
            <h3>Reconstructed Files</h3>
            <span className="badge">{validations.length} items</span>
          </div>
          <div className="list-content">
            {validations.map(file => (
              <div 
                key={file.id} 
                className={`file-item ${selectedItem === file.id ? 'active' : ''}`}
                onClick={() => setSelectedItem(file.id)}
              >
                <div className="file-icon">
                  <FileCheck size={24} />
                </div>
                <div className="file-details">
                  <div className="file-name">{file.filename}</div>
                  <div className="file-meta">
                    <span className="text-muted">{file.type} • {file.size}</span>
                  </div>
                </div>
                <div className="file-status">
                  {getStatusIcon(file.status)}
                  <span className={`score ${getScoreColor(file.integrityScore)}`}>
                    {file.integrityScore}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Validation Details */}
        <div className="validation-details glass-panel">
          {activeDoc ? (
            <div className="details-content">
              <div className="details-header">
                <div className="details-title-row">
                  {getStatusIcon(activeDoc.status)}
                  <h2>{activeDoc.filename}</h2>
                </div>
                <div className="actions flex gap-2">
                  <button className="btn-secondary"><Download size={16} /> Export Report</button>
                  <button className="btn-icon text-danger"><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="score-overview">
                <div className="score-circle">
                  <svg viewBox="0 0 36 36" className="circular-chart">
                    <path className="circle-bg"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path className={`circle ${getScoreColor(activeDoc.integrityScore).replace('text-', 'stroke-')}`}
                      strokeDasharray={`${activeDoc.integrityScore}, 100`}
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <text x="18" y="20.35" className="percentage">{activeDoc.integrityScore}%</text>
                  </svg>
                </div>
                <div className="score-stats">
                  <div className="stat-row">
                    <span className="label">Reconstruction Status</span>
                    <span className={`value status-badge-${activeDoc.status}`}>{activeDoc.status.toUpperCase()}</span>
                  </div>
                  <div className="stat-row">
                    <span className="label">Fragments Merged</span>
                    <span className="value">{activeDoc.fragments}</span>
                  </div>
                  <div className="stat-row">
                    <span className="label">File Size</span>
                    <span className="value">{activeDoc.size}</span>
                  </div>
                </div>
              </div>

              {activeDoc.warnings.length > 0 && (
                <div className="warnings-section">
                  <h3><AlertTriangle size={16} className="text-warning" /> Validation Warnings</h3>
                  <ul className="warning-list">
                    {activeDoc.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="hashes-section">
                <h3>Cryptographic Signatures</h3>
                <div className="hash-box">
                  <div className="hash-row">
                    <span className="hash-label">MD5</span>
                    <code className="hash-value text-mono">{activeDoc.hashes.md5}</code>
                  </div>
                  <div className="hash-row">
                    <span className="hash-label">SHA-256</span>
                    <code className="hash-value text-mono">{activeDoc.hashes.sha256}</code>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <FileCheck size={48} className="text-muted" />
              <p>Select a file to view validation details</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
