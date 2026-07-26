# Testing Strategy: Agents, Skills, Scripts & Evals

## Objective

Design a comprehensive testing strategy that validates agents, skills, and scripts end-to-end using opencode CLI, including deterministic tests, runtime validation, and LLM-powered evals with rubric-based scoring.

---

## Current State Analysis

### What Exists Today (49 test files, 380+ tests)

```
tests/
├── helpers.js                    ← Shared utilities (runArai, tmpDir, assert*, parseFrontmatter)
├── consistency/                  ← 14 files — Structural guardrails (Phase 1-2)
├── commands/                     ← 15 files — CLI + script unit tests (Phase 3)
├── shared/                       ← 9 files — Shared package artifact tests
└── integration/                  ← 11 files — E2E, opencode debug/run, AI validation
```

### 5-Phase Validation Pyramid

| Phase | What | Automation | Files |
|-------|------|------------|-------|
| **1** | Structural consistency (frontmatter, existence, naming) | CI | `tests/consistency/` (14 files) |
| **2** | Content quality (headings, keywords, word count) | CI | `tests/consistency/content-quality.test.js` |
| **3** | CLI commands (init, install, sync, create-*) | CI | `tests/commands/` (15 files) |
| **4** | DocGen pipeline (builders, charts, output quality) | CI | `tests/commands/docgen-*.test.js` |
| **5** | AI-assisted validation (LLM rubric grading) | Gated (`TEST_AI=true`) | `tests/integration/ai-validation.test.js` |

### opencode CLI Testing Interface

| Command | Returns | Use Case |
|---------|---------|----------|
| `opencode debug agent <name>` | JSON: `{name, mode, model, prompt, description, tools}` | Validate agent loads correctly |
| `opencode debug skill` | JSON array: `[{name, content, location}]` | Validate skill discovery |
| `opencode debug config` | Config validation | Validate opencode.json resolves |
| `opencode run --agent <name> --model <model> <prompt> --format json` | Streaming JSON events | E2E agent execution |

### Identified Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| No eval framework for systematic skill effectiveness testing | High | High |
| No JSON schema validation for script output | Medium | High |
| No snapshot/golden-file testing for generated artifacts | Medium | Medium |
| No `ci-validate.js` execution in test suite | Medium | Medium |
| No snapshot baseline for AI eval rubrics | High | High |
| No performance/size budgets for SKILL.md files | Low | Low |
| No cross-platform (Windows) test matrix | Medium | Low |
| No test coverage measurement | Medium | Low |

---

## Requirements

1. **Deterministic agent validation** — every agent loads via `opencode debug agent` with correct fields — priority: **high**
2. **Deterministic skill validation** — every skill discovered via `opencode debug skill` with non-empty content — priority: **high**
3. **Script output schema validation** — creator scripts produce valid JSON/MD conforming to defined schemas — priority: **high**
4. **Evals with rubric scoring** — systematic testing of skill effectiveness using structured rubrics — priority: **high**
5. **Agent permission adherence testing** — agents respect their declared permissions — priority: **high**
6. **Harness QA checklist** — automated validation of generated harness quality — priority: **high**
7. **Snapshot baseline for regression detection** — golden files for generated output — priority: **medium**
8. **Performance budgets** — SKILL.md size limits, test suite execution time — priority: **low**

---

## Architecture: Testing Layers

### Layer 1: Static Structural Tests (deterministic, no execution)

**Already implemented** in `tests/consistency/`. Validates:
- Frontmatter schema (name, description, license, mode, model, permission)
- File existence and naming conventions
- Cross-references between agents, skills, scripts
- No removed artifacts present

**Enhancement needed:**
- Add JSON Schema validation for `opencode.json` agent entries
- Add YAML Schema validation for SKILL.md frontmatter
- Add bidirectional reference validation (agent → skill → script)

### Layer 2: Script Output Schema Tests (deterministic, script execution)

**Currently:** Scripts tested for `--help` and `--dry-run` in `tests/commands/create-scripts.test.js`.

**Enhancement needed:**
- Define JSON schemas for each script's output
- Validate `create-config.js` output conforms to opencode.json schema
- Validate `create-agent.js` output has valid frontmatter structure
- Validate `create-permission.js` output has valid permission structure

### Layer 3: Runtime Validation via opencode CLI (deterministic, opencode binary)

**Already implemented** in `tests/integration/opencode-debug-*.test.js`.

**Enhancement needed:**
- Test ALL agents (currently 12/22), not just a subset
- Test ALL skills (currently only creator skills), including shared skills
- Test agent → skill binding (agent's prompt references skill that exists)
- Test command template parsing by opencode

### Layer 4: Evals with Rubric Scoring (LLM-powered, gated)

**Already implemented** in `tests/integration/ai-validation.test.js` with 3 suites.

**Enhancement needed:**
- Expand from 8 skills to all skills with scripts
- Add structured eval output (JSON scores, not just pass/fail)
- Add regression baseline (store expected scores, detect drift)
- Add eval runner CLI for manual execution
- Add eval result persistence (JSON reports)

### Layer 5: Harness QA (deterministic, generated output inspection)

**Currently:** `tests/integration/outcome-init.test.js` validates init output.

**Enhancement needed:**
- Comprehensive QA checklist for generated harnesses
- Validate all 4 layers of distributable packages
- Validate agent-skill-script binding chain
- Validate permission rules are complete and correct
- Validate AGENTS.md content accuracy

---

## Detailed Design

### A. Script Output Schemas

Define schemas for each creator script's output:

```js
// schemas/agent-md.yaml
required:
  - name
  - description
  - mode  # primary | subagent
  - model
properties:
  name:
    pattern: ^[a-z][a-z0-9-]*$
    maxLength: 64
  mode:
    enum: [primary, subagent]
  permission:
    properties:
      edit: { enum: [allow, deny] }
      bash: { enum: [allow, deny, ask] }
      read: { enum: [allow, deny] }
```

```js
// schemas/opencode-json.json
required: [agent]
properties:
  agent:
    additionalProperties:
      required: [description, mode]
      properties:
        mode: { enum: [primary, subagent] }
        path: { pattern: ^\.opencode/agents/.*\.md$ }
```

### B. Eval Framework Design

#### Eval Runner

```
tests/evals/
├── runner.js              ← Eval orchestration engine
├── rubrics/               ← Rubric definitions per skill/agent
│   ├── agent-creator.json
│   ├── config-creator.json
│   ├── skill-creator.json
│   └── ...
├── scenarios/             ← Test scenarios (task + expected behavior)
│   ├── skill-execution/
│   ├── permission-adherence/
│   └── output-format/
├── baselines/             ← Expected scores for regression detection
│   └── scores.json
└── reports/               ← Generated eval reports (gitignored)
```

#### Rubric Format

```json
{
  "skill": "agent-creator",
  "task": "Create a subagent called 'reviewer' with edit:deny permission",
  "rubric": {
    "required_patterns": [
      "reviewer",
      "subagent",
      "edit.*deny"
    ],
    "forbidden_patterns": [
      "primary",
      "edit.*allow"
    ],
    "structural_checks": [
      { "type": "file_exists", "path": ".opencode/agents/reviewer.md" },
      { "type": "frontmatter_field", "file": ".opencode/agents/reviewer.md", "field": "mode", "value": "subagent" }
    ],
    "pass_threshold": 0.8
  }
}
```

#### Eval Categories

| Category | What It Tests | Gated |
|----------|--------------|-------|
| **skill-execution** | Agent + skill produces correct output for a task | No (uses --dry-run) |
| **permission-adherence** | Agent respects declared permissions | Yes (requires LLM) |
| **output-format** | Script output conforms to schema | No (deterministic) |
| **instruction-following** | Agent follows SKILL.md instructions accurately | Yes (requires LLM) |
| **error-handling** | Agent handles edge cases gracefully | Partially |

### C. Harness QA Checklist

```markdown
## Harness QA Checklist (automated)

### Structure
- [ ] `.opencode/` directory exists
- [ ] `opencode.json` exists and is valid JSON
- [ ] `AGENTS.md` exists and is non-empty
- [ ] `.opencode/agents/` contains expected agent files
- [ ] `.opencode/skills/` contains expected skill directories
- [ ] `.opencode/scripts/` contains expected scripts
- [ ] `.opencode/commands/` contains expected command files

### Configuration
- [ ] `opencode.json` has required top-level keys (agent, command, permission)
- [ ] All agents registered with correct mode (primary/subagent)
- [ ] All agent paths resolve to existing .md files
- [ ] Permission rules have valid structure (edit/bash/read)
- [ ] Skills paths include `../shared/skills`

### Agents
- [ ] Each agent .md has valid frontmatter (description, mode, model)
- [ ] Each agent body has >= 3 instructions
- [ ] Each subagent references its corresponding skill
- [ ] Primary agents have appropriate permissions

### Skills
- [ ] Each SKILL.md has valid frontmatter (name, description, license)
- [ ] Each skill with scripts has local scripts/ directory
- [ ] Frontmatter script paths resolve to actual files
- [ ] No broken cross-skill references

### Scripts
- [ ] All referenced scripts exist
- [ ] Scripts have --help output
- [ ] Scripts have zero external dependencies (Node.js only)
- [ ] No dangerous patterns in script code

### Documentation
- [ ] AGENTS.md lists all installed agents
- [ ] AGENTS.md lists all installed scripts
- [ ] README.md (if exists) is consistent with actual structure

### Runtime
- [ ] `opencode debug config` succeeds
- [ ] `opencode debug agent <name>` succeeds for each agent
- [ ] `opencode debug skill` discovers all installed skills
```

---

## File Changes

### Files to Create

| File | Purpose |
|------|---------|
| `tests/evals/runner.js` | Eval orchestration engine |
| `tests/evals/rubrics/*.json` | Rubric definitions per skill/agent (16 files) |
| `tests/evals/scenarios/*.json` | Test scenarios with task + expected behavior |
| `tests/evals/baselines/scores.json` | Expected scores for regression detection |
| `tests/evals/eval-skill-execution.test.js` | Deterministic skill execution evals |
| `tests/evals/eval-permission-adherence.test.js` | Permission adherence evals (gated) |
| `tests/evals/eval-output-format.test.js` | Script output format validation |
| `tests/evals/eval-instruction-following.test.js` | Instruction following evals (gated) |
| `tests/harness/qa-checklist.test.js` | Automated harness QA checklist |
| `tests/harness/schema-validation.test.js` | JSON/YAML schema validation for outputs |
| `tests/integration/opencode-debug-all-agents.test.js` | Validate ALL agents via opencode debug |
| `tests/integration/opencode-debug-all-skills.test.js` | Validate ALL skills via opencode debug |
| `tests/consistency/reference-integrity.test.js` | Bidirectional agent↔skill↔script references |
| `tests/consistency/ci-validate-execution.test.js` | Run ci-validate.js and assert exit 0 |

### Files to Modify

| File | Change |
|------|--------|
| `tests/helpers.js` | Add `runOpencode()`, `loadSchema()`, `validateSchema()` helpers |
| `tests/integration/ai-validation.test.js` | Refactor rubricCheck() into eval framework |
| `package.json` | Add `test:evals` npm script |

---

## TDD Flow

### Step 1: Write Schema Tests (RED)

```js
// tests/harness/schema-validation.test.js
test('create-agent.js output has valid frontmatter schema', () => {
  const result = spawnSync('node', [SCRIPT, '--name', 'test-agent', '--mode', 'subagent', '--dry-run']);
  const output = JSON.parse(result.stdout);
  assert.ok(output.frontmatter.name, 'should have name');
  assert.ok(['primary', 'subagent'].includes(output.frontmatter.mode), 'mode should be primary or subagent');
});
```

### Step 2: Implement Schemas (GREEN)

Create schema definitions and validation logic.

### Step 3: Write Eval Rubrics (RED)

```json
{
  "skill": "config-creator",
  "task": "Generate a config for a TypeScript web project",
  "rubric": {
    "required_patterns": ["typescript", "web", "opencode.json"],
    "structural_checks": [
      { "type": "file_exists", "path": "opencode.json" },
      { "type": "json_valid", "path": "opencode.json" }
    ],
    "pass_threshold": 0.8
  }
}
```

### Step 4: Implement Eval Runner (GREEN)

Build the eval orchestration engine.

### Step 5: Write Harness QA (RED)

```js
test('harness QA: all agents have valid frontmatter', () => {
  const agents = readdirSync('.opencode/agents').filter(f => f.endsWith('.md'));
  for (const agent of agents) {
    const fm = parseFrontmatter(join('.opencode/agents', agent));
    assert.ok(fm.description, `${agent} should have description`);
    assert.ok(fm.mode, `${agent} should have mode`);
  }
});
```

### Step 6: Implement QA Runner (GREEN)

---

## Verification

### Automated
- [ ] `npm test` — all existing 380+ tests pass
- [ ] `npm run test:evals` — all eval scenarios pass
- [ ] Schema validation catches invalid script output
- [ ] Rubric scoring produces consistent results
- [ ] Harness QA checklist passes for generated projects

### Manual
- [ ] Run evals manually: `node tests/evals/runner.js --skill agent-creator`
- [ ] Review eval report in `tests/evals/reports/`
- [ ] Verify regression baseline detects intentional regressions
- [ ] Test harness QA on `arai init test-proj --template full`

---

## Implementation Phases

### Phase 1: Schema Validation (Week 1)
1. Define schemas for agent .md, opencode.json, SKILL.md
2. Implement `tests/harness/schema-validation.test.js`
3. Add `validateSchema()` helper to `tests/helpers.js`

### Phase 2: Expanded Runtime Validation (Week 1)
1. Implement `tests/integration/opencode-debug-all-agents.test.js`
2. Implement `tests/integration/opencode-debug-all-skills.test.js`
3. Add `tests/consistency/reference-integrity.test.js`

### Phase 3: Eval Framework (Week 2)
1. Create `tests/evals/runner.js` orchestration engine
2. Define rubrics for all 16 creator skills
3. Implement `tests/evals/eval-skill-execution.test.js`
4. Implement `tests/evals/eval-output-format.test.js`

### Phase 4: LLM-Gated Evals (Week 2)
1. Refactor `ai-validation.test.js` into eval framework
2. Add `tests/evals/eval-permission-adherence.test.js`
3. Add `tests/evals/eval-instruction-following.test.js`
4. Implement score persistence and regression detection

### Phase 5: Harness QA (Week 3)
1. Implement `tests/harness/qa-checklist.test.js`
2. Add `tests/consistency/ci-validate-execution.test.js`
3. Integrate harness QA into `arai init` smoke tests
4. Document QA process in tutorials

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| `opencode` binary not available in CI | High | Gate opencode tests behind `TEST_OPENCODE=true` |
| LLM eval scores inconsistent | Medium | Use deterministic seed, multiple trials, statistical threshold |
| Schema too strict (false negatives) | Medium | Start lenient, tighten over time |
| Eval rubrics become stale | Medium | Store baselines, detect drift, automated regeneration |
| Test suite execution time grows | Low | Use `--test-concurrency`, parallel test groups |
