---
tags:
  - referencias
  - prompts
  - reglas
created: 2026-07-05
---

# Prompts y reglas

## Prompts reutilizables

Los prompts son fragmentos de instrucciones que los agentes pueden cargar en contexto. Útiles para patrones recurrentes como mensajes de commit o criterios de revisión.

```bash
arai generate prompt commit-msg
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
arai generate rule code-style
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
