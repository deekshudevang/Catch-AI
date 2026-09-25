import os

def create_test_image(filename="test-carving.img"):
    # Create 5MB image of zeros
    with open(filename, 'wb') as f:
        f.write(b'\x00' * (5 * 1024 * 1024))
    
    # Paths to real files
    jpg_src = r"C:\Users\deeks\OneDrive\Desktop\Catch-AI-repo\recovery-frontend\node_modules\force-graph\example\img-nodes\imgs\dog.jpg"
    png_src = r"C:\Users\deeks\OneDrive\Desktop\Catch-AI-repo\recovery-frontend\src\assets\hero.png"
    pdf_src = r"C:\Users\deeks\OneDrive\Desktop\Catch-AI-repo\testdisk-7.2\testdisk.pdf"
    
    # Embed JPG at 1MB
    if os.path.exists(jpg_src):
        with open(jpg_src, 'rb') as f: data = f.read()
        with open(filename, 'r+b') as f:
            f.seek(1 * 1024 * 1024)
            f.write(data)
            
    # Embed PNG at 2MB
    if os.path.exists(png_src):
        with open(png_src, 'rb') as f: data = f.read()
        with open(filename, 'r+b') as f:
            f.seek(2 * 1024 * 1024)
            f.write(data)
            
    # Embed PDF at 3MB
    if os.path.exists(pdf_src):
        with open(pdf_src, 'rb') as f: data = f.read()
        with open(filename, 'r+b') as f:
            f.seek(3 * 1024 * 1024)
            f.write(data)

if __name__ == "__main__":
    create_test_image()
    print("Created test-carving.img with real JPG, PNG, and PDF embedded")
