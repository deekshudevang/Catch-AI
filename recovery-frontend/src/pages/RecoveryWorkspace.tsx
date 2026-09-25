import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader, SectionCard, StatusBadge, EmptyState } from '../components/common';
import { recoveryApi } from '../api/recovery';
import type { RecoveryJob, EngineExecution } from '../api/recovery';
import { Activity, Server, FileText, Database, GitMerge } from 'lucide-react';

export default function RecoveryWorkspace() {
  const { recoveryId } = useParams<{ recoveryId: string }>();
  const [job, setJob] = useState<RecoveryJob | null>(null);
  const [engines, setEngines] = useState<EngineExecution[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!recoveryId) return;
    
    Promise.all([
      recoveryApi.getRecoveryJob(recoveryId).then(setJob).catch(() => {}),
      recoveryApi.getEngineExecutions(recoveryId).then(setEngines).catch(() => {})
    ]).finally(() => {
      setLoading(false);
    });

  }, [recoveryId]);

  if (loading) return <div className="p-8 text-center text-muted">Loading recovery workspace...</div>;
  if (!job) return <EmptyState title="Recovery Not Found" description="The requested recovery job could not be found." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted mb-4">
        <Link to="/" className="hover:text-primary">CATCH-AI</Link> / 
        <Link to={`/cases/${job.case_id}`} className="hover:text-primary">{job.case_id}</Link> / 
        <Link to={`/evidence/${job.evidence_id}`} className="hover:text-primary">Evidence</Link> / 
        <span>Recovery</span> / 
        <span className="font-bold text-foreground mono">{job.id.substring(0, 8)}</span>
      </div>

      <PageHeader
        title={`Recovery Job ${job.id.substring(0, 8)}`}
        subtitle="Recovery extraction, carving, and reconstruction pipeline."
        actions={
          <div className="flex gap-2">
            <Link to={`/recovery/${job.id}/files`} className="btn btn-primary"><FileText size={16} className="mr-2" /> View Files</Link>
            <Link to={`/recovery/${job.id}/fragments`} className="btn btn-secondary"><Database size={16} className="mr-2" /> View Fragments</Link>
            <Link to={`/graph/${job.id}`} className="btn btn-secondary"><GitMerge size={16} className="mr-2" /> Open Graph</Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <SectionCard className="p-4 flex flex-col items-center justify-center">
            <div className="text-muted text-sm uppercase tracking-wider mb-2">Status</div>
            <StatusBadge label={job.status} level={job.status === 'COMPLETED' ? 'ok' : 'info'} />
         </SectionCard>
         <SectionCard className="p-4 flex flex-col items-center justify-center">
            <div className="text-muted text-sm uppercase tracking-wider mb-2">Started</div>
            <div className="font-bold">{new Date(job.started_at).toLocaleTimeString()}</div>
         </SectionCard>
         <SectionCard className="p-4 flex flex-col items-center justify-center">
            <div className="text-muted text-sm uppercase tracking-wider mb-2">Recovered</div>
            <div className="font-bold text-2xl text-cyan-400">{job.recovered}</div>
         </SectionCard>
         <SectionCard className="p-4 flex flex-col items-center justify-center">
            <div className="text-muted text-sm uppercase tracking-wider mb-2">Fragments</div>
            <div className="font-bold text-2xl text-amber-400">{job.fragments.toLocaleString()}</div>
         </SectionCard>
      </div>

      <SectionCard title="Live Recovery Pipeline" icon={<Activity size={18} />}>
        <div className="p-4">
          <div className="text-muted italic mb-4">Pipeline visualization...</div>
          {/* Simple textual representation instead of full visual pipeline for now */}
          <div className="flex flex-wrap gap-2 text-sm text-muted items-center">
             <span className="bg-cyan-500/10 text-cyan-500 px-2 py-1 rounded">Evidence</span> →
             <span className="bg-cyan-500/10 text-cyan-500 px-2 py-1 rounded">Hash</span> →
             <span className="bg-cyan-500/10 text-cyan-500 px-2 py-1 rounded">Image Detection</span> →
             <span className="bg-cyan-500/10 text-cyan-500 px-2 py-1 rounded">Filesystem Recovery</span> →
             <span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded">Fragment Analysis</span> →
             <span className="bg-[var(--surface-active)] px-2 py-1 rounded">Graph</span>
          </div>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard title="Engine Execution" icon={<Server size={18} />}>
          {engines.length === 0 ? (
             <div className="p-4 text-center text-muted">No execution records found.</div>
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
                {engines.map(e => (
                  <tr key={e.id}>
                    <td className="font-bold">{e.engine}</td>
                    <td>{e.operation}</td>
                    <td><StatusBadge label={e.status} level={e.status === 'USED' ? 'ok' : e.status === 'FAILED' ? 'error' : 'neutral'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
        
        <SectionCard title="Recovery Results" icon={<FileText size={18} />}>
           <div className="p-4 space-y-2">
             <div className="flex justify-between border-b border-[var(--border)] pb-2">
                <span className="text-muted">Files Found</span>
                <span className="font-bold">{job.files_found.toLocaleString()}</span>
             </div>
             <div className="flex justify-between border-b border-[var(--border)] pb-2">
                <span className="text-muted">Deleted Files</span>
                <span className="font-bold">{job.deleted_files.toLocaleString()}</span>
             </div>
             <div className="flex justify-between border-b border-[var(--border)] pb-2">
                <span className="text-muted">Recoverable</span>
                <span className="font-bold text-cyan-500">{job.recoverable.toLocaleString()}</span>
             </div>
             <div className="flex justify-between border-b border-[var(--border)] pb-2">
                <span className="text-muted">Partial</span>
                <span className="font-bold text-amber-500">{job.partial.toLocaleString()}</span>
             </div>
             <div className="flex justify-between border-b border-[var(--border)] pb-2">
                <span className="text-muted">Reconstructions</span>
                <span className="font-bold">{job.reconstructions.toLocaleString()}</span>
             </div>
           </div>
        </SectionCard>
      </div>

    </div>
  );
}
