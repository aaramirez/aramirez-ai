# Co-locate Scripts in `.opencode/skills/`

## Objective

Move the 15 `create-*.js` creator scripts from the flat `.opencode/scripts/` directory into their respective `.opencode/skills/<name>/scripts/` subdirectories, mirroring the pattern already applied to `shared/skills/`.

---

## Current State

### `.opencode/skills/` (17 skills, 15 with scripts)

Each skill has a `SKILL.md` declaring scripts in frontmatter, but the actual `.js` files live flat in `.opencode/scripts/`:

```
.opencode/
├── skills/
│   ├── agent-creator/SKILL.md        scripts: [create-agent.js, create-base.js]
│   ├── architecture-creator/SKILL.md scripts: [create-architecture.js, create-base.js]
│   ├── command-creator/SKILL.md      scripts: [create-command.js, create-base.js]
│   ├── config-creator/SKILL.md       scripts: [create-config.js, create-base.js]
│   ├── distribution-pattern/SKILL.md (no scripts)
│   ├── flow-creator/SKILL.md         scripts: [create-flow.js, create-base.js]
│   ├── harness-generator/SKILL.md    (no scripts)
│   ├── instructions-creator/SKILL.md scripts: [create-instructions.js, create-base.js]
│   ├── mcp-creator/SKILL.md          scripts: [create-mcp.js, create-base.js]
│   ├── permission-creator/SKILL.md   scripts: [create-permission.js, create-base.js]
│   ├── plugin-creator/SKILL.md       scripts: [create-plugin.js, create-base.js]
│   ├── prompt-creator/SKILL.md       scripts: [create-prompt.js, create-base.js]
│   ├── reference-creator/SKILL.md    scripts: [create-reference.js, create-base.js]
│   ├── rule-creator/SKILL.md         scripts: [create-rule.js, create-base.js]
│   ├── script-creator/SKILL.md       scripts: [create-script.js, create-base.js]
│   ├── skill-creator/SKILL.md        scripts: [create-skill.js, create-base.js]
│   └── tool-creator/SKILL.md         scripts: [create-tool.js, create-base.js]
└── scripts/
    ├── create-agent.js        ← FLAT, not co-located
    ├── create-architecture.js
    ├── create-base.js         ← SHARED by all 15 creators
    ├── create-command.js
    ├── create-config.js
    ├── create-flow.js
    ├── create-instructions.js
    ├── create-mcp.js
    ├── create-permission.js
    ├── create-plugin.js
    ├── create-prompt.js
    ├── create-reference.js
    ├── create-rule.js
    ├── create-script.js
    ├── create-skill.js
    ├── create-tool.js
    ├── getrepo.js             ← STANDALONE (no skill owner)
    └── updaterepos.js         ← STANDALONE (no skill owner)
```

### Key Challenge: `create-base.js`

`create-base.js` is a shared utility imported by all 15 creator scripts:
```js
import { parseArgs, writeFileNow, showHelp, println } from './create-base.js';
```

If each skill gets its own `scripts/` dir, we have two options:
1. **Duplicate** `create-base.js` into each skill's `scripts/` dir (15 copies)
2. **Keep `create-base.js` flat** in `.opencode/scripts/` and adjust imports

Option 2 is better — no duplication, single source of truth.

---

## Target State

### New Structure

```
.opencode/
├── skills/
│   ├── agent-creator/
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       └── create-agent.js
│   ├── architecture-creator/
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       └── create-architecture.js
│   ├── command-creator/
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       └── create-command.js
│   ├── config-creator/
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       └── create-config.js
│   ├── distribution-pattern/
│   │   └── SKILL.md              ← no scripts (instruction-only)
│   ├── flow-creator/
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       └── create-flow.js
│   ├── harness-generator/
│   │   └── SKILL.md              ← no scripts (instruction-only)
│   ├── instructions-creator/
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       └── create-instructions.js
│   ├── mcp-creator/
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       └── create-mcp.js
│   ├── permission-creator/
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       └── create-permission.js
│   ├── plugin-creator/
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       └── create-plugin.js
│   ├── prompt-creator/
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       └── create-prompt.js
│   ├── reference-creator/
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       └── create-reference.js
│   ├── rule-creator/
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       └── create-rule.js
│   ├── script-creator/
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       └── create-script.js
│   ├── skill-creator/
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       └── create-skill.js
│   └── tool-creator/
│       ├── SKILL.md
│       └── scripts/
│           └── create-tool.js
└── scripts/
    ├── create-base.js             ← STAYS (shared utility, 15 skills import it)
    ├── getrepo.js                 ← STAYS (standalone, no skill owner)
    └── updaterepos.js             ← STAYS (standalone, no skill owner)
```

### Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **`create-base.js` stays flat** | `.opencode/scripts/create-base.js` | Shared by all 15 creators; no duplication |
| **Import path update** | `../../../scripts/create-base.js` | Relative path from `.opencode/skills/<name>/scripts/` to shared utility at `.opencode/scripts/` |
| **SKILL.md frontmatter** | `scripts: [create-agent.js]` (filename only) | Matches `shared/skills/` convention; installer resolves path |
| **2 standalone scripts stay flat** | `getrepo.js`, `updaterepos.js` | No owning skill; used directly by users |
| **2 instruction-only skills** | `distribution-pattern`, `harness-generator` | No scripts, no change needed |

---

## Requirements

1. Move 15 `create-*.js` scripts from `.opencode/scripts/` to `.opencode/skills/<name>/scripts/` — priority: **high**
2. Update import paths in all 15 scripts: `./create-base.js` → `../scripts/create-base.js` — priority: **high**
3. Keep `create-base.js` in `.opencode/scripts/` (shared utility) — priority: **high**
4. Keep `getrepo.js` and `updaterepos.js` in `.opencode/scripts/` (standalone) — priority: **medium**
5. Verify SKILL.md frontmatter `scripts:` fields still work with co-located layout — priority: **high**
6. Update any references to `.opencode/scripts/create-*.js` in documentation — priority: **medium**

---

## Architecture Changes

### Files to Create (15 directories + 15 files)

| Directory | File |
|-----------|------|
| `.opencode/skills/agent-creator/scripts/` | `create-agent.js` (moved) |
| `.opencode/skills/architecture-creator/scripts/` | `create-architecture.js` (moved) |
| `.opencode/skills/command-creator/scripts/` | `create-command.js` (moved) |
| `.opencode/skills/config-creator/scripts/` | `create-config.js` (moved) |
| `.opencode/skills/flow-creator/scripts/` | `create-flow.js` (moved) |
| `.opencode/skills/instructions-creator/scripts/` | `create-instructions.js` (moved) |
| `.opencode/skills/mcp-creator/scripts/` | `create-mcp.js` (moved) |
| `.opencode/skills/permission-creator/scripts/` | `create-permission.js` (moved) |
| `.opencode/skills/plugin-creator/scripts/` | `create-plugin.js` (moved) |
| `.opencode/skills/prompt-creator/scripts/` | `create-prompt.js` (moved) |
| `.opencode/skills/reference-creator/scripts/` | `create-reference.js` (moved) |
| `.opencode/skills/rule-creator/scripts/` | `create-rule.js` (moved) |
| `.opencode/skills/script-creator/scripts/` | `create-script.js` (moved) |
| `.opencode/skills/skill-creator/scripts/` | `create-skill.js` (moved) |
| `.opencode/skills/tool-creator/scripts/` | `create-tool.js` (moved) |

### Files to Modify (15 scripts)

Each `create-*.js` script needs its import updated:

```js
// BEFORE
import { parseArgs, writeFileNow, showHelp, println } from './create-base.js';

// AFTER
import { parseArgs, writeFileNow, showHelp, println } from '../../../scripts/create-base.js';
```

### Files to Delete (15 files)

The original flat files in `.opencode/scripts/` after moving:
- `create-agent.js`, `create-architecture.js`, `create-command.js`, `create-config.js`, `create-flow.js`, `create-instructions.js`, `create-mcp.js`, `create-permission.js`, `create-plugin.js`, `create-prompt.js`, `create-reference.js`, `create-rule.js`, `create-script.js`, `create-skill.js`, `create-tool.js`

### Files That STAY in `.opencode/scripts/` (3 files)

| File | Reason |
|------|--------|
| `create-base.js` | Shared utility imported by all 15 creators |
| `getrepo.js` | Standalone repo management tool |
| `updaterepos.js` | Standalone repo update tool |

---

## TDD Flow

### Step 1: Write Tests (RED)

Add tests to verify co-location:

```js
// Test: each creator skill has scripts/ directory
test('creator skills have co-located scripts/ directory', () => {
  const creatorSkills = ['agent-creator', 'architecture-creator', ...];
  for (const skill of creatorSkills) {
    const scriptsDir = join('.opencode/skills', skill, 'scripts');
    assert.ok(existsSync(scriptsDir), `${skill} should have scripts/ dir`);
  }
});

// Test: scripts are NOT in flat .opencode/scripts/ (except base, getrepo, updaterepos)
test('create-*.js scripts are not in flat scripts/ dir', () => {
  const flat = readdirSync('.opencode/scripts');
  const createScripts = flat.filter(f => f.startsWith('create-') && f !== 'create-base.js');
  assert.equal(createScripts.length, 0, 'No create-*.js should be in flat dir');
});

// Test: create-base.js still exists in flat dir
test('create-base.js stays in .opencode/scripts/', () => {
  assert.ok(existsSync('.opencode/scripts/create-base.js'));
});
```

### Step 2: Move Scripts (GREEN)

1. Create `scripts/` subdirectory in each of 15 skill directories
2. Move each `create-*.js` to its skill's `scripts/` dir
3. Delete original flat files

### Step 3: Update Imports (GREEN)

Update import path in all 15 scripts:
```js
// ./create-base.js → ../../../scripts/create-base.js
```

### Step 4: Verify (GREEN)

- All tests pass
- Scripts are runnable from their new location
- `create-base.js` imports resolve correctly

---

## Verification

### Automated

- [ ] All tests pass
- [ ] `ls .opencode/scripts/` shows only 3 files: `create-base.js`, `getrepo.js`, `updaterepos.js`
- [ ] Each of 15 creator skill dirs has `SKILL.md` + `scripts/` subdirectory
- [ ] No `create-*.js` (except `create-base.js`) in flat `.opencode/scripts/`

### Manual Smoke Tests

- [ ] `node .opencode/skills/agent-creator/scripts/create-agent.js --help` — works
- [ ] `node .opencode/skills/skill-creator/scripts/create-skill.js --help` — works
- [ ] `node .opencode/skills/tool-creator/scripts/create-tool.js --help` — works
- [ ] `node .opencode/scripts/getrepo.js --help` — still works (standalone)
- [ ] Import chain resolves: each creator script → `../scripts/create-base.js` → works

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Import path `../scripts/create-base.js` breaks | **High** | Test each script after move |
| SKILL.md `scripts:` frontmatter doesn't resolve co-located paths | Medium | Verify `installSkillScripts()` handles both flat and co-located |
| Documentation references `.opencode/scripts/create-*.js` | Low | Grep and update |
