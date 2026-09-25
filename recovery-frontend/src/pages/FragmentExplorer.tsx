import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader, SectionCard, EmptyState } from '../components/common';
import { fragmentsApi } from '../api/fragments';
import type { Fragment } from '../api/fragments';
import { Search } from 'lucide-react';

export default function FragmentExplorer() {
  const { recoveryId } = useParams<{ recoveryId: string }>();
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fragmentsApi.getFragments(recoveryId).then(res => setFragments(res.data)).catch(() => {});
    
    setTimeout(() => {
      setFragments([
        { id: 'FRAG-001', case_id: 'C-01', evidence_id: 'E-01', recovery_id: 'R-01', offset: 1048576, physical_offset: 1048576, length: 4096, file_type: 'PDF', entropy: 0.94, source_engine: 'CATCH Carve' },
        { id: 'FRAG-002', case_id: 'C-01', evidence_id: 'E-01', recovery_id: 'R-01', offset: 1052672, physical_offset: 1052672, length: 4096, file_type: 'UNKNOWN', entropy: 0.98, source_engine: 'CATCH Carve' },
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
        <span className="font-bold text-foreground">Fragments</span>
      </div>

      <PageHeader
        title="Fragment Explorer"
        subtitle="Explore and analyze data fragments from recovery extraction."
      />

      <SectionCard>
        <div className="p-4 border-b border-[var(--border)] flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input type="text" placeholder="Search fragment ID..." className="input pl-9 w-full" />
          </div>
          <select className="input max-w-xs">
            <option value="">File Type</option>
            <option value="PDF">PDF</option>
            <option value="JPEG">JPEG</option>
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted">Loading fragments...</div>
        ) : fragments.length === 0 ? (
          <EmptyState title="No Fragments" description="No fragments match the criteria." />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Fragment ID</th>
                <th>Offset</th>
                <th>Length</th>
                <th>File Type</th>
                <th>Entropy</th>
                <th>Source Engine</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fragments.map(f => (
                <tr key={f.id}>
                  <td className="mono text-muted">{f.id}</td>
                  <td className="mono">{f.offset}</td>
                  <td>{f.length}</td>
                  <td>{f.file_type || 'Unknown'}</td>
                  <td>
                    <div className="flex items-center gap-2">
                       <span>{f.entropy.toFixed(2)}</span>
                       <div className="w-12 bg-[var(--surface-active)] h-1.5 rounded overflow-hidden">
                         <div className="bg-amber-500 h-full" style={{width: `${f.entropy * 100}%`}}></div>
                       </div>
                    </div>
                  </td>
                  <td>{f.source_engine}</td>
                  <td>
                    <Link to={`/fragments/${f.id}`} className="btn btn-secondary btn-sm">Inspect</Link>
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
