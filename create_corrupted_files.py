import os
import base64

def create_corrupted_pdf():
    corrupted_data = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\nCORRUPT_DATA_HERE\n"
    with open("corrupted_file.pdf", "wb") as f:
        f.write(corrupted_data)
    print("Created corrupted_file.pdf")

def create_corrupted_image():
    # Write a PNG header but mess up the rest
    corrupted_data = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDRCORRUPT_DATA_HERE"
    with open("corrupted_image.png", "wb") as f:
        f.write(corrupted_data)
    print("Created corrupted_image.png")

if __name__ == "__main__":
    create_corrupted_pdf()
    create_corrupted_image()
