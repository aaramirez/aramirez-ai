---
tags:
  - agentes
  - arquitecturas
created: 2026-07-05
---

# Arquitecturas multi-agente

## Orchestrator

Un agente orquestador delega tareas a agentes especializados y consolida resultados.

```
[Orquestador]
    │
    ├── [Reviewer]    ← revisa el código
    ├── [Tester]      ← escribe tests
    └── [Docs]        ← actualiza docs
```

**Ideal para**: flujos complejos con múltiples roles.

## Tiered (niveles)

Agentes en capas, donde cada nivel tiene un alcance diferente:

```
[Plan]        ← nivel estratégico (solo lectura)
    │
[Build]       ← nivel táctico (acceso completo)
    │
[Reviewer]    ← nivel de calidad (solo lectura)
```

**Ideal para**: separar concerns (planificación ≠ ejecución ≠ revisión).

## Peer (pares)

Agentes del mismo nivel que colaboran:

```
[Frontend] ←→ [Backend] ←→ [DB Admin]
```

**Ideal para**: equipos multidisciplinarios donde cada agente tiene un dominio.

## Chain (cadena)

Agentes en secuencia, donde la salida de uno alimenta al siguiente:

```
[Plan] → [Build] → [Review] → [Deploy]
```

**Ideal para**: pipelines lineales con validación en cada etapa.

## Crear una arquitectura

```bash
node shared/scripts/create-architecture.js \
  --name full-dev \
  --pattern orchestrator \
  --agents "plan,build,reviewer"
```

---

**Siguiente**: [[04-Agentes/05-flujos.md|Flujos de trabajo]]
