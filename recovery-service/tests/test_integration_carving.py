import os
import unittest
import shutil
from engines.carving import CATCHCarving

class TestIntegrationCarving(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Image is generated in the root by generate_carving_image.py
        cls.image_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'test-carving.img'))
        cls.output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'test_carved_output'))
        
    def setUp(self):
        if os.path.exists(self.output_dir):
            shutil.rmtree(self.output_dir)
        os.makedirs(self.output_dir, exist_ok=True)

    def tearDown(self):
        if os.path.exists(self.output_dir):
            shutil.rmtree(self.output_dir)

    def test_real_photorec_carving(self):
        engine = CATCHCarving()
        
        # 1. Binary must exist
        self.assertEqual(engine.health_check(), "READY", f"PhotoRec binary not found at {engine.photorec_bin}")
        
        # 2. Test image must exist
        self.assertTrue(os.path.exists(self.image_path), f"Test image not found at {self.image_path}. Run generate_carving_image.py first.")
        
        # 3. Execute real carving without mocks
        result = engine.execute(self.image_path, output_dir=self.output_dir)
        
        self.assertEqual(result["status"], "SUCCESS", f"Carving failed: {result.get('error')}")
        
        files = result.get("files", [])
        self.assertGreater(len(files), 0, "No files were carved from the image")
        
        extensions = [f["name"].split(".")[-1].lower() for f in files]
        
        self.assertIn("jpg", extensions, "Failed to carve JPG")
        self.assertIn("png", extensions, "Failed to carve PNG")
        self.assertIn("pdf", extensions, "Failed to carve PDF")
        
        print(f"\nSuccessfully carved {len(files)} files:")
        for f in files:
            print(f" - {f['name']} ({f['size']} bytes)")

if __name__ == '__main__':
    unittest.main()
