---
tags:
  - agentes
  - subagentes
created: 2026-07-05
---

# Subagentes

> **Objetivo**: Aprender qué son los subagentes, cómo se invocan (auto-invocación vs @-mention) y cómo configurarlos en opencode.

**⏱ Tiempo estimado**: 6 minutos
**🎯 Nivel**: Intermedio
**📋 Requisitos**: [[04-Agentes/01-agentes-principales.md|Agentes primarios]]

## Resultado esperado

Poder definir subagentes especializados que se activen automáticamente según el contexto o mediante mención explícita.

## ¿Qué es un subagente?

Un subagente (`mode: subagent`) es un agente que **no** aparece en la interfaz principal. Se invoca mediante:

1. **@-mention** — el agente principal menciona `@subagente` en su respuesta
2. **Auto-invocación** — el runtime decide delegar basado en la tarea

## Subagentes incorporados en arai

| Agente | Uso | Permisos |
|--------|-----|----------|
| `explore` | Exploración rápida del código | Solo lectura |
| `general` | Tareas complejas multi-paso | Bash allow |
| `reviewer` | Revisiones de código y PRs | Solo lectura |
| `tester` | Escribir y ejecutar tests | Bash allow |
| `docs` | Documentación y wikis | Edit allow, bash deny |

## Configurar un subagente

```json
"explore": {
  "mode": "subagent",
  "description": "Fast agent for codebase exploration",
  "permission": { "edit": "deny" }
}
```

## Buenas prácticas (Anthropic)

- Usa subagentes para **trabajo paralelo e independiente**, no secuencial
- Asigna modelos más baratos a subagentes para tareas simples
- Un subagente no debería depender del resultado de otro subagente
- Gatea permisos según la sensibilidad de la tarea

## Crear un subagente

```bash
node shared/scripts/create-subagent.js \
  --name mi-subagente \
  --description "Audita dependencias" \
  --model opencode/big-pickle
```

---

**Siguiente**: [[04-Agentes/03-agentes-especializados.md|Agentes especializados]]
