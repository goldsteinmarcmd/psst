#!/bin/bash

# Manual VSIX Package Creator for PSST Cursor Extension
echo "📦 Creating VSIX package for PSST Cursor Extension..."

# Create temporary directory
TEMP_DIR="temp-vsix"
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR

# Copy extension files (excluding unnecessary files)
echo "📋 Copying extension files..."
cp -r src $TEMP_DIR/
cp -r out $TEMP_DIR/
cp package.json $TEMP_DIR/
cp README.md $TEMP_DIR/
cp LICENSE $TEMP_DIR/
cp .vscodeignore $TEMP_DIR/

# Create extension.vsixmanifest
echo "📄 Creating extension manifest..."
cat > $TEMP_DIR/extension.vsixmanifest << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011" xmlns:d="http://schemas.microsoft.com/developer/vsx-schema-design/2011">
    <Metadata>
        <Identity Id="psst-toolkit.cursor-psst" Version="3.2.0" Language="en-US" Publisher="psst-toolkit" />
        <DisplayName>PSST - Prompt Symbol Standard Technology</DisplayName>
        <Description>Achieve 80-90% token reduction with perfect semantic fidelity in Cursor's AI chat</Description>
        <Tags>psst,prompt,compression,tokens,ai,cursor</Tags>
    </Metadata>
    <Installation>
        <InstallationTarget Id="Microsoft.VisualStudio.Code" Version="1.60.0" />
    </Installation>
    <Dependencies />
    <Assets>
        <Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="extension/package.json" Addressable="true" />
    </Assets>
</PackageManifest>
EOF

# Create the VSIX file structure
echo "🗜️ Creating VSIX structure..."
mkdir -p $TEMP_DIR/extension
mv $TEMP_DIR/* $TEMP_DIR/extension/ 2>/dev/null || true

# Create the VSIX file (simplified approach)
cd $TEMP_DIR
zip -r ../cursor-psst-3.2.0.vsix . -x "*.DS_Store" "*.log"
cd ..

# Clean up
rm -rf $TEMP_DIR

echo "✅ VSIX package created: cursor-psst-3.2.0.vsix"
echo ""
echo "📦 Next steps:"
echo "1. Test the VSIX file by installing it locally"
echo "2. Submit to Cursor's extension marketplace"
echo "3. Users will be able to find it in the Extensions tab!" 