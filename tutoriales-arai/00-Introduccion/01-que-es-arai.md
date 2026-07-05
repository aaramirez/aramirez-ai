---
tags: [introduccion, arai, opencode]
created: 2026-07-05
---

# ¿Qué es arai?

**arai** es el CLI del proyecto **aramirez-ai**, un gestor centralizado de configuración multi-agente para [opencode](https://opencode.ai).

## Propósito

arai resuelve un problema concreto: **cómo mantener y reutilizar configuraciones de agentes AI a través de múltiples proyectos** sin duplicar archivos, sin symlinks y sin depender de variables de entorno.

Cada proyecto que usa arai es **autocontenido**: los archivos se copian del repositorio central al proyecto y funcionan de forma independiente.

## Tres sistemas en uno

```
aramirez-ai/
├── AI Agent Config   →  Configuración multi-agente para opencode
├── Scaffolding       →  arai init: genera proyectos con estructura AI-agent
└── Document Pipeline →  Generación de PDF, HTML, PNG y PPTX desde JSON/MD
```

### 1. AI Agent Config

El núcleo del proyecto. Define **agentes opencode** con diferentes roles y permisos:

- **build** — agente principal por defecto, con acceso completo
- **plan** — agente de planificación, sin permisos de edición
- **reviewer** — subagente de revisión de código
- **tester** — subagente de pruebas automatizadas
- **docs** — subagente de documentación

Además gestiona **skills** (instrucciones especializadas para tareas específicas), **prompts** reutilizables, **reglas** de codificación y servidores **MCP**.

### 2. Scaffolding (arai init)

Genera la estructura completa de un proyecto con agentes AI desde cero:

```bash
arai init mi-proyecto           # Template minimal (skills básicos)
arai init mi-proyecto --template full  # Estructura completa
```

El proyecto generado incluye `shared/`, `platforms/`, skills, scripts, prompts, reglas y branding listos para usar.

### 3. Document Pipeline

Pipeline Node.js ESM que convierte especificaciones JSON/Markdown en documentos profesionales:

```bash
npm run docgen:deck   assets/decks/deck.json    # Presentación PDF
npm run docgen:report assets/decks/report.json  # Reporte PDF
npm run docgen:web    assets/decks/deck.json    # Presentación web
npm run docgen:pptx   assets/decks/deck.json    # PowerPoint
```

## Filosofía de diseño

| Principio | Descripción |
|-----------|-------------|
| **OpenCode only** | Gestiona exclusivamente configuración de opencode |
| **Always copy** | Los archivos se copian, no se vinculan |
| **Per-project** | Cada proyecto es autocontenido |
| **Test-driven** | Cada cambio empieza con un test |
| **Cross-platform** | macOS y Windows |

## ¿Para qué sirve?

- Centralizar skills, prompts y reglas que usan todos tus proyectos
- Generar documentación técnica profesional desde especificaciones
- Scaffoldear nuevos proyectos con estructura AI-agent preconfigurada
- Mantener un harness de agentes reutilizable entre equipos

## ¿Quién debería usarlo?

- **Desarrolladores** que integran asistentes AI en su flujo de trabajo diario
- **Equipos** que necesitan documentación técnica generada desde código
- **Arquitectos** que diseñan sistemas multi-agente con opencode
- **Tech leads** que quieren estandarizar la configuración AI en su organización

---

**Siguiente**: [[00-Introduccion/02-como-extender|Cómo extender arai]]
