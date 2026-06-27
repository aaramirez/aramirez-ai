# Subagentes y roles

## Definición de subagente

Un **subagente** es un agente especializado que se ejecuta dentro del contexto de un agente principal. Tiene acceso limitado a herramientas y se enfoca en una tarea específica.

> *"Un subagente no es un agente de segunda clase: es un experto al que llamas cuando necesitas su especialidad."*

## Roles disponibles

### Reviewer (revisor de código)

```yaml
description: Code review specialist
mode: subagent
model: anthropic/claude-sonnet-4-6
permission:
  edit: deny
  bash: deny
```

Se enfoca en:
- Corrección del código
- Seguridad
- Rendimiento
- Consistencia con el proyecto
- Buenas prácticas

### Tester (especialista en testing)

```yaml
description: Testing specialist
mode: subagent
model: anthropic/claude-haiku-4-5
permission:
  bash: allow
  edit: allow
```

Se enfoca en:
- Tests unitarios y de integración
- Cobertura de código
- Casos borde
- TDD

### Docs (documentación)

```yaml
description: Documentation specialist
mode: subagent
model: anthropic/claude-haiku-4-5
permission:
  edit: allow
  bash: deny
```

Se enfoca en:
- README, API docs, CHANGELOG
- Claridad y estructura
- Ejemplos de uso

## Cómo invocar subagentes

En opencode, los subagentes se invocan por nombre desde el agente principal:

```
/review     → Invoca al revisor
/test       → Invoca al tester
/docs       → Invoca al documentador
```

## Multi-modelo

Los subagentes pueden usar modelos diferentes:

| Rol | Modelo | Razón |
|-----|--------|-------|
| Build | Sonnet 4.6 | Máxima capacidad |
| Reviewer | Sonnet 4.6 | Requiere criterio |
| Tester | Haiku 4.5 | Rápido y económico |
| Docs | Haiku 4.5 | Suficiente para documentar |

## Buenas prácticas

1. **Un rol, una responsabilidad** — Cada subagente hace una cosa bien
2. **Permisos mínimos** — Solo las herramientas que necesita
3. **Modelo adecuado** — No uses el modelo más caro para tareas simples
4. **Contexto acotado** — Pasa solo la información relevante

## Enlaces

- [[01-Arquitectura-multiagente|Anterior: Arquitectura multiagente]]
- [[03-Orquestacion-y-flujos|Siguiente: Orquestación y flujos]]
- [[Módulo 2 — Agentes/04-Testing-y-calidad|Tester en detalle]]
- [[Módulo 2 — Agentes/05-Documentacion-automatica|Docs en detalle]]
