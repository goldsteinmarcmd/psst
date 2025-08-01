#!/usr/bin/env python3
"""
Script to add copyright headers to all Python files in the PSST project.
"""

import os
import glob
from pathlib import Path

COPYRIGHT_HEADER = '''"""
Copyright (c) 2024 Marc Goldstein. All rights reserved.

This software is part of the PSST (Prompt Symbol Standard Technology) toolkit.
PSST is a proprietary prompt compression and optimization system that achieves
up to 94.9% token reduction while maintaining perfect semantic fidelity.

For licensing and commercial use inquiries, contact: marcgoldstein@example.edu

MIT License - See LICENSE file for details.
"""

'''

def add_copyright_header(file_path):
    """Add copyright header to a Python file if it doesn't already have one."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if copyright header already exists
        if "Copyright (c) 2024 Marc Goldstein" in content:
            print(f"✅ {file_path} - Already has copyright header")
            return False
        
        # Add copyright header after the shebang and docstring
        lines = content.split('\n')
        new_lines = []
        
        # Keep shebang if present
        if lines and lines[0].startswith('#!'):
            new_lines.append(lines[0])
            lines = lines[1:]
        
        # Keep existing docstring if present
        if lines and lines[0].strip().startswith('"""'):
            # Find end of docstring
            docstring_end = 0
            for i, line in enumerate(lines):
                if '"""' in line and i > 0:
                    docstring_end = i
                    break
            
            # Add existing docstring
            for i in range(docstring_end + 1):
                new_lines.append(lines[i])
            
            # Add copyright header
            new_lines.append(COPYRIGHT_HEADER.strip())
            
            # Add remaining lines
            new_lines.extend(lines[docstring_end + 1:])
        else:
            # No existing docstring, add copyright header at beginning
            new_lines.append(COPYRIGHT_HEADER.strip())
            new_lines.extend(lines)
        
        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines))
        
        print(f"✅ {file_path} - Added copyright header")
        return True
        
    except Exception as e:
        print(f"❌ {file_path} - Error: {e}")
        return False

def main():
    """Add copyright headers to all Python files."""
    # Find all Python files
    python_files = []
    for pattern in ['*.py', 'psst-*']:
        python_files.extend(glob.glob(pattern))
    
    # Remove duplicates and sort
    python_files = sorted(list(set(python_files)))
    
    print(f"Found {len(python_files)} Python files to process:")
    for file_path in python_files:
        print(f"  - {file_path}")
    
    print("\nProcessing files...")
    added_count = 0
    
    for file_path in python_files:
        if add_copyright_header(file_path):
            added_count += 1
    
    print(f"\n✅ Completed! Added copyright headers to {added_count} files.")

if __name__ == "__main__":
    main() 