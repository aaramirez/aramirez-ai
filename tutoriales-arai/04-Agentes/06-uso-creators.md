---
tags:
  - agentes
  - creator-scripts
created: 2026-07-05
---

# Usar los creators de agentes

## create-agent

Crea un agente primario con prompt personalizado:

```bash
node shared/scripts/create-agent.js --name mi-agent --mode primary --description "Experto en X"
```

## create-subagent

Crea un subagente para tareas específicas:

```bash
node shared/scripts/create-subagent.js --name auditor --description "Audita logs"
```

## create-specialized-agent

Crea agentes pre-configurados por dominio:

```bash
node shared/scripts/create-specialized-agent.js --name code-reviewer --domain reviewer
```

## create-architecture

Crea una arquitectura multi-agente completa:

```bash
node shared/scripts/create-architecture.js --name full-dev --pattern tiered
```

## create-flow

Crea un flujo de trabajo con etapas definidas:

```bash
node shared/scripts/create-flow.js --name plan-first --stages "plan,build,review,test"
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
