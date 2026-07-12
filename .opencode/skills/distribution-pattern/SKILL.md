---
name: distribution-pattern
description: Follow the four-layer distributable package pattern when creating new skills for shared/.
license: MIT
---

# Distribution Pattern

When creating a new distributable skill in `shared/`, follow the four-layer package pattern.

## Package Structure

```
shared/
├── skills/<name>/SKILL.md     ← instructions + frontmatter
├── scripts/<name>.js          ← CLI implementation
├── agents/<name>.md           ← agent that loads the skill
└── commands/<name>.md         ← shortcut command
```

## Rules

1. **SKILL.md** must have `scripts: [<name>.js]` in frontmatter
2. **Script** must have `--help`, zero-deps (Node.js only), cross-platform
3. **Agent** name must match skill name; must have `description`, `mode`, `model`, `permission` in frontmatter
4. **Command** name must match skill name; must have `description` in frontmatter

## Installation

When user runs `arai install skill <name>`, all four layers are installed:
- Skill → `.opencode/skills/<name>/`
- Scripts → `shared/scripts/`
- Agent → `.opencode/agents/<name>/` + registered in `opencode.json`
- Command → `.opencode/commands/<name>/`

## Package Types

- **Full** (6): content-ingestion, document-generation, email, kb-management, youtube, vault-pdf-export
- **Utility** (2): branding, pdf-extraction
- **Instructive** (4): code-review, git, google-workspace, m365
