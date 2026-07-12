# Plan: Add 3 Missing Subagents + Validation Tests (TDD)

## Context

16 creator skills exist in `.opencode/skills/`, but only 12 have agent `.md` files + opencode.json registration. Missing: **agent-creator**, **skill-creator**, **script-creator**. The `harness-generator` is covered by the existing `new-harness` primary agent.

Key validation tool: **`opencode debug agent <name>`** validates agents (resolves permissions, model, tools, prompt) and **`opencode debug skill`** lists all discovered skills. These prove opencode can actually load and use the artifacts.

---

## Phase 1: TDD — Write Failing Tests First

### Test 1: Modify `tests/consistency/subagents.test.js`

Add the 3 new entries to `REQUIRED_SUBAGENTS`:

```js
'agent-creator.md',      // NEW
'skill-creator.md',      // NEW
'script-creator.md',     // NEW
```

Update test name: `'all 12 subagent .md files exist'` → `'all 15 subagent .md files exist'`.

The existing loop tests (frontmatter, skill reference, script reference) auto-apply to new entries.

**TDD status**: FAIL — the 3 `.md` files don't exist yet.

### Test 2: Modify `tests/consistency/opencode-agents.test.js`

Add to `REQUIRED_AGENTS`:

```js
'agent-creator':  { mode: 'subagent', path: '.opencode/agents/agent-creator.md' },
'skill-creator':  { mode: 'subagent', path: '.opencode/agents/skill-creator.md' },
'script-creator': { mode: 'subagent', path: '.opencode/agents/script-creator.md' },
```

Update count: `'total agent count is at least 19'` → `'total agent count is at least 22'`.

**TDD status**: FAIL — not registered in opencode.json yet.

### Test 3: Create `tests/integration/opencode-debug-agents.test.js` (NEW)

Uses `opencode debug agent <name>` to prove each new agent loads in the real opencode runtime:

- Spawns `opencode debug agent agent-creator`, `skill-creator`, `script-creator`
- Asserts exit code 0 for each
- Parses JSON output, checks: `name`, `mode === "subagent"`, `model` exists, `prompt` is non-empty, `tools.skill === true`
- This catches: bad frontmatter, missing skill reference, wrong path in opencode.json

**TDD status**: FAIL — agents don't exist yet.

### Test 4: Create `tests/integration/opencode-debug-skills.test.js` (NEW)

Uses `opencode debug skill` to verify all 16 creator skills are discovered:

- Spawns `opencode debug skill`
- Asserts exit code 0
- Parses JSON array, asserts all 15 creator skills + harness-generator present by name
- Asserts each has non-empty `content`

**TDD status**: PASS (skills already exist). This is a regression guard.

### Test 5: Create `tests/integration/script-to-agent-roundtrip.test.js` (NEW)

End-to-end: generate agent with script → validate with opencode:

1. Run `node .opencode/scripts/create-agent.js --name roundtrip-test --preset reviewer --output <tmpdir>/roundtrip-test.md`
2. Copy to `.opencode/agents/` temporarily
3. Run `opencode debug agent roundtrip-test`
4. Assert valid JSON with correct mode/permissions
5. Remove temp agent file and clean opencode.json entry

**TDD status**: FAIL (no agent registered).

---

## Phase 2: Implement (Make Tests Pass)

### Step 1: Create 3 agent `.md` files

All follow the template from `config-creator.md` (frontmatter + Inicio/Ejecución/Reglas).

#### `.opencode/agents/agent-creator.md`

```yaml
---
description: Genera definiciones de agentes opencode (primarios y subagentes) con prompts, permisos y overrides de modelo
mode: subagent
model: opencode/big-pickle
permission:
  edit: allow
  bash: allow
  read: allow
---
```

Body sections:
- **Inicio**: loads skill `agent-creator`
- **Ejecución**: `node .opencode/scripts/create-agent.js [flags]`
- **Reglas**: dry-run first, validate YAML frontmatter, register in opencode.json after creation, report generated file

#### `.opencode/agents/skill-creator.md`

Same template. Loads `skill-creator`, runs `create-skill.js`.
Rules: dry-run, validate name (lowercase, hyphens, max 64), validate description (max 120 chars), license always MIT, sync after creation.

#### `.opencode/agents/script-creator.md`

Same template. Loads `script-creator`, runs `create-script.js`.
Rules: dry-run, validate shebang, cross-platform compatibility, standard exit codes (0/1/2).

### Step 2: Register in `opencode.json`

Add 3 entries under `"agent"`:

```json
"agent-creator":  { "description": "...", "mode": "subagent", "path": ".opencode/agents/agent-creator.md" },
"skill-creator":  { "description": "...", "mode": "subagent", "path": ".opencode/agents/skill-creator.md" },
"script-creator": { "description": "...", "mode": "subagent", "path": ".opencode/agents/script-creator.md" }
```

### Step 3: Update `AGENTS.md`

Add 3 rows to the Agents table:

```
| **agent-creator** | subagent | edit: allow, bash: allow, read: allow |
| **skill-creator** | subagent | edit: allow, bash: allow, read: allow |
| **script-creator** | subagent | edit: allow, bash: allow, read: allow |
```

---

## Phase 3: Verify

1. `node --test tests/consistency/subagents.test.js` — 15 subagents, all pass
2. `node --test tests/consistency/opencode-agents.test.js` — 22 agents registered, all pass
3. `node --test tests/integration/opencode-debug-agents.test.js` — all 3 new agents load in opencode
4. `node --test tests/integration/opencode-debug-skills.test.js` — all 16 creator skills discovered
5. `node --test tests/integration/script-to-agent-roundtrip.test.js` — script → opencode roundtrip works
6. `npm test` — full suite passes

---

## Files Summary

| Action | File | What |
|--------|------|------|
| CREATE | `.opencode/agents/agent-creator.md` | Subagent definition |
| CREATE | `.opencode/agents/skill-creator.md` | Subagent definition |
| CREATE | `.opencode/agents/script-creator.md` | Subagent definition |
| CREATE | `tests/integration/opencode-debug-agents.test.js` | opencode debug validation |
| CREATE | `tests/integration/opencode-debug-skills.test.js` | opencode skill discovery |
| CREATE | `tests/integration/script-to-agent-roundtrip.test.js` | script → opencode roundtrip |
| MODIFY | `opencode.json` | Register 3 agents |
| MODIFY | `AGENTS.md` | Add 3 rows to agents table |
| MODIFY | `tests/consistency/subagents.test.js` | 12 → 15 subagents |
| MODIFY | `tests/consistency/opencode-agents.test.js` | 19 → 22 agents |

## Execution Order (TDD)

1. Write tests 1-5 first (all FAIL)
2. Create agent .md files (tests 1, 2 start passing)
3. Register in opencode.json (tests 1, 2 fully pass)
4. Run opencode debug tests (tests 3, 4, 5 pass)
5. Update AGENTS.md (documentation)
6. Full `npm test` (all green)
