---
tags:
  - documentacion
  - vault
  - pdf
  - obsidian
created: 2026-07-05
---

# Exportar vault a PDF

La skill `vault-pdf-export` convierte un vault de Obsidian en un documento PDF profesional con portada, encabezados, tabla de contenido y formato consistente.

## Requisitos

- Chrome/Chromium instalado
- Node.js 18+

## Exportar un módulo completo

```bash
node shared/scripts/docgen-vault.js --scope module --module "Módulo 1" --mode merged
```

Esto genera un PDF con todas las lecciones del Módulo 1 en un solo documento.

## Exportar una lección específica

```bash
node shared/scripts/docgen-vault.js --scope lesson --module "Módulo 5" --lesson "05"
```

## Exportar el curso completo

```bash
node shared/scripts/docgen-vault.js --scope all --mode merged
```

## Opciones disponibles

| Flag | Descripción | Default |
|------|-------------|---------|
| `--scope` | `lesson`, `module`, `all` | `module` |
| `--module` | Nombre del módulo | requerido |
| `--lesson` | Número de lección | — |
| `--mode` | `merged` o `separate` | `merged` |
| `--vault` | Ruta al vault | `curso-ia/` |
| `--output` | Directorio de salida | `generated` |

## Características del PDF generado

- Portada con título del vault, subtítulo y clasificación
- Encabezados y pies de página con branding
- Checkboxes interactivos `[ ]` y `[x]`
- Tablas con formato limpio
- Código en bloques `pre/code`
- Wikilinks `[[page]]` renderizados como texto plano
- Negritas, cursivas, código inline

---

**Siguiente**: [[11-Casos-de-uso/Index|Casos de uso]]
