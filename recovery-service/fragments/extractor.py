"""
Fragment Extractor — reads raw binary slices from a disk image.

Works on any readable file path. Splits the image into fixed-size
chunks, reads each chunk's bytes, and returns Fragment objects with
basic metadata. No external dependencies required.
"""

import os
import math
from typing import List, Optional
from .models import Fragment

# Known magic-byte signatures for common file types
MAGIC_SIGNATURES = {
    b'\xff\xd8\xff': 'jpeg',
    b'\x89PNG': 'png',
    b'GIF8': 'gif',
    b'%PDF': 'pdf',
    b'PK\x03\x04': 'zip',
    b'\x1f\x8b': 'gzip',
    b'BM': 'bmp',
    b'RIFF': 'avi_or_wav',
    b'\x00\x00\x00\x18ftypmp42': 'mp4',
    b'ID3': 'mp3',
    b'\xff\xfb': 'mp3',
    b'OggS': 'ogg',
    b'fLaC': 'flac',
    b'\x1aE\xdf\xa3': 'mkv',
    b'7z\xbc\xaf': '7zip',
    b'Rar!': 'rar',
    b'\xd0\xcf\x11\xe0': 'doc_xls_ppt',
    b'SQLite': 'sqlite',
    b'ELF\x02': 'elf64',
    b'ELF\x01': 'elf32',
}

FOOTER_SIGNATURES = {
    b'\xff\xd9': 'jpeg_footer',
    b'IEND': 'png_footer',
}


def _shannon_entropy(data: bytes) -> float:
    if not data:
        return 0.0
    freq = [0] * 256
    for b in data:
        freq[b] += 1
    length = len(data)
    entropy = 0.0
    for count in freq:
        if count:
            p = count / length
            entropy -= p * math.log2(p)
    return round(entropy, 4)


def _detect_magic(data: bytes) -> Optional[str]:
    for sig, ftype in MAGIC_SIGNATURES.items():
        if data[:len(sig)] == sig:
            return ftype
    return None


def _detect_footer(data: bytes) -> Optional[str]:
    tail = data[-4:] if len(data) >= 4 else data
    for sig, ftype in FOOTER_SIGNATURES.items():
        if tail[-len(sig):] == sig or data[-len(sig):] == sig:
            return ftype
    return None


def _classify(magic: Optional[str], footer: Optional[str], entropy: float) -> str:
    if magic:
        return "header"
    if footer:
        return "footer"
    if entropy > 7.5:
        return "body"
    return "orphan"


class FragmentExtractor:
    """
    Reads a binary image in chunk_size slices.
    Returns a list of Fragment objects with real data extracted from the file.
    """

    def __init__(self, chunk_size: int = 4096):
        self.chunk_size = chunk_size

    def extract(self, image_path: str, max_fragments: int = 500) -> List[Fragment]:
        """Extract fragments from a binary file."""
        fragments: List[Fragment] = []

        if not os.path.isfile(image_path):
            # Return a synthetic "empty" scan result so the rest of the
            # pipeline can still produce a graph (0 fragments).
            return fragments

        file_size = os.path.getsize(image_path)
        frag_id = 0

        with open(image_path, 'rb') as fh:
            offset = 0
            while offset < file_size and frag_id < max_fragments:
                data = fh.read(self.chunk_size)
                if not data:
                    break

                entropy = _shannon_entropy(data)
                magic = _detect_magic(data)
                footer = _detect_footer(data)
                ftype = _classify(magic, footer, entropy)

                fragments.append(Fragment(
                    id=f"FRAG-{frag_id:05d}",
                    offset=offset,
                    length=len(data),
                    entropy=entropy,
                    magic_bytes=magic,
                    fragment_type=ftype,
                    file_type_hint=magic or footer,
                    data=data,
                ))
                offset += len(data)
                frag_id += 1

        return fragments
