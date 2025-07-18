# psst Installation & Usage Guide

## Quick Start

The psst compiler requires Python 3.7+ and has no external dependencies.

### 1. Installation

```bash
# Clone or download the psst files
# Make sure you have these files:
# - psst_compiler.py
# - core_glossary.json  
# - psst-compress, psst-expand, psst-annotate, psst-compare (CLI tools)

# Make CLI tools executable
chmod +x psst-compress psst-expand psst-annotate psst-compare

# Optional: Install as a package
pip install -e .
```

### 2. Basic Usage

#### Compress a prompt file
```bash
./psst-compress examples/legal_prompt.txt
# Output: legal_prompt.psst (compressed version)
```

#### Expand back to natural language
```bash
./psst-expand legal_prompt.psst  
# Output: legal_prompt_expanded.txt
```

#### Annotate symbols with tooltips
```bash
./psst-annotate examples/example_compressed.psst
# Shows symbol meanings inline
```

#### Compare glossary versions
```bash
./psst-compare old_glossary.json new_glossary.json
# Shows differences between glossaries
```

#### Send compressed prompts to OpenAI API
```bash
# Setup (one time)
pip install requests
export OPENAI_API_KEY=your_api_key_here

# Basic usage
./psst-openai "Explain quantum computing in simple terms"

# With compression stats
./psst-openai --show-tokens "Summarize the following text in 3 bullet points. Explain AI benefits."

# From file
./psst-openai < examples/openai_test_prompt.txt
```

### 3. Using as Python Library

```python
from psst_compiler import PsstCompiler

# Initialize compiler
compiler = PsstCompiler("core_glossary.json")

# Compress text
compressed = compiler.compress("Summarize the following text in 3 bullet points.")
print(compressed)  # "⊕summarize"

# Expand symbols
expanded = compiler.expand("⊕summarize")
print(expanded)    # "Summarize the following text in 3 bullet points."
```

### 4. File Structure

```
psst/
├── psst_compiler.py        # Core compiler engine
├── core_glossary.json      # Symbol definitions
├── psst-compress          # CLI: compress prompts
├── psst-expand           # CLI: expand symbols  
├── psst-annotate         # CLI: show annotations
├── psst-compare          # CLI: compare glossaries
├── psst-openai           # CLI: OpenAI API integration
├── examples/             # Example files
│   ├── legal_prompt.txt
│   ├── coding_prompt.txt
│   ├── example_compressed.psst
│   ├── openai_test_prompt.txt
│   └── openai_usage_guide.md
├── setup.py              # Package installation
├── requirements.txt      # Dependencies (requests for OpenAI)
└── INSTALL.md           # This file
```

### 5. Creating Custom Glossaries

Create your own glossary file:

```json
{
  "version": "1.0.0",
  "glossary": {
    "🏥": "You are a medical assistant.",
    "💊": "List all medications and dosages.",
    "🚑": "This is urgent - respond immediately."
  }
}
```

Use with custom glossary:
```bash
./psst-compress prompt.txt --glossary custom_glossary.json
```

### 6. Best Practices

1. **Version Control**: Store glossaries in Git for tracking changes
2. **Team Glossaries**: Share common symbol sets across your organization  
3. **Symbol Hygiene**: Use semantic, memorable symbols
4. **Backup Originals**: Keep uncompressed prompts for readability
5. **Validation**: Run `python psst_compiler.py validate glossary.json` regularly

### 7. Integration Examples

#### In CI/CD Pipeline
```yaml
# .github/workflows/prompts.yml
- name: Validate psst glossary
  run: python psst_compiler.py validate core_glossary.json

- name: Compress prompts for production
  run: find prompts/ -name "*.txt" -exec ./psst-compress {} \;
```

#### Pre-commit Hook
```bash
#!/bin/sh
# Automatically compress prompts before commit
for file in $(git diff --cached --name-only | grep "\.txt$"); do
    ./psst-compress "$file"
    git add "${file%.*}.psst"
done
```

### 8. Troubleshooting

**Q: No compression achieved?**
A: Check that your text contains phrases defined in the glossary.

**Q: Symbols not expanding?**  
A: Verify the glossary file path and encoding (should be UTF-8).

**Q: CLI tools not working?**
A: Ensure they're executable: `chmod +x psst-*`

### 9. OpenAI API Integration

The `psst-openai` tool provides seamless integration with OpenAI's API, automatically compressing prompts before sending to save tokens and reduce costs.

#### Setup OpenAI Integration
```bash
# Install API dependency
pip install requests

# Set your OpenAI API key
export OPENAI_API_KEY=your_api_key_here

# Test the integration
./psst-openai "Hello, this is a test prompt"
```

#### Real-world Usage Examples
```bash
# Content creation with compression stats
./psst-openai --show-tokens --model gpt-4 \
  "Please act as a content writer and summarize the following text in 3 bullet points. Topic: Climate change solutions"

# Code analysis
./psst-openai --system "You are an expert programmer" \
  "Explain this algorithm and calculate its time complexity"

# Compare compressed vs raw
./psst-openai --show-tokens "Long prompt with repeated phrases..."
./psst-openai --raw --show-tokens "Long prompt with repeated phrases..."
```

#### Cost Benefits
- **Typical savings**: 5-30% token reduction
- **Example**: 1000-token prompt → 850 tokens = 15% cost reduction
- **Annual savings**: Significant for high-volume applications

For detailed usage examples, see `examples/openai_usage_guide.md`.

### 10. Performance

- **Compression**: ~1000 prompts/second on average hardware
- **Memory**: <10MB for typical glossaries  
- **Token Savings**: 5-50% depending on prompt style and glossary coverage
- **API Integration**: ~2-5ms compression overhead per request

---

For more information, see the main [ReadMe.md](ReadMe.md) specification. 