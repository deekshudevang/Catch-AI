import { useEffect, useState } from 'react';
import { Play, HardDrive, Server, Database, RefreshCw, AlertTriangle, Activity } from 'lucide-react';
import { backendApi } from '../api/client';
import type { RecoveryJob, HealthResponse } from '../api/client';
import { PageHeader, SectionCard, StatusBadge, StatusDot, ErrorState, LoadingState, EmptyState } from '../components/common';
import './Dashboard.css';

export default function Dashboard() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [jobs, setJobs] = useState<RecoveryJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [imagePath, setImagePath] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);

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
    try {
      await backendApi.scan(imagePath);
      setImagePath('');
      fetchData(); // refresh jobs list
    } catch (err: any) {
      alert(`Recovery failed: ${err.message}`);
    } finally {
      setIsRecovering(false);
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
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Target Image</th>
                    <th>Status</th>
                    <th>Fragments</th>
                    <th>Carved</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.slice(0, 5).map(job => (
                    <tr key={job.id}>
                      <td className="mono">{job.id}</td>
                      <td className="truncate" style={{ maxWidth: '200px' }} title={job.image_path}>{job.image_path}</td>
                      <td>
                        <StatusBadge 
                          label={job.status} 
                          level={job.status === 'COMPLETED' ? 'ok' : job.status === 'FAILED' ? 'error' : 'running'} 
                        />
                      </td>
                      <td>{job.fragments > 0 ? job.fragments.toLocaleString() : '-'}</td>
                      <td>{job.carved_files !== undefined && job.carved_files > 0 ? job.carved_files.toLocaleString() : '-'}</td>
                      <td>{new Date(job.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </SectionCard>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          <SectionCard title="System Alerts">
            <div style={{ padding: 'var(--sp-4)' }}>
              <EmptyState 
                title="NOT_AVAILABLE" 
                description="System alerts telemetry is not currently provided by the backend API." 
                icon={<AlertTriangle size={24} />} 
              />
            </div>
          </SectionCard>

          <SectionCard title="CATCH-AI Forensic Workflow">
            <div style={{ padding: 'var(--sp-4)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                {[
                  "Evidence", "Engine Selection (raw/carved)", "Recovery Pipeline", 
                  "Fragments", "Relationships", "Graph", "Reconstruction (Phase 4)", 
                  "Validation", "Integrity", "Classification", "Priority", 
                  "Timeline", "Case Intelligence"
                ].map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--blue-dim)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>{idx + 1}</div>
                    <div style={{ color: 'var(--text-2)', fontSize: 'var(--text-sm)', flex: 1 }}>{step}</div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Engine Status">
            {health ? (
              <div style={{ padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {Object.entries(health.engines).map(([name, status]) => (
                  <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 'var(--text-sm)' }}>{name}</span>
                    <StatusBadge label={status} level={status === 'OK' ? 'ok' : 'error'} />
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
