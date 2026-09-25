"""
NTFS Parser Module
Xử lý cấu trúc NTFS và truy cập Master File Table
"""

import pytsk3
import sys
from typing import Optional, Tuple

def safe_print(msg: str):
    try:
        print(msg)
    except UnicodeEncodeError:
        print(msg.encode(sys.stdout.encoding or 'ascii', 'replace').decode(sys.stdout.encoding or 'ascii'))



class NTFSParser:
    """
    Class để parse NTFS structure và truy cập file system
    """
    
    def __init__(self, image_path: str):
        """
        Khởi tạo NTFS Parser
        
        Args:
            image_path: Đường dẫn đến NTFS disk image
        """
        self.image_path = image_path
        self.img_info = None
        self.fs_info = None
        self.partition_offset = 0
        
    def open_image(self) -> bool:
        """
        Mở disk image và khởi tạo pytsk3 objects
        
        Returns:
            True nếu thành công, False nếu thất bại
        """
        try:
            # Mở disk image
            self.img_info = pytsk3.Img_Info(self.image_path)
            safe_print(f"[+] Đã mở disk image: {self.image_path}")
            safe_print(f"[+] Image size: {self.img_info.get_size()} bytes")
            
            return True
            
        except Exception as e:
            safe_print(f"[!] Lỗi khi mở disk image: {e}")
            return False
    
    def detect_partition_offset(self) -> bool:
        """
        Tự động phát hiện partition offset trong disk image
        
        Returns:
            True nếu phát hiện thành công, False nếu thất bại
        """
        try:
            # Thử đọc volume system (partition table)
            volume = pytsk3.Volume_Info(self.img_info)
            
            # Duyệt qua các partition
            for partition in volume:
                # Tìm partition NTFS
                if 'NTFS' in partition.desc.decode('utf-8').strip().upper():
                    self.partition_offset = partition.start * 512  # 512 bytes per sector
                    safe_print(f"[+] Đã phát hiện NTFS partition tại offset: {self.partition_offset}")
                    safe_print(f"[+] Partition description: {partition.desc.decode('utf-8')}")
                    safe_print(f"[+] Partition size: {partition.len * 512} bytes")
                    return True
                    
            safe_print("[!] Không tìm thấy NTFS partition")
            return False
            
        except Exception as e:
            # Nếu không có partition table, giả sử toàn bộ image là NTFS
            safe_print(f"[*] Không phát hiện được partition table: {e}")
            safe_print("[*] Giả sử toàn bộ image là NTFS filesystem")
            self.partition_offset = 0
            return True
    
    def open_filesystem(self) -> bool:
        """
        Mở NTFS filesystem
        
        Returns:
            True nếu thành công, False nếu thất bại
        """
        try:
            # Mở filesystem tại partition offset
            self.fs_info = pytsk3.FS_Info(self.img_info, offset=self.partition_offset)
            
            # Kiểm tra xem có phải NTFS không
            fs_type = self.fs_info.info.ftype
            if fs_type != pytsk3.TSK_FS_TYPE_NTFS:
                safe_print(f"[!] Filesystem không phải NTFS: {fs_type}")
                return False
            
            safe_print(f"[+] Đã mở NTFS filesystem")
            safe_print(f"[+] Block size: {self.fs_info.info.block_size} bytes")
            safe_print(f"[+] Block count: {self.fs_info.info.block_count}")
            
            return True
            
        except Exception as e:
            safe_print(f"[!] Lỗi khi mở filesystem: {e}")
            return False
    
    def get_filesystem(self) -> Optional[pytsk3.FS_Info]:
        """
        Lấy filesystem info object
        
        Returns:
            FS_Info object hoặc None nếu chưa mở
        """
        return self.fs_info
    
    def get_root_directory(self) -> Optional[pytsk3.Directory]:
        """
        Lấy root directory của filesystem
        
        Returns:
            Directory object hoặc None nếu có lỗi
        """
        try:
            if self.fs_info is None:
                safe_print("[!] Filesystem chưa được mở")
                return None
                
            # Mở root directory (inode 5 trong NTFS)
            root_dir = self.fs_info.open_dir(path="/")
            return root_dir
            
        except Exception as e:
            safe_print(f"[!] Lỗi khi mở root directory: {e}")
            return None
    
    def initialize(self) -> bool:
        """
        Khởi tạo toàn bộ parser (mở image, detect partition, mở filesystem)
        
        Returns:
            True nếu thành công, False nếu thất bại
        """
        if not self.open_image():
            return False
            
        if not self.detect_partition_offset():
            return False
            
        if not self.open_filesystem():
            return False
            
        safe_print("[+] NTFS Parser đã được khởi tạo thành công")
        return True
    
    def get_file_by_inode(self, inode: int) -> Optional[pytsk3.File]:
        """
        Lấy file object theo inode number
        
        Args:
            inode: Inode number (MFT entry number)
            
        Returns:
            File object hoặc None nếu có lỗi
        """
        try:
            if self.fs_info is None:
                return None
                
            file_obj = self.fs_info.open_meta(inode=inode)
            return file_obj
            
        except Exception as e:
            safe_print(f"[!] Lỗi khi mở file inode {inode}: {e}")
            return None
            
    def get_file_list(self, directory=None, current_path="/") -> list:
        """
        Lấy danh sách các file trong filesystem
        """
        if directory is None:
            directory = self.get_root_directory()
            if not directory:
                return []
                
        files = []
        try:
            for entry in directory:
                if not entry.info.name or not entry.info.name.name:
                    continue
                name = entry.info.name.name.decode('utf-8', errors='replace')
                if name in ['.', '..']:
                    continue
                    
                full_path = f"{current_path}{name}"
                is_dir = entry.info.meta and entry.info.meta.type == pytsk3.TSK_FS_META_TYPE_DIR
                
                files.append({
                    'name': name,
                    'path': full_path,
                    'size': entry.info.meta.size if entry.info.meta else 0,
                    'inode': entry.info.meta.addr if entry.info.meta else 0,
                    'is_dir': is_dir
                })
                
                if is_dir:
                    try:
                        sub_dir = entry.as_directory()
                        files.extend(self.get_file_list(sub_dir, f"{full_path}/"))
                    except IOError:
                        pass
        except Exception as e:
            safe_print(f"[!] Lỗi khi đọc directory: {e}")
            
        return files
        
    def read_file_content(self, filename: str) -> bytes:
        """
        Đọc nội dung file theo tên
        """
        files = self.get_file_list()
        for f in files:
            if f['name'] == filename:
                inode = f['inode']
                file_obj = self.get_file_by_inode(inode)
                if not file_obj or not file_obj.info.meta:
                    return b""
                if file_obj.info.meta.size == 0:
                    return b""
                try:
                    return file_obj.read_random(0, file_obj.info.meta.size)
                except Exception as e:
                    safe_print(f"[!] Lỗi khi đọc file content: {e}")
                    return b""
        return b""
    
    def close(self):
        """
        Đóng parser và giải phóng tài nguyên
        """
        self.fs_info = None
        self.img_info = None
        safe_print("[+] Đã đóng NTFS Parser")

