import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT } from '../helpers.js';
import { parseFrontmatter } from '../helpers.js';

const SHARED = join(REPO_ROOT, 'shared');

describe('shared artifacts schema validation', () => {
  describe('agents', () => {
    const agentsDir = join(SHARED, 'agents');
    if (!existsSync(agentsDir)) return;

    const agentFiles = readdirSync(agentsDir).filter(f => f.endsWith('.md'));

    for (const file of agentFiles) {
      const name = file.replace(/\.md$/, '');

      test(`shared/agents/${file} has valid frontmatter`, () => {
        const fm = parseFrontmatter(join(agentsDir, file));
        assert.ok(fm.description, `${name}: missing description`);
        assert.ok(typeof fm.description === 'string' && fm.description.length > 10,
          `${name}: description too short`);
        assert.ok(fm.mode, `${name}: missing mode`);
        assert.ok(['primary', 'subagent'].includes(fm.mode),
          `${name}: mode must be primary or subagent, got: ${fm.mode}`);
        assert.ok(fm.model, `${name}: missing model`);
        assert.ok(typeof fm.model === 'string' && fm.model.length > 0,
          `${name}: model must be non-empty string`);
        assert.ok(fm.permission, `${name}: missing permission block`);
      });

      test(`shared/agents/${file} body has content`, () => {
        const content = readFileSync(join(agentsDir, file), 'utf8');
        const bodyStart = content.indexOf('---', 3);
        const body = bodyStart > 0 ? content.slice(bodyStart + 3).trim() : '';
        assert.ok(body.length > 50, `${name}: body too short (${body.length} chars)`);
      });
    }
  });

  describe('commands', () => {
    const commandsDir = join(SHARED, 'commands');
    if (!existsSync(commandsDir)) return;

    const commandFiles = readdirSync(commandsDir).filter(f => f.endsWith('.md'));

    for (const file of commandFiles) {
      const name = file.replace(/\.md$/, '');

      test(`shared/commands/${file} has valid frontmatter`, () => {
        const fm = parseFrontmatter(join(commandsDir, file));
        assert.ok(fm.description, `${name}: missing description`);
        assert.ok(typeof fm.description === 'string' && fm.description.length > 10,
          `${name}: description too short`);
      });

      test(`shared/commands/${file} body has template content`, () => {
        const content = readFileSync(join(commandsDir, file), 'utf8');
        const bodyStart = content.indexOf('---', 3);
        const body = bodyStart > 0 ? content.slice(bodyStart + 3).trim() : '';
        assert.ok(body.length > 20, `${name}: body too short (${body.length} chars)`);
      });
    }
  });

  describe('skills', () => {
    const skillsDir = join(SHARED, 'skills');
    if (!existsSync(skillsDir)) return;

    const skillDirs = readdirSync(skillsDir).filter(d =>
      statSync(join(skillsDir, d)).isDirectory() &&
      existsSync(join(skillsDir, d, 'SKILL.md'))
    );

    for (const dir of skillDirs) {
      test(`shared/skills/${dir}/SKILL.md has valid frontmatter`, () => {
        const fm = parseFrontmatter(join(skillsDir, dir, 'SKILL.md'));
        assert.ok(fm.name, `${dir}: missing name`);
        assert.equal(fm.name, dir, `${dir}: name must match directory name`);
        assert.ok(fm.description, `${dir}: missing description`);
        assert.ok(typeof fm.description === 'string' && fm.description.length > 10,
          `${dir}: description too short`);
        assert.ok(fm.license, `${dir}: missing license`);
        assert.equal(fm.license, 'MIT', `${dir}: license must be MIT`);
      });

      test(`shared/skills/${dir}/SKILL.md body has content`, () => {
        const content = readFileSync(join(skillsDir, dir, 'SKILL.md'), 'utf8');
        const bodyStart = content.indexOf('---', 3);
        const body = bodyStart > 0 ? content.slice(bodyStart + 3).trim() : '';
        assert.ok(body.length > 100, `${dir}: body too short (${body.length} chars)`);
      });

      if (existsSync(join(skillsDir, dir, 'scripts'))) {
        test(`shared/skills/${dir}/scripts/ has files`, () => {
          const scriptsDir = join(skillsDir, dir, 'scripts');
          const files = readdirSync(scriptsDir);
          assert.ok(files.length > 0, `${dir}: scripts/ is empty`);
        });
      }
    }
  });

  describe('prompts', () => {
    const promptsDir = join(SHARED, 'prompts');
    if (!existsSync(promptsDir)) return;

    const promptFiles = readdirSync(promptsDir).filter(f => f.endsWith('.md'));

    for (const file of promptFiles) {
      test(`shared/prompts/${file} has content`, () => {
        const content = readFileSync(join(promptsDir, file), 'utf8');
        assert.ok(content.length > 20, `${file}: too short`);
      });
    }
  });

  describe('rules', () => {
    const rulesDir = join(SHARED, 'rules');
    if (!existsSync(rulesDir)) return;

    const ruleFiles = readdirSync(rulesDir).filter(f => f.endsWith('.md'));

    for (const file of ruleFiles) {
      test(`shared/rules/${file} has content`, () => {
        const content = readFileSync(join(rulesDir, file), 'utf8');
        assert.ok(content.length > 20, `${file}: too short`);
      });
    }
  });

  describe('brand.json', () => {
    test('brand.json is valid JSON', () => {
      const brandPath = join(SHARED, 'brand.json');
      assert.ok(existsSync(brandPath), 'brand.json must exist');
      const content = readFileSync(brandPath, 'utf8');
      const brand = JSON.parse(content);
      assert.ok(brand, 'brand.json should not be empty');
    });
  });

  describe('tui.json', () => {
    test('tui.json is valid JSON', () => {
      const tuiPath = join(SHARED, 'tui.json');
      assert.ok(existsSync(tuiPath), 'tui.json must exist');
      const content = readFileSync(tuiPath, 'utf8');
      const tui = JSON.parse(content);
      assert.ok(tui, 'tui.json should not be empty');
    });
  });
});
