---
tags:
  - referencias
  - prompts
  - reglas
created: 2026-07-05
---

# Prompts y reglas

> **Objetivo**: Crear fragmentos de prompt reutilizables y reglas de codificación para mantener consistencia entre proyectos.

**⏱ Tiempo estimado**: 6 minutos
**🎯 Nivel**: Intermedio
**📋 Requisitos**: Creator scripts disponibles en `.opencode/scripts/`

## Resultado esperado

Poder definir prompts para tareas frecuentes (commits, reviews, planning) y reglas de estilo/arquitectura que los agentes sigan automáticamente.

## Prompts reutilizables

Los prompts son fragmentos de instrucciones que los agentes pueden cargar en contexto. Útiles para patrones recurrentes como mensajes de commit o criterios de revisión.

```bash
node .opencode/scripts/create-prompt.js commit-msg
```

Esto crea `shared/prompts/commit-msg.md`:

```markdown
Escribe mensajes de commit siguiendo Conventional Commits:
- feat: nueva funcionalidad
- fix: corrección de bug
- refactor: cambio que no agrega funcionalidad
- docs: cambios en documentación
- test: agregar o corregir tests
```

## Reglas de codificación

Las reglas definen estándares que los agentes deben seguir al escribir código.

```bash
node .opencode/scripts/create-rule.js code-style
```

Esto crea `shared/rules/code-style.md`:

```markdown
# Code Style

- Usar TypeScript estricto
- Funciones puras donde sea posible
- Tests antes de implementar (TDD)
- Nombres descriptivos en inglés
- Máximo 200 líneas por archivo
```

## Instalar en un proyecto

```bash
arai install prompt commit-msg
arai install rule code-style
```

## Skills asociadas

Las skills `prompt-creator` y `rule-creator` describen el proceso desde un agente de opencode.

---

**Siguiente**: [[08-Referencias/02-referencias-compartidas.md|Referencias compartidas]]
