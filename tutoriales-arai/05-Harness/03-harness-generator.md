---
tags:
  - harness
  - harness-generator
created: 2026-07-05
---

# Harness Generator

> **Objetivo**: Usar el agente `new-harness` para generar un harness completo de opencode de forma interactiva.

**⏱ Tiempo estimado**: 10 minutos
**🎯 Nivel**: Avanzado
**📋 Requisitos**: [[05-Harness/02-creator-scripts.md|Los 16 creator scripts]]

## Resultado esperado

Poder crear un proyecto completo con agentes, skills, MCP, permisos usando el flujo interactivo de 7 pasos.

## Descripción

El agente `new-harness` (modo primary) carga el skill `harness-generator` y guía al usuario a través de un workflow interactivo de 7 pasos para generar un harness completo de opencode. No es un script standalone — es un orquestador que coordina los 15 creator scripts.

## Flujo de 7 pasos

1. **Nombre del proyecto** — Verifica formato kebab-case
2. **Tipo de proyecto** — web, api, cli, library, mobile, desktop, data, ai/ml, fullstack
3. **Lenguaje/Stack** — Sugiere opciones según el tipo
4. **Descripción** — Pide descripción breve
5. **Agentes** — Perfiles predefinidos (minimal/standard/full) o selección manual
6. **Skills** — Ejecuta `arai list skills` y recomienda
7. **Configuración avanzada** — Estrictitud, workflow, template, MCP servers

## Uso

Desde opencode, selecciona el agente `new-harness` (tab-cycling) y responde las preguntas interactivas. El agente mostrará un resumen antes de ejecutar cualquier comando.
6. Escribe los archivos finales

## Vista previa

```bash
node .opencode/skills/config-creator/scripts/create-config.js (individual scripts) --project spec.json --dry-run
```

---

**Siguiente**: [[05-Harness/04-ciclo-completo.md|Ciclo completo de creación]]
