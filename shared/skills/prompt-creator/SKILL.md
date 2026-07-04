---
name: prompt-creator
description: Create reusable prompt fragments for commit messages, review criteria, planning, and common patterns.
license: MIT
---

# Creación de fragmentos de prompt

Los fragmentos de prompt (prompt fragments) son bloques reutilizables de texto instructivo almacenados en `shared/prompts/`. A diferencia de los skills, no tienen frontmatter YAML ni licencia: son archivos Markdown planos.

## Diferencias con skills

| Aspecto | Prompt fragment | Skill |
|---------|-----------------|-------|
| Frontmatter | No | Sí (name, description, license) |
| Alcance | Fragmento reutilizable | Agente completo |
| Ubicación | `shared/prompts/` | `shared/skills/<name>/SKILL.md` |
| Uso | Pegado manual o por agente | Cargado con `skill:` |

## Patrones efectivos

1. **Específico**: Instrucciones concretas, no genéricas.
2. **Contextual**: Incluir el "por qué" además del "qué".
3. **Estructurado**: Usar listas, tablas y ejemplos.
4. **Accionable**: Terminar con una instrucción clara.

## Referencia

```bash
node shared/scripts/create-prompt.js \
  --name commit-message \
  --content "Write a conventional commit..." \
  --output ./shared/prompts/commit-message.md
```
