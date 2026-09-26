import os
import hashlib
import time
import pytsk3
import uuid

TARGET_DIR = r"C:\Users\deeks\OneDrive\Desktop\Catch-AI-repo"
TEST_FILENAME = f"test_recover_{uuid.uuid4().hex}.txt"
TEST_FILEPATH = os.path.join(TARGET_DIR, TEST_FILENAME)
RECOVERED_FILEPATH = os.path.join(TARGET_DIR, f"recovered_{TEST_FILENAME}")

def calculate_sha256(filepath):
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def test_recovery():
    print(f"1. CREATE REAL FILE: {TEST_FILEPATH}")
    test_data = b"This is a test file for live NTFS deleted file recovery.\n" * 100
    with open(TEST_FILEPATH, "wb") as f:
        f.write(test_data)
    
    print("2. CALCULATE ORIGINAL SHA256")
    original_hash = calculate_sha256(TEST_FILEPATH)
    print(f"   Original Hash: {original_hash}")
    
    print("3. DELETE FILE")
    os.remove(TEST_FILEPATH)
    time.sleep(2) # Wait a bit for file system to flush
    
    print("4. OPEN REAL C: VOLUME")
    try:
        img_info = pytsk3.Img_Info(url=r"\\.\C:")
        print("   [img_info created successfully]")
    except Exception as e:
        print(f"FAILED TO OPEN VOLUME: {e}")
        print("Make sure to run as Administrator.")
        return
        
    print("5. OPEN NTFS")
    try:
        fs_info = pytsk3.FS_Info(img_info)
        print("   [fs_info created successfully]")
    except Exception as e:
        print(f"FAILED TO OPEN FS: {e}")
        return

    print("6. ENUMERATE REAL $MFT")
    print(f"   Target filename to find: {TEST_FILENAME}")
    
    found_inode = None
    file_data = None
    
    try:
        print("   Scanning MFT directly for deleted files (fast search)...")
        start_inum = fs_info.info.root_inum
        end_inum = fs_info.info.last_inum
        
        # Fast search: just look at the last 50,000 inodes since we just created it
        scan_limit = max(start_inum, end_inum - 50000)
        
        print(f"   Inodes to scan: from {end_inum} down to {scan_limit}")
        
        # Searching backwards is often faster for recently deleted files
        for i in range(end_inum, scan_limit - 1, -1):
            if i % 10000 == 0:
                print(f"   ... scanning inode {i}")
            try:
                f = fs_info.open_meta(inode=i)
                # Check if it's unallocated
                if f.info.meta.flags & pytsk3.TSK_FS_META_FLAG_UNALLOC:
                    for attr in f:
                        if attr.info.type == pytsk3.TSK_FS_ATTR_TYPE_FNAME:
                            try:
                                name_data = attr.read_random(0, attr.info.size)
                                if TEST_FILENAME.encode('utf-16le') in name_data or TEST_FILENAME.encode('utf-8') in name_data:
                                    print(f"\n7. IDENTIFY REAL DELETED RECORD")
                                    print(f"   Found deleted file {TEST_FILENAME} at inode {i}")
                                    found_inode = i
                                    
                                    print("8. RESOLVE REAL PARENT DIRECTORY (Skipped in direct scan for simplicity)")
                                    print("9. READ REAL DATA RUNS")
                                    print("10. RECOVER REAL BYTES")
                                    # Read data attribute
                                    for dattr in f:
                                        if dattr.info.type == pytsk3.TSK_FS_ATTR_TYPE_DATA:
                                            file_data = dattr.read_random(0, dattr.info.size)
                                            break
                                    break
                            except Exception:
                                pass
                    if found_inode:
                        break
            except Exception:
                continue
                
    except Exception as e:
        print(f"Error during scan: {e}")

    if not found_inode or file_data is None:
        print("FAILED TO FIND OR RECOVER DELETED FILE.")
        return

    print("11. WRITE RECOVERED FILE")
    with open(RECOVERED_FILEPATH, "wb") as f:
        f.write(file_data)
        
    print("12. CALCULATE RECOVERED SHA256")
    recovered_hash = calculate_sha256(RECOVERED_FILEPATH)
    print(f"    Recovered Hash: {recovered_hash}")
    
    print("13. COMPARE HASHES")
    if original_hash == recovered_hash:
        print("    HASHES MATCH!")
        print("14. PROVE REAL RECOVERY: SUCCESS!")
    else:
        print("    HASHES DO NOT MATCH!")
        print("14. PROVE REAL RECOVERY: FAILED!")
        
if __name__ == "__main__":
    test_recovery()
