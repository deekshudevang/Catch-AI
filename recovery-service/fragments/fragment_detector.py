import uuid
from .feature_extraction import extract_features
from .classifier import classify_fragment

class FragmentDetector:
    def __init__(self, chunk_size=4096):
        self.chunk_size = chunk_size

    def detect(self, input_data: bytes):
        fragments = []
        offset = 0
        total_len = len(input_data)

        # Basic deterministic splitting for hackathon (windowed chunks or magic bytes boundary)
        # For simplicity, we just split into fixed chunks or look for signatures.
        # But for the demo, let's split by chunk_size, unless it's a test case.
        while offset < total_len:
            end = min(offset + self.chunk_size, total_len)
            chunk = input_data[offset:end]
            
            features = extract_features(chunk, offset)
            classification = classify_fragment(chunk)
            
            fragment = {
                "id": str(uuid.uuid4()),
                **features,
                **classification,
                "data": chunk
            }
            fragments.append(fragment)
            offset = end

        return fragments
