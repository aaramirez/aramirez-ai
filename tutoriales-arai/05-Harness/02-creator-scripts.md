---
tags:
  - harness
  - creator-scripts
created: 2026-07-05
---

# Los 18 creator scripts

> **Objetivo**: Conocer los 18 scripts creator que generan componentes del harness de opencode y saber cuándo usar cada uno.

**⏱ Tiempo estimado**: 8 minutos
**🎯 Nivel**: Intermedio
**📋 Requisitos**: [[05-Harness/01-que-es-un-harness.md|¿Qué es un harness?]]

## Resultado esperado

Tener una referencia completa de los 18 scripts, sus flags y qué genera cada uno.

## Visión general

Los creator scripts son scripts Node.js ESM en `shared/scripts/` que generan componentes de harness de forma interactiva. Cada script produce uno o más archivos listos para usar.

## Tabla completa

| # | Script | Genera | Para qué |
|---|--------|--------|----------|
| 1 | `create-config.js` | `opencode.json` | Configuración base del proyecto |
| 2 | `create-permission.js` | Bloque de permisos | Reglas globales y por agente |
| 3 | `create-instructions.js` | `AGENTS.md` | Instrucciones del proyecto |
| 4 | `create-agent.js` | Agent `.md` + registro | Agentes primarios personalizados |
| 5 | `create-subagent.js` | Subagent `.md` | Agentes especializados invocados |
| 6 | `create-specialized-agent.js` | Agent `.md` con prompt de dominio | Reviewer, tester, docs, security, devops |
| 7 | `create-architecture.js` | Múltiples agents + registro | Arquitecturas multi-agente |
| 8 | `create-flow.js` | Instrucciones de workflow | Flujos de trabajo (plan-first, TDD, etc.) |
| 9 | `create-skill.js` | `SKILL.md` | Skills reutilizables con frontmatter |
| 10 | `create-mcp.js` | Entrada MCP en opencode.json | Servidores MCP locales/remotos |
| 11 | `create-command.js` | Entrada command en opencode.json | Comandos personalizados |
| 12 | `create-script.js` | Script `.js/.py/.sh` | Automatizaciones reutilizables |
| 13 | `create-prompt.js` | Fragmento `.md` | Prompts reutilizables |
| 14 | `create-rule.js` | Regla `.md` | Estándares de codificación |
| 15 | `create-reference.js` | Entrada reference en opencode.json | Rutas compartidas |
| 16 | `create-plugin.js` | Config + estructura del plugin | Extensiones del runtime |
| 17 | `create-tool.js` | Definición + handler | Herramientas personalizadas |
| 18 | `harness-generator.js` | Harness completo | Orquestador de todos los anteriores |

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
