---
name: rule-creator
description: Create coding standards and architecture rule files for project consistency.
license: MIT
scripts:
  - create-rule.js
  - create-base.js
---

# Creación de reglas de proyecto

Las reglas definen estándares de codificación y arquitectura que aplican a todo el proyecto. Se almacenan en `shared/rules/` como archivos Markdown.

## Diferencias con skills

| Aspecto | Rule | Skill |
|---------|------|-------|
| Alcance | Todo el proyecto | Agente específico |
| Ubicación | `shared/rules/` | `shared/skills/<name>/SKILL.md` |
| Contenido | Estándares + guías | Instrucciones de agente |
| Frontmatter | No requiere | Sí (name, description, license) |

## Categorías recomendadas

- **code-style** — formato, nombres, estructura.
- **architecture** — patrones, capas, dependencias.
- **testing** — cobertura, estrategia, herramientas.
- **security** — validación, autenticación, secretos.
- **documentation** — estándares de docs y comentarios.

## Referencia

```bash
node .opencode/skills/rule-creator/scripts/create-rule.js \
  --name code-style \
  --content "# Code style\n\n## General\n- Follow patterns" \
  --output ./shared/rules/code-style.md
```
