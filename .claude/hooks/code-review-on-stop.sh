#!/bin/bash
# Stop hook: if Claude made code edits this turn, block the stop and ask it to run /code-review.
# Loop guard: if the previous Stop already fired this hook (stop_hook_active=true), exit silently.

set -u

INPUT=$(cat)

STOP_ACTIVE=$(printf '%s' "$INPUT" | jq -r '.stop_hook_active // false' 2>/dev/null)
if [ "$STOP_ACTIVE" = "true" ]; then
  exit 0
fi

TRANSCRIPT=$(printf '%s' "$INPUT" | jq -r '.transcript_path // empty' 2>/dev/null)
if [ -z "$TRANSCRIPT" ] || [ ! -f "$TRANSCRIPT" ]; then
  exit 0
fi

# Find the line number of the most recent real user prompt. tool_result wrappers
# are also "type":"user" lines, so skip them — we want the actual user-typed message.
LAST_USER_LINE=$(grep -n '"type":"user"' "$TRANSCRIPT" 2>/dev/null \
  | grep -v '"tool_result"' \
  | tail -1 \
  | cut -d: -f1)
if [ -z "$LAST_USER_LINE" ]; then
  exit 0
fi

# Look at lines after the last user message for edit-style tool_use entries.
EDIT_HITS=$(tail -n +"$LAST_USER_LINE" "$TRANSCRIPT" 2>/dev/null \
  | grep -c -E '"type":"tool_use"[^}]*"name":"(Edit|Write|MultiEdit|NotebookEdit)"' \
  || true)

if [ "${EDIT_HITS:-0}" -gt 0 ]; then
  cat <<'JSON'
{"decision":"block","reason":"This turn made code edits. Before stopping, run the /code-review skill on the changes: review for correctness, quality, and efficiency, then fix any issues found. Once /code-review completes, stop normally."}
JSON
fi

exit 0
