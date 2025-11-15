# Beads Setup for Browser Environment

## TL;DR
Use `bd --no-db` instead of `bd` for all commands in browser environment.

## Why
Browser environment has SQLite locking issues. Beads supports JSONL-only mode which works perfectly!

## Usage Examples
```bash
# Create issue
bd --no-db create "Issue title"

# List issues
bd --no-db list

# Close issue
bd --no-db close one-job-1

# Show issue
bd --no-db show one-job-1
```

## Notes
- All data stored in .beads/issues.jsonl (committed to git)
- No SQLite database needed
- Fully functional issue tracking
- Works great for coding agent memory

