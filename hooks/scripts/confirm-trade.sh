#!/bin/bash
# Safety hook: warn when zerion commands include --yes (trade execution)
# Runs on PreToolUse for Bash commands

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if echo "$COMMAND" | grep -q 'zerion.*--yes'; then
  echo '{"decision": "ask", "message": "This will execute a real trade on-chain. Please confirm you want to proceed."}'
else
  echo '{"decision": "allow"}'
fi
