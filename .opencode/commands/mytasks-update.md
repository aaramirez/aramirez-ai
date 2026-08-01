---
description: Update an existing mytasks task (status, priority, due, project, tags, assignees).
---

Modify an existing task in mytasks using JSON output.

1. Parse the task id and options from: $ARGUMENTS
2. Inspect the current task first: `node .opencode/scripts/mytasks.js show <id> --json`
3. Run:
   `node .opencode/scripts/mytasks.js update <id> [--title <text>] [--description <text>] [--status backlog|todo|in_progress|blocked|done] [--priority low|med|high] [--type requirement|project] [--due YYYY-MM-DD] [--project <id>|none] [--tags a,b,c] [--assigned-to <memberId>|none] [--requested-by <memberId>|none] --json`
4. Print the updated task from `{ok, data}`.

Notes: only passed fields change; `--tags` replaces the full tag set; `none` clears `--project`/`--assigned-to`/`--requested-by`. To mark done, use `done <id> --json`. For full CLI reference, load the `mytasks` skill.
