import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT } from '../helpers.js';

const SKILLS_DIR = join(REPO_ROOT, 'shared', 'skills');

function getSkills() {
  return readdirSync(SKILLS_DIR).filter(f =>
    statSync(join(SKILLS_DIR, f)).isDirectory()
  ).sort();
}

function getBody(filePath) {
  const content = readFileSync(filePath, 'utf8');
  return content.replace(/^---[\s\S]+?---\n*/, '').trim();
}

function getAllHeadings(filePath) {
  const body = getBody(filePath);
  return [...body.matchAll(/^## (.+)/gm)].map(m => m[1].trim());
}

const TECHNICAL_SKILLS = new Set(['branding', 'document-generation', 'pdf-extraction', 'youtube']);

/* ─── 1a. Skill section coverage ─── */

const REQUIRED_SECTIONS = {
  git:                    ['Commit convention', 'Branch naming', 'Workflow'],
  'code-review':          ['Focus areas', 'Review process'],
  'content-ingestion':    ['Sources', 'Rules', 'Workflow'],
  'document-generation':  ['Pipeline', 'Available builders'],
  branding:               ['Token reference (`.opencode/brand.json`)', 'Visual conventions'],
  'kb-management':        ['Structure', 'Maintenance tasks'],
  'pdf-extraction':       ['Techniques'],
  youtube:                ['Usage', 'Workflow'],
};

/* ─── 1b. Domain keyword presence ─── */

const REQUIRED_KEYWORDS = {
  git:                    ['commit', 'branch'],
  'code-review':          ['security', 'performance', 'maintainability'],
  'content-ingestion':    ['frontmatter', 'source'],
  'document-generation':  ['json', 'build', 'slide'],
  branding:               ['colors', 'logo'],
  'kb-management':        ['frontmatter', 'wikilink'],
  'pdf-extraction':       ['pdftotext', 'python'],
  youtube:                ['cli', 'node.js'],
};

describe('skill content quality (Phase 1a, 1b, 1c, 1f)', () => {
  const skills = getSkills();

  test('has at least one skill', () => {
    assert.ok(skills.length > 0);
  });

  /* ─── 1a. Section coverage ─── */

  for (const name of skills) {
    test(`${name}: has required section headings`, () => {
      const required = REQUIRED_SECTIONS[name];
      if (!required) return; // no hard requirement for this skill
      const headings = getAllHeadings(join(SKILLS_DIR, name, 'SKILL.md'));
      for (const section of required) {
        assert.ok(headings.includes(section),
          `Skill "${name}" missing required section "## ${section}". Found: [${headings.join(', ')}]`);
      }
    });
  }

  /* ─── 1b. Domain keyword presence ─── */

  for (const name of skills) {
    test(`${name}: covers key domain topics`, () => {
      const required = REQUIRED_KEYWORDS[name];
      if (!required) return;
      const body = getBody(join(SKILLS_DIR, name, 'SKILL.md')).toLowerCase();
      const missing = required.filter(kw => !body.includes(kw.toLowerCase()));
      assert.ok(missing.length === 0,
        `Skill "${name}" missing keywords: ${missing.join(', ')}`);
    });
  }

  /* ─── 1c. Cross-reference validity ─── */
  // Only check explicit cross-references: markdown links [text](skill) and
  // backtick-wrapped skill names (after stripping [[brackets]]).

  function stripBrackets(s) {
    return s.replace(/^\[\[/, '').replace(/\]\]$/, '');
  }

  test('skill cross-references point to existing skills', () => {
    const skillNames = new Set(skills);
    const refErrors = [];

    for (const name of skills) {
      const body = getBody(join(SKILLS_DIR, name, 'SKILL.md'));

      // Backtick-wrapped: extract values, strip [[ ]], keep only those
      // whose trimmed value matches a known skill name.
      const backtickRefs = [...body.matchAll(/`([^`]+)`/g)]
        .map(m => stripBrackets(m[1]).trim())
        .filter(ref => ref !== name && skillNames.has(ref));

      // Markdown link references: [text](ref), keep only skill names
      const mdRefs = [...body.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)]
        .map(m => m[2].trim())
        .filter(ref => ref !== name && skillNames.has(ref));

      const allRefs = [...new Set([...backtickRefs, ...mdRefs])];
      for (const ref of allRefs) {
        if (!skillNames.has(ref)) {
          refErrors.push(`${name} references "${ref}" which is not a known skill`);
        }
      }
    }

    assert.ok(refErrors.length === 0, refErrors.join('\n'));
  });

  /* ─── 1f. Minimum content quality ─── */

  for (const name of skills) {
    test(`${name}: has minimum body content (≥50 words)`, () => {
      const body = getBody(join(SKILLS_DIR, name, 'SKILL.md'));
      const wordCount = body.split(/\s+/).filter(Boolean).length;
      assert.ok(wordCount >= 50,
        `Skill "${name}" has only ${wordCount} body words, need at least 50`);
    });
  }

  for (const name of skills) {
    if (!TECHNICAL_SKILLS.has(name)) continue;
    test(`${name}: technical skill has at least one code block`, () => {
      const body = getBody(join(SKILLS_DIR, name, 'SKILL.md'));
      const codeBlocks = (body.match(/```/g) || []).length / 2;
      assert.ok(codeBlocks >= 1,
        `Technical skill "${name}" has no code blocks, expected at least 1`);
    });
  }
});
