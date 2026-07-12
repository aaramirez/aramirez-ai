---
name: skill-creator
description: Create reusable SKILL.md files with valid YAML frontmatter for agent skill discovery.
license: MIT
scripts:
  - create-skill.js
  - create-base.js
---

# Creador de skills

## Formato SKILL.md

```yaml
---
name: my-skill
description: Breve descripción de lo que hace el skill
license: MIT
---
```

### Reglas de validación

- **name**: minúsculas, guiones permitidos, máximo 64 caracteres. Sin espacios ni caracteres especiales.
- **description**: máximo 120 caracteres, debe describir el caso de uso del skill.
- **license**: usar siempre `MIT`.

### Path de descubrimiento
OpenCode descubre skills en `.opencode/skills/<name>/SKILL.md`. También se cargan desde `shared/skills/<name>/SKILL.md` en el repositorio central.

### Carga bajo demanda
Los skills se cargan solo cuando el agente los invoca explícitamente mediante la herramienta `skill`. No afectan el rendimiento si no se usan.

## Uso

```bash
node .opencode/scripts/create-skill.js --name my-skill --description "Does X" --content "# My skill\n\nInstructions..." --output ./shared/skills/my-skill/SKILL.md
```
