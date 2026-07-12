# Módulo 11: Arquitecturas Multi-Agente y Flujos de Trabajo

## Patrones de Arquitectura

OpenCode permite definir múltiples agentes que colaboran en un harness. Existen cuatro patrones principales:

### Orchestrator

Un agente principal (**orchestrator**) delega tareas a subagentes especializados. El orchestrator mantiene el plan general, asigna trabajo, revisa resultados y coordina el flujo.

```
         ┌─────────────┐
         │ Orchestrator │
         └──────┬──────┘
        ┌──────┼──────┐
        ▼      ▼      ▼
    ┌──────┐┌──────┐┌──────┐
    │ Agent││ Agent││ Agent│
    │  A   ││  B   ││  C   │
    └──────┘└──────┘└──────┘
```

**Ideal para**: proyectos con un líder técnico que delega a especialistas.

```json
{
  "agent": "orchestrator",
  "subagents": ["planner", "developer", "reviewer", "tester"],
  "orchestration": {
    "mode": "sequential",
    "handoff": "message"
  }
}
```

### Tiered

Tres niveles de agentes con diferentes capacidades:

| Nivel | Rol | Profundidad | Herramientas |
|-------|-----|-------------|--------------|
| **Deep** | Arquitectos / Planners | Estratégico | Lectura, análisis |
| **Mid** | Developers | Táctico | Lectura, escritura, bash |
| **Fast** | Reviewers / Testers | Operativo | Lectura, bash (sin escritura) |

**Ideal para**: equipos grandes con separación clara de responsabilidades.

### Peer

Agentes especialistas con el mismo nivel de jerarquía. Cada uno maneja un dominio específico:

- `frontend-agent`: UI, componentes, estilos
- `backend-agent`: API, bases de datos, lógica de negocio
- `devops-agent`: infraestructura, CI/CD, despliegue
- `qa-agent`: tests, calidad, revisión

**Ideal para**: proyectos con dominios claramente separados que requieren coordinación entre pares.

### Chain

Pipeline secuencial donde cada agente recibe el output del anterior:

```
plan → (handoff) → build → (handoff) → review → (handoff) → deploy
```

Cada etapa tiene un agente especializado que transforma el artefacto y lo pasa al siguiente.

**Ideal para**: flujos de trabajo predecibles y lineales como CI/CD.

## Flujos de Trabajo Predefinidos

### plan-first

```
plan → review-plan → build → test → review → deploy
```

El flujo estándar para desarrollo de funcionalidades. Se planifica primero, luego se revisa el plan, se implementa, se prueba, se revisa el código y se despliega.

### TDD (Test-Driven Development)

```
test → implement → refactor → review
```

Primero se escriben las pruebas, luego se implementa la funcionalidad mínima para que pasen, se refactoriza y finalmente se revisa.

### hotfix

```
diagnose → fix → review → deploy
```

Flujo acelerado para correcciones urgentes. Diagnóstico rápido, fix directo, revisión ligera y despliegue inmediato.

### research

```
explore → analyze → synthesize → document
```

Para tareas de investigación. Se explora el dominio, se analizan hallazgos, se sintetizan conclusiones y se documentan los resultados.

## Cómo Elegir el Patrón Correcto

| Situación | Patrón Recomendado |
|-----------|-------------------|
| Proyecto con líder técnico claro | Orchestrator |
| Equipo grande con roles definidos | Tiered |
| Dominios múltiples e independientes | Peer |
| Pipeline predecible (CI/CD) | Chain |
| Bajo presupuesto de contexto | Orchestrator (2-3 subagentes) |
| Alta complejidad técnica | Tiered (deep agents) |
| Múltiples frentes simultáneos | Peer |

## Task Permissions

Controla qué subagentes puede invocar cada agente mediante permisos en `opencode.json`:

```json
{
  "agent": "orchestrator",
  "subagents": {
    "planner": { "allowed": true, "tools": ["read", "bash"] },
    "developer": { "allowed": true, "tools": ["read", "write", "edit", "bash"] },
    "reviewer": { "allowed": true, "tools": ["read", "bash"], "edit": "deny" },
    "tester": { "allowed": true, "tools": ["bash"], "edit": "deny" }
  },
  "allowedTools": ["read", "bash"],
  "edit": "deny"
}
```

## Color Coding para Agentes en la UI

Define colores para identificar agentes visualmente en la interfaz de OpenCode:

```json
{
  "agent": "orchestrator",
  "ui": {
    "color": "#6C5CE7",
    "label": "🧠 Orquestador"
  },
  "subagents": [
    {
      "name": "planner",
      "ui": { "color": "#0984E3", "label": "📋 Planificador" }
    },
    {
      "name": "developer",
      "ui": { "color": "#00B894", "label": "💻 Desarrollador" }
    },
    {
      "name": "reviewer",
      "ui": { "color": "#FDCB6E", "label": "🔍 Revisor" }
    },
    {
      "name": "tester",
      "ui": { "color": "#E17055", "label": "🧪 Probador" }
    }
  ]
}
```

## Scripts de Creación

### architecture-creator

```bash
node .opencode/scripts/create-architecture.js \
  --pattern orchestrator \
  --description "Full dev team" \
  --subagents planner,developer,reviewer,tester \
  --output ./.opencode/agents/
```

Genera la estructura de directorios y archivos de configuración para el patrón seleccionado.

### flow-creator

```bash
node .opencode/scripts/create-flow.js \
  --name dev-flow \
  --stages "plan,build,review,deploy" \
  --output ./flow.json
```

Crea un archivo JSON con la definición del flujo de trabajo.

## Práctica

1. Genera una arquitectura **orchestrator** con 4 subagentes usando `create-architecture.js`
2. Define colores distintos para cada subagente
3. Configura permisos: los subagentes `reviewer` y `tester` no pueden editar
4. Crea un flujo `plan-first` con `flow-creator`
5. Verifica la configuración con `opencode debug config`

## Resumen

Las arquitecturas multi-agente permiten dividir el trabajo entre especialistas. El patrón **orchestrator** usa un agente principal que delega a subagentes. El patrón **tiered** organiza agentes en niveles de profundidad estratégica, táctica y operativa. El patrón **peer** asigna especialistas iguales por dominio. El patrón **chain** procesa un pipeline secuencial. Los flujos de trabajo (`plan-first`, `TDD`, `hotfix`, `research`) definen la secuencia de etapas. Los permisos controlan qué herramientas y subagentes puede usar cada agente, y el color coding mejora la identificación visual en la interfaz.
