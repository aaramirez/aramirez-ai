---
tags:
  - caso-de-uso
  - vault
  - pdf
  - curso-ia
created: 2026-07-05
---

# Publicar el vault curso-ia como PDF

## Objetivo

Convertir el vault de Obsidian `curso-ia/` en un PDF profesional con portada, módulos y lecciones.

## Paso 1: Exportar módulo por módulo

```bash
# Módulo 1 — Fundamentos
node shared/skills/vault-pdf-export/scripts/docgen-vault.js --scope module --module "Módulo 1" --mode merged

# Módulo 2 — Ingeniería de Prompts
node shared/skills/vault-pdf-export/scripts/docgen-vault.js --scope module --module "Módulo 2" --mode merged

# Módulo 3 — Multiagentes
node shared/skills/vault-pdf-export/scripts/docgen-vault.js --scope module --module "Módulo 3" --mode merged
```

## Paso 2: Exportar el curso completo

```bash
node shared/skills/vault-pdf-export/scripts/docgen-vault.js --scope all --mode merged
```

Genera `curso-completo.pdf` con las 39 lecciones en 6 módulos.

## Paso 3: Exportar lecciones individuales

```bash
# Una lección específica
node shared/skills/vault-pdf-export/scripts/docgen-vault.js --scope lesson --module "Módulo 5" --lesson "05"

# Varias lecciones por separado (modo separate)
node shared/skills/vault-pdf-export/scripts/docgen-vault.js --scope module --module "Módulo 1" --mode separate
```

## Resultado

Los PDFs se generan en `generados/curso-ia-<timestamp>/`:

```
generated/
└── curso-ia-20260705-143848/
    ├── modulo-1.pdf      (268 KB)
    └── ...
```

## Solución de problemas

| Problema | Solución |
|----------|----------|
| `spawnSync ETIMEDOUT` | Chrome tarda en arrancar — ejecuta de nuevo |
| `SyntaxError: import` | Ejecuta desde la raíz del repo |
| El PDF no tiene portada | Verifica que `Index.md` tenga un `# Título` |
| Las negritas no se ven en checkboxes | Verifica que el script esté actualizado (`arai update`) |

---

**Siguiente**: [[11-Casos-de-uso/02-crear-skills-personalizadas.md|Crear skills personalizadas]]
