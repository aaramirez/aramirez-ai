---
tags:
  - skills
  - creator
created: 2026-07-05
---

# Skills creator

> **Objetivo**: Conocer las 16 skills creator que guían a los agentes en la creación de componentes del harness de opencode.

**⏱ Tiempo estimado**: 5 minutos
**🎯 Nivel**: Intermedio
**📋 Requisitos**: [[06-Skills/01-usar-skills.md|Usar skills existentes]]

## Resultado esperado

Saber qué skills creator están disponibles, qué componente genera cada una, y cómo invocarlas desde los agentes.

## ¿Qué son las skills creator?

Son skills especiales en `.opencode/skills/` que describen cómo usar cada creator script desde un agente de opencode. Cada creator script tiene su skill correspondiente.

## Lista completa

| Skill | Script asociado | Propósito |
|-------|----------------|-----------|
| `config-creator` | `create-config.js` | Configuración base opencode.json |
| `permission-creator` | `create-permission.js` | Reglas de permisos |
| `instructions-creator` | `create-instructions.js` | AGENTS.md |
| `agent-creator` | `create-agent.js` | Agentes primarios y subagentes |
| `architecture-creator` | `create-architecture.js` | Arquitecturas multi-agente |
| `flow-creator` | `create-flow.js` | Flujos de trabajo |
| `skill-creator` | `create-skill.js` | Skills reutilizables |
| `mcp-creator` | `create-mcp.js` | Servidores MCP |
| `command-creator` | `create-command.js` | Comandos personalizados |
| `script-creator` | `create-script.js` | Scripts de automatización |
| `prompt-creator` | `create-prompt.js` | Fragmentos de prompt |
| `rule-creator` | `create-rule.js` | Reglas de codificación |
| `reference-creator` | `create-reference.js` | Referencias compartidas |
| `plugin-creator` | `create-plugin.js` | Plugins |
| `tool-creator` | `create-tool.js` | Herramientas personalizadas |
| `harness-generator` | *(orchestrates others)* | Orquestador interactivo (agente `new-harness`) |

## Cargar una skill creator

Cuando trabajas con un agente de opencode, puedes cargar una skill creator para que te guíe:

```
/usar skill agent-creator
```

El agente entonces seguirá las instrucciones de la skill para crear un agente usando el script correspondiente.

## Sincronizar skills creator

```bash
arai sync skill config-creator
arai sync skill agent-creator
# ...etc
```

---

**Siguiente**: [[07-MCP/Index|MCP, Comandos y Extensiones]]
