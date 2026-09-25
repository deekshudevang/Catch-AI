import unittest
import sys
import os

# Add src to path so we can import ntfs_parser
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../forensic-engines/catch-filesystem/src')))
from ntfs_parser import NTFSParser

class TestNTFSParser(unittest.TestCase):
    def setUp(self):
        self.parser = NTFSParser("test-evidence.img")
        self.assertTrue(self.parser.initialize())

    def test_get_file_list(self):
        files = self.parser.get_file_list()
        # Ensure our files are in the list
        filenames = [f['name'] for f in files]
        self.assertIn("test1.txt", filenames)
        self.assertIn("test2.txt", filenames)
        self.assertIn("test-folder", filenames)

    def test_read_file_content(self):
        content = self.parser.read_file_content("test1.txt")
        # Touch created empty files
        self.assertEqual(content, b"")

if __name__ == '__main__':
    unittest.main()
