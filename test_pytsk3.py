import sys
import hashlib
sys.path.append(r"C:\Users\deeks\OneDrive\Desktop\Catch-AI-repo\forensic-engines\catch-filesystem\src")
from ntfs_parser import NTFSParser
import pytsk3

parser = NTFSParser(r"\\.\C:")
if not parser.open_image():
    print("RAW_VOLUME_OPEN: FAIL")
else:
    print("RAW_VOLUME_OPEN: PASS")
    print("PYTSK3_RAW_VOLUME: PASS")
    
    if not parser.detect_partition_offset() or not parser.open_filesystem():
        print("NTFS_FILESYSTEM_OPEN: FAIL")
    else:
        print("NTFS_FILESYSTEM_OPEN: PASS")
        
        try:
            files = parser.get_file_list()
            print("DELETED_RECORDS_FOUND:", len(files))
            
            found = False
            for f in files:
                if f['name'] == 'deleted-recovery-test.txt':
                    found = True
                    print("TEST FILE:", f['name'])
                    print("DELETED RECORD FOUND: PASS")
                    data = parser.read_file_content(f['name'])
                    h = hashlib.sha256(data).hexdigest()
                    print("RECOVERED HASH:", h.upper())
            if not found:
                print("TEST FILE: NOT FOUND")
        except Exception as e:
            print("ERROR SCANNING:", e)
