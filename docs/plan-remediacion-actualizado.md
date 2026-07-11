# Plan de Remediación y Mejora — Versión Corregida

Este documento presenta la hoja de ruta **actualizada** para corregir los problemas detectados en el repositorio, basada en la validación cruzada del plan original contra el estado real del código.

> **Nota**: El plan original contenía ~40% de tareas ya completadas. Esta versión corrige eso y reenfoca los esfuerzos.

---

## Índice
1. [Fase 1: Sanitización de Specs — Eliminar Organización Hardcodeada](#fase-1-sanitización-de-specs--eliminar-organización-hardcodeada)
2. [Fase 2: Modularización del CLI (`arai`)](#fase-2-modularización-del-cli-arai)
3. [Fase 3: Extensión de Validación CI](#fase-3-extensión-de-validación-ci)
4. [Estrategia de Ejecución y Validación](#estrategia-de-ejecución-y-validación)

---

## Fase 1: Sanitización de Specs — Eliminar Organización Hardcodeada
**Objetivo**: Reemplazar "Gerencia de Desarrollos y Aplicaciones" en los archivos spec para que use el valor dinámico de `brand.json`.
**Tiempo estimado**: 15-30 minutos.
**Dependencias**: Ninguna — el sistema de footer dinámico ya funciona.

### Contexto
- `shared/brand.json` ya tiene el campo `footer` con `{{organization}}`.
- `html-theme.js` ya tiene `resolveFooterText()` que usa brand.json.
- `report-theme.js` ya tiene `_pageFooter()` que usa brand.json.
- **Solo queda**: eliminar los valores hardcodeados en los specs.

### Tareas:
- [ ] **Reemplazar `"organization"` en 10 archivos spec**:
  Cambiar `"Gerencia de Desarrollos y Aplicaciones"` por `"Mi Organizacion"` (o eliminar el campo para que use brand.json por defecto):
  - `assets/templates/specs/adr.json`
  - `assets/templates/specs/api-specs-report.json`
  - `assets/templates/specs/decision-log.json`
  - `assets/templates/specs/deployment-runbook-report.json`
  - `assets/templates/specs/incident-postmortem.json`
  - `assets/templates/specs/meeting-minutes.json`
  - `assets/templates/specs/project-charter.json`
  - `assets/templates/specs/project-status-report.json`
  - `assets/templates/specs/release-notes-report.json`
  - `assets/templates/specs/team-overview.json` (campo `"subtitulo"` embebido)

- [ ] **Reemplazar `"organizacion"` en 1 archivo adicional** (no listado en el plan original):
  - `assets/templates/specs/team-member-profile.json` (campo `"organizacion"`, línea 11)

### Validación:
```bash
grep -r "Gerencia de Desarrollos" assets/templates/specs/
# Debe retornar 0 resultados
node shared/scripts/docgen/validate.js
```

---

## Fase 2: Modularización del CLI (`arai`)
**Objetivo**: Extraer la lógica de negocio de `bin/arai.js` (1,434 líneas monolíticas) en módulos dedicados.
**Tiempo estimado**: 2-4 horas.
**Dependencias**: Ninguna.

### Contexto
`bin/arai.js` contiene toda la lógica del CLI en un solo archivo:
- Líneas 110-300: Install/uninstall (6+6 funciones)
- Líneas 302-503: Status, update, sync
- Líneas 505-637: Dynamic AGENTS.md helpers
- Líneas 640-872: Template system / scaffold
- Líneas 874-1059: Generate helpers
- Líneas 1061-1089: Skills sync
- Líneas 1091-1165: List functions
- Líneas 1167-1228: KB install
- Líneas 1230-1434: CLI command registration (Commander.js)

### Estructura propuesta:
```
bin/arai.js                    → Solo registro de comandos (Commander.js)
shared/scripts/lib/
├── install.js                 → Lógica de install/uninstall
├── sync.js                    → Lógica de sync
├── generate.js                → Lógica de generate
├── scaffold.js                → Lógica de template/init
├── kb.js                      → Lógica de KB
└── list.js                    → Lógica de list
```

### Tareas:
- [ ] **Crear directorio `shared/scripts/lib/`**.
- [ ] **Extraer funciones de install/uninstall** → `install.js`.
- [ ] **Extraer funciones de sync** → `sync.js`.
- [ ] **Extraer funciones de generate** → `generate.js`.
- [ ] **Extraer funciones de template/scaffold** → `scaffold.js`.
- [ ] **Extraer funciones de KB** → `kb.js`.
- [ ] **Extraer funciones de list** → `list.js`.
- [ ] **Refactorizar `bin/arai.js`** para importar desde `lib/`.
- [ ] **Ejecutar `npm test`** para validar que nada se rompió.

### Validación:
```bash
npm test
node bin/arai.js --help
node bin/arai.js list skills
node bin/arai.js status
```

---

## Fase 3: Extensión de Validación CI
**Objetivo**: Añadir validaciones de consistencia a `shared/scripts/ci-validate.js`.
**Tiempo estimado**: 1-2 horas.
**Dependencias**: Ninguna.

### Contexto
`ci-validate.js` solo tiene 139 líneas con validaciones básicas (estructura de directorios, frontmatter de skills, brand.json, gitignore).

### Tareas:
- [ ] **Validación de Wikilinks**: Verificar que `[[wikilinks]]` en `tutoriales-arai/` apunten a archivos existentes.
- [ ] **Detección de inglés no deseado**: Detectar palabras clave en inglés en títulos de specs (HTTP status names son aceptables).
- [ ] **Verificación de TODOs**: Confirmar que `shared/scripts/create-*.js` no tengan `TODO`/`FIXME` (ya están limpios, pero la validación previene regresiones).

### Validación:
```bash
node shared/scripts/ci-validate.js --strict --verbose
npm test
```

---

## Tareas Eliminadas del Plan Original

Las siguientes tareas fueron verificadas como **ya completadas** y se eliminan de este plan:

| Tarea | Razón de eliminación |
|---|---|
| Agregar `"footer"` a `brand.json` | Ya existe (línea 4) |
| Implementar `resolveFooterText()` en `html-theme.js` | Ya implementado (líneas 16-21) |
| Implementar `_pageFooter()` en `report-theme.js` | Ya implementado (líneas 32-42) |
| Crear `00-Introduccion/` en tutoriales | Ya existe con 4 archivos |
| Corregir 3 enlaces de navegación rotos | Ya corregidos |
| Migrar `exec-dashboard.json` a deck completo | Ya es deck completo |
| Crear `team-member-profile.json` | Ya existe (75 líneas) |
| Verificar TODOs en `create-*.js` | No hay TODOs |

---

## Tareas Consideradas pero No Incluidas

| Tarea | Razón |
|---|---|
| Traducir HTTP status names en `api-specs-report.json` | Nombres HTTP están estandarizados en inglés globalmente; traducirlos puede causar confusión |
| Roadmap por rol en Index.md | Ya tiene tabla por objetivo, que es más práctica |
| Metadata en tutoriales (Objetivo, Tiempo, etc.) | Mejora cosmética de bajo impacto |

---

## Estrategia de Ejecución y Validación

1. **Orden**: Fase 1 → Fase 3 → Fase 2 (de menor a mayor esfuerzo).
2. **Validación incremental**: Tras cada fase:
   ```bash
   node shared/scripts/ci-validate.js --strict --verbose
   npm test
   node shared/scripts/docgen/validate.js
   ```
3. **Smoke tests de docgen**: Validar que la generación no se rompa tras Fase 1:
   ```bash
   node shared/scripts/docgen/validate.js
   ```

---

## Resumen de Esfuerzo

| Fase | Esfuerzo | Impacto |
|---|---|---|
| Fase 1: Sanitización de specs | 15-30 min | Alto (elimina hardcoding) |
| Fase 2: Modularización CLI | 2-4 hrs | Alto (mantenibilidad) |
| Fase 3: Extensión CI | 1-2 hrs | Medio (previene regresiones) |
| **Total** | **4-6 hrs** | |

---

*¿Estás de acuerdo con el alcance y orden de este plan corregido? Confirma para comenzar con la Fase 1.*
