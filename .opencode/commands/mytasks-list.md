---
description: List mytasks tasks with filters (status, project, priority, tags, search, all).
---

List tasks in mytasks using JSON output.

1. Parse filters from: $ARGUMENTS
2. Run `node .opencode/scripts/mytasks.js list <filters> --json`
3. Print the result: `{ok, data}` is an array of tasks, each with nested `assignedTo`, `requestedBy` and `project` objects (may be `null`).

Supported filters: `--status <s1,s2>`, `--project <id>`, `--tag <t1,t2>`, `--priority <p1,p2>`, `--type`, `--assigned-to <id>`, `--requested-by <id>`, `--due-before/--due-after <YYYY-MM-DD>`, `--search <text>`, `--sort due_date|priority|created_at|updated_at`, `--all` (include done tasks).

Reminders: `list` hides `done` tasks by default — use `--all` or `show <id>`. `--project` and `--assigned-to` take numeric ids, resolve them first via `project list --json` / `member list --json`.

For full CLI reference, load the `mytasks` skill.
