# Plan: Harness Configuration Course + Harness Creator Ecosystem

## Overview

Create a comprehensive course on configuring opencode harnesses following best practices, then build a **creator ecosystem** — a set of 18 skills and companion scripts that interactively generate harness components based on user selections.

A **harness** in opencode is the client-side runtime configuration that bundles agents, skills, permissions, commands, MCP servers, and references into a single `opencode.json` + companion files implementing a specific development workflow.

---

## Architecture: Creator Ecosystem

```
harness-creator (orchestrator)
  │
  ├── config-creator          → opencode.json (base config)
  ├── permission-creator      → permission rules (global + per-agent)
  ├── instructions-creator    → AGENTS.md (project instructions)
  │
  ├── agent-creator           → primary agent .md files
  ├── subagent-creator        → subagent .md files
  ├── specialized-agent-creator → domain-specific agents (reviewer, tester, etc.)
  ├── architecture-creator    → multi-agent structures (tiers, delegation)
  ├── flow-creator            → workflow sequences (plan→build→review→deploy)
  │
  ├── skill-creator           → SKILL.md files with YAML frontmatter
  ├── mcp-creator             → MCP server configurations (+ server code)
  ├── command-creator         → custom command definitions
  ├── script-creator          → reusable automation scripts
  │
  ├── prompt-creator          → reusable prompt fragments
  ├── rule-creator            → coding standards and architecture rules
  ├── reference-creator       → shared path configurations
  │
  ├── plugin-creator          → plugin configurations
  └── tool-creator            → custom tool definitions
```

### How it works

1. User describes their project to `harness-creator`
2. `harness-creator` proposes a concrete config (Anthropic's "propose, don't interrogate")
3. Based on the project type, it loads relevant sub-skills
4. Each sub-skill delegates to its companion script in `shared/scripts/create-*.js`
5. The orchestrator validates and composes all outputs into final files

### Component mapping

| Layer | Components | Creator Skill | Companion Script |
|-------|-----------|--------------|-----------------|
| Base config | opencode.json, model, shell, formatter, LSP, compaction | config-creator | create-config.js |
| Security | global + per-agent permissions, bash globs, task gates | permission-creator | create-permission.js |
| Instructions | AGENTS.md, project "constitution" | instructions-creator | create-instructions.js |
| Primary agents | build, plan, orchestrator | agent-creator | create-agent.js |
| Subagents | explore, general, scout | subagent-creator | create-subagent.js |
| Domain agents | reviewer, tester, docs, security, devops | specialized-agent-creator | create-specialized-agent.js |
| Architecture | agent tiers, hierarchies, delegation patterns | architecture-creator | create-architecture.js |
| Workflows | plan→build, plan→review→fix, TDD cycles | flow-creator | create-flow.js |
| Reusable instructions | SKILL.md files | skill-creator | create-skill.js |
| MCP servers | local/remote, env, headers, auth | mcp-creator | create-mcp.js |
| Custom commands | test, deploy, commit, review | command-creator | create-command.js |
| Automation | Node.js/Python scripts | script-creator | create-script.js |
| Prompt fragments | commit-msg, review-criteria | prompt-creator | create-prompt.js |
| Standards | code-style, architecture rules | rule-creator | create-rule.js |
| Shared paths | references to scripts/rules/prompts | reference-creator | create-reference.js |
| Extensions | npm plugins, local hooks | plugin-creator | create-plugin.js |
| Custom tools | tool schemas, handlers | tool-creator | create-tool.js |

---

## Part 1: Course (`curso-ia/Módulo 6 — Harness en OpenCode/`)

11 modules in markdown, written in Spanish (matching existing docs convention), with code examples and "try it yourself" sections.

### Module 1 — What Is a Harness?
- Definition: harness = agent loop + tool surface + permission model
- Anatomy of a harness: `opencode.json`, `.opencode/agents/`, `.opencode/skills/`, `AGENTS.md`
- Community examples: `opencode-workspace`, `iceglober/harness-opencode`, aramirez-ai itself
- Key distinction: Claude emits tool calls; your harness handles them

### Module 2 — `opencode.json` Schema Deep Dive
- Model configuration: `model`, `small_model`, provider options
- Runtime: `shell`, `formatter`, `lsp`, `compaction`, `tool_output`, `watcher`, `snapshot`
- Config layers: remote → global → custom → project → `.opencode` → managed
- Best practice: commit `opencode.json` to git

### Module 3 — Agent Architecture
- **Anthropic pattern**: primary agents (tab-cycled) + subagents (@-mentioned or auto-invoked)
- Subagents for parallel/independent work, not sequential
- Built-in agents: build, plan, general, explore, scout
- Agent options: mode, description, model, prompt, temperature, steps, max tokens, color
- Using `architecture-creator` and `agent-creator` to scaffold

### Module 4 — Permissions Model
- Global defaults + per-agent overrides
- Permission keys: read, edit, glob, grep, list, bash, task, skill, webfetch, websearch
- Bash glob patterns: `"git push": "ask"`, `"npm *": "allow"`
- Task permissions: which subagents can be invoked
- Anthropic guidance: *start permissive, gate only what needs gating*
- Using `permission-creator` to generate

### Module 5 — Tool Surface Design
- **Anthropic pattern**: start with bash for breadth; promote to dedicated tools when you need to gate, render, audit, or parallelize
- Security boundary: hard-to-reverse actions (API calls, deletes) should be gated
- Staleness checks, scheduling, parallel-safe tools
- Using `tool-creator` and `mcp-creator`

### Module 6 — Context Management
- Compaction: auto (default true), prune, reserved tokens
- Memory: cross-session persistence via files
- **Anthropic rules**: don't change system prompt mid-session, don't switch models mid-session (invalidates cache)
- Using subagents with cheaper models for sub-tasks

### Module 7 — Custom Commands + Scripts
- `command` key with `template`, `description`, `agent`, `model`
- `$ARGUMENTS` for parameterized commands
- Markdown alternative in `.opencode/commands/`
- Using `command-creator` and `script-creator`

### Module 8 — MCP Servers + Plugins + Custom Tools
- Local vs remote MCP servers
- Environment variables and authentication
- Plugins: extending opencode with custom tools and hooks
- Custom tool schemas and handlers
- Using `mcp-creator`, `plugin-creator`, `tool-creator`

### Module 9 — Skills
- SKILL.md anatomy: YAML frontmatter (name, description, license)
- Discovery paths: `.opencode/skills/`, `~/.config/opencode/skills/`
- On-demand loading — keeps context small until needed (Anthropic pattern)
- Permissions per skill: `"internal-*": "deny"`, glob patterns
- Using `skill-creator` to generate

### Module 10 — Instructions, References, Prompts, Rules
- `instructions` array: AGENTS.md, rule files
- `references`: shared paths to scripts, rules, prompts
- Prompt fragments for repeated patterns
- Coding standards as SKILL.md or rules
- Using `instructions-creator`, `reference-creator`, `prompt-creator`, `rule-creator`

### Module 11 — Putting It Together
- Walkthrough: build a "full-dev harness" from scratch using all creators
- Follow Anthropic's *"propose, don't interrogate"* flow
- Silent viability gate before generating config
- Testing with `opencode debug config`
- CI validation patterns

---

## Part 2: Companion Scripts (`shared/scripts/create-*.js`)

Each script is a Node.js ESM module that accepts a JSON description and outputs the corresponding file(s). Pattern:

```bash
node shared/scripts/create-agent.js --name reviewer --mode subagent --description "Reviews code"
node shared/scripts/create-config.js --model anthropic/claude-sonnet-4-6 --permissions balanced
node shared/scripts/create-skill.js --name code-review --description "Review code quality"
```

| Script | Input | Output |
|--------|-------|--------|
| `create-config.js` | model, shell, formatter, lsp, compaction | `opencode.json` |
| `create-permission.js` | strictness level, rules | Permission block for opencode.json |
| `create-instructions.js` | project type, workflow, language | `AGENTS.md` |
| `create-agent.js` | name, mode, description, model, permissions | `.opencode/agents/<name>.md` + opencode.json entry |
| `create-subagent.js` | name, description, model, permissions | `.opencode/agents/<name>.md` |
| `create-specialized-agent.js` | domain (reviewer/tester/docs/devops/security), options | `.opencode/agents/<name>.md` with domain-specific prompt |
| `create-architecture.js` | agent tiers, delegation patterns | Multiple agent files + opencode.json entries |
| `create-flow.js` | workflow stages, agent assignments | Workflow instructions + AGENTS.md additions |
| `create-skill.js` | name, description, content | `shared/skills/<name>/SKILL.md` |
| `create-mcp.js` | type (local/remote), command/url, env vars | opencode.json MCP entry |
| `create-command.js` | name, template, description, agent, model | opencode.json command entry |
| `create-script.js` | name, language (js/py/sh), description | `shared/scripts/<name>.js` with boilerplate |
| `create-prompt.js` | name, content | `shared/prompts/<name>.md` |
| `create-rule.js` | name, content | `shared/rules/<name>.md` |
| `create-reference.js` | name, path, description | opencode.json reference entry |
| `create-plugin.js` | name, type (npm/local), options | Plugin config + `.opencode/plugins/<name>/` |
| `create-tool.js` | name, description, input schema | Tool definition + handler boilerplate |
| `harness-generator.js` | project description JSON | Full harness: all of the above |

All scripts support:
- `--dry-run` — print output to stdout
- `--output <dir>` — custom output directory
- `--help` — usage information

---

## Part 3: Creator Skills (`shared/skills/*-creator/SKILL.md`)

Each skill follows the standard SKILL.md format and describes how to use the companion script.

| Skill | Purpose |
|-------|---------|
| `harness-creator` | Orchestrator: loads sub-skills based on user description, generates full harness |
| `config-creator` | Create base opencode.json configuration |
| `permission-creator` | Create permission rules for agents and tools |
| `instructions-creator` | Create AGENTS.md with project instructions |
| `agent-creator` | Create primary agents with custom prompts and permissions |
| `subagent-creator` | Create subagents for specialized tasks |
| `specialized-agent-creator` | Create domain-specific agents (reviewer, tester, docs, etc.) |
| `architecture-creator` | Create multi-agent architectures and delegation patterns |
| `flow-creator` | Create workflow sequences for agent collaboration |
| `skill-creator` | Create SKILL.md files with YAML frontmatter |
| `mcp-creator` | Create MCP server configurations and server code |
| `command-creator` | Create custom opencode commands |
| `script-creator` | Create reusable automation scripts |
| `prompt-creator` | Create reusable prompt fragments |
| `rule-creator` | Create coding standards and architecture rules |
| `reference-creator` | Create shared reference configurations |
| `plugin-creator` | Create plugin configurations |
| `tool-creator` | Create custom tool definitions |

---

## Part 4: Tests

Tests in `tests/` using `node:test`:

- `tests/commands/create-*.test.js` — unit tests for each script
- `tests/consistency/` — file structure and content consistency
- `tests/integration/` — full lifecycle: skill → generate → validate

All tests run via `npm test`.

---

## Implementation Order

### Phase 1: Update plan (this file)
### Phase 2: Create all 18 companion scripts in `shared/scripts/`
### Phase 3: Create all 18 creator skills in `shared/skills/`
### Phase 4: Create course modules in `curso-ia/Módulo 6 — Harness en OpenCode/`
### Phase 5: Write tests
### Phase 6: `arai sync` + `npm test` validation
