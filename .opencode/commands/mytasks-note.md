---
description: Add or list mytasks notes (timestamped free-text log) on a task.
---

Manage notes (timestamped free-text log entries) on a mytasks task using JSON output.

1. Parse the action and args from: $ARGUMENTS
2. Run the matching command:
   - Add: `node .opencode/scripts/mytasks.js note create <taskId> --text "<content>" --json`
   - List: `node .opencode/scripts/mytasks.js note list <taskId> --json`
3. Print the result from `{ok, data}` (notes ordered newest-first).

A note is not a follow-up: it has no scheduled date or completion state, just a record of what happened. For full CLI reference, load the `mytasks` skill.
