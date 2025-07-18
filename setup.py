#!/usr/bin/env python3
"""
Setup script for psst: Prompt Symbol Standard Technology
"""

from setuptools import setup, find_packages
import os

# Read the README file
with open("ReadMe.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="psst",
    version="1.0.0",
    author="psst Contributors",
    description="Prompt Symbol Standard Technology - Token-efficient AI prompting",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/your-org/psst",
    py_modules=["psst_compiler"],
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Topic :: Software Development :: Compilers",
        "Topic :: Text Processing :: Linguistic",
        "Intended Audience :: Developers",
    ],
    python_requires=">=3.7",
    scripts=[
        "psst-compress",
        "psst-expand", 
        "psst-annotate",
        "psst-compare",
        "psst-openai"
    ],
    package_data={
        "": ["core_glossary.json", "examples/*.txt", "examples/*.psst"]
    },
    include_package_data=True,
    entry_points={
        "console_scripts": [
            "psst=psst_compiler:main",
        ],
    },
) 