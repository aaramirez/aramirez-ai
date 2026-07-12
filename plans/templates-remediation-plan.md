# Plan de remediación — Templates docgen

## Problemas detectados

1. **Footer hardcodeado** en `html-theme.js`, `report-theme.js`, `deck.css`, `report.css`
2. **Falta `team-member-profile`** spec (portado de gda-ai)
3. **Idioma inconsistente** — 13 templates con títulos en inglés, mezcla de índices EN/ES
4. **Templates incompletos** — ~3-5 slide types usados de 20+ disponibles
5. **`exec-dashboard.json`** es solo portada, debe migrarse a deck completo

## Fases

### Fase 0: Tests (TDD)

Nuevo archivo `tests/consistency/templates-content.test.js` que valida:
- Cada template tiene `titulo` o `title` en español (sin palabras EN)
- Cada template lista `slides` con al menos 4 entradas (excepto team-member-profile que usa build-image)
- `exec-dashboard.json` tiene al menos 5 slides (ya no es imagen simple)
- `layout` es `deck` para decks, `report` para reports
- No existe el texto "Gerencia de Desarrollos y Aplicaciones" hardcodeado en templates ni en motores
- `brand.json` tiene campo `footer`
- `team-member-profile.json` existe en specs
- `html-theme.js` y `report-theme.js` leen footer de `brand.json` / `meta.organization`

### Fase 1: Footer configurable

**Archivos a modificar:**

| Archivo | Cambio |
|---------|--------|
| `shared/brand.json` | Agregar `"footer": "Contenido confidencial de {{organization}}"` |
| `shared/scripts/docgen/html-theme.js` | `FOOTER_TEXT` ← `brand().footer` o `meta.organization` |
| `shared/scripts/docgen/report-theme.js` | Ídem en `_page_footer()` |
| `assets/templates/deck.css` | Comentario actualizado |
| `assets/templates/report.css` | Comentario actualizado |

### Fase 2: Team Member Profile

**Nuevo archivo:**

`assets/templates/specs/team-member-profile.json`:
```json
{
  "output": "assets/images/team-member-profile.png",
  "slides": [
    {
      "type": "profile",
      "nombre": "Alexander Ramírez",
      "cargo": "Tech Lead · Arquitecto de Software",
      "organizacion": "Gerencia de Desarrollos y Aplicaciones",
      "email": "alexander.ramirez@example.com",
      "telefono": "+52 55 1234 5678",
      "ubicacion": "Ciudad de México",
      "foto": "assets/images/profiles/alexander-ramirez.jpg",
      "sobre_mi": "Arquitecto de software con más de 10 años de experiencia...",
      "habilidades": ["Node.js", "Arquitectura", "RabbitMQ", "Kubernetes", "PostgreSQL", "React"],
      "experiencia_destacada": [
        { "rol": "Tech Lead", "periodo": "2022-2026", "empresa": "Fibex", "logros": ["Migración a microservicios", "Arquitectura de notificaciones"] }
      ],
      "experiencia_reciente": [
        { "rol": "Senior Developer", "periodo": "2019-2022", "empresa": "TechCorp", "logros": ["API REST v2"] }
      ],
      "estudios": [
        { "titulo": "Ing. Sistemas", "institucion": "UNAM", "year": 2014 }
      ]
    }
  ]
}
```

### Fase 3: Traducción y enriquecimiento (28 + 1 templates)

Cada template se reescribe completo con:
- **Títulos, subtítulos, contenido, índices → 100% español**
- **Máximo de tipos de slide** relevantes para ese documento
- **Contenido de ejemplo completo** y realista
- **Meta completa** (título, subtítulo, organización, autor, fecha, clasificación)

#### Decks (14) — migrar a todos los tipos de slide disponibles

| Template | Tipos de slide a incluir |
|----------|--------------------------|
| `adr-deck.json` | portada, seccion, bullets, tabla, dos-columnas, grafico (radar), destacado, cita, timeline, proceso |
| `project-status.json` | portada, seccion, kpis, grafico (gantt), tabla, dos-columnas, tarjetas, cita |
| `sprint-planning.json` | portada, seccion, bullets, tarjetas, tabla, dos-columnas, grafico (barras), destacado, proceso |
| `sprint-review.json` | portada, seccion, kpis, grafico (lineas), bullets, tabla, cita, grafico (donut) |
| `system-architecture.json` | portada, seccion, bullets, imagen, tarjetas, grafico (timeline), proceso, comparativa |
| `tech-design.json` | portada, seccion, bullets, dos-columnas, grafico (radar), tabla, proceso, destacado, faq |
| `api-specs.json` | portada, seccion, bullets, tabla, dos-columnas, grafico (barras), tarjetas, imagen-texto |
| `deployment-runbook.json` | portada, seccion, bullets, proceso, tabla, dos-columnas, destacado, kpis |
| `weekly-status-deck.json` | portada, seccion, kpis, grafico (lineas), bullets, tabla, cita, dos-columnas |
| `release-notes.json` | portada, seccion, bullets, tabla, dos-columnas, cita, tarjetas, grafico (pastel) |
| `team-overview.json` | portada, seccion, cita, tarjetas, grafico (radar), n-columnas, personas, imagen |
| **`exec-dashboard.json`** | portada, seccion, kpis, grafico (gauge), grafico (barras), tabla, tarjetas, grafico (lineas) — **migrado de imagen a deck** |
| `weekly-status.json` | (formato reporte — se enriquece por separado) |
| `meeting-minutes.json` | (formato reporte — se enriquece por separado) |

#### Reports (15) — migrar a todos los tipos de report disponibles

Cada report: doc-cover + section (múltiples) + text + bullets + table + callout + recommendation + roadmap + kpi-table + closing

| Template | Contenido específico |
|----------|---------------------|
| `adr.json` | ADR completo con contexto, opciones, decisión, consecuencias |
| `sow.json` | Alcance, entregables, cronograma, presupuesto, riesgos |
| `project-charter.json` | Objetivos, stakeholders, riesgos, roadmap, presupuesto |
| `incident-postmortem.json` | Timeline, RCA, acciones correctivas, métricas |
| `decision-log.json` | Todas las decisiones con contexto y alternativas |
| `sprint-planning-report.json` | Objetivos, backlog, capacidad, riesgos |
| `sprint-review-report.json` | Entregas, métricas, retrospectiva, recomendaciones |
| `project-status-report.json` | Estado general, KPIs, riesgos, próximos hitos |
| `release-notes-report.json` | Features, bugs, issues conocidos, migración |
| `tech-design-report.json` | Contexto, opciones, comparativa, recomendación |
| `api-specs-report.json` | Endpoints, autenticación, errores, ejemplos |
| `system-architecture-report.json` | Componentes, flujos, tecnologías, decisiones |
| `deployment-runbook-report.json` | Prerrequisitos, pasos, rollback, verificación |
| `test-report.json` | Suites, cobertura, KPIs, recomendaciones |
| `weekly-status.json` | Resumen, tabla de avance, bloqueos, KPIs, riesgos |

### Fase 4: Migrar exec-dashboard

`exec-dashboard.json` cambia de `build-image` a `build-deck`:
- `output` cambia a `assets/docs/exec-dashboard.pdf`
- Se agrega `mostrar_paginas: true`
- Se agregan slides completos con portada, secciones, KPIs, gráficos, tablas

### npm scripts

Actualizar `package.json`:
- `docgen:dashboard` → `build-deck.js` (en vez de `build-image.js`)
- `docgen:profile` → nuevo, apunta a `build-image.js` con `team-member-profile.json`
- `docgen:templates` → actualizar lista

## Orden de implementación

```
Fase 0: Tests  →  Fase 1: Footer  →  Fase 2: Profile  →  Fase 3: Templates  →  Fase 4: Dashboard
```

Cada fase: 1) escribir test fallido → 2) implementar → 3) test pasa → commit
