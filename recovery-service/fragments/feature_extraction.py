import hashlib

def calculate_sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def calculate_entropy(data: bytes) -> float:
    if not data:
        return 0.0
    import math
    from collections import Counter
    p, lns = Counter(data), float(len(data))
    return -sum(count/lns * math.log2(count/lns) for count in p.values())

def get_byte_histogram(data: bytes) -> list:
    hist = [0] * 256
    for b in data:
        hist[b] += 1
    return hist

def extract_features(fragment_data: bytes, offset: int = 0) -> dict:
    return {
        "sha256": calculate_sha256(fragment_data),
        "entropy": calculate_entropy(fragment_data),
        "byte_histogram": get_byte_histogram(fragment_data),
        "offset": offset,
        "length": len(fragment_data)
    }
