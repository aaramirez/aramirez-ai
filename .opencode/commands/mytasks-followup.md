---
description: Create, close, or list mytasks follow-ups for a task.
---

Manage follow-ups (scheduled reminders on a task) in mytasks using JSON output.

1. Parse the action and args from: $ARGUMENTS
2. Run the matching command:
   - Create: `node .opencode/scripts/mytasks.js followup create <taskId> --date YYYY-MM-DD [--note "<text>"] --json`
   - Close: `node .opencode/scripts/mytasks.js followup done <followupId> --json`
   - List history for a task: `node .opencode/scripts/mytasks.js followup list <taskId> --json`
   - List all pending follow-ups: `node .opencode/scripts/mytasks.js followup list --json`
3. Print the result from `{ok, data}`.

A follow-up is one row in the task history (scheduled date + optional note + completion state), not a single field. For full CLI reference, load the `mytasks` skill.
