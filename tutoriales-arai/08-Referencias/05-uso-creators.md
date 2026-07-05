---
tags:
  - referencias
  - creator-scripts
created: 2026-07-05
---

# Usar prompt/rule/reference creators

> **Objetivo**: Usar los scripts creator para generar prompts, reglas y referencias compartidas desde la línea de comandos.

**⏱ Tiempo estimado**: 3 minutos
**🎯 Nivel**: Intermedio
**📋 Requisitos**: [[08-Referencias/01-prompt-y-reglas.md|Prompts y reglas]]

## Resultado esperado

Generar prompts, reglas y configuraciones de referencia usando `node shared/scripts/create-*.js`.

## create-prompt

```bash
node shared/scripts/create-prompt.js --name commit-msg --content "Escribe commits convencionales..."
```

## create-rule

```bash
node shared/scripts/create-rule.js --name code-style --content "Usar TypeScript estricto..."
```

## create-reference

```bash
node shared/scripts/create-reference.js --name scripts --path shared/scripts --description "Scripts reutilizables"
```

## Instalación en proyectos

```bash
arai install prompt commit-msg
arai install rule code-style
```

## Flags comunes

```bash
--dry-run       # Previsualizar sin escribir
--output <dir>  # Directorio de salida
--help          # Ayuda
```

---

**Siguiente**: [[09-Documentacion/Index|Generación de documentos]]
