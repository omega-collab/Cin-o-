#!/usr/bin/env bash
# Search lexical sur la mémoire Ruflo exportée (.claude-memory/cin-o.json).
# Fallback au search sémantique cassé en env Claude Code Web (HuggingFace bloqué).
#
# Usage:
#   ./.claude-memory/search.sh "addproject"
#   ./.claude-memory/search.sh "permissions" --keys-only

set -euo pipefail

FILE="${CLAUDE_PROJECT_DIR:-/home/user/Cin-o-}/.claude-memory/cin-o.json"
QUERY="${1:-}"
MODE="${2:-full}"

if [[ -z "$QUERY" ]]; then
  echo "Usage: $0 <query> [--keys-only]" >&2
  exit 1
fi

if [[ ! -f "$FILE" ]]; then
  echo "Fichier mémoire introuvable: $FILE" >&2
  exit 1
fi

# Case-insensitive match sur key + value
if [[ "$MODE" == "--keys-only" ]]; then
  node -e "
    const data = JSON.parse(require('fs').readFileSync('$FILE', 'utf-8'));
    const q = '$QUERY'.toLowerCase();
    const matches = data.entries.filter(e =>
      e.key.toLowerCase().includes(q) ||
      e.value.toLowerCase().includes(q)
    );
    matches.forEach(m => console.log(m.key));
    if (matches.length === 0) process.exit(1);
  "
else
  node -e "
    const data = JSON.parse(require('fs').readFileSync('$FILE', 'utf-8'));
    const q = '$QUERY'.toLowerCase();
    const matches = data.entries.filter(e =>
      e.key.toLowerCase().includes(q) ||
      e.value.toLowerCase().includes(q)
    );
    if (matches.length === 0) {
      console.error('Aucun résultat pour: $QUERY');
      process.exit(1);
    }
    matches.forEach(m => {
      console.log('─── ' + m.key + ' (' + m.size + 'B) ───');
      console.log(m.value);
      console.log('');
    });
  "
fi
