#!/usr/bin/env python3
"""
Test Dynamic Learning PSST over multiple prompts
"""

from dynamic_psst_compiler import DynamicPsstCompiler
import os

def test_dynamic_learning():
    print("=== DYNAMIC LEARNING TEST OVER 10 PROMPTS ===")
    
    # Initialize the dynamic compiler
    c = DynamicPsstCompiler('core_glossary.json')
    initial_glossary_size = len(c.glossary)
    initial_entries = list(c.glossary.keys())
    
    print(f"Initial glossary size: {initial_glossary_size}")
    print(f"Initial entries: {initial_entries[:5]}")
    print()
    
    # Test prompts
    test_prompts = [
        "Please analyze the legal implications of artificial intelligence in healthcare and provide a comprehensive summary.",
        "The plaintiff filed a motion for summary judgment claiming breach of contract in the healthcare AI case.",
        "Please respond in a warm, casual tone when explaining the legal concepts to make them accessible to the client.",
        "The defendant argues that the contract was void due to mutual mistake regarding the property's zoning classification.",
        "The court must determine whether the evidence shows a genuine issue of material fact in this AI healthcare case.",
        "Please provide a comprehensive analysis of the regulatory framework for artificial intelligence in medical devices.",
        "Summarize the key legal arguments presented by both parties in this healthcare technology dispute.",
        "The plaintiff contends that the defendant breached the contract by failing to deliver the AI system as specified.",
        "Please explain the legal concepts in simple terms that a non-lawyer can understand.",
        "The court will consider whether the AI system meets the contractual requirements for healthcare compliance."
    ]
    
    total_original = 0
    total_compressed = 0
    total_saved = 0
    
    for i, prompt in enumerate(test_prompts, 1):
        # Save prompt to file
        with open(f'prompt_{i}.txt', 'w') as f:
            f.write(prompt)
        
        # Use adaptive compression (with learning)
        compressed = c._adaptive_compress(prompt)
        
        # Calculate stats
        original_len = len(prompt)
        compressed_len = len(compressed)
        saved = original_len - compressed_len
        current_glossary_size = len(c.glossary)
        
        total_original += original_len
        total_compressed += compressed_len
        total_saved += saved
        
        print(f"Prompt {i}:")
        print(f"  Original: {original_len} chars")
        print(f"  Compressed: {compressed_len} chars")
        print(f"  Saved: {saved} chars")
        print(f"  Glossary size: {current_glossary_size} entries")
        print(f"  Compression: {saved/original_len*100:.1f}%")
        print(f"  Compressed text: {compressed[:50]}{'...' if len(compressed) > 50 else ''}")
        print()
    
    # Final analysis
    print("=== FINAL ANALYSIS ===")
    print(f"Initial glossary size: {initial_glossary_size}")
    print(f"Final glossary size: {len(c.glossary)}")
    print(f"New entries added: {len(c.glossary) - initial_glossary_size}")
    
    # Show new entries
    new_entries = [k for k in c.glossary.keys() if k not in initial_entries]
    print(f"New entries: {new_entries}")
    
    # Overall compression stats
    overall_compression = total_saved / total_original * 100 if total_original > 0 else 0
    print(f"\nOverall compression: {overall_compression:.1f}%")
    print(f"Total original: {total_original} chars")
    print(f"Total compressed: {total_compressed} chars")
    print(f"Total saved: {total_saved} chars")
    
    # Test if learning improved compression
    print(f"\n=== LEARNING IMPROVEMENT TEST ===")
    print("Testing the same prompt again to see if compression improved...")
    
    test_prompt = "Please analyze the legal implications of artificial intelligence in healthcare and provide a comprehensive summary."
    
    # Create a fresh compiler for comparison
    c_fresh = DynamicPsstCompiler('core_glossary.json')
    fresh_compressed = c_fresh.compress(test_prompt)
    
    print(f"Fresh compiler: {len(test_prompt)} -> {len(fresh_compressed)} chars")
    print(f"Learned compiler: {len(test_prompt)} -> {len(c.compress(test_prompt))} chars")
    
    # Check if the learned compiler has better compression
    learned_compressed = c.compress(test_prompt)
    fresh_savings = len(test_prompt) - len(fresh_compressed)
    learned_savings = len(test_prompt) - len(learned_compressed)
    
    if learned_savings > fresh_savings:
        print("✅ Learning improved compression!")
    elif learned_savings == fresh_savings:
        print("⚠️ Learning didn't improve compression for this prompt")
    else:
        print("❌ Learning actually made compression worse")
    
    # Show learning stats
    stats = c.get_learning_stats()
    print(f"\n=== LEARNING STATS ===")
    print(f"Total compressions: {stats.get('total_compressions', 0)}")
    print(f"Average compression ratio: {stats.get('average_compression_ratio', 0):.3f}")
    print(f"Best compression ratio: {stats.get('best_compression_ratio', 0):.3f}")
    print(f"Discovered patterns: {stats.get('discovered_patterns', 0)}")
    print(f"Failed patterns: {stats.get('failed_patterns', 0)}")
    
    # Show suggestions
    suggestions = c.suggest_improvements()
    if suggestions:
        print(f"\n=== SUGGESTIONS ===")
        for suggestion in suggestions:
            print(f"• {suggestion}")

if __name__ == "__main__":
    test_dynamic_learning() 