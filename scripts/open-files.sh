#!/bin/bash
# Open files in VS Code for review before editing
# Usage: ./scripts/open-files.sh file1.ts file2.ts ...

if [ $# -eq 0 ]; then
  echo "Usage: $0 <file1> [file2] ..."
  exit 1
fi

code "$@"
echo "Opened $# file(s) in VS Code:"
for f in "$@"; do
  echo "  → $f"
done
