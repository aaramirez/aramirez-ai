# Plan: Document Templates para Unidad de Ingeniería

> Estado: ⬜ Pendiente de aprobación
> Versión: 1.0
> Fecha: 2026-06-28

## 1. Objetivo

Crear **specs JSON** reutilizables para el pipeline docgen que permitan a cualquier miembro de una unidad de ingeniería de software generar documentos profesionales con solo proporcionar datos.

**Flujo de trabajo:**
```
Usuario edita JSON con datos del proyecto
       │
       ▼
npm run docgen:<template>
       │
       ▼
build-deck.js / build-report.js / build-image.js
       │
       ▼
PDF / HTML / PNG / PPTX listo para compartir
```

El usuario **nunca toca el pipeline** — solo edita datos en un JSON simple con campos claros.

---

## 2. Templates (28 total)

Cada template de **comunicación periódica** y **documentación técnica** está disponible
en **dos formatos**: `deck` (presentación visual, ideal para reuniones) y `report`
(documento formal, ideal para archivo y lectura). El formato primario se omite del nombre;
el alternativo lleva sufijo `-deck` o `-report`.

### 2.1 Comunicación periódica (5 temas × 2 formatos = 10 specs)

| Template (deck) | Template (report) | Datos que requiere el usuario |
|:----------------|:------------------|:-----------------------------|
| `sprint-review` | `sprint-review-report` | sprint nombre/número, stories completadas, KPIs (velocity, completion rate), burndown data, blockers, retrospective quote |
| `sprint-planning` | `sprint-planning-report` | sprint goals, capacity (días-hombre), backlog priorizado, team members, risks |
| `project-status` | `project-status-report` | hitos con fechas (timeline), riesgos con severidad, métricas (budget, schedule, quality), equipo |
| `release-notes` | `release-notes-report` | versión semver, fecha, features list, bug fixes, breaking changes, contributors, install/upgrade notes |
| `weekly-status` (report, default) | `weekly-status-deck` | meta, logros, KPIs, blockers, riesgos, roadmap próximas semanas |

> `weekly-status` es report por defecto (el formato natural para un reporte semanal);
> su versión deck se usa para all-hands. Los otros 4 son deck por defecto y tienen
> versión report para documentación.

### 2.2 Documentación técnica (5 temas × 2 formatos = 10 specs)

| Template (deck) | Template (report) | Datos que requiere el usuario |
|:----------------|:------------------|:-----------------------------|
| `tech-design` | `tech-design-report` | título, contexto, opciones (hasta 3 en dos-columnas), diagrama (imagen), tabla comparativa, decisión, workflow |
| `adr-deck` | `adr` | ADR number, title, status, context, options (tabla), decision, consequences |
| `api-specs` | `api-specs-report` | API name, version, base URL, auth, endpoints (método, path, request/response) |
| `system-architecture` | `system-architecture-report` | diagrama, componentes, flujos, tecnologías |
| `deployment-runbook` | `deployment-runbook-report` | entorno, prerequisitos, pasos (proceso), rollback, verify |

> `adr` es report por defecto (documento de archivo); los otros 4 son deck por defecto.

### 2.3 Gestión de proyectos (3 — formato único)

| Template | Builder | Output | Datos que requiere el usuario |
|----------|---------|--------|------------------------------|
| `sow` | report | PDF | título, cliente, alcance (bullets), entregables con fechas (tabla), cronograma (roadmap), budget, equipo, firmas |
| `project-charter` | report | PDF | proyecto nombre, objetivos, stakeholders, riesgos iniciales, hitos, budget, autorización |
| `decision-log` | report | PDF | decisiones (fecha, contexto, decisión tomada, alternativas, acordado por) en tabla |

### 2.4 Calidad e incidentes (2 — formato único)

| Template | Builder | Output | Datos que requiere el usuario |
|----------|---------|--------|------------------------------|
| `incident-postmortem` | report | PDF | timeline, severidad, duración, servicios afectados, RCA, acciones correctivas, métricas post-incidente |
| `test-report` | report | PDF | suite name, fecha, tests totales/pasados/fallidos, cobertura %, tendencias (tabla), blockers |

### 2.5 Métricas y equipo (3 — formato único)

| Template | Builder | Output | Datos que requiere el usuario |
|----------|---------|--------|------------------------------|
| `exec-dashboard` | image | PNG | 6 KPIs (label, valor, delta), health gauge (0-100), progress bars por objetivo |
| `team-overview` | deck | PDF | unidad nombre, miembros (nombre, rol, avatar), skills radar, stack tecnológico, misión |
| `meeting-minutes` | report | PDF | fecha, asistentes, agenda (tabla), discusión, acuerdos, action items |

---

## 3. Estructura de archivos

```
assets/templates/specs/                  ← 28 specs listos para build
├── weekly-status.json                   report
├── weekly-status-deck.json              deck
├── sprint-review.json                   deck
├── sprint-review-report.json            report
├── sprint-planning.json                 deck
├── sprint-planning-report.json          report
├── project-status.json                  deck
├── project-status-report.json           report
├── release-notes.json                   deck
├── release-notes-report.json            report
├── tech-design.json                     deck
├── tech-design-report.json              report
├── adr.json                             report
├── adr-deck.json                        deck
├── api-specs.json                       deck
├── api-specs-report.json                report
├── system-architecture.json             deck
├── system-architecture-report.json      report
├── deployment-runbook.json              deck
├── deployment-runbook-report.json       report
├── sow.json                             report
├── project-charter.json                 report
├── decision-log.json                    report
├── incident-postmortem.json             report
├── test-report.json                     report
├── exec-dashboard.json                  image
├── team-overview.json                   deck
└── meeting-minutes.json                 report

tests/commands/templates.test.js          ← Tests (TDD primero)
```

---

## 4. npm scripts

Se agregan al `package.json` existente:

```json
{
  "docgen:weekly": "node shared/scripts/docgen/build-report.js assets/templates/specs/weekly-status.json",
  "docgen:weekly-slides": "node shared/scripts/docgen/build-deck.js assets/templates/specs/weekly-status-deck.json",
  "docgen:sprint": "node shared/scripts/docgen/build-deck.js assets/templates/specs/sprint-review.json",
  "docgen:sprint-report": "node shared/scripts/docgen/build-report.js assets/templates/specs/sprint-review-report.json",
  "docgen:planning": "node shared/scripts/docgen/build-deck.js assets/templates/specs/sprint-planning.json",
  "docgen:planning-report": "node shared/scripts/docgen/build-report.js assets/templates/specs/sprint-planning-report.json",
  "docgen:status": "node shared/scripts/docgen/build-deck.js assets/templates/specs/project-status.json",
  "docgen:status-report": "node shared/scripts/docgen/build-report.js assets/templates/specs/project-status-report.json",
  "docgen:release": "node shared/scripts/docgen/build-deck.js assets/templates/specs/release-notes.json",
  "docgen:release-report": "node shared/scripts/docgen/build-report.js assets/templates/specs/release-notes-report.json",
  "docgen:tech-design": "node shared/scripts/docgen/build-deck.js assets/templates/specs/tech-design.json",
  "docgen:tech-design-report": "node shared/scripts/docgen/build-report.js assets/templates/specs/tech-design-report.json",
  "docgen:adr": "node shared/scripts/docgen/build-report.js assets/templates/specs/adr.json",
  "docgen:adr-slides": "node shared/scripts/docgen/build-deck.js assets/templates/specs/adr-deck.json",
  "docgen:api": "node shared/scripts/docgen/build-deck.js assets/templates/specs/api-specs.json",
  "docgen:api-report": "node shared/scripts/docgen/build-report.js assets/templates/specs/api-specs-report.json",
  "docgen:architecture": "node shared/scripts/docgen/build-deck.js assets/templates/specs/system-architecture.json",
  "docgen:architecture-report": "node shared/scripts/docgen/build-report.js assets/templates/specs/system-architecture-report.json",
  "docgen:runbook": "node shared/scripts/docgen/build-deck.js assets/templates/specs/deployment-runbook.json",
  "docgen:runbook-report": "node shared/scripts/docgen/build-report.js assets/templates/specs/deployment-runbook-report.json",
  "docgen:sow": "node shared/scripts/docgen/build-report.js assets/templates/specs/sow.json",
  "docgen:charter": "node shared/scripts/docgen/build-report.js assets/templates/specs/project-charter.json",
  "docgen:decision-log": "node shared/scripts/docgen/build-report.js assets/templates/specs/decision-log.json",
  "docgen:postmortem": "node shared/scripts/docgen/build-report.js assets/templates/specs/incident-postmortem.json",
  "docgen:test-report": "node shared/scripts/docgen/build-report.js assets/templates/specs/test-report.json",
  "docgen:dashboard": "node shared/scripts/docgen/build-image.js assets/templates/specs/exec-dashboard.json --format png",
  "docgen:team": "node shared/scripts/docgen/build-deck.js assets/templates/specs/team-overview.json",
  "docgen:minutes": "node shared/scripts/docgen/build-report.js assets/templates/specs/meeting-minutes.json",
  "docgen:list": "echo 'Templates: weekly, weekly-slides, sprint, sprint-report, planning, planning-report, status, status-report, release, release-report, tech-design, tech-design-report, adr, adr-slides, api, api-report, architecture, architecture-report, runbook, runbook-report, sow, charter, decision-log, postmortem, test-report, dashboard, team, minutes'"
}
```

---

## 5. Enfoque TDD

### Fase 1: Escribir tests (FALLAN primero)

Archivo: `tests/commands/templates.test.js`

**Grupo A — Existencia y sintaxis (28 tests)**
```
test(`<name>.json existe y es JSON válido`)
  → assertFile(path)
  → JSON.parse(content) sin error
```

**Grupo B — Schema por tipo de builder (28 tests)**
```
test(`<name> es un report/deck/image válido`)
  → report: tiene meta (title), slides con tipos de _RENDERERS
  → deck: slides con tipos de _LAYOUTS
  → image: exactamente 1 slide
```

**Grupo C — Tipos de slide existen (1 test)**
```
test('todos los tipos de slide existen en html-theme.js o report-theme.js')
  → recorrer todos los specs, extraer tipos, verificar en _LAYOUTS ∪ _RENDERERS
```

**Grupo D — Tipos de chart existen (1 test)**
```
test('todos los chart.tipo existen en charts.js')
  → extraer chart.tipo de grafico slides, verificar en renderChart
```

**Grupo E — Build smoke test (28 tests)**
```
test(`<name> se buildea a HTML sin error`)
  → importar buildHtml (report-theme o html-theme según tipo)
  → ejecutar con los datos del spec
  → verificar que produce HTML válido (DOCTYPE, html, /html)
```

**Grupo F — Campos requeridos por tipo de slide (1 test por tipo de slide)**
```
test('portada requiere titulo')  → assert.ok(s.titulo)
test('kpis requiere kpis[]')     → assert.ok(Array.isArray(s.kpis))
test('grafico requiere chart')   → assert.ok(s.chart?.tipo)
...etc para todos los tipos usados
```

### Fase 2: Crear specs (tests pasan)

Crear cada archivo JSON en `assets/templates/specs/` con datos de ejemplo realistas pero genéricos.

Cada spec usa:
- Datos de ejemplo ficticios (no datos reales de ningún proyecto)
- Todos los campos documentados en la sección 2
- Tipos de slide y chart existentes

### Fase 3: npm scripts y documentación

- Agregar scripts al `package.json`
- Actualizar `README.md` con sección "Document Templates"
- Actualizar `AGENTS.md` con referencia a templates disponibles

### Fase 4: Verificación

```bash
npm test                    # Todos los tests pasan
npm run docgen:list         # Lista templates
npm run docgen:sprint       # Build de prueba
```

---

## 6. Ejemplo completo de spec

### `sprint-review.json`

```json
{
  "engine": "html",
  "output": "sprint-review.pdf",
  "mostrar_paginas": true,
  "slides": [
    {
      "type": "portada",
      "titulo": "Sprint Review: Sprint 7",
      "subtitulo": "Equipo Plataforma · 15-28 Jun 2026"
    },
    {
      "type": "seccion",
      "titulo": "Resumen del Sprint",
      "indice": "01"
    },
    {
      "type": "kpis",
      "titulo": "Métricas Clave",
      "kpis": [
        { "valor": "32", "etiqueta": "Story Points Completados" },
        { "valor": "89%", "etiqueta": "Completion Rate" },
        { "valor": "12", "etiqueta": "Bugs Cerrados" },
        { "valor": "4.5", "etiqueta": "Velocidad Promedio" }
      ]
    },
    {
      "type": "grafico",
      "titulo": "Burndown del Sprint",
      "chart": {
        "tipo": "lineas",
        "datos": [["Día 1", 32], ["Día 5", 25], ["Día 10", 12], ["Día 14", 0]]
      }
    },
    {
      "type": "bullets",
      "titulo": "Entregas Completadas",
      "items": [
        "Autenticación OAuth 2.0 con Google y GitHub",
        "API REST de usuarios v2 con rate limiting",
        "Dashboard de métricas en tiempo real",
        "Migración de base de datos a PostgreSQL 16"
      ]
    },
    {
      "type": "tabla",
      "titulo": "Tickets por Estado",
      "headers": ["Estado", "Cantidad"],
      "filas": [
        ["Done", 18],
        ["En Progreso", 3],
        ["Bloqueado", 1],
        ["No Iniciado", 2]
      ]
    },
    {
      "type": "grafico",
      "titulo": "Distribución por Tipo",
      "chart": {
        "tipo": "donut",
        "datos": [["Features", 12], ["Bugs", 8], ["Deuda Técnica", 5], ["Mejoras", 7]]
      }
    },
    {
      "type": "cita",
      "texto": "El mejor sprint del trimestre. El equipo mantuvo el foco y la calidad.",
      "autor": "— Tech Lead"
    }
  ]
}
```

---

## 7. Actualizaciones a la documentación

### README.md — Nueva sección (tabla actualizada a 28 templates)

```
## Document Templates

28 plantillas listas para generar documentos profesionales. Cada template es un
archivo JSON en `assets/templates/specs/` que puedes editar con tus datos y
construir con un solo comando. Los templates de comunicación periódica y
documentación técnica están disponibles en formato deck (presentación) y report
(documento).

### Templates disponibles

| Template | Comando | Formato | Descripción |
|----------|---------|---------|-------------|
| weekly-status | `npm run docgen:weekly` | report | Reporte semanal de avance |
| weekly-status-slides | `npm run docgen:weekly-slides` | deck | Weekly para all-hands |
| sprint-review | `npm run docgen:sprint` | deck | Sprint review presentation |
| sprint-review-report | `npm run docgen:sprint-report` | report | Sprint review documentado |
| sprint-planning | `npm run docgen:planning` | deck | Planificación de sprint |
| sprint-planning-report | `npm run docgen:planning-report` | report | Planificación documentada |
| project-status | `npm run docgen:status` | deck | Status ejecutivo |
| project-status-report | `npm run docgen:status-report` | report | Status documentado |
| release-notes | `npm run docgen:release` | deck | Notas de versión |
| release-notes-report | `npm run docgen:release-report` | report | Release notes documentadas |
| tech-design | `npm run docgen:tech-design` | deck | Diseño técnico revisión |
| tech-design-report | `npm run docgen:tech-design-report` | report | Diseño técnico documentado |
| adr | `npm run docgen:adr` | report | Architecture Decision Record |
| adr-slides | `npm run docgen:adr-slides` | deck | ADR para presentar |
| api-specs | `npm run docgen:api` | deck | API specs review |
| api-specs-report | `npm run docgen:api-report` | report | API specs documentadas |
| system-architecture | `npm run docgen:architecture` | deck | Arquitectura revisión |
| system-architecture-report | `npm run docgen:architecture-report` | report | Arquitectura documentada |
| deployment-runbook | `npm run docgen:runbook` | deck | Runbook training |
| deployment-runbook-report | `npm run docgen:runbook-report` | report | Runbook documentado |
| sow | `npm run docgen:sow` | report | Statement of Work |
| project-charter | `npm run docgen:charter` | report | Project charter |
| decision-log | `npm run docgen:decision-log` | report | Registro de decisiones |
| incident-postmortem | `npm run docgen:postmortem` | report | Análisis post-incidente |
| test-report | `npm run docgen:test-report` | report | Reporte de pruebas |
| exec-dashboard | `npm run docgen:dashboard` | image | Dashboard KPIs (PNG) |
| team-overview | `npm run docgen:team` | deck | Overview del equipo |
| meeting-minutes | `npm run docgen:minutes` | report | Minutas de reunión |

### Cómo usar

```bash
# 1. Editar el spec con tus datos
code assets/templates/specs/sprint-review.json

# 2. Generar el documento
npm run docgen:sprint

# 3. El PDF se genera en assets/docs/
open assets/docs/sprint-review.pdf
```

### Personalizar marca

```bash
# Configurar colores y logo de tu unidad
arai generate brand --name "Mi Unidad" --primary "#1a365d"
```
```

### AGENTS.md — Nueva sección

```
## Document Templates

18 plantillas de documentos en `assets/templates/specs/` para el pipeline docgen.
Cada template es un JSON que puedes editar y construir con:

```bash
npm run docgen:<nombre>   # genera PDF/HTML/PNG
```

Comunicación periódica (deck+report): weekly-status, weekly-slides, sprint,
sprint-report, planning, planning-report, status, status-report, release,
release-report.
Documentación técnica (deck+report): tech-design, tech-design-report, adr,
adr-slides, api, api-report, architecture, architecture-report, runbook,
runbook-report.
Gestión: sow, charter, decision-log.
Calidad: postmortem, test-report.
Métricas/Equipo: dashboard, team, minutes.

Ver docs/templates-plan.md para el detalle completo.
```

---

## 8. Criterios de aceptación

- [ ] 28 specs JSON en `assets/templates/specs/`, todos parseables
- [ ] Todos los tipos de slide existen en el pipeline
- [ ] Todos los tipos de chart existen en el pipeline
- [ ] Cada spec se puede buildear a HTML sin error
- [ ] 28+ tests en `tests/commands/templates.test.js`, todos verdes
- [ ] npm scripts agregados para cada template
- [ ] README.md actualizado con tabla de templates
- [ ] AGENTS.md actualizado con referencia
- [ ] `npm test` — suite completa pasa

---

## 9. Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Specs muy grandes difíciles de mantener | Usar datos de ejemplo mínimos pero representativos |
| Slide types incompatibles con report theme | Validar en tests que cada spec usa solo tipos válidos para su builder |
| Usuario no sabe qué campos editar | Documentar cada campo con comentarios en el JSON (si el formato lo permite) o en la documentación |
| Build requiere Chromium | El engine SVG no requiere browser, pero la calidad es menor. Documentar ambos caminos. |
