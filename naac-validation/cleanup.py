#!/usr/bin/env python3
"""
NAAC Validation System - Automated Cleanup Script

This script helps maintain a clean project structure by removing:
- Temporary files and cache directories
- Log files older than 7 days
- Backup files and duplicates
- Generated artifacts and test outputs

Usage:
    python cleanup.py           # Interactive cleanup
    python cleanup.py --auto    # Automatic cleanup
    python cleanup.py --dry-run # Show what would be cleaned
"""

import os
import sys
import shutil
import argparse
from pathlib import Path
from datetime import datetime, timedelta

def log_action(message, color=""):
    """Log cleanup actions with optional color"""
    colors = {
        "red": "\033[91m",
        "green": "\033[92m", 
        "yellow": "\033[93m",
        "blue": "\033[94m",
        "reset": "\033[0m"
    }
    
    color_code = colors.get(color, "")
    reset_code = colors["reset"] if color else ""
    print(f"{color_code}{message}{reset_code}")

def get_file_age_days(file_path):
    """Get file age in days"""
    try:
        file_stat = os.stat(file_path)
        file_age = datetime.now() - datetime.fromtimestamp(file_stat.st_mtime)
        return file_age.days
    except:
        return 0

def cleanup_cache_directories():
    """Remove Python cache directories"""
    cache_patterns = ["__pycache__", ".pytest_cache", ".mypy_cache"]
    removed_count = 0
    
    for root, dirs, files in os.walk("."):
        for dir_name in dirs[:]:  # Create copy to safely modify during iteration
            if dir_name in cache_patterns:
                cache_path = Path(root) / dir_name
                log_action(f"  📁 Removing cache: {cache_path}", "yellow")
                try:
                    shutil.rmtree(cache_path)
                    dirs.remove(dir_name)  # Don't recurse into removed directory
                    removed_count += 1
                except Exception as e:
                    log_action(f"  ❌ Failed to remove {cache_path}: {e}", "red")
    
    return removed_count

def cleanup_temporary_files():
    """Remove temporary files"""
    temp_patterns = [
        "temp_*",
        "*.tmp", 
        "*.temp",
        ".DS_Store",
        "Thumbs.db",
        "diagnostic_results.json"
    ]
    
    removed_count = 0
    
    for pattern in temp_patterns:
        for temp_file in Path(".").glob(pattern):
            if temp_file.is_file():
                log_action(f"  🗑️ Removing temp file: {temp_file}", "yellow")
                try:
                    temp_file.unlink()
                    removed_count += 1
                except Exception as e:
                    log_action(f"  ❌ Failed to remove {temp_file}: {e}", "red")
    
    return removed_count

def cleanup_log_files(max_age_days=7):
    """Remove log files older than specified days"""
    log_patterns = ["*.log", "*.log.*"]
    removed_count = 0
    
    for pattern in log_patterns:
        for log_file in Path(".").glob(pattern):
            if log_file.is_file():
                age_days = get_file_age_days(log_file)
                if age_days > max_age_days:
                    log_action(f"  📄 Removing old log: {log_file} ({age_days} days old)", "yellow")
                    try:
                        log_file.unlink()
                        removed_count += 1
                    except Exception as e:
                        log_action(f"  ❌ Failed to remove {log_file}: {e}", "red")
    
    return removed_count

def cleanup_backup_files():
    """Remove backup and duplicate files"""
    backup_patterns = [
        "*_backup*",
        "*_original*", 
        "*.bak",
        "*.old",
        "*_copy*"
    ]
    
    removed_count = 0
    
    for pattern in backup_patterns:
        for backup_file in Path(".").glob(pattern):
            if backup_file.is_file():
                log_action(f"  💾 Removing backup: {backup_file}", "yellow")
                try:
                    backup_file.unlink()
                    removed_count += 1
                except Exception as e:
                    log_action(f"  ❌ Failed to remove {backup_file}: {e}", "red")
    
    return removed_count

def cleanup_generated_files():
    """Remove generated files and artifacts"""
    generated_patterns = [
        "simplified_response_example.json",
        "test_output_*.json",
        "validation_result_*.json"
    ]
    
    removed_count = 0
    
    for pattern in generated_patterns:
        for gen_file in Path(".").glob(pattern):
            if gen_file.is_file():
                log_action(f"  ⚙️ Removing generated file: {gen_file}", "yellow")
                try:
                    gen_file.unlink()
                    removed_count += 1
                except Exception as e:
                    log_action(f"  ❌ Failed to remove {gen_file}: {e}", "red")
    
    return removed_count

def get_cleanup_summary():
    """Get summary of what would be cleaned"""
    summary = {
        "cache_dirs": [],
        "temp_files": [],
        "old_logs": [],
        "backup_files": [],
        "generated_files": []
    }
    
    # Cache directories
    cache_patterns = ["__pycache__", ".pytest_cache", ".mypy_cache"]
    for root, dirs, files in os.walk("."):
        for dir_name in dirs:
            if dir_name in cache_patterns:
                summary["cache_dirs"].append(Path(root) / dir_name)
    
    # Temporary files
    temp_patterns = ["temp_*", "*.tmp", "*.temp", ".DS_Store", "Thumbs.db"]
    for pattern in temp_patterns:
        summary["temp_files"].extend(Path(".").glob(pattern))
    
    # Old log files (older than 7 days)
    log_patterns = ["*.log", "*.log.*"]
    for pattern in log_patterns:
        for log_file in Path(".").glob(pattern):
            if get_file_age_days(log_file) > 7:
                summary["old_logs"].append(log_file)
    
    # Backup files
    backup_patterns = ["*_backup*", "*_original*", "*.bak", "*.old"]
    for pattern in backup_patterns:
        summary["backup_files"].extend(Path(".").glob(pattern))
    
    # Generated files
    gen_patterns = ["simplified_response_example.json", "test_output_*.json"]
    for pattern in gen_patterns:
        summary["generated_files"].extend(Path(".").glob(pattern))
    
    return summary

def run_cleanup(dry_run=False, auto=False):
    """Run the cleanup process"""
    log_action("🧹 NAAC Validation System - Cleanup Script", "blue")
    log_action("=" * 50, "blue")
    
    if dry_run:
        log_action("🔍 DRY RUN - Showing what would be cleaned:", "yellow")
        summary = get_cleanup_summary()
        
        for category, items in summary.items():
            if items:
                log_action(f"\n📂 {category.replace('_', ' ').title()}:", "green")
                for item in items:
                    log_action(f"  - {item}")
        
        total_items = sum(len(items) for items in summary.values())
        log_action(f"\n📊 Total items to clean: {total_items}", "blue")
        return
    
    # Interactive confirmation
    if not auto:
        response = input("\n🤔 Proceed with cleanup? (y/N): ").strip().lower()
        if response not in ['y', 'yes']:
            log_action("❌ Cleanup cancelled by user", "red")
            return
    
    log_action("\n🚀 Starting cleanup process...", "green")
    
    total_removed = 0
    
    # Run cleanup operations
    log_action("\n1️⃣ Cleaning cache directories...")
    total_removed += cleanup_cache_directories()
    
    log_action("\n2️⃣ Cleaning temporary files...")
    total_removed += cleanup_temporary_files()
    
    log_action("\n3️⃣ Cleaning old log files...")
    total_removed += cleanup_log_files()
    
    log_action("\n4️⃣ Cleaning backup files...")
    total_removed += cleanup_backup_files()
    
    log_action("\n5️⃣ Cleaning generated files...")
    total_removed += cleanup_generated_files()
    
    log_action(f"\n✅ Cleanup completed! Removed {total_removed} items.", "green")

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="NAAC Validation System Cleanup")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be cleaned without actually cleaning")
    parser.add_argument("--auto", action="store_true", help="Run cleanup automatically without confirmation")
    
    args = parser.parse_args()
    
    # Change to script directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    try:
        run_cleanup(dry_run=args.dry_run, auto=args.auto)
    except KeyboardInterrupt:
        log_action("\n⚠️ Cleanup interrupted by user", "yellow")
    except Exception as e:
        log_action(f"\n❌ Cleanup failed: {str(e)}", "red")
        sys.exit(1)

if __name__ == "__main__":
    main()