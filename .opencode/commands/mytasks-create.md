---
description: Create a task in mytasks (title, description, project, priority, due, tags, assignees).
---

Create a task in mytasks using JSON output.

1. Parse the task title and options from: $ARGUMENTS
2. If `--project`, `--assigned-to` or `--requested-by` are needed, resolve numeric ids first:
   - `node .opencode/scripts/mytasks.js project list --json`
   - `node .opencode/scripts/mytasks.js member list --json`
3. Run:
   `node .opencode/scripts/mytasks.js create "<title>" [--description <text>] [--project <id>] [--priority low|med|high] [--type requirement|project] [--due YYYY-MM-DD] [--tags a,b,c] [--assigned-to <memberId>] [--requested-by <memberId>] [--status ...] --json`
4. Print the created task from `{ok, data}`.

Notes: `--tags` is a single comma-separated value. `type` (requirement/project) classifies the work item and is unrelated to the `project` grouping. For full CLI reference, load the `mytasks` skill.
