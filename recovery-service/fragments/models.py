# Fragment Models
from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class Fragment(BaseModel):
    id: str
    offset: int
    length: int
    entropy: float
    magic_bytes: Optional[str] = None
    fragment_type: str = "unknown"  # header / body / footer / orphan
    file_type_hint: Optional[str] = None


class FragmentFeatures(BaseModel):
    fragment_id: str
    entropy: float
    mean_byte_value: float
    byte_freq_variance: float
    run_length: float        # avg run-length of repeated bytes
    magic_bytes: Optional[str] = None
    fragment_type: str = "unknown"
    file_type_hint: Optional[str] = None


class FragmentRelationship(BaseModel):
    source_id: str
    target_id: str
    score: float             # 0.0 – 1.0
    relationship_type: str   # sequential / referenced / signature_match / entropy_match


class GraphNode(BaseModel):
    id: str
    label: str
    type: str                # header / body / footer / orphan
    x: float = 0.0
    y: float = 0.0
    properties: Dict[str, Any] = {}


class GraphEdge(BaseModel):
    source: str
    target: str
    weight: float
    relationship_type: str


class FragmentGraphResult(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    total_fragments: int
    total_relationships: int
    scan_source: Optional[str] = None
