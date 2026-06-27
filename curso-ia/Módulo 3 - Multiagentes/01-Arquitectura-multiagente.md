# Arquitectura multiagente

## ¿Por qué multiagente?

Un solo agente intentando hacerlo todo tiene limitaciones:

- **Contexto limitado**: la ventana de contexto se llena rápido
- **Falta de especialización**: un agente no puede ser experto en todo
- **Problemas de control**: es difícil mantener coherencia

> *"Un agente generalista hace muchas cosas regulares. Varios agentes especializados hacen pocas cosas excelentes."*

## Patrones de arquitectura multiagente

### 1. Supervisor

Un agente principal orquesta a subagentes especializados:

```
       [Supervisor / Build]
       /         |         \
[Reviewer]   [Tester]    [Docs]
```

### 2. Pipeline

Cada agente pasa el resultado al siguiente:

```
[Plan] → [Code] → [Review] → [Test] → [Deploy]
```

### 3. Swarm

Agentes colaboran sin jerarquía fija, intercambiando información.

## Cuándo usar cada patrón

| Patrón | Cuándo usarlo |
|--------|---------------|
| **Supervisor** | Proyectos con roles claros (código, tests, docs) |
| **Pipeline** | Flujos lineales (CI/CD, generación de contenido) |
| **Swarm** | Problemas complejos sin estructura predefinida |

## Ejemplo: supervisor con opencode

```json
{
  "default_agent": "build",
  "agent": {
    "build": { "mode": "primary" },
    "plan": {
      "mode": "primary",
      "permission": { "edit": "deny" }
    },
    "reviewer": {
      "mode": "subagent",
      "permission": { "edit": "deny" }
    },
    "tester": {
      "mode": "subagent",
      "permission": { "bash": "allow" }
    },
    "docs": {
      "mode": "subagent",
      "permission": { "edit": "allow", "bash": "deny" }
    }
  }
}
```

## Beneficios

- **Cada agente tiene un rol claro**
- **Permisos granulares** por agente
- **Contexto optimizado** para cada tarea
- **Escalabilidad**: añadir agentes sin modificar los existentes

## Enlaces

- [[02-Subagentes-y-roles|Siguiente: Subagentes y roles]]
- [[Módulo 2 — Agentes/01-Que-es-un-agente|Concepto de agente]]
- [[Módulo 2 — Agentes/02-Configuracion-de-agentes|Configuración de agentes]]
