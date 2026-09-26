import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, HardDrive, Server, Database, RefreshCw, Activity, Shield } from 'lucide-react';
import { backendApi } from '../api/client';
import type { RecoveryJob, HealthResponse } from '../api/client';
import { StatusBadge, StatusDot, ErrorState, LoadingState, EmptyState } from '../components/common';

export default function Dashboard() {
  const navigate = useNavigate();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [jobs, setJobs] = useState<RecoveryJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  
  const [privileges, setPrivileges] = useState<{ is_admin: boolean; raw_ntfs_access: string } | null>(null);
  const [elevating, setElevating] = useState(false);

  const [imagePath, setImagePath] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const [, setPipelineStage] = useState(0);

  const [fetchDirPath, setFetchDirPath] = useState('');
  const [fetchSource, setFetchSource] = useState<'WORKSPACE_DIRECTORY' | 'DISK_IMAGE' | 'MONITORED_EVENTS'>('WORKSPACE_DIRECTORY');
  const [isFetching, setIsFetching] = useState(false);

  const [monitorDirPath, setMonitorDirPath] = useState('');
  const [isMonitoring, setIsMonitoring] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch data in parallel
      const [healthData, jobsData, privilegesData] = await Promise.all([
        backendApi.health().catch(_ => null),
        backendApi.jobs().catch(_ => ({ jobs: [] })),
        backendApi.systemPrivileges().catch(_ => null)
      ]);
      if (healthData) setHealth(healthData);
      if (jobsData) setJobs(jobsData.jobs || []);
      if (privilegesData) setPrivileges(privilegesData);
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
    if (!imagePath && !selectedFile) return;
    setIsRecovering(true);
    setPipelineStage(1);

    try {
      if (selectedFile) {
        await backendApi.upload(selectedFile);
        setSelectedFile(null);
      } else {
        await backendApi.scan(imagePath);
        setImagePath('');
      }
      setPipelineStage(6); // complete
      fetchData(); // refresh jobs list
    } catch (err: any) {
      alert(`Recovery failed: ${err.message}`);
      setPipelineStage(0);
    } finally {
      setIsRecovering(false);
      setTimeout(() => setPipelineStage(0), 3000);
    }
  };

  const [fetchMessage, setFetchMessage] = useState<{ type: 'error' | 'warning' | 'success', text: string } | null>(null);

  const handleFetchData = async () => {
    let targetPath = fetchDirPath;
    if (fetchSource === 'WORKSPACE_DIRECTORY') {
      targetPath = 'C:\\Users\\deeks\\OneDrive\\Desktop\\Catch-AI-repo';
    } else if (fetchSource === 'MONITORED_EVENTS') {
      try {
        const data = await backendApi.sentinelStatus();
        if (data.directories && data.directories.length > 0) {
          targetPath = data.directories[0].path;
        } else {
          setFetchMessage({ type: 'error', text: 'No monitored directory found.' });
          return;
        }
      } catch (err: any) {
        setFetchMessage({ type: 'error', text: `Failed to fetch sentinel status: ${err.message}` });
        return;
      }
    } else {
      if (!fetchDirPath) return;
    }
    
    setIsFetching(true);
    setFetchMessage(null);
    try {
      const response = await backendApi.fetchData(targetPath);
      if (response && response.status === 'PRIVILEGE_REQUIRED') {
        setFetchMessage({ type: 'warning', text: response.message || 'Administrator privileges and raw NTFS access are required.' });
      } else {
        setFetchMessage({ type: 'success', text: 'Fetch request triggered successfully.' });
      }
      setFetchDirPath('');
      fetchData();
    } catch (err: any) {
      setFetchMessage({ type: 'error', text: `Fetch failed: ${err.message}` });
    } finally {
      setIsFetching(false);
    }
  };

  const handleStartMonitor = async () => {
    if (!monitorDirPath) return;
    setIsMonitoring(true);
    try {
      await backendApi.monitor(monitorDirPath);
      alert('Monitoring started successfully.');
      setMonitorDirPath('');
    } catch (err: any) {
      alert(`Monitor failed: ${err.message}`);
    } finally {
      setIsMonitoring(false);
    }
  };

  const handleElevate = async () => {
    setElevating(true);
    try {
      await backendApi.systemElevate();
      alert('Elevation requested. Please accept the UAC prompt if it appears. The application may restart.');
    } catch (err: any) {
      alert(`Elevation request failed: ${err.message}`);
    } finally {
      setElevating(false);
    }
  };

  // Compute aggregate stats from jobs
  const completedJobs = jobs.filter(j => j.status === 'COMPLETED');
  const totalFragments = completedJobs.reduce((sum, j) => sum + (j.fragments || 0), 0);
  const totalCarved = completedJobs.reduce((sum, j) => sum + (j.carved_files || 0), 0);
  const activeJobs = jobs.filter(j => j.status === 'RUNNING' || j.status === 'PROCESSING');

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-1">Recovery Dashboard</h1>
          <p className="text-gray-500">Real-time overview of digital evidence recovery operations</p>
        </div>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium"
          onClick={fetchData}
        >
          <RefreshCw size={16} className={loading ? "animate-spin text-gray-400" : "text-gray-400"} />
          Refresh
        </button>
      </div>

      {/* Privilege Warning Banner */}
      {privileges && !privileges.is_admin && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center shadow-sm">
          <div className="flex gap-3 items-start">
            <Shield className="text-amber-600 mt-0.5" size={20} />
            <div>
              <h3 className="text-sm font-semibold text-amber-900">Administrator Privileges Required</h3>
              <p className="text-sm text-amber-700 mt-1">
                To perform forensic deleted-file recovery, the application needs raw NTFS access. 
                Some features may be limited or unavailable without elevation.
              </p>
            </div>
          </div>
          <button
            onClick={handleElevate}
            disabled={elevating}
            className="whitespace-nowrap px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            {elevating ? 'Requesting...' : 'Request Elevation'}
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <HardDrive size={24} />
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Images Processed</div>
            <div className="text-2xl font-semibold text-gray-900">{jobs.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Activity size={24} />
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Fragments Recovered</div>
            <div className="text-2xl font-semibold text-gray-900">{totalFragments.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Server size={24} />
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Carved Files</div>
            <div className="text-2xl font-semibold text-gray-900">{totalCarved.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Server size={24} />
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Core System</div>
            <div className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              {health?.status === 'OK' ? <StatusDot level="ok" /> : <StatusDot level="error" />}
              {health?.status || 'Unknown'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Database size={24} />
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Active Jobs</div>
            <div className="text-2xl font-semibold text-gray-900">{activeJobs.length}</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* New Recovery Job */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">New Recovery Job</h2>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <span className="text-sm font-medium text-gray-700 w-32">Local File:</span>
                <input
                  type="file"
                  onChange={e => {
                    if (e.target.files && e.target.files.length > 0) {
                      setSelectedFile(e.target.files[0]);
                      setImagePath('');
                    } else {
                      setSelectedFile(null);
                    }
                  }}
                  className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <span className="text-sm font-medium text-gray-700 w-32">Server Path:</span>
                <input
                  type="text"
                  placeholder="Or enter absolute path on server (e.g., /data/evidence.raw)"
                  value={imagePath}
                  onChange={e => {
                    setImagePath(e.target.value);
                    if (e.target.value) setSelectedFile(null);
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleStartRecovery()}
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <button
                className="mt-2 flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed self-start"
                onClick={handleStartRecovery}
                disabled={(!imagePath && !selectedFile) || isRecovering}
              >
                {isRecovering ? <RefreshCw size={18} className="animate-spin" /> : <Play size={18} />}
                Start Recovery
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fetch Deleted Data */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">FETCH DELETED DATA</h2>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">SOURCE</label>
                  <select
                    value={fetchSource}
                    onChange={(e: any) => setFetchSource(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="WORKSPACE_DIRECTORY">WORKSPACE DIRECTORY</option>
                    <option value="DISK_IMAGE">DISK IMAGE</option>
                    <option value="MONITORED_EVENTS">MONITORED EVENTS</option>
                  </select>
                </div>
                
                {fetchSource === 'DISK_IMAGE' && (
                  <input
                    type="text"
                    placeholder="Path to .dd / .raw / .img / .vmdk file"
                    value={fetchDirPath}
                    onChange={e => setFetchDirPath(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                )}
                {fetchMessage && (
                  <div className={`p-3 rounded-md text-sm ${fetchMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : fetchMessage.type === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                    {fetchMessage.text}
                  </div>
                )}
                <button
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed w-full mt-2"
                  onClick={handleFetchData}
                  disabled={(fetchSource === 'DISK_IMAGE' && !fetchDirPath) || isFetching}
                >
                  {isFetching ? <RefreshCw size={18} className="animate-spin" /> : <Play size={18} />}
                  FETCH DELETED DATA
                </button>
              </div>
            </div>

            {/* Start Monitor */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">START MONITOR</h2>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Directory path"
                  value={monitorDirPath}
                  onChange={e => setMonitorDirPath(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <button
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed w-full"
                  onClick={handleStartMonitor}
                  disabled={!monitorDirPath || isMonitoring}
                >
                  {isMonitoring ? <RefreshCw size={18} className="animate-spin" /> : <Play size={18} />}
                  START MONITOR
                </button>
              </div>
            </div>
          </div>


          {/* Recent Jobs */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Jobs</h2>
            </div>
            <div className="p-0">
              {error ? (
                <div className="p-6"><ErrorState message={error} onRetry={fetchData} /></div>
              ) : loading && jobs.length === 0 ? (
                <div className="p-6"><LoadingState /></div>
              ) : jobs.length === 0 ? (
                <div className="p-6"><EmptyState title="No Jobs Found" description="Start a new recovery job to see it here." icon={<HardDrive size={32} />} /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Job ID</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Evidence</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Started</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Artifacts</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {jobs.map(job => {
                        const formatDate = (dStr?: string | null) => dStr && !isNaN(new Date(dStr).getTime()) ? new Date(dStr).toLocaleTimeString() : '-';
                        return (
                        <tr
                          key={job.id}
                          onClick={() => setSelectedJobId(String(job.id))}
                          className={`cursor-pointer transition-colors ${selectedJobId === String(job.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                        >
                          <td className="py-3 px-4 text-sm font-mono text-gray-500">{String(job.id).substring(0,8)}</td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-900 truncate max-w-[150px]" title={job.image_path || job.evidence}>
                            {String(job.image_path || job.evidence || '').split('/').pop()}
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge
                              label={job.status}
                              level={job.status === 'COMPLETED' ? 'ok' : job.status === 'FAILED' ? 'error' : 'running'}
                            />
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">{formatDate(job.created_at)}</td>
                          <td className="py-3 px-4 text-sm text-gray-500">{formatDate(job.started_at)}</td>
                          <td className="py-3 px-4 text-sm text-gray-500">{formatDate(job.completed_at)}</td>
                          <td className="py-3 px-4 text-sm text-gray-500">{job.duration || '-'}</td>
                          <td className="py-3 px-4 text-sm text-gray-900 font-medium text-right">{job.artifacts !== undefined ? job.artifacts.toLocaleString() : '-'}</td>
                          <td className="py-3 px-4 text-center">
                            <button
                              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-md text-sm font-medium transition-colors shadow-sm"
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
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">

          {/* Engine Status */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Engine Status</h2>
            </div>
            {health ? (
              <div className="p-6 flex flex-col gap-4">
                {Object.entries(health.engines).map(([name, status]) => (
                  <div key={name} className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                    <span className="text-sm text-gray-700 font-medium">{name}</span>
                    <StatusBadge label={status as string} level={status === 'OK' ? 'ok' : 'error'} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6">
                <LoadingState label="Checking health..." />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Side Panel for Job Details */}
      {selectedJobId && (
        <div className="fixed top-0 right-0 bottom-0 w-[400px] bg-white border-l border-gray-200 z-50 p-6 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Artifact Details</h2>
            <button 
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors text-sm font-medium" 
              onClick={() => setSelectedJobId(null)}
            >
              Close
            </button>
          </div>
          <p className="text-gray-500 text-sm mb-6">
            Showing artifacts for Job <strong className="text-gray-900">{selectedJobId}</strong>
          </p>
          <div className="flex flex-col gap-4">
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
              <h3 className="text-sm text-blue-900 mb-2 font-medium">Extracted Fragments</h3>
              <p className="text-4xl font-bold text-blue-600">
                {jobs.find(j => String(j.id) === selectedJobId)?.fragments || 0}
              </p>
            </div>
            <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
              <h3 className="text-sm text-amber-900 mb-2 font-medium">Carved Files</h3>
              <p className="text-4xl font-bold text-amber-600">
                {jobs.find(j => String(j.id) === selectedJobId)?.carved_files || 0}
              </p>
            </div>
          </div>
          <div className="mt-8">
            <button 
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm" 
              onClick={() => navigate(`/recovery/${selectedJobId}`)}
            >
              Open Full Case Workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
