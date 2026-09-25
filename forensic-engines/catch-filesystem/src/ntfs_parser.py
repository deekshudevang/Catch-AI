"""
NTFS Parser Module
Xß╗¡ l├╜ cß║Ñu tr├║c NTFS v├á truy cß║¡p Master File Table
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
    Class ─æß╗â parse NTFS structure v├á truy cß║¡p file system
    """
    
    def __init__(self, image_path: str):
        """
        Khß╗ƒi tß║ío NTFS Parser
        
        Args:
            image_path: ─É╞░ß╗¥ng dß║½n ─æß║┐n NTFS disk image
        """
        self.image_path = image_path
        self.img_info = None
        self.fs_info = None
        self.partition_offset = 0
        
    def open_image(self) -> bool:
        """
        Mß╗ƒ disk image v├á khß╗ƒi tß║ío pytsk3 objects
        
        Returns:
            True nß║┐u th├ánh c├┤ng, False nß║┐u thß║Ñt bß║íi
        """
        try:
            # Mß╗ƒ disk image
            self.img_info = pytsk3.Img_Info(self.image_path)
            safe_print(f"[+] ─É├ú mß╗ƒ disk image: {self.image_path}")
            safe_print(f"[+] Image size: {self.img_info.get_size()} bytes")
            
            return True
            
        except Exception as e:
            safe_print(f"[!] Lß╗ùi khi mß╗ƒ disk image: {e}")
            return False
    
    def detect_partition_offset(self) -> bool:
        """
        Tß╗▒ ─æß╗Öng ph├ít hiß╗çn partition offset trong disk image
        
        Returns:
            True nß║┐u ph├ít hiß╗çn th├ánh c├┤ng, False nß║┐u thß║Ñt bß║íi
        """
        try:
            # Thß╗¡ ─æß╗ìc volume system (partition table)
            volume = pytsk3.Volume_Info(self.img_info)
            
            # Duyß╗çt qua c├íc partition
            for partition in volume:
                # T├¼m partition NTFS
                if 'NTFS' in partition.desc.decode('utf-8').strip().upper():
                    self.partition_offset = partition.start * 512  # 512 bytes per sector
                    safe_print(f"[+] ─É├ú ph├ít hiß╗çn NTFS partition tß║íi offset: {self.partition_offset}")
                    safe_print(f"[+] Partition description: {partition.desc.decode('utf-8')}")
                    safe_print(f"[+] Partition size: {partition.len * 512} bytes")
                    return True
                    
            safe_print("[!] Kh├┤ng t├¼m thß║Ñy NTFS partition")
            return False
            
        except Exception as e:
            # Nß║┐u kh├┤ng c├│ partition table, giß║ú sß╗¡ to├án bß╗Ö image l├á NTFS
            safe_print(f"[*] Kh├┤ng ph├ít hiß╗çn ─æ╞░ß╗úc partition table: {e}")
            safe_print("[*] Giß║ú sß╗¡ to├án bß╗Ö image l├á NTFS filesystem")
            self.partition_offset = 0
            return True
    
    def open_filesystem(self) -> bool:
        """
        Mß╗ƒ NTFS filesystem
        
        Returns:
            True nß║┐u th├ánh c├┤ng, False nß║┐u thß║Ñt bß║íi
        """
        try:
            # Mß╗ƒ filesystem tß║íi partition offset
            self.fs_info = pytsk3.FS_Info(self.img_info, offset=self.partition_offset)
            
            # Kiß╗âm tra xem c├│ phß║úi NTFS kh├┤ng
            fs_type = self.fs_info.info.ftype
            if fs_type != pytsk3.TSK_FS_TYPE_NTFS:
                safe_print(f"[!] Filesystem kh├┤ng phß║úi NTFS: {fs_type}")
                return False
            
            safe_print(f"[+] ─É├ú mß╗ƒ NTFS filesystem")
            safe_print(f"[+] Block size: {self.fs_info.info.block_size} bytes")
            safe_print(f"[+] Block count: {self.fs_info.info.block_count}")
            
            return True
            
        except Exception as e:
            safe_print(f"[!] Lß╗ùi khi mß╗ƒ filesystem: {e}")
            return False
    
    def get_filesystem(self) -> Optional[pytsk3.FS_Info]:
        """
        Lß║Ñy filesystem info object
        
        Returns:
            FS_Info object hoß║╖c None nß║┐u ch╞░a mß╗ƒ
        """
        return self.fs_info
    
    def get_root_directory(self) -> Optional[pytsk3.Directory]:
        """
        Lß║Ñy root directory cß╗ºa filesystem
        
        Returns:
            Directory object hoß║╖c None nß║┐u c├│ lß╗ùi
        """
        try:
            if self.fs_info is None:
                safe_print("[!] Filesystem ch╞░a ─æ╞░ß╗úc mß╗ƒ")
                return None
                
            # Mß╗ƒ root directory (inode 5 trong NTFS)
            root_dir = self.fs_info.open_dir(path="/")
            return root_dir
            
        except Exception as e:
            safe_print(f"[!] Lß╗ùi khi mß╗ƒ root directory: {e}")
            return None
    
    def initialize(self) -> bool:
        """
        Khß╗ƒi tß║ío to├án bß╗Ö parser (mß╗ƒ image, detect partition, mß╗ƒ filesystem)
        
        Returns:
            True nß║┐u th├ánh c├┤ng, False nß║┐u thß║Ñt bß║íi
        """
        if not self.open_image():
            return False
            
        if not self.detect_partition_offset():
            return False
            
        if not self.open_filesystem():
            return False
            
        safe_print("[+] NTFS Parser ─æ├ú ─æ╞░ß╗úc khß╗ƒi tß║ío th├ánh c├┤ng")
        return True
    
    def get_file_by_inode(self, inode: int) -> Optional[pytsk3.File]:
        """
        Lß║Ñy file object theo inode number
        
        Args:
            inode: Inode number (MFT entry number)
            
        Returns:
            File object hoß║╖c None nß║┐u c├│ lß╗ùi
        """
        try:
            if self.fs_info is None:
                return None
                
            file_obj = self.fs_info.open_meta(inode=inode)
            return file_obj
            
        except Exception as e:
            safe_print(f"[!] Lß╗ùi khi mß╗ƒ file inode {inode}: {e}")
            return None
            
    def get_file_list(self, directory=None, current_path="/") -> list:
        """
        Lß║Ñy danh s├ích c├íc file trong filesystem
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
            safe_print(f"[!] Lß╗ùi khi ─æß╗ìc directory: {e}")
            
        return files
        
    def read_file_content(self, filename: str) -> bytes:
        """
        ─Éß╗ìc nß╗Öi dung file theo t├¬n
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
                    safe_print(f"[!] Lß╗ùi khi ─æß╗ìc file content: {e}")
                    return b""
        return b""
    
    def close(self):
        """
        ─É├│ng parser v├á giß║úi ph├│ng t├ái nguy├¬n
        """
        self.fs_info = None
        self.img_info = None
        safe_print("[+] ─É├ú ─æ├│ng NTFS Parser")

