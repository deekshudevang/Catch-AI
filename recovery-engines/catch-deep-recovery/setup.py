from pathlib import Path
from setuptools import setup, find_packages

long_description = (Path(__file__).parent / "README.md").read_text(encoding="utf-8")

setup(
    name="deep-recover",
    version="1.0.1",
    description="Recover deleted files via filesystem metadata parsing and raw signature carving.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="Bernard Hamie",
    url="https://github.com/Bernard411/deep-recover",
    license="MIT",
    packages=find_packages(),
    python_requires=">=3.9",
    install_requires=[],
    extras_require={
        "metadata": ["pytsk3>=20230722"],
    },
    entry_points={
        "console_scripts": [
            "deep-recover=deep_recover.cli:main",
        ],
    },
    classifiers=[
        "Development Status :: 4 - Beta",
        "Environment :: Console",
        "Intended Audience :: Information Technology",
        "License :: OSI Approved :: MIT License",
        "Operating System :: POSIX :: Linux",
        "Programming Language :: Python :: 3",
        "Topic :: Security",
        "Topic :: System :: Recovery Tools",
    ],
)
