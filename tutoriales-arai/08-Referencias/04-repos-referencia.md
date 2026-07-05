---
tags:
  - referencias
  - repos
created: 2026-07-05
---

# Repositorios de referencia

## ¿Qué son?

Repositorios externos clonados bajo `repos/` que sirven como fuente de patrones y referencias para el desarrollo. **No se modifican directamente** — se consultan como inspiración.

## Gestión centralizada

Los repos se configuran en `repos.json` en la raíz del proyecto:

```json
[
  {
    "name": "anthropics/skills",
    "url": "https://github.com/anthropics/skills.git",
    "description": "Skills oficiales de Anthropic — SKILL.md format, patterns, MCP"
  },
  {
    "name": "betta-tech/byo-coding-agent",
    "url": "https://github.com/betta-tech/byo-coding-agent.git",
    "description": "Construcción de agentes personalizados"
  },
  {
    "name": "anthropics/claude-quickstarts",
    "url": "https://github.com/anthropics/claude-quickstarts.git",
    "description": "Templates de inicio rápido con Claude"
  }
]
```

## Sincronizar

```bash
# Sincronizar todos
node shared/scripts/repos-sync.js

# Listar estado
node shared/scripts/repos-sync.js --list
```

## Buenas prácticas

- Clona solo lo que necesites como referencia
- Nunca modifiques archivos dentro de `repos/`
- Cuando uses código de un repo referencia, cita la fuente:

```javascript
// Adaptado de repos/anthropics/skills/skills/mcp-builder/SKILL.md
```

## Los repos en aramirez-ai

```bash
repos/
├── anthropics/
│   ├── skills/
│   └── claude-quickstarts/
└── betta-tech/
    └── byo-coding-agent/
```

---

**Siguiente**: [[08-Referencias/05-uso-creators.md|Usar prompt/rule/reference creators]]
