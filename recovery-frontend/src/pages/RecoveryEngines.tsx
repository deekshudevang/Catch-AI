import { useEffect, useState } from 'react';

const RecoveryEngines = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/system/integration-report')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error(err));
  }, []);

  if (!data) return <div className="p-8">Loading Recovery Engine Monitor...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">CATCH-AI FORENSIC ENGINE MONITOR</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.engines?.map((engine: any) => (
          <div key={engine.id} className="border border-gray-200 rounded p-4 shadow-sm bg-white">
            <h2 className="text-xl font-bold">{engine.name}</h2>
            <p className="text-sm text-gray-500 mb-4">Repository: {engine.repository}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Source:</span>
                <span className={`font-mono ${engine.source_present ? 'text-green-600' : 'text-red-600'}`}>
                  {engine.source_present ? 'PRESENT' : 'NOT FOUND'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Dependencies:</span>
                <span className={`font-mono ${engine.dependency_ready ? 'text-green-600' : 'text-yellow-600'}`}>
                  {engine.dependency_ready ? 'READY' : 'MISSING'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Runtime:</span>
                <span className={`font-mono ${engine.runtime_ready ? 'text-green-600' : 'text-yellow-600'}`}>
                  {engine.runtime_ready ? 'READY' : 'NOT READY'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Integration Test:</span>
                <span className={`font-mono ${engine.integration_tested ? 'text-green-600' : 'text-gray-500'}`}>
                  {engine.integration_tested ? 'PASSED' : 'UNTESTED'}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Actual Usage:</span>
                <span className={`font-mono ${engine.actually_used ? 'text-blue-600' : 'text-gray-500'}`}>
                  {engine.actually_used ? 'USED' : engine.status}
                </span>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p>Version: {engine.version}</p>
              <p>Last Test: {engine.last_tested || 'N/A'}</p>
              <p>Last Used: {engine.last_used || 'N/A'}</p>
            </div>
            
            {engine.capabilities && engine.capabilities.length > 0 && (
              <div className="mt-4">
                <p className="font-semibold text-sm">Operations:</p>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {engine.capabilities.map((cap: string, idx: number) => (
                    <li key={idx}>{cap}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecoveryEngines;
