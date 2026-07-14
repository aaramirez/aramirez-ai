---
tags:
  - agentes
  - creator-scripts
created: 2026-07-05
---

# Usar los creators de agentes

> **Objetivo**: Usar los scripts creator para generar agentes primarios, subagentes, agentes especializados, arquitecturas y flujos desde la línea de comandos.

**⏱ Tiempo estimado**: 5 minutos
**🎯 Nivel**: Intermedio
**📋 Requisitos**: [[04-Agentes/01-agentes-principales.md|Agentes primarios]]

## Resultado esperado

Poder generar cualquier tipo de agente o arquitectura usando `node .opencode/scripts/create-*.js` con sus respectivas opciones.

## create-agent

Crea un agente primario con prompt personalizado:

```bash
node .opencode/skills/agent-creator/scripts/create-agent.js --name mi-agent --mode primary --description "Experto en X"
```

## create-subagent

Crea un subagente para tareas específicas:

```bash
node .opencode/skills/agent-creator/scripts/create-agent.js --mode subagent --name auditor --description "Audita logs"
```

## create-specialized-agent

Crea agentes pre-configurados por dominio:

```bash
node .opencode/skills/agent-creator/scripts/create-agent.js --mode subagent --name code-reviewer --domain reviewer
```

## create-architecture

Crea una arquitectura multi-agente completa:

```bash
node .opencode/skills/architecture-creator/scripts/create-architecture.js --name full-dev --pattern tiered
```

## create-flow

Crea un flujo de trabajo con etapas definidas:

```bash
node .opencode/skills/flow-creator/scripts/create-flow.js --name plan-first --stages "plan,build,review,test"
```

## Flags comunes

| Flag | Descripción |
|------|-------------|
| `--dry-run` | Previsualizar sin escribir archivos |
| `--output <dir>` | Directorio de salida personalizado |
| `--help` | Mostrar ayuda |

## Ver archivos generados

```bash
ls -la .opencode/agents/
cat opencode.json | grep -A5 '"mi-agent"'
```

---

**Siguiente**: [[05-Harness/Index|Creación de Harness]]
