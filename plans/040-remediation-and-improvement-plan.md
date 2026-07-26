# Plan Detallado de Remediación y Mejora

Este documento presenta la hoja de ruta integral para corregir los problemas detectados en el repositorio, abarcando desde la documentación (tutoriales) hasta el pipeline de generación de documentos y la estructura del CLI.

---

## Índice
1. [Fase 1: Footer Dinámico y Desacoplamiento de Marca](#fase-1-footer-dinámico-y-desacoplamiento-de-marca)
2. [Fase 2: Estructura, Navegación y Contenido de Tutoriales (`tutoriales-arai`)](#fase-2-estructura-navegación-y-contenido-de-tutoriales-tutoriales-arai)
3. [Fase 3: Enriquecimiento, Traducción y Migración de Templates de Docgen](#fase-3-enriquecimiento-traducción-y-migración-de-templates-de-docgen)
4. [Fase 4: Modularización del CLI (`arai`) y Extensión de Validación CI](#fase-4-modularización-del-cli-arai-y-extensión-de-validación-ci)
5. [Estrategia de Ejecución y Validación](#estrategia-de-ejecución-y-validación)

---

## Fase 1: Footer Dinámico y Desacoplamiento de Marca
**Objetivo**: Eliminar referencias hardcodeadas a *"Gerencia de Desarrollos y Aplicaciones"* en los templates y centralizar la configuración en `shared/brand.json`.

### Tareas:
- [ ] **Actualizar `shared/brand.json`**:
  Agregar un campo `"footer"` configurable que soporte variables como `{{organization}}`.
  ```json
  "footer": "Contenido confidencial de {{organization}}"
  ```
- [ ] **Modificar Motores de Renderizado**:
  - `shared/scripts/docgen/html-theme.js`: Asegurar que `resolveFooterText()` use el footer de `brand.json` sustituyendo `{{organization}}` por el nombre de la organización si no se especifica uno personalizado.
  - `shared/scripts/docgen/report-theme.js`: Replicar la misma lógica en la función `_page_footer()`.
- [ ] **Sanitizar Archivos Spec**:
  - Reemplazar `"organization": "Gerencia de Desarrollos y Aplicaciones"` por un marcador genérico o eliminarlo para que use el valor dinámico de `brand.json` en los siguientes archivos en `assets/templates/specs/`:
    - `adr.json`
    - `api-specs-report.json`
    - `decision-log.json`
    - `deployment-runbook-report.json`
    - `incident-postmortem.json`
    - `meeting-minutes.json`
    - `project-charter.json`
    - `project-status-report.json`
    - `release-notes-report.json`
    - `team-overview.json`

---

## Fase 2: Estructura, Navegación y Contenido de Tutoriales (`tutoriales-arai`)
**Objetivo**: Convertir el vault de Obsidian en una guía de aprendizaje fluida, consistente y profesional.

### Tareas:
- [ ] **Crear Sección Introductoria (`00-Introduccion/`)**:
  - `Index.md`: Explicación general de `arai` (qué es, para qué sirve, filosofía "always copy").
  - `01-que-es-arai.md`: Explicación de los tres subsistemas (multi-agente, scaffolding, docgen).
  - `02-como-extender.md`: Guía de extensión (crear skills, scripts, commands).
  - `03-arquitectura.md`: Diagrama conceptual del ecosistema de agentes.
- [ ] **Añadir Roadmap de Aprendizaje**:
  - Actualizar `tutoriales-arai/Index.md` para segmentar la lectura según el rol (Desarrollador, Arquitecto, Tech Lead).
- [ ] **Corregir Navegación Rota**:
  - Reparar los enlaces de "Siguiente" y "Volver" en los archivos críticos:
    - `06-Skills/03-sincronizar-skills.md` (debe apuntar a `07-MCP/Index`).
    - `02-Comandos/08-list.md` (cambiar "Volver" por "Siguiente" hacia `03-Configuracion/Index`).
    - `09-Documentacion/05-todas-las-plantillas.md` (apuntar a `10-CI/Index`).
- [ ] **Enriquecer Tutoriales con Metadatos (Template Estándar)**:
  - Añadir de forma no invasiva las secciones: `> **Objetivo**`, `⏱ Tiempo estimado`, `📋 Requisitos previos` y `Resultado esperado` en los tutoriales clave.

---

## Fase 3: Enriquecimiento, Traducción y Migración de Templates de Docgen
**Objetivo**: Completar y homogeneizar el catálogo de 29 plantillas, asegurando que estén 100% en español y utilicen de forma exhaustiva los componentes visuales disponibles.

### Tareas:
- [ ] **Traducción 100% al Español**:
  - Traducir títulos, subtítulos, placeholders y descripciones en todos los archivos spec que aún conserven fragmentos en inglés (ej. `api-specs-report.json`).
- [ ] **Aumentar la Variedad de Láminas**:
  - Incorporar tipos de slide más complejos (como gráficos, tablas comparativas, diagramas de procesos y KPIs) en los decks de:
    - `adr-deck.json`
    - `project-status.json`
    - `sprint-planning.json`
    - `sprint-review.json`
    - `system-architecture.json`
- [ ] **Migrar `exec-dashboard.json`**:
  - Convertir de una sola imagen estática a un deck PDF completo con KPIs, gráficos de barras/líneas, tablas y tarjetas.
- [ ] **Crear Spec para `team-member-profile.json`**:
  - Portar e implementar el spec detallado de perfil de miembro del equipo usando el tipo de slide `profile` en `build-image.js`.

---

## Fase 4: Modularización del CLI (`arai`) y Extensión de Validación CI
**Objetivo**: Mejorar la mantenibilidad del CLI modularizando `bin/arai.js` y hacer que el proceso de integración continua sea más estricto.

### Tareas:
- [ ] **Refactorizar `bin/arai.js`**:
  - Identificar comandos acoplados (como `install`, `sync`, `generate`) y mover su lógica de negocio a módulos dedicados bajo `platforms/opencode/commands/` o una nueva carpeta `shared/scripts/lib/`.
- [ ] **Extender `shared/scripts/ci-validate.js`**:
  - Añadir validación de consistencia de Wikilinks para prevenir enlaces rotos en la documentación de Obsidian.
  - Validar que los archivos spec de los templates no contengan palabras clave en inglés no deseadas en títulos y secciones críticas.
  - Comprobar que todos los scripts de creación (`create-*.js`) no tengan marcas `TODO` pendientes.

---

## Estrategia de Ejecución y Validación

1. **Enfoque TDD (Test-Driven Development)**:
   Antes de modificar cualquier template o motor, crearemos un test de consistencia en `tests/consistency/` para asegurar que el cambio pueda ser validado de forma automática.
2. **Validación Incremental**:
   Tras completar cada fase, ejecutaremos:
   ```bash
   node shared/scripts/ci-validate.js --strict --verbose
   npm test
   ```
3. **Smoke Tests de Docgen**:
   Validar que la generación de PDFs y HTMLs no se rompa tras los cambios:
   ```bash
   node shared/scripts/docgen/validate.js
   ```

---

*¿Estás de acuerdo con el alcance y orden de este plan? Confirma para comenzar con la Fase 1.*
