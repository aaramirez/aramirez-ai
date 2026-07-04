---
name: flow-creator
description: Create workflow sequences for agent collaboration — plan-first, TDD, hotfix, or custom stages.
license: MIT
---

# Creador de flujos de trabajo

## Plantillas de workflow

### Plan-first
`spec` → `design` → `implement` → `review` → `test` → `deploy`
Cada stage se mapea a un agente específico. El plan inicial guía toda la ejecución.

### TDD
`test` → `implement` → `refactor` → `review`
Primero se escribe el test, luego la implementación que lo pasa, después se refactoriza.

### Hotfix
`fix` → `review` → `deploy`
Flujo rápido de 3 etapas para correcciones urgentes. Omite planificación y documentación.

### Custom
Define tus propios stages y su mapeo a agentes. Los stages pueden ser secuenciales o paralelos.

## Integración con AGENTS.md
Los flujos se documentan en `AGENTS.md` como una sección de workflows. Cada flujo lista los stages, el agente responsable por stage, y las reglas de transición.

## Uso

```bash
node shared/scripts/create-flow.js --name "my-flow" --stages "plan,build,review,deploy" --output ./flow.json
```
