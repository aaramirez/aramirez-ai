# Plan de mejora — tutoriales-arai vault

## Problemas identificados

Tras explorar las 51 páginas del vault y la documentación del proyecto, estos son los problemas fundamentales:

| # | Problema | Severidad |
|---|----------|-----------|
| 1 | **No existe una introducción a arai** — el vault salta directo a instalación sin explicar qué es arai, para qué sirve, quién debería usarlo | 🔴 Alta |
| 2 | **Sin roadmap de aprendizaje** — el Index.md solo lista secciones, no orienta al lector sobre por dónde empezar según su perfil | 🔴 Alta |
| 3 | **Falta "Objetivo" en casi todos los tutoriales** — solo 3/41 tienen sección de objetivo. El lector no sabe qué va a lograr | 🟡 Media |
| 4 | **Faltan "Requisitos previos"** — 0/41 tutoriales los tienen. El lector puede encontrarse con conceptos que no conoce | 🟡 Media |
| 5 | **Falta "Resultado esperado"** — solo 1/41 muestra qué archivos se generan o cómo debería verse el resultado | 🟡 Media |
| 6 | **Navegación inconsistente** — los enlaces "Siguiente"/"Volver" al final son inconsistentes y a veces incorrectos | 🟡 Media |
| 7 | **Directorios huérfanos** — `06-MCP/`, `07-Referencias/`, `08-CI/` están vacíos pero existen en disco | 🟢 Baja |
| 8 | **Sin guía de contribución** — no hay documentación sobre cómo agregar nuevos tutoriales o qué convenciones seguir | 🟢 Baja |

## Estructura del plan

El plan tiene **4 fases** ejecutables de forma independiente:

---

## Fase 1: Contenido fundamental (Alta prioridad)

### 1.1 Introducción a arai (nuevo archivo `00-Introduccion/Index.md`)

Crear una sección completa **00-Introduccion/** que responda:

**¿Qué es arai?**
- CLI del proyecto aramirez-ai: "Gestor centralizado de configuración multi-agente para opencode + generación de documentos técnicos"
- Tres sistemas en uno: configuración de agentes AI, scaffolding de proyectos, pipeline de documentos
- Filosofía "always copy" (proyectos autocontenidos)

**¿Para qué sirve?**
- Centralizar y reutilizar configuraciones de agentes AI entre proyectos
- Generar documentación técnica profesional (PDF, HTML, presentaciones)
- Scaffoldear nuevos proyectos con estructura AI-agent lista para usar
- Mantener skills, prompts y reglas compartidas entre equipos

**¿Quién debería usarlo?**
- Desarrolladores que quieran integrar asistentes AI en su flujo
- Equipos que necesiten documentación técnica generada desde código
- Arquitectos que diseñen sistemas multi-agente

**Arquitectura conceptual**
- Diagrama ASCII del ecosistema: repositorio central → proyectos → agentes opencode

### 1.2 Roadmap de aprendizaje (en Index.md raíz)

Agregar secciones al Index.md raíz:

```
## Cómo usar este vault

Si eres **nuevo**: empieza por Instalación → Comandos → Configuración
Si quieres **crear skills**: lee Skills → Agentes → MCP
Si necesitas **documentación**: Documentación → CI
Para **escenarios completos**: Casos de uso
```

### 1.3 Cómo extender arai (en `00-Introduccion/`)

Agregar página que explique las vías de extensión:

- **Skills**: crear skills reutilizables en `shared/skills/`
- **Agents**: definir nuevos agentes en opencode.json
- **Scripts**: scripts automatizables en `shared/scripts/`
- **Harness**: generación programática de configuraciones completas
- **MCP/Plugins**: integrar servidores y herramientas externas

---

## Fase 2: Template de tutorial (Media prioridad)

### 2.1 Definir estructura estándar

Cada tutorial debe tener este frontmatter:

```yaml
---
tags: [tema, subtema]
created: YYYY-MM-DD
level: basico | intermedio | avanzado
estimated_time: "15 min"
prerequisites: ["concepto-1", "concepto-2"]
---
```

Y estas secciones en el cuerpo:

```markdown
# Título del tutorial

> **Objetivo**: Al finalizar este tutorial habrás [logro concreto].

**⏱ Tiempo estimado**: 15 minutos  
**🎯 Nivel**: Básico  
**📋 Requisitos**: [[enlace-a-tutorial-previo]], Node.js 18+

## Resultado esperado

Al completar este tutorial tendrás:
- [Archivo o capacidad obtenida]

## [Pasos...]

---

**Siguiente**: [[ruta-al-siguiente|Nombre del siguiente tutorial]]
```

### 2.2 Aplicar template

Priorizar los tutoriales que más se benefician:
1. Primer tutorial de cada sección (establece el contexto del tema)
2. Tutoriales sin "Objetivo" (38 de 41)
3. Tutoriales que introducen conceptos nuevos

Estrategia: **no reescribir todo**, solo agregar las secciones faltantes al inicio de cada archivo. El contenido existente se mantiene intacto.

---

## Fase 3: Correcciones de navegación (Media prioridad)

### 3.1 Arreglar enlaces inconsistentes

| Archivo | Problema | Solución |
|---------|----------|----------|
| `06-Skills/03-sincronizar-skills.md` | Apunta a 09-Documentación (salta 07, 08) | Apuntar a `07-MCP/Index\|MCP, Comandos y Extensiones` |
| `02-Comandos/08-list.md` | Usa "Volver" en vez de "Siguiente" | Debe usar "Siguiente": `[[03-Configuracion/Index]]` |
| `09-Documentacion/05-todas-las-plantillas.md` | Usa "Volver" en vez de "Siguiente" | Debe usar "Siguiente": `[[10-CI/Index\|Validación y Calidad]]` |
| `11-Casos-de-uso/*.md` (últimos) | Usan "Volver" en vez de "Siguiente" | Usar "Siguiente" consistente o eliminar si es el último |

### 3.2 Eliminar directorios huérfanos

```
rm -rf tutoriales-arai/06-MCP/
rm -rf tutoriales-arai/07-Referencias/
rm -rf tutoriales-arai/08-CI/
```

### 3.3 Normalizar "Siguiente"

Regla: **todos los tutoriales** terminan con `**Siguiente**: [[path|texto]]`. Solo el último tutorial de la última sección (11-Casos-de-uso/05) puede no tener "Siguiente".

---

## Fase 4: Mejoras opcionales (Baja prioridad)

### 4.1 Tags de dificultad en frontmatter

Agregar `level: basico | intermedio | avanzado` a los 41 tutoriales.

Clasificación sugerida:
- **Básico**: Instalación, Comandos (01, 02)
- **Intermedio**: Configuración, Skills, MCP (03, 06, 07)
- **Avanzado**: Agentes, Harness, CI (04, 05, 10)

### 4.2 Guía de contribución (`CONTRIBUTING.md`)

Documentar:
- Convenciones de nombres (directorios, archivos, enlaces)
- Template obligatorio
- Cómo probar localmente en Obsidian
- Cómo sincronizar cambios

### 4.3 (Opcional) Script generator

Considerar un script `create-tutorial.js` que genere la estructura base de un nuevo tutorial siguiendo el template.

---

## Resumen de cambios por archivo

| Archivo | Fase | Cambio |
|---------|------|--------|
| `tutoriales-arai/Index.md` | 1 | + secciones roadmap, cómo usar, cómo extender |
| `tutoriales-arai/00-Introduccion/Index.md` | 1 | Nuevo: qué es arai, arquitectura, audiencia |
| `tutoriales-arai/00-Introduccion/01-que-es-arai.md` | 1 | Nuevo: explicación detallada |
| `tutoriales-arai/00-Introduccion/02-como-extender.md` | 1 | Nuevo: vías de extensión |
| `tutoriales-arai/00-Introduccion/03-arquitectura.md` | 1 | Nuevo: diagrama y componentes |
| `tutoriales-arai/**/*.md` (38 archivos) | 2 | + sección Objetivo, Requisitos, Resultado |
| `tutoriales-arai/06-Skills/03-sincronizar-skills.md` | 3 | Fix enlace "Siguiente" |
| `tutoriales-arai/02-Comandos/08-list.md` | 3 | "Volver" → "Siguiente" |
| `tutoriales-arai/09-Documentacion/05-todas-las-plantillas.md` | 3 | "Volver" → "Siguiente" |
| `tutoriales-arai/11-Casos-de-uso/*.md` (2-3) | 3 | Normalizar navegación |
| Directorios `06-MCP/`, `07-Referencias/`, `08-CI/` | 3 | Eliminar |
| `tutoriales-arai/CONTRIBUTING.md` | 4 | Nuevo: guía de contribución |

## Orden de ejecución sugerido

1. **Fase 1** (contenido fundamental) — primero, porque da contexto a todo el vault
2. **Fase 3** (correcciones) — cambios rápidos y de alto impacto
3. **Fase 2** (template) — el trabajo más pesado, requiere editar 38 archivos
4. **Fase 4** (opcional) — solo si hay tiempo/necesidad

## Verificación

1. `npm test` — los tests de consistencia no deben romperse
2. Visualizar en Obsidian — abrir el vault y verificar que los wikilinks funcionan
3. `docgen-vault --vault tutoriales-arai --scope all` — exportar a PDF para verificar
4. Revisión manual de 5 tutoriales representativos
