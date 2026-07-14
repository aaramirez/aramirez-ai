# Shared Artifacts Audit & Standardization

## Objective

Audit all 89 files across 10 directories in `shared/` and establish comprehensive test coverage, structural consistency, and documentation standards following the same patterns used in the main project.

---

## Current State Analysis

### shared/ Structure (89 files, 36 directories)

```
shared/
├── agents/          12 .md files — agent definitions (shared across projects)
├── brand.json       brand identity config
├── commands/        12 .md files — opencode command templates
├── plugins/         1 .tsx file — custom-logo plugin
├── prompts/         1 .md file — commit-message prompt
├── rules/           1 .md file — code-style rule
├── scripts/         4 .js files + lib/ (8 files) — arai CLI infrastructure
├── skills/          14 SKILL.md directories (6 with scripts/)
├── templates/       2 template dirs + partials/
└── tui.json         TUI plugin config
```

### Skills Inventory

| Skill | Has scripts/ | Agent .md | Command .md | Package Type |
|-------|-------------|-----------|-------------|--------------|
| branding | ✅ 1 script | ✅ | ❌ | utility |
| ci-validate | ❌ | ❌ | ❌ | standalone |
| code-review | ❌ | ❌ | ❌ | standalone |
| content-ingestion | ✅ 1 script | ✅ | ✅ ingest.md | full |
| document-generation | ✅ 11 scripts | ✅ | ✅ generate.md | full |
| email | ✅ 2 scripts | ✅ | ✅ send-email.md | full |
| git | ❌ | ❌ | ❌ | standalone |
| google-workspace | ❌ | ❌ | ❌ | standalone |
| kb-management | ✅ 1 script | ✅ | ✅ kb.md | full |
| m365 | ❌ | ❌ | ❌ | standalone |
| pdf-extraction | ✅ 1 script | ✅ | ❌ | utility |
| repos-sync | ❌ | ❌ | ❌ | standalone |
| vault-pdf-export | ✅ 1 script | ✅ | ✅ export-pdf.md | full |
| youtube | ✅ 1 script | ✅ | ✅ youtube-cmd.md | full |

### Existing Test Coverage (tests/shared/)

| Test File | Tests | Coverage |
|-----------|-------|----------|
| agents.test.js | agent existence + frontmatter | 6 agents |
| commands.test.js | command existence + frontmatter | 6 commands |
| skill-completeness.test.js | SKILL.md existence | 2 skills |
| frontmatter-updates.test.js | scripts: field + script existence | 4 skills |
| create-brand.test.js | script execution | branding |
| extract-pdf.test.js | script execution | pdf-extraction |
| ingest-content.test.js | script execution | content-ingestion |
| kb-sync.test.js | script execution | kb-management |
| install-skill-full.test.js | install flow | email |

### Identified Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| No schema validation for shared agents | High | High |
| No schema validation for shared commands | High | High |
| No validation of standalone skills (no scripts) | Medium | High |
| No cross-reference integrity (agent ↔ skill ↔ command) | High | High |
| No script ESM validation for shared/scripts/ | Medium | Medium |
| No template validation | Medium | Medium |
| No plugin validation | Low | Medium |
| No CI validation execution | Medium | Medium |
| No eval framework for shared skill quality | Medium | Low |

---

## Requirements

1. **Schema validation** — every agent, command, and SKILL.md has valid frontmatter — priority: **high**
2. **Cross-reference integrity** — agent ↔ skill ↔ command mapping is complete — priority: **high**
3. **Script ESM compliance** — all shared scripts use ESM syntax — priority: **high**
4. **Standalone skill coverage** — all skills validated, even those without scripts — priority: **high**
5. **Template validation** — templates/minimal and templates/full have valid structure — priority: **medium**
6. **Plugin validation** — plugins/custom-logo.tsx is valid TypeScript — priority: **low**
7. **CI validation** — run shared/scripts/ci-validate.js in test suite — priority: **medium**
8. **Documentation** — update README if needed — priority: **low**

---

## File Changes

### New Files

| File | Purpose |
|------|---------|
| `tests/shared/schema-validation.test.js` | Schema validation for all shared artifacts |
| `tests/shared/cross-reference-integrity.test.js` | Agent ↔ skill ↔ command mapping |
| `tests/shared/script-esm-validation.test.js` | ESM syntax validation for shared scripts |
| `tests/shared/template-validation.test.js` | Template structure validation |
| `tests/shared/plugin-validation.test.js` | Plugin TypeScript validation |
| `tests/shared/ci-validate-execution.test.js` | Run ci-validate.js in test suite |
| `tests/shared/eval-runner.js` | Evals for shared skill quality |

### Modified Files

| File | Changes |
|------|---------|
| `tests/shared/skill-completeness.test.js` | Add all 14 skills, not just 2 |
| `tests/shared/frontmatter-updates.test.js` | Expand to cover all skills with scripts |
| `tests/consistency/shared-artifacts.test.js` | Fix require('fs') bug, expand checks |

### Shared Files (no changes)

| File | Status |
|------|--------|
| `shared/agents/*.md` | Validate only, no modifications |
| `shared/commands/*.md` | Validate only, no modifications |
| `shared/skills/*/SKILL.md` | Validate only, no modifications |
| `shared/scripts/*.js` | Validate only, no modifications |

---

## TDD Flow

### Phase 1: Schema Validation (tests first)

1. Write `tests/shared/schema-validation.test.js` → **FAIL** (assert against frontmatter)
2. No implementation needed (validation only) → **PASS** when artifacts are valid
3. Fix any invalid frontmatter found → still **PASS**

### Phase 2: Cross-Reference Integrity

1. Write `tests/shared/cross-reference-integrity.test.js` → **FAIL** (map dependencies)
2. No implementation needed → **PASS** when mappings are correct
3. Document any missing cross-references → still **PASS**

### Phase 3: Script ESM Validation

1. Write `tests/shared/script-esm-validation.test.js` → **FAIL** (check import/export)
2. No implementation needed → **PASS** when scripts use ESM
3. Fix any CommonJS scripts found → still **PASS**

### Phase 4: Standalone Skill Coverage

1. Modify `tests/shared/skill-completeness.test.js` → **FAIL** (add all 14 skills)
2. No implementation needed → **PASS** when all skills exist
3. Add any missing SKILL.md files → still **PASS**

### Phase 5: Template & Plugin Validation

1. Write `tests/shared/template-validation.test.js` → **FAIL** (validate structure)
2. Write `tests/shared/plugin-validation.test.js` → **FAIL** (validate TypeScript)
3. No implementation needed → **PASS** when artifacts are valid

### Phase 6: CI Validation Execution

1. Write `tests/shared/ci-validate-execution.test.js` → **FAIL** (run ci-validate.js)
2. Fix any ci-validate.js issues → **PASS**
3. Ensure exit code 0 → still **PASS**

---

## Verification Steps

- [ ] `npm test` passes (all new + existing tests)
- [ ] Schema validation covers all 12 agents, 12 commands, 14 skills
- [ ] Cross-reference integrity maps all 6 full packages correctly
- [ ] All 14 shared scripts pass ESM validation
- [ ] Templates validated (minimal + full)
- [ ] Plugin validated (custom-logo.tsx)
- [ ] ci-validate.js executes successfully
- [ ] No modifications to shared/ artifacts (validation only)
- [ ] Documentation updated if needed

---

## Test Count Estimate

| Test File | Estimated Tests |
|-----------|-----------------|
| schema-validation.test.js | 40-50 |
| cross-reference-integrity.test.js | 20-25 |
| script-esm-validation.test.js | 15-20 |
| template-validation.test.js | 5-10 |
| plugin-validation.test.js | 3-5 |
| ci-validate-execution.test.js | 3-5 |
| **Total new** | **86-115** |

---

## Execution Order

1. Create plan document (this file)
2. Write schema-validation.test.js (Phase 1)
3. Write cross-reference-integrity.test.js (Phase 2)
4. Write script-esm-validation.test.js (Phase 3)
5. Modify skill-completeness.test.js (Phase 4)
6. Write template-validation.test.js (Phase 5)
7. Write plugin-validation.test.js (Phase 5)
8. Write ci-validate-execution.test.js (Phase 6)
9. Run full test suite
10. Fix any issues found
11. Update documentation if needed
