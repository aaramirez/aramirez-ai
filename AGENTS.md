# aramirez-ai — AI Agent Instructions

This repository is a **harness for producing focused, specialized agent architectures** and complete opencode configurations. It generates new projects with pre-configured agents, skills, and commands via `arai init`.

## Architecture

Two directories, two purposes:

| Directory | Purpose | Contents |
|-----------|---------|----------|
| `.opencode/` | **The machine** — harness that produces new agent architectures | 16 creator triplets (skill + script + agent), runtime config, commands, plugins |
| `shared/` | **The artifacts** — distributable components for new projects | 12 distributable skills, project templates, prompts, rules, docgen pipeline |

### Creator Triplet Pattern

Each creator follows a three-layer architecture:

```
SKILL.md (instructions)  →  create-*.js (implementation)  →  agent .md (invocation wrapper)
```

- **SKILL.md** at `.opencode/skills/<name>/SKILL.md` — what to do, rules, validation
- **Script** at `.opencode/scripts/create-*.js` — Node.js ESM generator
- **Agent** at `.opencode/agents/<name>.md` — loads skill, runs script, enforces rules

16 creators: agent, architecture, command, config, flow, harness-generator, instructions, mcp, permission, plugin, prompt, reference, rule, script, skill, tool.

### How It Works

1. **User** invokes an agent (e.g., `@agent-creator`)
2. **Agent** loads its skill (instructions + rules)
3. **Agent** runs the script (`node .opencode/scripts/create-*.js`)
4. **Script** produces the artifact (Markdown, JSON, or JS file)
5. **Agent** validates output per skill rules, reports to user

### Distributable Package Pattern

Each distributable artifact in `shared/` follows a four-layer package:

```
shared/
├── skills/<name>/SKILL.md     ← instructions + frontmatter
├── scripts/<name>.js          ← CLI implementation
├── agents/<name>.md           ← agent that loads the skill
└── commands/<name>.md         ← shortcut command
```

When a user runs `arai install skill <name>`, all four layers are installed:
- Skill → `.opencode/skills/<name>/`
- Scripts → `shared/scripts/`
- Agent → `.opencode/agents/<name>/` + registered in `opencode.json`
- Command → `.opencode/commands/<name>/`

**Three package types:**
- **Full** (6): content-ingestion, document-generation, email, kb-management, youtube, vault-pdf-export
- **Utility** (2): branding, pdf-extraction
- **Instructive** (4): code-review, git, google-workspace, m365

## Quick Start

```bash
arai init my-project                    # scaffold with defaults
arai init my-project --template full    # complete structure
arai list skills                        # see available distributable skills
arai list agents                        # see available agents
```

All install/uninstall commands accept `--project <dir>` (default: `.`).

## Creator Triplets

| Creator | Skill | Script | Agent |
|---------|-------|--------|-------|
| agent | agent-creator | create-agent.js | agent-creator.md |
| architecture | architecture-creator | create-architecture.js | architecture-creator.md |
| command | command-creator | create-command.js | command-creator.md |
| config | config-creator | create-config.js | config-creator.md |
| flow | flow-creator | create-flow.js | flow-creator.md |
| harness-generator | harness-generator | *(orchestrates others)* | new-harness.md |
| instructions | instructions-creator | create-instructions.js | instructions-creator.md |
| mcp | mcp-creator | create-mcp.js | mcp-creator.md |
| permission | permission-creator | create-permission.js | permission-creator.md |
| plugin | plugin-creator | create-plugin.js | plugin-creator.md |
| prompt | prompt-creator | create-prompt.js | prompt-creator.md |
| reference | reference-creator | create-reference.js | reference-creator.md |
| rule | rule-creator | create-rule.js | rule-creator.md |
| script | script-creator | create-script.js | script-creator.md |
| skill | skill-creator | create-skill.js | skill-creator.md |
| tool | tool-creator | create-tool.js | tool-creator.md |

All scripts support `--dry-run` (preview) and `--help` (usage).

## Agent Registry

| Agent | Mode | Purpose |
|-------|------|---------|
| **build** | primary | Default — implementation of features |
| **plan** | primary | Strategic planning (`edit: deny`) |
| **plan-arai** | primary | Plan mode, documents in `plans/` |
| **new-harness** | primary | Interactive harness generator (7-step workflow) |
| **reviewer** | subagent | Code review (`edit: deny`) |
| **tester** | subagent | Testing and TDD |
| **docs** | subagent | Documentation (`bash: deny`) |
| **config-creator** | subagent | Generates `opencode.json` |
| **permission-creator** | subagent | Generates permission config |
| **instructions-creator** | subagent | Generates `AGENTS.md` |
| **mcp-creator** | subagent | Generates MCP server configs |
| **architecture-creator** | subagent | Generates architecture docs |
| **flow-creator** | subagent | Generates workflow definitions |
| **plugin-creator** | subagent | Generates TUI plugins |
| **tool-creator** | subagent | Generates custom tools |
| **prompt-creator** | subagent | Generates reusable prompts |
| **rule-creator** | subagent | Generates code rules |
| **reference-creator** | subagent | Generates repo references |
| **command-creator** | subagent | Generates opencode commands |
| **agent-creator** | subagent | Generates agent definitions |
| **skill-creator** | subagent | Creates SKILL.md files |
| **script-creator** | subagent | Creates reusable scripts |
| **content-ingestion** | subagent | Content ingestion from any source |
| **document-generation** | subagent | Generate documents from templates |
| **email** | subagent | Send email via MCP |
| **kb-management** | subagent | Knowledge base maintenance |
| **youtube** | subagent | YouTube transcript extraction |
| **vault-pdf-export** | subagent | Export vault notes to PDF |

All agents use model `opencode/big-pickle`. Defined in `opencode.json`, configured with `.md` files in `.opencode/agents/`.

## Mandatory TDD Flow

Every new agent MUST follow this flow — all steps are mandatory:

```
1. Write tests    → 2. Create .md  → 3. Register  → 4. Verify  → 5. Done
   (FAIL first)      (file)           (opencode.json)  (npm test)
```

1. **Write tests first** — add to `subagents.test.js`, `opencode-agents.test.js`, and `opencode-debug-agents.test.js`. Tests MUST fail before implementation.
2. **Create agent .md** — use `create-agent.js` or write manually. Frontmatter must have `description`, `mode`, `model`, `permission`.
3. **Register in opencode.json** — add entry under `"agent"` with `description`, `mode`, `path`.
4. **Verify** — run `npm test`. ALL tests must pass.
5. **Done** — update this file's agent table. Commit.

See `agent-creator` skill for the full specification.

## Key Principles

- **Test-driven**: Every change starts with a failing test. Run `npm test` before committing.
- **Copy-not-symlink**: Files are copied to projects, not symlinked or env-var based.
- **Cross-platform**: All code, scripts, and configurations run on both macOS and Windows.
- **SKILL.md format**: Skills use YAML frontmatter (`name:`, `description:`, `license: MIT`).
- **Proactive Skills**: When a new problem is resolved, create a new skill so the solution is reusable.

## Test Suite

```bash
npm test                              # full suite (node:test)
node --test tests/consistency/        # consistency subset only
```
