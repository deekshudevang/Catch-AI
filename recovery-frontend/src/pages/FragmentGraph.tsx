import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SectionCard } from '../components/common';
import type { GraphData, ReconstructionPath, GraphNode, GraphEdge } from '../api/graph';
import { GitMerge, ZoomIn, ZoomOut, Maximize, RotateCcw } from 'lucide-react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';

export default function FragmentGraph() {
  const { recoveryId } = useParams<{ recoveryId: string }>();
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [paths, setPaths] = useState<ReconstructionPath[]>([]);
  const [loading, setLoading] = useState(true);
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedLink, setSelectedLink] = useState<GraphEdge | null>(null);

  useEffect(() => {
    if (!recoveryId) return;
    
    // Simulate API fetch
    setTimeout(() => {
      setGraphData({
        nodes: [
          { id: 'FRAG-001', fragment_id: 'FRAG-001', offset: 0, length: 4096, type: 'PDF', entropy: 0.9, source_engine: 'Carver' },
          { id: 'FRAG-009', fragment_id: 'FRAG-009', offset: 8192, length: 4096, type: 'UNKNOWN', entropy: 0.95, source_engine: 'Carver' },
          { id: 'FRAG-013', fragment_id: 'FRAG-013', offset: 16384, length: 4096, type: 'UNKNOWN', entropy: 0.93, source_engine: 'Carver' },
        ],
        edges: [
          { id: 'E1', source: 'FRAG-001', target: 'FRAG-009', score: 0.94, reasons: ['Compatible file type', 'Consistent physical offset'], is_selected_path: true },
          { id: 'E2', source: 'FRAG-009', target: 'FRAG-013', score: 0.88, reasons: ['Entropy match'], is_selected_path: true }
        ]
      });
      setPaths([
         { path_id: 'PATH-1', score: 0.91, fragment_count: 3, fragments: ['FRAG-001', 'FRAG-009', 'FRAG-013'], reasons: ['Contiguous logical flow'] }
      ]);
      setLoading(false);
    }, 800);
  }, [recoveryId]);

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
    setSelectedLink(null);
  }, []);

  const handleLinkClick = useCallback((link: any) => {
    setSelectedLink(link);
    setSelectedNode(null);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex items-center gap-2 text-sm text-muted mb-4 shrink-0">
        <Link to="/" className="hover:text-primary">CATCH-AI</Link> / 
        {recoveryId && <>
          <Link to={`/recovery/${recoveryId}`} className="hover:text-primary">Recovery</Link> / 
        </>}
        <span className="font-bold text-foreground">Fragment Graph</span>
      </div>

      <div className="flex justify-between items-end mb-4 shrink-0">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
             <GitMerge size={24} className="text-primary" />
             Fragment Relationship Graph
           </h1>
           <div className="text-sm text-muted mt-1">
             Nodes: {graphData?.nodes.length || 0} | Edges: {graphData?.edges.length || 0}
           </div>
        </div>
        <div className="flex gap-2">
           <button className="btn btn-secondary btn-sm" title="Zoom In" onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 1.2)}><ZoomIn size={16} /></button>
           <button className="btn btn-secondary btn-sm" title="Zoom Out" onClick={() => fgRef.current?.zoom(fgRef.current.zoom() / 1.2)}><ZoomOut size={16} /></button>
           <button className="btn btn-secondary btn-sm" title="Fit to Screen" onClick={() => fgRef.current?.zoomToFit(400)}><Maximize size={16} /></button>
           <button className="btn btn-secondary btn-sm" title="Reset" onClick={() => { fgRef.current?.centerAt(0,0,400); fgRef.current?.zoom(1, 400); }}><RotateCcw size={16} /></button>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
         {/* Controls Sidebar */}
         <SectionCard className="w-64 flex flex-col shrink-0">
            <div className="p-4 border-b border-[var(--border)] font-bold text-sm uppercase tracking-wider">
               Filters
            </div>
            <div className="p-4 space-y-4 overflow-y-auto">
               <div>
                  <label className="block text-sm text-muted mb-1">Minimum Score</label>
                  <input type="range" min="0" max="100" defaultValue="50" className="w-full" />
                  <div className="text-right text-xs text-muted mt-1">0.50</div>
               </div>
               <div>
                  <label className="block text-sm text-muted mb-1">File Type</label>
                  <select className="input w-full"><option>All</option><option>PDF</option></select>
               </div>
               <div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" /> Path Only
                  </label>
               </div>
            </div>
         </SectionCard>

         {/* Main Graph Area */}
         <SectionCard className="flex-1 flex flex-col relative overflow-hidden bg-[var(--background)]">
            {loading ? (
               <div className="absolute inset-0 flex items-center justify-center text-muted">
                 Loading graph...
               </div>
            ) : (
               <div className="absolute inset-0">
                 {graphData && (
                   <ForceGraph2D
                     ref={fgRef as any}
                     graphData={{ nodes: graphData.nodes, links: graphData.edges }}
                     nodeId="id"
                     nodeLabel="id"
                     nodeAutoColorBy="type"
                     linkSource="source"
                     linkTarget="target"
                     linkColor={(link: any) => link.is_selected_path ? '#06b6d4' : '#4b5563'}
                     linkWidth={(link: any) => link.is_selected_path ? 2 : 1}
                     onNodeClick={handleNodeClick}
                     onLinkClick={handleLinkClick}
                     backgroundColor="#121212"
                   />
                 )}
               </div>
            )}
         </SectionCard>

         {/* Details Sidebar */}
         <SectionCard className="w-80 flex flex-col shrink-0">
            <div className="p-4 border-b border-[var(--border)] font-bold text-sm uppercase tracking-wider">
               Details
            </div>
            <div className="p-4 overflow-y-auto text-sm">
               {selectedNode ? (
                 <div className="space-y-3">
                   <div className="font-bold text-foreground text-lg">{selectedNode.id}</div>
                   <div><span className="text-muted">Type:</span> {selectedNode.type}</div>
                   <div><span className="text-muted">Offset:</span> {selectedNode.offset}</div>
                   <div><span className="text-muted">Length:</span> {selectedNode.length}</div>
                   <div><span className="text-muted">Entropy:</span> {selectedNode.entropy}</div>
                   <div><span className="text-muted">Engine:</span> {selectedNode.source_engine}</div>
                 </div>
               ) : selectedLink ? (
                 <div className="space-y-3">
                   <div className="font-bold text-foreground text-lg">{selectedLink.id}</div>
                   <div><span className="text-muted">Source:</span> {typeof selectedLink.source === 'object' ? (selectedLink.source as any).id : selectedLink.source}</div>
                   <div><span className="text-muted">Target:</span> {typeof selectedLink.target === 'object' ? (selectedLink.target as any).id : selectedLink.target}</div>
                   <div><span className="text-muted">Score:</span> {selectedLink.score}</div>
                   <div><span className="text-muted">Reasons:</span></div>
                   <ul className="list-disc list-inside">
                     {selectedLink.reasons.map((r, i) => <li key={i}>{r}</li>)}
                   </ul>
                 </div>
               ) : (
                 <div className="text-muted">Select a node or edge to view details.</div>
               )}
            </div>
         </SectionCard>
      </div>

      {/* Probable Reconstruction Path */}
      {paths.length > 0 && (
         <SectionCard className="mt-4 shrink-0">
            <div className="p-3 border-b border-[var(--border)] font-bold text-sm uppercase tracking-wider text-cyan-400">
               Probable Reconstruction Path
            </div>
            <div className="p-4 flex gap-4 overflow-x-auto items-center">
               <div className="text-muted mr-4">
                  <div>Score: <span className="font-bold text-foreground">{paths[0].score.toFixed(2)}</span></div>
                  <div>Fragments: <span className="font-bold text-foreground">{paths[0].fragment_count}</span></div>
               </div>
               
               {paths[0].fragments.map((frag, idx) => (
                 <React.Fragment key={frag}>
                   <div className="bg-[var(--surface-active)] px-3 py-2 rounded border border-[var(--border)] font-mono text-sm">
                     {frag}
                   </div>
                   {idx < paths[0].fragments.length - 1 && (
                     <div className="text-muted">→</div>
                   )}
                 </React.Fragment>
               ))}
            </div>
         </SectionCard>
      )}
    </div>
  );
}
