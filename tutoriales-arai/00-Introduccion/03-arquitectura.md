---
tags: [introduccion, arquitectura, componentes]
created: 2026-07-05
---

# Arquitectura del ecosistema

## Diagrama de componentes

```
┌─────────────────────────────────────────────────────┐
│                 aramirez-ai (repo central)            │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ shared/  │  │platforms/│  │    assets/       │  │
│  │ skills   │  │ opencode │  │    decks, docs   │  │
│  │ prompts  │  │ agents   │  │    templates     │  │
│  │ scripts  │  │ commands │  │    brand         │  │
│  │ rules    │  │ mcp      │  └──────────────────┘  │
│  └────┬─────┘  └────┬─────┘        │               │
│       │              │              │               │
│       ▼              ▼              ▼               │
│  ┌──────────────────────────────────────────────┐   │
│  │              arai CLI (bin/arai.js)           │   │
│  │  init │ install │ sync │ generate │ list      │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
       ┌─────────────────────────────────┐
       │      Proyecto destino            │
       │  ┌───────────┐ ┌──────────────┐ │
       │  │ .opencode/ │ │ opencode.json│ │
       │  │  skills/   │ │              │ │
       │  │  agents/   │ │              │ │
       │  └───────────┘ └──────────────┘ │
       └─────────────────────────────────┘
                       │
           ┌───────────┴───────────┐
           ▼                       ▼
   ┌──────────────┐       ┌──────────────┐
   │ opencode AI  │       │   Docgen     │
   │ agents       │       │   Pipeline   │
   │ (build,plan, │       │   (PDF, HTML,│
   │  tester,...) │       │    PNG,PPTX) │
   └──────────────┘       └──────────────┘
```

## Flujo de instalación

```
1. arai init mi-proyecto
   → Crea estructura shared/, platforms/, AGENTS.md
   
2. arai install
   → Copia .opencode/ + opencode.json al proyecto
   
3. arai sync skill <nombre>
   → Copia SKILL.md individual al proyecto
   
4. opencode (en el proyecto)
   → Lee .opencode/ y opencode.json
   → Agentes disponibles con sus skills
```

## Flujo de generación de documentos

```
spec.json ──► build-deck.js ──► HTML ──► Chrome ──► PDF
                                │
                                ├──► HTML standalone (web)
                                │
                          ┌─────┴─────┐
                     rsvg-convert  python-pptx
                          │             │
                          ▼             ▼
                        PNG            PPTX
```

## Repositorios de referencia

arai puede clonar y usar repositorios externos como fuente de patrones. Gestionados via `repos.json`:

```
repos/anthropics/       → Skills de Anthropic
repos/claude-quickstarts/ → Ejemplos de Claude
repos/byo-coding-agent/ → BYO coding agent patterns
```

Estos repos se sincronizan con:

```bash
node shared/scripts/repos-sync.js
```

Cuando se usa código de un repo de referencia, se cita la fuente.

---

**Volver**: [[00-Introduccion/Index|Introducción a arai]]
