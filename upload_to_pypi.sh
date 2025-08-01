#!/bin/bash

echo "=== PSST Toolkit v3.2.0 PyPI Upload ==="
echo ""
echo "📦 Package files ready for upload:"
ls -la dist/
echo ""
echo "🚀 Starting upload to PyPI..."
echo ""
echo "If prompted for credentials:"
echo "  Username: Your PyPI username"
echo "  Password: Your PyPI API token (not your regular password)"
echo ""
echo "Press Enter to continue or Ctrl+C to cancel..."
read

python3 -m twine upload dist/*

echo ""
echo "✅ Upload complete! Check https://pypi.org/project/psst-toolkit/ for the new version."
echo ""
echo "🎉 PSST Toolkit v3.2.0 is now available via:"
echo "   pip install psst-toolkit==3.2.0"
