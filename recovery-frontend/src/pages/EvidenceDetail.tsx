import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader, SectionCard, StatusBadge, EmptyState } from '../components/common';
import { evidenceApi } from '../api/evidence';
import type { Evidence, Partition, EngineAnalysis, EvidenceRecoveryJob } from '../api/evidence';
import { Activity, HardDrive, Database, Hash, FileCode, PlayCircle } from 'lucide-react';

export default function EvidenceDetail() {
  const { evidenceId } = useParams<{ evidenceId: string }>();
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const [partitions, setPartitions] = useState<Partition[]>([]);

  const [analysis, setAnalysis] = useState<EngineAnalysis[]>([]);
  const [recoveries, setRecoveries] = useState<EvidenceRecoveryJob[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!evidenceId) return;
    
    // In real app we would use Promise.all and handle errors appropriately
    evidenceApi.getEvidenceById(evidenceId).then(setEvidence).catch(() => {});
    evidenceApi.getEvidencePartitions(evidenceId).then(setPartitions).catch(() => {});
    evidenceApi.getEvidenceAnalysis(evidenceId).then(setAnalysis).catch(() => {});
    evidenceApi.getEvidenceRecoveries(evidenceId).then(setRecoveries).catch(() => {});
    
    // Simulate loading for now since mock API throws on getEvidenceById
    setTimeout(() => {
      setEvidence({
        id: evidenceId,
        case_id: 'CASE-2026-001',
        filename: 'disk01.E01',
        format: 'EWF',
        size_bytes: 256000000000,
        sha256: 'a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3',
        status: 'READY',
        added_at: new Date().toISOString()
      });
      setLoading(false);
    }, 500);

  }, [evidenceId]);

  if (loading) return <div className="p-8 text-center text-muted">Loading evidence details...</div>;
  if (!evidence) return <EmptyState title="Evidence Not Found" description="The requested evidence could not be found." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted mb-4">
        <Link to="/" className="hover:text-primary">CATCH-AI</Link> / 
        <Link to={`/cases/${evidence.case_id}`} className="hover:text-primary">{evidence.case_id}</Link> / 
        <span>Evidence</span> / 
        <span className="font-bold text-foreground">{evidence.filename}</span>
      </div>

      <PageHeader
        title={evidence.filename}
        subtitle={`Evidence ID: ${evidence.id}`}
        actions={
          <div className="flex gap-2">
            <button className="btn btn-secondary">Analyze</button>
            <button className="btn btn-primary"><PlayCircle size={16} className="mr-2" /> Start Recovery</button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard title="1. Evidence Identity" icon={<HardDrive size={18} />}>
          <div className="p-4 space-y-3">
            <div className="flex justify-between border-b border-[var(--border)] pb-2">
              <span className="text-muted">Evidence ID</span>
              <span className="mono">{evidence.id}</span>
            </div>
            <div className="flex justify-between border-b border-[var(--border)] pb-2">
              <span className="text-muted">Case ID</span>
              <span className="mono">{evidence.case_id}</span>
            </div>
            <div className="flex justify-between border-b border-[var(--border)] pb-2">
              <span className="text-muted">Filename</span>
              <span className="font-bold">{evidence.filename}</span>
            </div>
            <div className="flex justify-between border-b border-[var(--border)] pb-2">
              <span className="text-muted">Size</span>
              <span>{(evidence.size_bytes / 1e9).toFixed(2)} GB</span>
            </div>
            <div className="flex justify-between border-b border-[var(--border)] pb-2">
              <span className="text-muted">Format</span>
              <span>{evidence.format}</span>
            </div>
            <div className="flex justify-between border-b border-[var(--border)] pb-2">
              <span className="text-muted">Status</span>
              <StatusBadge label={evidence.status} level="ok" />
            </div>
            <div className="mt-4 p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-center font-bold text-sm tracking-wider rounded">
              READ-ONLY
            </div>
          </div>
        </SectionCard>

        <SectionCard title="2. Cryptographic Hash" icon={<Hash size={18} />}>
          <div className="p-4 flex flex-col items-center justify-center h-full min-h-[200px]">
             {evidence.sha256 ? (
               <>
                 <div className="text-sm text-muted mb-2">SHA-256</div>
                 <div className="font-mono bg-[var(--surface-active)] p-4 rounded-lg break-all text-center border border-[var(--border)]">
                   {evidence.sha256}
                 </div>
                 <button className="btn btn-secondary btn-sm mt-4">Copy Hash</button>
               </>
             ) : (
               <div className="text-muted">Hash Not Available</div>
             )}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard title="4. Partitions" icon={<Database size={18} />}>
          {partitions.length === 0 ? (
            <div className="p-4 text-center text-muted">No partition information available.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Partition</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Filesystem</th>
                </tr>
              </thead>
              <tbody>
                {partitions.map(p => (
                  <tr key={p.id}>
                    <td className="mono">{p.id}</td>
                    <td>{p.type}</td>
                    <td>{(p.size_bytes / 1e9).toFixed(2)} GB</td>
                    <td>{p.filesystem || 'Unknown'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>

        <SectionCard title="6. Engine Analysis" icon={<FileCode size={18} />}>
           {analysis.length === 0 ? (
             <div className="p-4 text-center text-muted">Analysis data not available.</div>
           ) : (
             <table className="data-table">
                <thead>
                  <tr>
                    <th>Engine</th>
                    <th>Operation</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.map((a, i) => (
                    <tr key={i}>
                      <td className="font-bold">{a.engine}</td>
                      <td>{a.operation}</td>
                      <td>
                         <StatusBadge label={a.status} level={a.status === 'USED' ? 'ok' : a.status === 'FAILED' ? 'error' : 'neutral'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
           )}
        </SectionCard>
      </div>
      
      <SectionCard title="7. Recovery Jobs" icon={<Activity size={18} />}>
        {recoveries.length === 0 ? (
          <div className="p-6 text-center text-muted">
            <p>No recovery jobs found for this evidence.</p>
            <button className="btn btn-primary mt-4">Start Recovery</button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Recovery ID</th>
                <th>Status</th>
                <th>Started</th>
                <th>Recovered Files</th>
                <th>Fragments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recoveries.map(r => (
                <tr key={r.id}>
                  <td className="mono text-muted">{r.id.substring(0,8)}</td>
                  <td><StatusBadge label={r.status} level={r.status === 'COMPLETED' ? 'ok' : 'info'} /></td>
                  <td className="text-sm">{new Date(r.started_at).toLocaleString()}</td>
                  <td>{r.recovered_files_count}</td>
                  <td>{r.fragments_count}</td>
                  <td>
                    <Link to={`/recovery/${r.id}`} className="btn btn-secondary btn-sm">Open</Link>
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
