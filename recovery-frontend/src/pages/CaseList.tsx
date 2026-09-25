import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, SectionCard, StatusBadge, ErrorState, LoadingState, EmptyState } from '../components/common';
import { casesApi, Case } from '../api/cases';
import { Briefcase, Plus, Search } from 'lucide-react';

export default function CaseList() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchCases = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await casesApi.getCases();
      setCases(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch cases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleCreateCase = async () => {
    const name = prompt('Enter new Case Name:');
    if (!name) return;
    const desc = prompt('Enter Case Description:') || '';
    try {
      const newCase = await casesApi.createCase(name, desc);
      navigate(`/cases/${newCase.id}`);
    } catch (err: any) {
      alert(`Failed to create case: ${err.message}`);
    }
  };

  const filteredCases = cases.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page">
      <PageHeader 
        title="Cases" 
        subtitle="Manage data investigation cases"
        actions={
          <button className="btn btn-primary" onClick={handleCreateCase}>
            <Plus size={16} /> New Case
          </button>
        }
      />

      <SectionCard>
        <div style={{ padding: 'var(--sp-4)', display: 'flex', gap: 'var(--sp-4)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input 
              type="text" 
              placeholder="Search cases..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '36px' }}
            />
          </div>
        </div>

        {error ? (
          <div style={{ padding: 'var(--sp-8)' }}>
            <ErrorState message={error} onRetry={fetchCases} />
          </div>
        ) : loading ? (
          <div style={{ padding: 'var(--sp-8)' }}>
            <LoadingState label="Loading cases..." />
          </div>
        ) : filteredCases.length === 0 ? (
          <div style={{ padding: 'var(--sp-8)' }}>
            <EmptyState 
              icon={<Briefcase size={32} />} 
              title="No cases found" 
              description={searchTerm ? "No cases match your search criteria." : "Create a new case to get started."} 
            />
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Name</th>
                  <th>Evidence</th>
                  <th>Recoveries</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Updated</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map(c => (
                  <tr key={c.id}>
                    <td className="mono text-muted">{c.id}</td>
                    <td style={{ fontWeight: 500, color: 'var(--text)' }}>{c.name}</td>
                    <td>{c.evidence_count}</td>
                    <td>{c.recoveries_count}</td>
                    <td>
                      <StatusBadge 
                        label={c.status} 
                        level={['COMPLETED', 'ANALYSIS_COMPLETE'].includes(c.status) ? 'ok' : ['FAILED'].includes(c.status) ? 'error' : 'running'} 
                      />
                    </td>
                    <td className="text-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="text-muted">{new Date(c.updated_at).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-secondary" onClick={() => navigate(`/cases/${c.id}`)}>
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
