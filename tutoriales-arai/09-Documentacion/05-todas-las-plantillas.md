---
tags:
  - documentacion
  - plantillas
created: 2026-07-05
---

# Todas las plantillas

## Comunicación periódica

| Plantilla | Deck | Reporte | Uso |
|-----------|:----:|:-------:|-----|
| `weekly-status` | ✅ | ✅ | Reporte semanal de estado |
| `sprint-review` | ✅ | ✅ | Revisión de sprint |
| `sprint-planning` | ✅ | ✅ | Planificación de sprint |
| `project-status` | ✅ | ✅ | Estado general del proyecto |
| `release-notes` | ✅ | ✅ | Notas de release |

## Documentación técnica

| Plantilla | Deck | Reporte | Uso |
|-----------|:----:|:-------:|-----|
| `tech-design` | ✅ | ✅ | Diseño técnico |
| `adr` | ✅ | ✅ | Architecture Decision Records |
| `api-specs` | ✅ | ✅ | Especificaciones de API |
| `system-architecture` | ✅ | ✅ | Arquitectura del sistema |
| `deployment-runbook` | ✅ | ✅ | Runbook de despliegue |

## Gestión

| Plantilla | Deck | Reporte | Uso |
|-----------|:----:|:-------:|-----|
| `sow` | — | ✅ | Statement of Work |
| `project-charter` | — | ✅ | Project Charter |
| `decision-log` | — | ✅ | Registro de decisiones |

## Calidad

| Plantilla | Deck | Reporte | Uso |
|-----------|:----:|:-------:|-----|
| `incident-postmortem` | — | ✅ | Postmortem de incidentes |
| `test-report` | — | ✅ | Reporte de tests |

## Métricas y equipo

| Plantilla | Deck | Reporte | Uso |
|-----------|:----:|:-------:|-----|
| `exec-dashboard` | ✅ | — | Dashboard ejecutivo |
| `team-member-profile` | — | — | Perfil de miembro (imagen) |
| `team-overview` | ✅ | — | Vista general del equipo |
| `meeting-minutes` | — | ✅ | Minutas de reunión |

## Generar

```bash
npm run docgen:weekly
npm run docgen:weekly-slides
npm run docgen:sprint
npm run docgen:sprint-report
# ...etc
```

---

**Volver**: [[09-Documentacion/Index|Generación de documentos]]
