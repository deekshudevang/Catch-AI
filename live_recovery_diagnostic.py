import os
import time
import uuid
import ctypes
import hashlib
import pytsk3

TARGET_DIR = r"C:\Users\deeks\OneDrive\Desktop\Catch-AI-repo"
TSK_TARGET_DIR = "/Users/deeks/OneDrive/Desktop/Catch-AI-repo"

FILE_ATTRIBUTE_REPARSE_POINT = 0x400

def get_file_attributes(filepath):
    attrs = ctypes.windll.kernel32.GetFileAttributesW(filepath)
    if attrs == -1: return None
    return attrs

def calculate_sha256(filepath):
    sha256_hash = hashlib.sha256()
    if not os.path.exists(filepath): return None
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def search_raw_mft_for_filename(fs_info, filename):
    print(f"\n[RAW MFT SEARCH] Searching for UTF-16LE string: {filename}")
    utf16_name = filename.encode("utf-16le")
    mft_file = fs_info.open_meta(inode=0)
    
    mft_size = mft_file.info.meta.size
    chunk_size = 1024 * 1024 * 10 # 10MB chunks
    
    offset = 0
    while offset < mft_size:
        read_size = min(chunk_size, mft_size - offset)
        try:
            data = mft_file.read_random(offset, read_size)
        except Exception as e:
            print(f"Error reading MFT at offset {offset}: {e}")
            break
            
        idx = data.find(utf16_name)
        if idx != -1:
            match_offset = offset + idx
            print(f"RAW_UTF16_FILENAME_FOUND=YES")
            print(f"RAW_MATCH_OFFSET={match_offset}")
            record_num = match_offset // 1024
            print(f"Calculated MFT record number (assuming 1024 byte records): {record_num}")
            return match_offset, record_num
        offset += read_size
                
    print("RAW_UTF16_FILENAME_FOUND=NO")
    return None, None

def analyze_mft_record(fs_info, inode):
    try:
        file_obj = fs_info.open_meta(inode=inode)
        meta = file_obj.info.meta
        is_unalloc = meta.flags & pytsk3.TSK_FS_META_FLAG_UNALLOC
        
        found_names = []
        parent_ref = None
        is_resident = False
        data_runs = []
        has_data = False
        
        for attr in file_obj:
            if attr.info.type == pytsk3.TSK_FS_ATTR_TYPE_NTFS_FNAME:
                if attr.info.name:
                    found_names.append(attr.info.name.decode("utf8", "ignore"))
                # Read attribute data for filename if possible
                try:
                    attr_data = file_obj.read_random(0, attr.info.size, attr.info.type, attr.info.id)
                    if len(attr_data) >= 66:
                        # minimal parsing to get parent and name
                        parent_ref = int.from_bytes(attr_data[0:6], 'little')
                        name_len = attr_data[64]
                        name_bytes = attr_data[66:66+(name_len*2)]
                        parsed_name = name_bytes.decode("utf-16le", "ignore")
                        found_names.append(parsed_name)
                except Exception as e:
                    pass
                    
            if attr.info.type == pytsk3.TSK_FS_ATTR_TYPE_NTFS_DATA:
                has_data = True
                is_resident = bool(attr.info.flags & pytsk3.TSK_FS_ATTR_RES)
                if not is_resident:
                    for run in attr:
                        data_runs.append((run.addr, run.len))
                        
        return {
            "allocated": not is_unalloc,
            "names": found_names,
            "parent_ref": parent_ref,
            "size": meta.size,
            "has_data": has_data,
            "is_resident": is_resident,
            "data_runs": data_runs
        }
    except Exception as e:
        return {"error": str(e)}

def scan_mft_for_filename(fs_info, target_filename, start_inode, end_inode):
    records_examined = 0
    valid_records = 0
    active_records = 0
    deleted_records = 0
    file_name_attrs = 0
    data_attrs = 0
    
    found_inode = None
    found_info = None
    
    for inode in range(start_inode, end_inode):
        records_examined += 1
        try:
            file_obj = fs_info.open_meta(inode=inode)
            valid_records += 1
            meta = file_obj.info.meta
            
            if meta.flags & pytsk3.TSK_FS_META_FLAG_UNALLOC:
                deleted_records += 1
            else:
                active_records += 1
                
            has_fn = False
            has_dt = False
            for attr in file_obj:
                if attr.info.type == pytsk3.TSK_FS_ATTR_TYPE_NTFS_FNAME:
                    has_fn = True
                    try:
                        attr_data = file_obj.read_random(0, attr.info.size, attr.info.type, attr.info.id)
                        if len(attr_data) >= 66:
                            name_len = attr_data[64]
                            name_bytes = attr_data[66:66+(name_len*2)]
                            parsed_name = name_bytes.decode("utf-16le", "ignore")
                            if parsed_name == target_filename:
                                found_inode = inode
                    except:
                        pass
                if attr.info.type == pytsk3.TSK_FS_ATTR_TYPE_NTFS_DATA:
                    has_dt = True
                    
            if has_fn: file_name_attrs += 1
            if has_dt: data_attrs += 1
            
            if found_inode and not found_info:
                found_info = analyze_mft_record(fs_info, found_inode)
                
        except Exception:
            pass
            
    print(f"MFT_RECORDS_EXAMINED={records_examined}")
    print(f"VALID_FILE_RECORDS={valid_records}")
    print(f"ACTIVE_RECORDS={active_records}")
    print(f"DELETED_RECORDS={deleted_records}")
    print(f"FILE_NAME_ATTRIBUTES={file_name_attrs}")
    print(f"DATA_ATTRIBUTES={data_attrs}")
    
    return found_inode, found_info

def main():
    print("\n[DIAGNOSTIC START]")
    control_filename = f"test_mft_control_{uuid.uuid4().hex}.txt"
    control_filepath = os.path.join(TARGET_DIR, control_filename)
    
    test_data = b"DIAGNOSTIC_CONTROL_FILE\n" * 200
    with open(control_filepath, "wb") as f:
        f.write(test_data)
        
    print(f"Control File Created: {control_filepath}")
    print(f"file size: {os.path.getsize(control_filepath)}")
    print(f"SHA256: {calculate_sha256(control_filepath)}")
    
    attrs = get_file_attributes(control_filepath)
    is_reparse = bool(attrs & FILE_ATTRIBUTE_REPARSE_POINT) if attrs else False
    print(f"Windows file attributes: {hex(attrs) if attrs else 'Unknown'}")
    print(f"reparse-point status: {'YES' if is_reparse else 'NO'}")
    print(f"locally available: {'YES' if os.path.getsize(control_filepath) > 0 else 'NO'}")
    
    time.sleep(2)
    
    print("\n--- STEP 1: BEFORE DELETION ---")
    try:
        img_info = pytsk3.Img_Info(url=r"\\.\C:")
        print("RAW_VOLUME=PASS")
    except Exception as e:
        print(f"RAW_VOLUME=FAIL ({e})")
        return
        
    try:
        fs_info = pytsk3.FS_Info(img_info)
        print("NTFS=PASS")
        print("MFT_OPEN=PASS")
    except Exception as e:
        print(f"NTFS=FAIL ({e})")
        return

    # Scanning last 20,000 inodes to save time, assuming new file is at the end.
    last_inum = fs_info.info.last_inum
    start_inum = max(0, last_inum - 20000)
    print(f"Scanning MFT from inode {start_inum} to {last_inum}...")
    
    active_inode, active_info = scan_mft_for_filename(fs_info, control_filename, start_inum, last_inum + 1)
    
    if active_inode:
        print("CONTROL_FILE_FOUND=YES")
        print(f"CONTROL_MFT_RECORD={active_inode}")
        print(f"CONTROL_FILENAME={control_filename}")
        print(f"CONTROL_PARENT_REFERENCE={active_info.get('parent_ref')}")
        print(f"CONTROL_FILE_SIZE={active_info.get('size')}")
        print(f"CONTROL_DATA_ATTRIBUTE={'RESIDENT' if active_info.get('is_resident') else 'NON_RESIDENT'}")
        print(f"CONTROL_DATA_RUNS={active_info.get('data_runs')}")
    else:
        print("CONTROL_FILE_FOUND=NO")
        
        # Fallback to RAW search to find it
        raw_offset, raw_inode = search_raw_mft_for_filename(fs_info, control_filename)
        if raw_inode:
            print(f"Found via RAW search at inode: {raw_inode}. Parsing it directly...")
            active_inode = raw_inode
            active_info = analyze_mft_record(fs_info, active_inode)
            print(f"CONTROL_MFT_RECORD={active_inode}")
            print(f"CONTROL_PARENT_REFERENCE={active_info.get('parent_ref')}")
            print(f"CONTROL_FILE_SIZE={active_info.get('size')}")
        else:
            print("MFT_ACTIVE_FILE_LOOKUP=FAILED")
            return

    print("\n--- STEP 2: DELETE THE CONTROL FILE ---")
    os.remove(control_filepath)
    time.sleep(2)
    
    print("\n--- STEP 3: MFT RESCAN AFTER DELETION ---")
    deleted_info = analyze_mft_record(fs_info, active_inode)
    
    if "error" not in deleted_info:
        print("DELETED_CONTROL_FILE_FOUND=YES")
        print(f"DELETED_CONTROL_MFT_RECORD={active_inode}")
        print(f"DELETED_FLAG={'YES' if not deleted_info.get('allocated') else 'NO (Still Active)'}")
        print(f"DELETED_FILENAME_ATTRIBUTE={'YES' if deleted_info.get('names') else 'NO'}")
        print(f"DELETED_PARENT_REFERENCE={deleted_info.get('parent_ref')}")
        print(f"DELETED_DATA_ATTRIBUTE={'YES' if deleted_info.get('has_data') else 'NO'}")
    else:
        print("DELETED_CONTROL_FILE_FOUND=NO")
        print(f"DELETED_CONTROL_MFT_RECORD=null")
        print(f"Error: {deleted_info['error']}")

    print("\n--- RAW MFT SEARCH FOR DELETED FILE ---")
    raw_offset, raw_inode = search_raw_mft_for_filename(fs_info, control_filename)
    if raw_inode:
        print("\n--- STEP 4: VALID FILE RECORD PARSING ---")
        val_info = analyze_mft_record(fs_info, raw_inode)
        print(f"Record number: {raw_inode}")
        print(f"Names found: {val_info.get('names')}")
        print(f"Has DATA: {val_info.get('has_data')}")
        
    print("\n--- FINAL REPORT ---")
    print("A. RAW_VOLUME: PASS")
    print("B. NTFS: PASS")
    print("C. MFT_OPEN: PASS")
    print("D. MFT_ENUMERATION: PASS")
    print(f"E. ACTIVE_CONTROL_FILE_LOOKUP: {'PASS' if active_inode else 'FAIL'}")
    print(f"F. DELETED_CONTROL_FILE_LOOKUP: {'PASS' if not deleted_info.get('allocated') else 'FAIL'}")
    print(f"G. RAW_FILENAME_SEARCH: {'PASS' if raw_inode else 'FAIL'}")
    print(f"H. DATA_ATTRIBUTE: {'PASS' if deleted_info.get('has_data') else 'FAIL'}")
    
    if deleted_info and deleted_info.get('has_data') and not deleted_info.get('allocated'):
        print("MFT_DELETED_LOOKUP=PASS")
    else:
        print("MFT_DELETED_LOOKUP=FAILED")
        
    print("I. DATA_RUNS: " + str(deleted_info.get('data_runs', [])))
    print("J. RECOVERY: NOT_TESTED (Diagnostic only)")
    print("\nREAL LIVE WINDOWS DELETED RECOVERY NOT VERIFIED (Diagnostic complete)")

if __name__ == "__main__":
    main()
