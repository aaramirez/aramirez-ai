---
tags:
  - harness
  - creator-scripts
created: 2026-07-05
---

# Los 16 creator scripts

> **Objetivo**: Conocer los 16 scripts creator que generan componentes del harness de opencode y saber cuándo usar cada uno.

**⏱ Tiempo estimado**: 8 minutos
**🎯 Nivel**: Intermedio
**📋 Requisitos**: [[05-Harness/01-que-es-un-harness.md|¿Qué es un harness?]]

## Resultado esperado

Tener una referencia completa de los 16 scripts, sus flags y qué genera cada uno.

## Visión general

Los creator scripts son scripts Node.js ESM en `.opencode/scripts/` que generan componentes de harness de forma interactiva. Cada script produce uno o más archivos listos para usar.

## Tabla completa

| # | Script | Genera | Para qué |
|---|--------|--------|----------|
| 1 | `create-config.js` | `opencode.json` | Configuración base del proyecto |
| 2 | `create-permission.js` | Bloque de permisos | Reglas globales y por agente |
| 3 | `create-instructions.js` | `AGENTS.md` | Instrucciones del proyecto |
| 4 | `create-agent.js` | Agent `.md` + registro | Agentes primarios y subagentes |
| 5 | `create-architecture.js` | Múltiples agents + registro | Arquitecturas multi-agente |
| 6 | `create-flow.js` | Instrucciones de workflow | Flujos de trabajo (plan-first, TDD, etc.) |
| 7 | `create-skill.js` | `SKILL.md` | Skills reutilizables con frontmatter |
| 8 | `create-mcp.js` | Entrada MCP en opencode.json | Servidores MCP locales/remotos |
| 9 | `create-command.js` | Entrada command en opencode.json | Comandos personalizados |
| 10 | `create-script.js` | Script `.js/.py/.sh` | Automatizaciones reutilizables |
| 11 | `create-prompt.js` | Fragmento `.md` | Prompts reutilizables |
| 12 | `create-rule.js` | Regla `.md` | Estándares de codificación |
| 13 | `create-reference.js` | Entrada reference en opencode.json | Rutas compartidas |
| 14 | `create-plugin.js` | Config + estructura del plugin | Extensiones del runtime |
| 15 | `create-tool.js` | Definición + handler | Herramientas personalizadas |
| 16 | `create-base.js` | Utilidades compartidas | Base para todos los scripts |

## Flags comunes

```bash
--dry-run       # Previsualizar sin escribir archivos
--output <dir>  # Directorio de salida personalizado
--help          # Mostrar ayuda
```

## Skill asociada

Cada script tiene una skill correspondiente en `shared/skills/` con el sufijo `-creator`, que describe cómo usarlo desde un agente de opencode.

---

**Siguiente**: [[05-Harness/03-harness-generator.md|Harness Generator]]
