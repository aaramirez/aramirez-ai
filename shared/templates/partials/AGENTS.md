# {{project_name}} — AI Agent Instructions

{{project_description}}

This repository uses **arai** (open-code AI configuration manager) for multi-agent configuration.
Skills, scripts, and prompts are installed from the [aramirez-ai](https://github.com/aaramirez/aramirez-ai) repository.

## Repository structure

```
{{project_name}}/
{{directory_tree}}
```

## Key principles

- **OpenCode only**: All agent configuration is managed through opencode (opencode.json).
- **Skills live in `.opencode/skills/<name>/SKILL.md`** with YAML frontmatter.
- **Cross-Platform Compatibility**: All code, scripts, and tools must run on both macOS and Windows.
- **Per-project installs**: `arai install` copies files locally — projects are self-contained.

## Available agents

| Agent | Mode | Permissions |
|-------|------|-------------|
{{agents_table}}

## Available skills

| Skill | Description |
|-------|-------------|
{{skills_table}}

## Available scripts

| Script | Type |
|--------|------|
{{scripts_table}}

## CLI quick reference

| Command | Description |
|---------|-------------|
{{cli_table}}

## When working

- Follow the existing code style (see `shared/rules/code-style.md`)
- Use conventional commits (`<type>(<scope>): <description>`)
- Keep skills in SKILL.md format with YAML frontmatter
- Add new skills as `.opencode/skills/<name>/SKILL.md`
