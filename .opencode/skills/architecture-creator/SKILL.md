---
name: architecture-creator
description: Create multi-agent architecture patterns — orchestrator, tiered, peer, or chain delegation models.
license: MIT
scripts:
  - create-architecture.js
  - create-base.js
---

# Creador de arquitecturas multi-agente

## Patrones disponibles

### Orchestrator
Un agente primario delega tareas a subagentes especializados. Ejemplo: `plan` → `code` → `review` → `test`. El orquestador coordina el flujo y consolida resultados.

**Ideal para**: Proyectos con un líder técnico que asigna trabajo a especialistas.

### Tiered
Tres niveles:
- **Deep**: Arquitectos — decisiones estratégicas, diseño de sistemas.
- **Mid**: Desarrolladores — implementación, refactors.
- **Fast**: Reviewers/testers — validación rápida, retroalimentación.

**Ideal para**: Equipos grandes con separación clara de responsabilidades.

### Peer
Agentes especializados con igual jerarquía: frontend, backend, devops, QA. Cada uno opera en su dominio sin supervisión central.

**Ideal para**: Equipos multidisciplinarios donde cada miembro es autónomo.

### Chain
Pipeline secuencial: `plan` → `build` → `review` → `deploy`. Cada etapa recibe el output de la anterior y solo avanza si hay aprobación.

**Ideal para**: Procesos con validación obligatoria en cada paso (ej. releases).

## Uso

```bash
node .opencode/skills/architecture-creator/scripts/create-architecture.js --pattern orchestrator --description "Full team" --output ./.opencode/agents/
```
