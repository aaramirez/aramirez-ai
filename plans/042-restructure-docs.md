> **DEPRECATED**: This plan references `arai generate`, which has been removed from the CLI.
> Creators (`.opencode/scripts/create-*.js`) are the canonical way to generate artifacts.
> See `plans/remove-arai-generate.md` for details.
>
# Plan: Restructure AGENTS.md, Fix README.md, Clean Tutorials + Stale Counts

## Overview

Three categories of work:
1. **Rewrite AGENTS.md** — agent-focused, ~85 lines, clear harness purpose
2. **Fix README.md** — 7 inaccuracies + architecture section
3. **Fix stale references** — scripts, tests, tutorials

---

## Part 1: Rewrite AGENTS.md (agent-focused, ~85 lines)

Replace the current 300-line document. New structure:

### Section 1: Purpose (3 lines)
What this repo does: produces focused, specialized agent architectures and complete opencode configurations.

### Section 2: Architecture (15 lines)
Two-directory model with clear table:
- `.opencode/` = the machine (16 creator triplets, runtime config)
- `shared/` = the artifacts (12 distributable skills, templates, prompts, rules)

Creator triplet pattern: SKILL.md (instructions) → create-*.js (implementation) → agent .md (invocation wrapper)

### Section 3: Quick Start (10 lines)
`arai init`, `arai list`, `arai install`

### Section 4: Creator Triplets (15 lines)
One table: all 16 creators with skill, script, agent columns.

### Section 5: Agent Registry (15 lines)
22 agents in a table: name, mode, purpose.

### Section 6: TDD Flow (10 lines)
Write tests → Create → Register → Verify → Done

### Section 7: Key Principles (5 lines)
Test-driven, copy-not-symlink, cross-platform, SKILL.md format.

### Sections REMOVED from current AGENTS.md:
- YouTube personal workflow (vault path — not for agents)
- Document templates list (29 templates — reference material)
- "When working" human dev notes
- Duplicate Agent Creation Flow (already in agent-creator skill)
- Detailed docgen architecture
- Harness Creator Scripts code examples
- MCP server details → move to README
- CI validation commands → move to README
- Reference repos section → move to README
- Install behavior by type table (confusing dual-source)
- Repository structure tree (replaced by architecture section)

---

## Part 2: Fix README.md

### 2a: Add Architecture Section (after Philosophy section)
Explain `.opencode/` vs `shared/` boundary clearly, like the AGENTS.md section but for humans.

### 2b: Fix 7 Inaccuracies

| # | Location | Fix |
|---|----------|-----|
| 1 | Agent table | Add all 22 agents (currently lists only 5) |
| 2 | MCP section | List all 7 servers from opencode.json |
| 3 | Plugins | Fix `plugins/example.ts` → `custom-logo.tsx` |
| 4 | Commands | Add `/email` to commands table |
| 5 | `arai generate skill` | Fix destination to `shared/skills/<name>/SKILL.md` |
| 6 | Duplicate `arai sync` | Remove duplicate entry |
| 7 | `skills.paths` claim | The project DOES use `skills.paths` — fix claim |

---

## Part 3: Fix Stale References

### 3a: Fix script USAGE headers (16 files)

All `.opencode/scripts/create-*.js` files have `--help` text saying `node shared/scripts/create-*.js`. Fix to `node .opencode/scripts/create-*.js`.

Files: create-agent.js, create-architecture.js, create-command.js, create-config.js, create-flow.js, create-instructions.js, create-mcp.js, create-permission.js, create-plugin.js, create-prompt.js, create-reference.js, create-rule.js, create-script.js, create-skill.js, create-tool.js, create-base.js (if applicable)

### 3b: Fix test stale counts (2 files)

| File | Fix |
|------|-----|
| `tests/consistency/creator-skills.test.js` | Add `harness-generator` to CREATOR_SKILLS array, change "15" → "16" |
| `tests/consistency/updated-skills.test.js` | Change "19 agents" → "22 agents" |

### 3c: Fix tutorials (3 active files)

| File | Fix |
|------|-----|
| `tutoriales-arai/06-Skills/04-creator-skills.md` | Remove `subagent-creator`, `specialized-agent-creator`, `harness-creator` from active list; update `harness-generator.js` reference |
| `tutoriales-arai/05-Harness/02-creator-scripts.md` | Remove `harness-generator.js` from script list, update count from 18 to 17 |
| `tutoriales-arai/05-Harness/03-harness-generator.md` | Remove references to deleted `harness-generator.js` |

### 3d: Fix curso-ia Module 6 (8 files, bulk sed)

Replace `shared/scripts/create-` → `.opencode/scripts/create-` and replace deleted artifact names.

Files in `curso-ia/Módulo 6 — Harness en OpenCode/`:
- 01-Que-es-un-Harness.md
- 03-Arquitectura-de-Agentes.md
- 04-Configuracion-Base.md
- 05-Modelo-de-Permisos.md
- 06-Diseno-de-Superficie-de-Herramientas.md
- 08-Comandos-Personalizados-y-Scripts.md
- 09-Instrucciones-Referencias-Prompts-Reglas.md
- 10-Skills-y-Aprendizaje-Bajo-Demanda.md
- 11-Arquitecturas-Multi-Agente-y-Flujos.md
- 12-Poniendolo-Todo-Junto.md

### 3e: Skip (historical, no action)
- `plans/` files — historical records, leave as-is

---

## Execution Order

1. Rewrite AGENTS.md
2. Fix README.md (architecture section + 7 fixes)
3. Fix script USAGE headers (bulk sed)
4. Fix test stale counts
5. Fix tutorials
6. Fix curso-ia
7. Verify: `npm test` + `ci-validate.js`

## Files Summary

| Action | Count | Files |
|--------|-------|-------|
| REWRITE | 1 | AGENTS.md |
| MODIFY | 1 | README.md |
| MODIFY | 15 | .opencode/scripts/create-*.js |
| MODIFY | 2 | tests (creator-skills, updated-skills) |
| MODIFY | 3 | tutoriales-arai active docs |
| MODIFY | 10 | curso-ia Module 6 |
| **TOTAL** | **32** | |

## Verification

1. `node --test tests/consistency/*.test.js` — all pass
2. `node shared/scripts/ci-validate.js` — all checks pass
3. AGENTS.md under 100 lines
4. README.md agent table has 22 agents
5. No remaining references to deleted artifacts in active files
