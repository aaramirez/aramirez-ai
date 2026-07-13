---
tags:
  - comandos
  - status
created: 2026-07-05
---

# arai status — Diagnosticar el proyecto

> **Objetivo**: Usar `arai status` para verificar el estado de opencode en el proyecto actual, incluyendo skills instaladas, agentes registrados y permisos.

**⏱ Tiempo estimado**: 3 minutos
**🎯 Nivel**: Básico
**📋 Requisitos**: [[02-Comandos/02-install.md|arai install]] completado

## Resultado esperado

Poder diagnosticar rápidamente qué componentes de opencode están instalados y su estado en cualquier proyecto.

## Uso básico

```bash
arai status
```

Muestra el estado de la instalación en el directorio actual.

## Salida típica

```
aramirez-ai status
──────────────────
Platform:  opencode ✔
Skills:    branding, code-review, content-ingestion, document-generation,
           git, kb-management, pdf-extraction, vault-pdf-export, youtube
Agents:    build, plan, plan-arai, tester, reviewer, docs
Scripts:   18 creator scripts, docgen tools
Commands:  test, commit, deploy
Templates: minimal, full
```

## Interpretación

| Indicador | Significado |
|-----------|-------------|
| ✔ | Componente instalado y configurado |
| ✘ | Componente faltante o con error |
| — | No aplica |

## Cuándo usarlo

- Después de `arai install` para verificar que todo quedó correcto
- Cuando un agente no aparece en opencode
- Para saber qué skills están disponibles en el proyecto

---

**Siguiente**: [[02-Comandos/06-update.md|arai update]]
