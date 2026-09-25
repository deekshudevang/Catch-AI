import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, SectionCard, StatusBadge, EmptyState } from '../components/common';
import { evidenceApi } from '../api/evidence';
import type { Evidence } from '../api/evidence';
import { Plus, Search } from 'lucide-react';

export default function EvidenceList() {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    evidenceApi.getEvidenceList().then(setEvidence).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evidence"
        subtitle="Manage disk images and evidence associated with investigations."
        actions={
          <Link to="/evidence/new" className="btn btn-primary">
            <Plus size={16} className="mr-2" /> Add Evidence
          </Link>
        }
      />

      <SectionCard>
        <div className="p-4 border-b border-[var(--border)] flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input type="text" placeholder="Search evidence..." className="input pl-9 w-full" />
          </div>
          <select className="input max-w-xs">
            <option value="">All Formats</option>
            <option value="E01">E01</option>
            <option value="RAW">RAW</option>
          </select>
          <select className="input max-w-xs">
            <option value="">All Statuses</option>
            <option value="READY">READY</option>
            <option value="ANALYZING">ANALYZING</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted">Loading...</div>
        ) : evidence.length === 0 ? (
          <div className="p-8">
            <EmptyState title="No Evidence" description="Add evidence to begin analysis." action={
              <Link to="/evidence/new" className="btn btn-primary mt-4">Add Evidence</Link>
            } />
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Evidence ID</th>
                <th>Filename</th>
                <th>Format</th>
                <th>Size</th>
                <th>Status</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {evidence.map(e => (
                <tr key={e.id}>
                  <td className="mono text-muted">{e.id.substring(0, 8)}</td>
                  <td className="font-bold">{e.filename}</td>
                  <td>{e.format}</td>
                  <td>{(e.size_bytes / 1e9).toFixed(2)} GB</td>
                  <td><StatusBadge label={e.status} level={e.status === 'READY' ? 'ok' : e.status === 'FAILED' ? 'error' : 'warn'} /></td>
                  <td className="text-muted text-sm">{new Date(e.added_at).toLocaleDateString()}</td>
                  <td className="flex gap-2">
                    <Link to={`/evidence/${e.id}`} className="btn btn-secondary btn-sm">Open</Link>
                    <button className="btn btn-secondary btn-sm">Analyze</button>
                    <button className="btn btn-primary btn-sm">Start Recovery</button>
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
