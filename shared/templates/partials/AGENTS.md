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
- **All skills are SKILL.md**: Skills live in `shared/skills/<name>/SKILL.md` with YAML frontmatter.
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

## CLI quick reference

| Command | Description |
|---------|-------------|
{{cli_table}}

## When working

- Follow the existing code style (see `shared/rules/code-style.md`)
- Use conventional commits (`<type>(<scope>): <description>`)
- Keep skills in SKILL.md format with YAML frontmatter
- Add new skills as `shared/skills/<name>/SKILL.md`

## Adding new agents

Run `arai generate agent <name>` to create an agent definition in `shared/agents/` and register it in `platforms/opencode/opencode.json`.
