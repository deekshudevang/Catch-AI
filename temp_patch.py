import sys

fpath = r'c:\Users\deeks\OneDrive\Desktop\Catch-AI-repo\recovery-service\app\models.py'
with open(fpath, 'r') as f:
    text = f.read()

text = text.replace('reconstruction_id = Column(String, nullable=True)', 'reconstruction_id = Column(String, nullable=True)\n    provenance = Column(String, default="UNKNOWN")')

with open(fpath, 'w') as f:
    f.write(text)
