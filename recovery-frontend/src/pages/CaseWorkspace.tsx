import { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { SectionCard, StatusBadge, ErrorState, LoadingState, EmptyState } from '../components/common';
import { casesApi } from '../api/cases';
import type { Case, CaseEvidence, CaseRecovery, CaseFile, CaseTimelineEvent, CaseFragment, CaseGraphData, CaseValidation, CaseReport, CaseAudit } from '../api/cases';
import { Briefcase, HardDrive, Activity, FileText, Database, GitBranch, Shield, Clock, Search, Play, CheckCircle, AlertTriangle, FileBox } from 'lucide-react';
import './CaseWorkspace.css';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Briefcase },
  { id: 'evidence', label: 'Evidence', icon: HardDrive },
  { id: 'recovery', label: 'Recovery', icon: Activity },
  { id: 'files', label: 'Files', icon: FileBox },
  { id: 'fragments', label: 'Fragments', icon: Database },
  { id: 'graph', label: 'Graph', icon: GitBranch },
  { id: 'validation', label: 'Validation', icon: Shield },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'audit', label: 'Audit', icon: Search },
];

export default function CaseWorkspace() {
  const { caseId } = useParams<{ caseId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract tab from URL hash, e.g. /cases/123#evidence, default to 'overview'
  // Or could use nested routes, but hash based is easy for now, prompt said:
  // /cases/123/evidence etc, I will use nested routes or just read the pathname.
  // Actually, let's just use internal state with hash for simplicity, or we can use sub-routes.
  // The prompt asked for `/cases/123/evidence`. 
  // Let's parse it from location.pathname
  const pathParts = location.pathname.split('/');
  const activeTab = pathParts.length > 3 ? pathParts[3] : 'overview';

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!caseId) return;
    casesApi.getCase(caseId)
      .then(setCaseData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [caseId]);

  if (loading) return <div className="page"><LoadingState label="Loading Case Workspace..." /></div>;
  if (error) return <div className="page"><ErrorState message={error} /></div>;
  if (!caseData) return <div className="page"><EmptyState title="Case not found" /></div>;

  const handleTabClick = (tabId: string) => {
    navigate(`/cases/${caseData.id}${tabId === 'overview' ? '' : `/${tabId}`}`);
  };

  const getStatusLevel = (status: string) => {
    const s = status.toUpperCase();
    if (['COMPLETED', 'ANALYSIS_COMPLETE'].includes(s)) return 'ok';
    if (['FAILED'].includes(s)) return 'error';
    if (['PARTIAL', 'NEW'].includes(s)) return 'warning';
    return 'running';
  };

  return (
    <div className="case-workspace">
      {/* Case Header */}
      <div className="case-header">
        <div className="case-breadcrumbs">
          <Link to="/dashboard">CATCH-AI</Link> / <Link to="/cases">Cases</Link> / <span>{caseData.id}</span>
        </div>
        <div className="case-header-content">
          <div className="case-header-info">
            <h1>{caseData.name}</h1>
            <div className="case-meta">
              <span className="mono">{caseData.id}</span>
              <span className="divider">•</span>
              <StatusBadge label={caseData.status} level={getStatusLevel(caseData.status)} />
              <span className="divider">•</span>
              <span className="text-muted">Created: {new Date(caseData.created_at).toLocaleDateString()}</span>
              <span className="divider">•</span>
              <span className="text-muted">Updated: {new Date(caseData.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="case-header-actions">
            <button className="btn btn-secondary"><HardDrive size={16}/> Add Evidence</button>
            <button className="btn btn-primary" disabled={caseData.evidence_count === 0}><Play size={16}/> Start Recovery</button>
            <button className="btn btn-secondary" disabled={caseData.status === 'NEW'}><FileText size={16}/> Generate Report</button>
          </div>
        </div>
      </div>

      <div className="case-body">
        {/* Case Nav */}
        <div className="case-nav">
          {TABS.map(tab => (
            <button 
              key={tab.id} 
              className={`case-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Case Content */}
        <div className="case-content">
          {activeTab === 'overview' && <CaseOverview caseData={caseData} />}
          {activeTab === 'evidence' && <CaseEvidenceView caseId={caseData.id} />}
          {activeTab === 'recovery' && <CaseRecoveryView caseId={caseData.id} />}
          {activeTab === 'files' && <CaseFilesView caseId={caseData.id} />}
          {activeTab === 'fragments' && <CaseFragmentsView caseId={caseData.id} />}
          {activeTab === 'graph' && <CaseGraphView caseId={caseData.id} />}
          {activeTab === 'validation' && <CaseValidationView caseId={caseData.id} />}
          {activeTab === 'timeline' && <CaseTimelineView caseId={caseData.id} />}
          {activeTab === 'reports' && <CaseReportsView caseId={caseData.id} />}
          {activeTab === 'audit' && <CaseAuditView caseId={caseData.id} />}
          {!['overview', 'evidence', 'recovery', 'files', 'fragments', 'graph', 'validation', 'timeline', 'reports', 'audit'].includes(activeTab) && (
             <EmptyState title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Workspace`} description="This section is under construction." />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-views ────────────────────────────────────────────────────────────────

function CaseOverview({ caseData }: { caseData: Case }) {
  return (
    <div className="case-overview">
      <div className="overview-stats-grid">
        <div className="card-2 p-4">
          <div className="text-muted text-xs uppercase tracking-wider mb-1">Evidence Images</div>
          <div className="text-2xl font-bold">{caseData.evidence_count}</div>
        </div>
        <div className="card-2 p-4">
          <div className="text-muted text-xs uppercase tracking-wider mb-1">Recovery Jobs</div>
          <div className="text-2xl font-bold">{caseData.recoveries_count}</div>
        </div>
        <div className="card-2 p-4">
          <div className="text-muted text-xs uppercase tracking-wider mb-1">Validation Issues</div>
          <div className="text-2xl font-bold text-amber">0</div>
        </div>
      </div>
      
      <div className="pipeline-preview mt-6">
        <SectionCard title="Recovery Pipeline Status">
          <div className="pipeline-steps p-4 flex items-center justify-between">
            <PipelineStep name="Evidence" status="COMPLETED" />
            <PipelineStep name="Image Analysis" status="COMPLETED" />
            <PipelineStep name="Filesystem" status="COMPLETED" />
            <PipelineStep name="Recovery" status="RUNNING" />
            <PipelineStep name="Fragments" status="PENDING" />
            <PipelineStep name="Graph" status="PENDING" />
          </div>
        </SectionCard>
      </div>

      <div className="graph-preview mt-6">
        <SectionCard title="Case Graph Preview" actions={<button className="btn btn-secondary btn-sm">Open Full Graph</button>}>
           <div className="p-8 flex justify-center text-muted">
              {caseData.recoveries_count > 0 ? "Loading graph preview..." : "No fragment graph available for this case."}
           </div>
        </SectionCard>
      </div>
    </div>
  );
}

function PipelineStep({ name, status }: { name: string, status: string }) {
  const getIcon = () => {
    if (status === 'COMPLETED') return <CheckCircle size={20} className="text-green" />;
    if (status === 'RUNNING') return <div className="spin text-cyan"><Activity size={20} /></div>;
    if (status === 'FAILED') return <AlertTriangle size={20} className="text-red" />;
    return <div style={{width: 20, height: 20, borderRadius: '50%', border: '2px dashed var(--text-3)'}} />;
  };
  return (
    <div className="pipeline-step flex flex-col items-center gap-2">
      {getIcon()}
      <span className="text-sm">{name}</span>
      <span className="text-xs text-muted">{status}</span>
    </div>
  );
}

function CaseEvidenceView({ caseId }: { caseId: string }) {
  const [evidence, setEvidence] = useState<CaseEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    casesApi.getCaseEvidence(caseId).then(setEvidence).catch(err => setError(err.message)).finally(() => setLoading(false));
  }, [caseId]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  
  return (
    <SectionCard title="Case Evidence">
      {evidence.length === 0 ? (
        <div className="p-8">
          <EmptyState title="No Evidence" description="No recovery evidence has been added to this case." action={<button className="btn btn-primary">Add Evidence</button>} />
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Filename</th>
              <th>Format</th>
              <th>Size</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {evidence.map(e => (
              <tr key={e.id}>
                <td className="mono text-muted">{e.id.substring(0, 8)}</td>
                <td>{e.filename}</td>
                <td>{e.format}</td>
                <td>{(e.size_bytes / 1024 / 1024 / 1024).toFixed(2)} GB</td>
                <td><StatusBadge label={e.status} level="ok" /></td>
                <td>
                   <div className="flex gap-2">
                     <button className="btn btn-secondary btn-sm">Analyze</button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </SectionCard>
  );
}

function CaseRecoveryView({ caseId }: { caseId: string }) {
  const [recoveries, setRecoveries] = useState<CaseRecovery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    casesApi.getCaseRecoveries(caseId).then(setRecoveries).catch(err => setError(err.message)).finally(() => setLoading(false));
  }, [caseId]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  
  return (
    <SectionCard title="Recovery Jobs">
      {recoveries.length === 0 ? (
        <div className="p-8">
          <EmptyState title="No Recoveries" description="No recovery jobs have been executed." action={<button className="btn btn-primary">Start Recovery</button>} />
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Started</th>
              <th>Fragments</th>
              <th>Files</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recoveries.map(r => (
              <tr key={r.id}>
                <td className="mono text-muted">{r.id.substring(0, 8)}</td>
                <td><StatusBadge label={r.status} level={r.status === 'COMPLETED' ? 'ok' : 'running'} /></td>
                <td>{new Date(r.started_at).toLocaleString()}</td>
                <td>{r.fragments_extracted.toLocaleString()}</td>
                <td>{r.files_recovered.toLocaleString()}</td>
                <td>
                   <div className="flex gap-2">
                     <button className="btn btn-secondary btn-sm">View Graph</button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </SectionCard>
  );
}

function CaseFilesView({ caseId }: { caseId: string }) {
  const [files, setFiles] = useState<CaseFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    casesApi.getCaseFiles(caseId).then(setFiles).catch(err => setError(err.message)).finally(() => setLoading(false));
  }, [caseId]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  
  return (
    <SectionCard title="Recovered Files">
      {files.length === 0 ? (
        <div className="p-8">
          <EmptyState title="No Files" description="No files have been recovered yet." />
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Filename</th>
              <th>Type</th>
              <th>Size</th>
              <th>Confidence</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {files.map(f => (
              <tr key={f.id}>
                <td className="truncate" style={{maxWidth: 200}} title={f.filename}>{f.filename}</td>
                <td>{f.detected_type}</td>
                <td>{(f.size_bytes / 1024).toFixed(1)} KB</td>
                <td>{(f.confidence * 100).toFixed(1)}%</td>
                <td><StatusBadge label={f.status} level="ok" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </SectionCard>
  );
}

function CaseTimelineView({ caseId }: { caseId: string }) {
  const [events, setEvents] = useState<CaseTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    casesApi.getCaseTimeline(caseId).then(setEvents).catch(err => setError(err.message)).finally(() => setLoading(false));
  }, [caseId]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  
  return (
    <SectionCard title="Case Activity Timeline">
      {events.length === 0 ? (
        <div className="p-8">
          <EmptyState title="No Activity" description="No events recorded for this case." />
        </div>
      ) : (
        <div className="p-4 flex flex-col gap-4">
           {events.map(ev => (
             <div key={ev.id} className="flex gap-4 items-start border-l-2 border-cyan pl-4">
                <div className="text-muted text-sm" style={{width: 150}}>{new Date(ev.timestamp).toLocaleString()}</div>
                <div>
                  <div className="font-bold">{ev.type}</div>
                  <div className="text-sm text-muted">{ev.description}</div>
                  <div className="text-xs text-muted mt-1">Actor: {ev.actor}</div>
                </div>
             </div>
           ))}
        </div>
      )}
    </SectionCard>
  );
}

function CaseFragmentsView({ caseId }: { caseId: string }) {
  const [fragments, setFragments] = useState<CaseFragment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    casesApi.getCaseFragments(caseId).then(setFragments).catch(err => setError(err.message)).finally(() => setLoading(false));
  }, [caseId]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  
  return (
    <SectionCard title="Data Fragments">
      {fragments.length === 0 ? (
        <div className="p-8">
          <EmptyState title="No Fragments" description="No fragments have been extracted yet." />
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Offset</th>
              <th>Size</th>
              <th>Entropy</th>
              <th>Magic Bytes</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {fragments.map(f => (
              <tr key={f.id}>
                <td className="mono text-muted">{f.id.substring(0, 8)}</td>
                <td className="mono">0x{f.offset.toString(16)}</td>
                <td>{f.size_bytes} B</td>
                <td>{f.entropy.toFixed(2)}</td>
                <td className="mono">{f.magic_bytes || '-'}</td>
                <td><StatusBadge label={f.status} level="ok" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </SectionCard>
  );
}

function CaseGraphView({ caseId }: { caseId: string }) {
  const [graph, setGraph] = useState<CaseGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    casesApi.getCaseGraph(caseId).then(setGraph).catch(err => setError(err.message)).finally(() => setLoading(false));
  }, [caseId]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  
  return (
    <SectionCard title="Fragment Reconstruction Graph">
      {!graph || graph.nodes.length === 0 ? (
        <div className="p-8">
          <EmptyState title="No Graph" description="Graph has not been generated for this case." />
        </div>
      ) : (
        <div className="p-8 text-center text-muted">
          <p>Graph visualization placeholder. Total nodes: {graph.nodes.length}, Total edges: {graph.edges.length}</p>
          <div className="flex justify-center mt-4">
             <div style={{width: '100%', height: 400, border: '1px dashed var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <GitBranch size={48} className="text-muted" opacity={0.2} />
             </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

function CaseValidationView({ caseId }: { caseId: string }) {
  const [validations, setValidations] = useState<CaseValidation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    casesApi.getCaseValidation(caseId).then(setValidations).catch(err => setError(err.message)).finally(() => setLoading(false));
  }, [caseId]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  
  return (
    <SectionCard title="Validation Results">
      {validations.length === 0 ? (
        <div className="p-8">
          <EmptyState title="No Validation Results" description="No validations have been executed for this case." />
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Rule</th>
              <th>Status</th>
              <th>Message</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {validations.map(v => (
              <tr key={v.id}>
                <td className="font-bold">{v.rule}</td>
                <td><StatusBadge label={v.status} level={v.status === 'PASSED' ? 'ok' : 'error'} /></td>
                <td>{v.message}</td>
                <td className="text-muted text-sm">{new Date(v.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </SectionCard>
  );
}

function CaseReportsView({ caseId }: { caseId: string }) {
  const [reports, setReports] = useState<CaseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    casesApi.getCaseReports(caseId).then(setReports).catch(err => setError(err.message)).finally(() => setLoading(false));
  }, [caseId]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  
  return (
    <SectionCard title="Generated Reports">
      {reports.length === 0 ? (
        <div className="p-8">
          <EmptyState title="No Reports" description="No reports have been generated for this case." action={<button className="btn btn-primary">Generate Report</button>} />
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.id}>
                <td className="font-bold">{r.title}</td>
                <td>{r.type}</td>
                <td className="text-muted text-sm">{new Date(r.created_at).toLocaleString()}</td>
                <td>
                  <a href={r.url} className="btn btn-secondary btn-sm" target="_blank" rel="noreferrer">Download</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </SectionCard>
  );
}

function CaseAuditView({ caseId }: { caseId: string }) {
  const [audits, setAudits] = useState<CaseAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    casesApi.getCaseAudit(caseId).then(setAudits).catch(err => setError(err.message)).finally(() => setLoading(false));
  }, [caseId]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  
  return (
    <SectionCard title="Audit Log">
      {audits.length === 0 ? (
        <div className="p-8">
          <EmptyState title="No Audit Records" description="No audit log available." />
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {audits.map(a => (
              <tr key={a.id}>
                <td className="text-muted text-sm">{new Date(a.timestamp).toLocaleString()}</td>
                <td className="font-bold">{a.user}</td>
                <td>{a.action}</td>
                <td className="text-muted">{a.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </SectionCard>
  );
}
