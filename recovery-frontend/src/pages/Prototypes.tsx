import { 
  Search, Folder, File, Activity, Link, 
  FileText, CheckCircle, Shield, Database, Download, Check, AlertTriangle, Info, Play, HardDrive
} from 'lucide-react';

export function Cases() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto py-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-1">Cases</h1>
          <p className="text-gray-500">Manage and trace forensic recovery cases</p>
        </div>
        <button className="btn-recover !py-2 !px-4 text-sm font-semibold rounded-lg">
          New Case
        </button>
      </div>
      
      <div className="surface-card p-4 flex gap-4 items-center">
        <Search className="text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by case ID, name, or examiner..." 
          className="flex-1 outline-none text-sm bg-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="surface-card surface-card-lift p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Folder size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Case {2024000 + i}</h3>
                  <p className="text-sm text-gray-500">Updated 2 days ago</p>
                </div>
              </div>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Open</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 border-t border-gray-100 pt-4 mt-2">
              <span className="flex items-center gap-1.5"><File size={16} /> {120 * i} artifacts</span>
              <span className="flex items-center gap-1.5"><Activity size={16} /> Stage {i}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Fragments() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto py-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-1">Fragments</h1>
          <p className="text-gray-500">Inspect raw data fragments and intelligence</p>
        </div>
      </div>
      
      <div className="surface-card overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <input type="text" placeholder="Filter fragments by signature..." className="px-3 py-1.5 border border-gray-200 rounded text-sm w-64 outline-none focus:ring-1 focus:ring-green-primary" />
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-3">Offset</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Confidence</th>
              <th className="px-6 py-3">Size</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[
              { offset: '0x00A1F00', type: 'JPEG Header', conf: 'High', size: '4 KB', status: 'Carved' },
              { offset: '0x00A2100', type: 'Unknown Binary', conf: 'Low', size: '12 KB', status: 'Orphaned' },
              { offset: '0x00B0000', type: 'SQLite DB', conf: 'High', size: '1.2 MB', status: 'Reconstructed' },
            ].map((f, i) => (
              <tr key={i} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-6 py-4 font-mono text-gray-600">{f.offset}</td>
                <td className="px-6 py-4 font-medium">{f.type}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${f.conf === 'High' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{f.conf}</span>
                </td>
                <td className="px-6 py-4 text-gray-500">{f.size}</td>
                <td className="px-6 py-4 text-gray-500">{f.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Graph() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto py-6 h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-1">Graph Reconstruction</h1>
          <p className="text-gray-500">Visual layout of linked evidence and file structures</p>
        </div>
      </div>
      <div className="flex-1 surface-card relative overflow-hidden bg-gray-50/50 flex items-center justify-center">
        <div className="hero-grid-lines absolute inset-0 opacity-40"></div>
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-200">
            <Link size={48} className="text-green-primary mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Graph visualization is inactive</h2>
          <p className="text-gray-500 max-w-sm">
            Select a specific case and fragment to map out structural relationships across the evidence image.
          </p>
          <button className="px-4 py-2 mt-2 bg-white border border-gray-200 shadow-sm rounded-lg text-sm font-medium hover:bg-gray-50">
            Load Mock Graph
          </button>
        </div>
      </div>
    </div>
  );
}

export function Validation() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto py-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-1">Validation & Hashes</h1>
          <p className="text-gray-500">Cryptographic verification of acquired evidence</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="surface-card p-6 flex flex-col gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg w-fit">
            <CheckCircle size={24} />
          </div>
          <h3 className="font-semibold text-lg">Hash Integrity</h3>
          <p className="text-4xl font-bold">100%</p>
          <p className="text-sm text-gray-500">All 142 extracted files match their cryptographic signatures.</p>
        </div>
        
        <div className="lg:col-span-2 surface-card p-0 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-medium">Recent Verifications</h3>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Check size={16} className="text-green-500" />
                    <span className="font-mono text-sm text-gray-600">file_00{i}.jpg</span>
                  </div>
                  <span className="font-mono text-xs text-gray-400">MD5: a1b2c3d4e5f6g7h8i9j0...</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Engines() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto py-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-1">Recovery Engines</h1>
          <p className="text-gray-500">Manage heuristics, carvers, and deep recovery modules</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: 'Fast Carver', desc: 'Header-footer matching for standard types', status: 'Active', icon: Play },
          { name: 'Deep Recovery', desc: 'Heuristic structural reconstruction', status: 'Active', icon: Database },
          { name: 'NLP Scraper', desc: 'Extracts textual evidence from unstructured blocks', status: 'Inactive', icon: FileText },
          { name: 'Graph Linker', desc: 'Rebuilds fragmented directory trees', status: 'Active', icon: Link }
        ].map((engine, i) => (
          <div key={i} className="surface-card p-6 flex flex-col gap-5">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${engine.status === 'Active' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                  <engine.icon size={20} />
                </div>
                <h3 className="font-semibold text-lg">{engine.name}</h3>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${engine.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {engine.status}
              </span>
            </div>
            <p className="text-sm text-gray-600">{engine.desc}</p>
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button className="text-sm font-medium text-blue-600 hover:underline">Configure</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Reports() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto py-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-1">Reports</h1>
          <p className="text-gray-500">Exportable forensic summaries and detailed documentation</p>
        </div>
        <button className="btn-recover !py-2 !px-4 text-sm font-semibold rounded-lg flex items-center gap-2">
          <Download size={16} /> Generate Report
        </button>
      </div>

      <div className="surface-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-3">Report Name</th>
              <th className="px-6 py-3">Date Generated</th>
              <th className="px-6 py-3">Format</th>
              <th className="px-6 py-3">Size</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[
              { name: 'Case 2024001 - Executive Summary', date: '2024-03-15', format: 'PDF', size: '2.4 MB' },
              { name: 'Case 2024001 - Technical Details', date: '2024-03-15', format: 'PDF', size: '14.1 MB' },
              { name: 'Global Engine Audit Log', date: '2024-03-10', format: 'CSV', size: '1.8 MB' },
            ].map((r, i) => (
              <tr key={i} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-6 py-4 font-medium flex items-center gap-2">
                  <FileText size={16} className="text-blue-500" /> {r.name}
                </td>
                <td className="px-6 py-4 text-gray-500">{r.date}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{r.format}</span>
                </td>
                <td className="px-6 py-4 text-gray-500">{r.size}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:underline font-medium text-sm">Download</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Timeline() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto py-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-1">Timeline</h1>
          <p className="text-gray-500">Chronological analysis of filesystem events</p>
        </div>
      </div>

      <div className="surface-card p-8">
        <div className="relative border-l-2 border-gray-200 ml-3 md:ml-6 flex flex-col gap-8 py-2">
          {[
            { time: '14:32:01', date: '2024-03-15', action: 'Volume shadow copy deleted', icon: AlertTriangle, color: 'text-amber-500' },
            { time: '14:30:12', date: '2024-03-15', action: 'Mass file deletion detected in /User/Documents', icon: File, color: 'text-red-500' },
            { time: '10:15:44', date: '2024-03-14', action: 'System boot (normal)', icon: Info, color: 'text-blue-500' },
            { time: '09:00:00', date: '2024-03-14', action: 'External USB device connected (Vendor: SanDisk)', icon: HardDrive, color: 'text-purple-500' },
          ].map((event, i) => (
            <div key={i} className="relative pl-8 md:pl-10">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-gray-300"></div>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1">
                <span className="font-mono text-sm font-semibold">{event.time}</span>
                <span className="text-xs text-gray-500">{event.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <event.icon size={16} className={event.color} />
                <p className="text-gray-800">{event.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AuditLog() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto py-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-1">Audit Log</h1>
          <p className="text-gray-500">Immutable record of all investigator actions</p>
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-3">Timestamp</th>
              <th className="px-6 py-3">User / System</th>
              <th className="px-6 py-3">Action</th>
              <th className="px-6 py-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[
              { time: '2024-03-15T15:00:01Z', user: 'system', action: 'SCAN_COMPLETE', details: 'Completed deep scan of image_001.raw' },
              { time: '2024-03-15T14:45:12Z', user: 'investigator_1', action: 'JOB_START', details: 'Initiated deep recovery on image_001.raw' },
              { time: '2024-03-15T14:42:00Z', user: 'investigator_1', action: 'EVIDENCE_LOAD', details: 'Loaded image_001.raw (MD5: e4d9...)' },
              { time: '2024-03-14T09:12:33Z', user: 'admin', action: 'LOGIN', details: 'Successful authentication' },
            ].map((log, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-xs text-gray-500 whitespace-nowrap">{log.time}</td>
                <td className="px-6 py-4 font-medium flex items-center gap-2">
                  <Shield size={14} className="text-gray-400" /> {log.user}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono">{log.action}</span>
                </td>
                <td className="px-6 py-4 text-gray-600">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Settings() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto py-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-1">Settings</h1>
          <p className="text-gray-500">Configure studio preferences and global defaults</p>
        </div>
      </div>

      <div className="surface-card p-8 flex flex-col gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-100 pb-2">Evidence Handling</h3>
          <div className="flex flex-col gap-4">
            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium">Strict Read-Only Verification</p>
                <p className="text-sm text-gray-500">Verify source hashes continuously during processing</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-green-primary" />
            </label>
            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium">Default Output Directory</p>
                <p className="text-sm text-gray-500">Where carved files and reports are saved</p>
              </div>
              <input type="text" defaultValue="/mnt/forensics/output" className="px-3 py-2 border border-gray-200 rounded text-sm w-64 outline-none focus:ring-1 focus:ring-green-primary" />
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-100 pb-2">Analysis Thresholds</h3>
          <div className="flex flex-col gap-4">
            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium">Minimum Confidence Score</p>
                <p className="text-sm text-gray-500">Ignore reconstructions below this threshold</p>
              </div>
              <select className="px-3 py-2 border border-gray-200 rounded text-sm w-64 outline-none focus:ring-1 focus:ring-green-primary">
                <option>Low (30%)</option>
                <option>Medium (60%)</option>
                <option selected>High (85%)</option>
                <option>Certain (99%)</option>
              </select>
            </label>
          </div>
        </div>
        
        <div className="pt-4 flex justify-end">
          <button className="btn-recover !py-2 !px-6 text-sm font-semibold rounded-lg">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
