---
tags:
  - comandos
  - init
created: 2026-07-05
---

# arai init — Escafoldar proyectos

## Uso básico

```bash
arai init <directorio>
```

Crea un nuevo proyecto con la estructura de arai en el directorio especificado.

## Plantillas

### Mínima (default)

```bash
arai init mi-proyecto
```

Crea:
- `shared/` — prompts, rules, scripts
- `platforms/opencode/` — configuración opencode
- `AGENTS.md` — instrucciones del proyecto

### Completa

```bash
arai init mi-proyecto --template full
```

Incluye todo lo anterior más:
- `assets/` — logos, CSS, templates de documentos
- Branding pre-configurado
- Todas las skills del repositorio base

## Flags útiles

| Flag | Descripción |
|------|-------------|
| `--template minimal\|full` | Plantilla a usar (default: minimal) |
| `--description "..."` | Descripción del proyecto |

## Ejemplo completo

```bash
arai init curso-ia --template full --description "Curso de Inteligencia Artificial con opencode"
```

---

**Siguiente**: [[02-Comandos/02-install.md|arai install]]
