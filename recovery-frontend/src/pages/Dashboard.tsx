import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, HardDrive, Server, Database, RefreshCw, Activity } from 'lucide-react';
import { backendApi } from '../api/client';
import type { RecoveryJob, HealthResponse } from '../api/client';
import { PageHeader, SectionCard, StatusBadge, StatusDot, ErrorState, LoadingState, EmptyState } from '../components/common';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [jobs, setJobs] = useState<RecoveryJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const [imagePath, setImagePath] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);

  const [pipelineStage, setPipelineStage] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch data in parallel
      const [healthData, jobsData] = await Promise.all([
        backendApi.health().catch(_ => null),
        backendApi.jobs().catch(_ => ({ jobs: [] }))
      ]);
      if (healthData) setHealth(healthData);
      if (jobsData) setJobs(jobsData.jobs || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleStartRecovery = async () => {
    if (!imagePath) return;
    setIsRecovering(true);
    setPipelineStage(1);

    // Simulate pipeline progression
    const interval = setInterval(() => {
      setPipelineStage(prev => (prev < 5 ? prev + 1 : prev));
    }, 1500);

    try {
      await backendApi.scan(imagePath);
      setImagePath('');
      setPipelineStage(6); // complete
      fetchData(); // refresh jobs list
    } catch (err: any) {
      alert(`Recovery failed: ${err.message}`);
      setPipelineStage(0);
    } finally {
      clearInterval(interval);
      setIsRecovering(false);
      setTimeout(() => setPipelineStage(0), 3000);
    }
  };

  // Compute aggregate stats from jobs
  const completedJobs = jobs.filter(j => j.status === 'COMPLETED');
  const totalFragments = completedJobs.reduce((sum, j) => sum + (j.fragments || 0), 0);
  const totalCarved = completedJobs.reduce((sum, j) => sum + (j.carved_files || 0), 0);
  const activeJobs = jobs.filter(j => j.status === 'RUNNING' || j.status === 'PROCESSING');

  return (
    <div className="page">
      <PageHeader
        title="Recovery Dashboard"
        subtitle="Real-time overview of digital evidence recovery operations"
        actions={
          <button className="btn btn-secondary" onClick={fetchData}>
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            Refresh
          </button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
        <div className="card-2" style={{ padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
          <div style={{ padding: 'var(--sp-3)', background: 'var(--cyan-dim)', color: 'var(--cyan)', borderRadius: 'var(--r-md)' }}>
            <HardDrive size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Images Processed</div>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}>{jobs.length}</div>
          </div>
        </div>

        <div className="card-2" style={{ padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
          <div style={{ padding: 'var(--sp-3)', background: 'var(--amber-dim)', color: 'var(--amber)', borderRadius: 'var(--r-md)' }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fragments Recovered</div>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}>{totalFragments.toLocaleString()}</div>
          </div>
        </div>

        <div className="card-2" style={{ padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
          <div style={{ padding: 'var(--sp-3)', background: 'var(--blue-dim)', color: 'var(--blue)', borderRadius: 'var(--r-md)' }}>
            <Server size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Carved Files</div>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}>{totalCarved.toLocaleString()}</div>
          </div>
        </div>

        <div className="card-2" style={{ padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
          <div style={{ padding: 'var(--sp-3)', background: 'var(--green-dim)', color: 'var(--green)', borderRadius: 'var(--r-md)' }}>
            <Server size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Core System</div>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              {health?.status === 'OK' ? <StatusDot level="ok" /> : <StatusDot level="error" />}
              {health?.status || 'Unknown'}
            </div>
          </div>
        </div>

        <div className="card-2" style={{ padding: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
          <div style={{ padding: 'var(--sp-3)', background: 'var(--purple-dim)', color: 'var(--purple)', borderRadius: 'var(--r-md)' }}>
            <Database size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Jobs</div>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}>{activeJobs.length}</div>
          </div>
        </div>
      </div>

      {selectedJobId && (
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px',
          background: 'var(--surface)', borderLeft: '1px solid var(--border)',
          zIndex: 100, padding: 'var(--sp-6)', boxShadow: '-4px 0 16px rgba(0,0,0,0.5)',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>Artifact Details</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedJobId(null)}>Close</button>
          </div>
          <p style={{ color: 'var(--text-3)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-4)' }}>
            Showing artifacts for Job <strong>{selectedJobId}</strong>
          </p>
          <div className="card-2" style={{ padding: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
            <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-2)', marginBottom: 'var(--sp-2)' }}>Extracted Fragments</h3>
            <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: 'var(--cyan)' }}>
              {jobs.find(j => String(j.id) === selectedJobId)?.fragments || 0}
            </p>
          </div>
          <div className="card-2" style={{ padding: 'var(--sp-4)' }}>
            <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-2)', marginBottom: 'var(--sp-2)' }}>Carved Files</h3>
            <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: 'var(--amber)' }}>
              {jobs.find(j => String(j.id) === selectedJobId)?.carved_files || 0}
            </p>
          </div>
          <div style={{ marginTop: 'var(--sp-6)' }}>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate(`/recovery/${selectedJobId}`)}>
              Open Full Case Workspace
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--sp-6)' }}>

        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          <SectionCard title="New Recovery Job">
            <div style={{ padding: 'var(--sp-4)', display: 'flex', gap: 'var(--sp-2)' }}>
              <input
                type="text"
                placeholder="Enter absolute path to evidence image (e.g., /data/evidence.raw)"
                value={imagePath}
                onChange={e => setImagePath(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleStartRecovery()}
              />
              <button
                className="btn btn-primary"
                onClick={handleStartRecovery}
                disabled={!imagePath || isRecovering}
              >
                {isRecovering ? <RefreshCw size={16} className="spin" /> : <Play size={16} />}
                Start Recovery
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Recent Jobs">
            {error ? (
              <ErrorState message={error} onRetry={fetchData} />
            ) : loading && jobs.length === 0 ? (
              <LoadingState />
            ) : jobs.length === 0 ? (
              <EmptyState title="No Jobs Found" description="Start a new recovery job to see it here." icon={<HardDrive size={32} />} />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ fontSize: 'var(--text-sm)' }}>
                  <thead>
                    <tr>
                      <th>JOB ID</th>
                      <th>EVIDENCE</th>
                      <th>STATUS</th>
                      <th>CREATED</th>
                      <th>STARTED</th>
                      <th>COMPLETED</th>
                      <th>DURATION</th>
                      <th>ARTIFACTS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map(job => {
                      const formatDate = (dStr?: string) => dStr && !isNaN(new Date(dStr).getTime()) ? new Date(dStr).toLocaleTimeString() : '-';
                      return (
                      <tr
                        key={job.id}
                        onClick={() => setSelectedJobId(String(job.id))}
                        style={{ cursor: 'pointer', background: selectedJobId === String(job.id) ? 'var(--surface-active)' : 'transparent' }}
                        className="hover:bg-[var(--surface-active)]"
                      >
                        <td className="mono">{String(job.id).substring(0,8)}</td>
                        <td className="truncate" style={{ maxWidth: '150px' }} title={job.image_path || job.evidence}>{String(job.image_path || job.evidence || '').split('/').pop()}</td>
                        <td>
                          <StatusBadge
                            label={job.status}
                            level={job.status === 'COMPLETED' ? 'ok' : job.status === 'FAILED' ? 'error' : 'running'}
                          />
                        </td>
                        <td>{formatDate(job.created_at)}</td>
                        <td>{formatDate(job.started_at)}</td>
                        <td>{formatDate(job.completed_at)}</td>
                        <td>{job.duration || '-'}</td>
                        <td>{job.artifacts !== undefined ? job.artifacts.toLocaleString() : '-'}</td>
                        <td>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/recovery/${job.id}`);
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          <SectionCard title="Active Pipeline Engines">
            <div style={{ padding: 'var(--sp-4)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                {[
                  "Orchestrator Initialization",
                  "File System Image Scan",
                  "File Carving (catch-carving)",
                  "Deep Recovery (catch-deep-recovery)",
                  "Graph-Based Reconstruction (Phase 4)",
                  "Validation"
                ].map((step, idx) => {
                  const isActive = isRecovering && pipelineStage === idx + 1;
                  const isCompleted = pipelineStage > idx + 1;
                  return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: isActive ? 'var(--cyan)' : isCompleted ? 'var(--green-dim)' : 'var(--border-2)',
                      color: isActive ? '#000' : isCompleted ? 'var(--green)' : 'var(--text-3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 'var(--text-xs)', fontWeight: 'bold'
                    }}>
                      {isActive ? <RefreshCw size={12} className="spin" /> : idx + 1}
                    </div>
                    <div style={{ color: isActive ? 'var(--text)' : 'var(--text-2)', fontSize: 'var(--text-sm)', flex: 1, fontWeight: isActive ? 600 : 400 }}>{step}</div>
                  </div>
                )})}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Engine Status">
            {health ? (
              <div style={{ padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {Object.entries(health.engines).map(([name, status]) => (
                  <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 'var(--text-sm)' }}>{name}</span>
                    <StatusBadge label={status as string} level={status === 'OK' ? 'ok' : 'error'} />
                  </div>
                ))}
              </div>
            ) : (
              <LoadingState label="Checking health..." />
            )}
          </SectionCard>
        </div>

      </div>
    </div>
  );
}
