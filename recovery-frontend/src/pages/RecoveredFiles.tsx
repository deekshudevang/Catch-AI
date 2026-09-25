import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader, SectionCard, StatusBadge, EmptyState } from '../components/common';
import { filesApi } from '../api/files';
import type { RecoveredFile } from '../api/files';
import { Search } from 'lucide-react';

export default function RecoveredFiles() {
  const { recoveryId } = useParams<{ recoveryId: string }>();
  const [files, setFiles] = useState<RecoveredFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    filesApi.getFiles(recoveryId).then(setFiles).catch(() => {});
    
    // Mock data for UI
    setTimeout(() => {
      setFiles([
        { id: '1', recovery_id: recoveryId || 'R-001', filename: 'invoice_2026.pdf', detected_type: 'PDF', size_bytes: 45000, recovery_method: 'FS_UNDELETE', source_engine: 'CATCH FS', fragments_count: 1, integrity_score: 1.0, confidence_score: 1.0, status: 'RECOVERED' },
        { id: '2', recovery_id: recoveryId || 'R-001', filename: 'vacation.jpg', detected_type: 'JPEG', size_bytes: 1250000, recovery_method: 'CARVING', source_engine: 'CATCH Carve', fragments_count: 3, integrity_score: 0.8, confidence_score: 0.9, status: 'PARTIAL' },
        { id: '3', recovery_id: recoveryId || 'R-001', filename: 'budget.xlsx', detected_type: 'ZIP', size_bytes: 25000, recovery_method: 'FS_UNDELETE', source_engine: 'CATCH FS', fragments_count: 1, integrity_score: 1.0, confidence_score: 1.0, status: 'RECOVERED' },
      ]);
      setLoading(false);
    }, 500);
  }, [recoveryId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted mb-4">
        <Link to="/" className="hover:text-primary">CATCH-AI</Link> / 
        {recoveryId && <>
          <Link to={`/recovery/${recoveryId}`} className="hover:text-primary">Recovery</Link> / 
        </>}
        <span className="font-bold text-foreground">Files</span>
      </div>

      <PageHeader
        title="Recovered Files"
        subtitle="Recovery file explorer for extracted and carved files."
      />

      <SectionCard>
        <div className="p-4 border-b border-[var(--border)] flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input type="text" placeholder="Search recovered files..." className="input pl-9 w-full" />
          </div>
          <select className="input max-w-xs">
            <option value="">All Types</option>
            <option value="PDF">PDF</option>
            <option value="JPEG">JPEG</option>
          </select>
          <select className="input max-w-xs">
            <option value="">All Statuses</option>
            <option value="RECOVERED">RECOVERED</option>
            <option value="PARTIAL">PARTIAL</option>
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted">Loading files...</div>
        ) : files.length === 0 ? (
          <EmptyState title="No Files Found" description="No files match the current criteria." />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Filename</th>
                <th>Detected Type</th>
                <th>Size</th>
                <th>Recovery Method</th>
                <th>Fragments</th>
                <th>Integrity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map(f => (
                <tr key={f.id}>
                  <td className="font-bold">{f.filename}</td>
                  <td>{f.detected_type}</td>
                  <td>{(f.size_bytes / 1024).toFixed(1)} KB</td>
                  <td><span className="text-sm px-2 py-1 bg-[var(--surface-active)] rounded">{f.recovery_method}</span></td>
                  <td>{f.fragments_count}</td>
                  <td>
                     <div className="w-16 bg-[var(--surface-active)] h-2 rounded overflow-hidden">
                       <div className="bg-cyan-500 h-full" style={{width: `${f.integrity_score * 100}%`}}></div>
                     </div>
                  </td>
                  <td><StatusBadge label={f.status} level={f.status === 'RECOVERED' ? 'ok' : 'warn'} /></td>
                  <td>
                    <Link to={`/files/${f.id}`} className="btn btn-secondary btn-sm">View Details</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>
    </div>
  );
}
