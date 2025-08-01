#!/usr/bin/env python3
"""
Build script for PSST package
"""

import os
import subprocess
import sys
from pathlib import Path

def run_command(cmd, description):
    """Run a command and handle errors."""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def main():
    """Build the PSST package."""
    print("🚀 Building PSST Package for PyPI")
    print("=" * 50)
    
    # Clean previous builds
    print("🧹 Cleaning previous builds...")
    for path in ["build", "dist", "*.egg-info"]:
        subprocess.run(f"rm -rf {path}", shell=True)
    
    # Check if required files exist
    required_files = [
        "setup.py",
        "pyproject.toml", 
        "MANIFEST.in",
        "README_PSST.md",
        "psst_ultimate.py",
        "psst_hybrid_integration.py"
    ]
    
    missing_files = []
    for file in required_files:
        if not Path(file).exists():
            missing_files.append(file)
    
    if missing_files:
        print(f"❌ Missing required files: {missing_files}")
        return False
    
    print("✅ All required files found")
    
    # Build the package
    if not run_command("python3 setup.py sdist bdist_wheel", "Building package"):
        return False
    
    # Check the built package
    if not run_command("python3 -m twine check dist/*", "Checking package"):
        return False
    
    # List built files
    print("\n📦 Built packages:")
    subprocess.run("ls -la dist/", shell=True)
    
    print("\n🎉 Package built successfully!")
    print("📋 Next steps:")
    print("1. Test installation: pip install dist/psst-3.0.0.tar.gz")
    print("2. Upload to PyPI: python3 -m twine upload dist/*")
    print("3. Or upload to TestPyPI: python3 -m twine upload --repository testpypi dist/*")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
