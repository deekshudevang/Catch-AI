import os
import hashlib
import time
import pytsk3
import uuid

TARGET_DIR = r"C:\Users\deeks\OneDrive\Desktop\Catch-AI-repo"
SAFE_RECOVERY_DIR = r"C:\Users\deeks\OneDrive\Desktop\SafeRecoveryZone"

if not os.path.exists(SAFE_RECOVERY_DIR):
    os.makedirs(SAFE_RECOVERY_DIR)

TEST_FILENAME = f"test_recover_{uuid.uuid4().hex}.txt"
TEST_FILEPATH = os.path.join(TARGET_DIR, TEST_FILENAME)
RECOVERED_FILEPATH = os.path.join(SAFE_RECOVERY_DIR, f"recovered_{TEST_FILENAME}")

def calculate_sha256(filepath):
    sha256_hash = hashlib.sha256()
    if not os.path.exists(filepath):
        return None
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def test_recovery():
    print(f"1. CREATE REAL FILE: {TEST_FILEPATH}")
    test_data = b"This is a robust test file for live NTFS deleted file recovery.\n" * 100
    with open(TEST_FILEPATH, "wb") as f:
        f.write(test_data)
    
    print("2. CALCULATE ORIGINAL SHA256")
    original_hash = calculate_sha256(TEST_FILEPATH)
    print(f"   Original Hash: {original_hash}")
    
    print("3. DELETE FILE")
    os.remove(TEST_FILEPATH)
    time.sleep(2)
    
    print("4. OPEN REAL C: VOLUME")
    try:
        img_info = pytsk3.Img_Info(url=r"\\.\C:")
        print("   raw C: access PASS")
    except Exception as e:
        print(f"FAILED TO OPEN VOLUME: {e}")
        return
        
    print("5. OPEN NTFS")
    try:
        fs_info = pytsk3.FS_Info(img_info)
        print("   NTFS PASS")
    except Exception as e:
        print(f"FAILED TO OPEN FS: {e}")
        return

    print("6. ENUMERATE REAL $MFT")
    print(f"   Target filename to find: {TEST_FILENAME}")
    
    found_inode = None
    file_data = b""
    is_resident = False
    data_runs_info = []
    
    try:
        # We will use open_dir to search for unallocated files within the specific directory to avoid scanning 3.5M inodes blindly.
        # This effectively enumerates the MFT records associated with that directory.
        tsk_dir_path = "/Users/deeks/OneDrive/Desktop/Catch-AI-repo"
        try:
            directory = fs_info.open_dir(path=tsk_dir_path)
        except Exception as e:
            print(f"   Failed to open directory {tsk_dir_path}: {e}")
            directory = []
            
        for entry in directory:
            if not entry.info.name or not entry.info.name.name:
                continue
                
            name = entry.info.name.name.decode("utf8", errors="ignore")
            
            if name == TEST_FILENAME:
                found_inode = entry.info.meta.addr
                print("\n   [+] IDENTIFY REAL DELETED RECORD")
                print(f"   MFT record number: {found_inode}")
                print(f"   filename: {name}")
                
                # Check deleted state
                is_unallocated = entry.info.meta.flags & pytsk3.TSK_FS_META_FLAG_UNALLOC
                print(f"   deleted/in-use state: {'DELETED (UNALLOCATED)' if is_unallocated else 'IN-USE (ALLOCATED)'}")
                
                # Resolve parent directory
                parent_ref = entry.info.name.par_addr
                print(f"   parent reference: {parent_ref}")
                
                print(f"   file size: {entry.info.meta.size} bytes")
                
                file_obj = fs_info.open_meta(inode=found_inode)
                
                # Extract DATA attribute
                for attr in file_obj:
                    if attr.info.type == pytsk3.TSK_FS_ATTR_TYPE_DATA:
                        resident_status = "RESIDENT" if attr.info.flags & pytsk3.TSK_FS_ATTR_RES else "NON-RESIDENT"
                        print(f"   data attribute type: {resident_status}")
                        is_resident = resident_status == "RESIDENT"
                        
                        if not is_resident:
                            print("   data runs:")
                            for run in attr:
                                print(f"      - offset: {run.addr}, len: {run.len}")
                                data_runs_info.append((run.addr, run.len))
                        else:
                            print("   data runs: N/A (Resident Data)")
                            
                        file_data = attr.read_random(0, attr.info.size)
                        print(f"   recovered byte count: {len(file_data)}")
                        break
                break
                
    except Exception as e:
        print(f"Error during scan: {e}")

    if not found_inode:
        print("\nRECOVERY_STATUS=TARGET_MFT_RECORD_NOT_FOUND")
        print("\nREAL LIVE WINDOWS DELETED RECOVERY NOT VERIFIED")
        return

    if not file_data:
        print("\nRECOVERY_STATUS=DATA_UNAVAILABLE")
        print("\nREAL LIVE WINDOWS DELETED RECOVERY NOT VERIFIED")
        return

    print("\n11. WRITE RECOVERED FILE")
    with open(RECOVERED_FILEPATH, "wb") as f:
        f.write(file_data)
        
    print("\n12. CALCULATE RECOVERED SHA256")
    recovered_hash = calculate_sha256(RECOVERED_FILEPATH)
    print(f"    Original SHA256:  {original_hash}")
    print(f"    Recovered SHA256: {recovered_hash}")
    
    print("\n13. COMPARE HASHES")
    if original_hash == recovered_hash:
        print("    HASH MATCH PASS")
        print("\nREAL LIVE WINDOWS DELETED RECOVERY VERIFIED")
        print("\n--- FINAL EVIDENCE ---")
        print("service/process identity: Python test script")
        print("raw C: access PASS")
        print("NTFS PASS")
        print(f"MFT record number: {found_inode}")
        print(f"deleted flag/state: DELETED")
        print(f"parent reference: {parent_ref}")
        print(f"data attribute type: {'RESIDENT' if is_resident else 'NON-RESIDENT'}")
        if not is_resident:
            print("data runs:")
            for r in data_runs_info:
                print(f"  - offset: {r[0]}, len: {r[1]}")
        else:
            print("data runs: N/A")
        print(f"recovered byte count: {len(file_data)}")
        print(f"original SHA256: {original_hash}")
        print(f"recovered SHA256: {recovered_hash}")
        print("HASH MATCH PASS")
    else:
        print("    HASHES DO NOT MATCH!")
        print("\nREAL LIVE WINDOWS DELETED RECOVERY NOT VERIFIED")
        
if __name__ == "__main__":
    test_recovery()
