import pytsk3
import sys
import struct

def test_mft(volume_path):
    print(f"Opening volume {volume_path}")
    try:
        img = pytsk3.Img_Info(volume_path)
    except Exception as e:
        print(f"Failed to open img: {e}")
        return

    try:
        # Assuming NTFS is on the main volume directly, as it's C:
        fs = pytsk3.FS_Info(img)
    except Exception as e:
        print(f"Failed to open FS: {e}")
        return

    print(f"First inum: {fs.info.first_inum}, Last inum: {fs.info.last_inum}")
    
    # Just read a few inodes to test
    for i in range(fs.info.first_inum, fs.info.first_inum + 100):
        try:
            file = fs.open_meta(inode=i)
            if not file or not file.info or not file.info.meta:
                continue
            
            is_deleted = (file.info.meta.flags & pytsk3.TSK_FS_META_FLAG_UNALLOC) != 0
            
            # Iterate attributes
            for attr in file:
                if attr.info.type == pytsk3.TSK_FS_ATTR_TYPE_NTFS_FNAME:
                    # Read attribute data
                    data = file.read_random(0, attr.info.size, attr.info.type, attr.info.id)
                    if data and len(data) >= 66:
                        parent_ref = struct.unpack("<Q", data[0:8])[0]
                        parent_mft = parent_ref & 0xFFFFFFFFFFFF  # lower 48 bits
                        name_len = data[64]
                        name_bytes = data[66:66+name_len*2]
                        filename = name_bytes.decode('utf-16le', errors='replace')
                        print(f"Inode {i} (Deleted: {is_deleted}): Name={filename}, Parent={parent_mft}")
                        
        except Exception as e:
            pass

if __name__ == "__main__":
    import ctypes
    if ctypes.windll.shell32.IsUserAnAdmin():
        test_mft(r"\\.\C:")
    else:
        print("Run as administrator")
