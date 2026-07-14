---
tags:
  - skills
  - uso
created: 2026-07-05
---

# Usar skills existentes

> **Objetivo**: Aprender a cargar y ejecutar skills de opencode en tu flujo de trabajo diario con los agentes.

**⏱ Tiempo estimado**: 5 minutos
**🎯 Nivel**: Básico
**📋 Requisitos**: [[02-Comandos/02-install.md|arai install]] completado

## Resultado esperado

Saber cómo listar skills disponibles, cargarlas en el contexto de trabajo y usarlas con los agentes de opencode.

## ¿Qué es una skill?

Una skill es un archivo `SKILL.md` con metadatos YAML que describe una capacidad específica. Los agentes de opencode pueden cargar estas skills para obtener instrucciones detalladas sobre cómo realizar una tarea.

## Skills disponibles

```bash
arai list skills
```

Ejemplo de salida:

```
branding              - Define y aplica identidad visual
code-review           - Revisa código y aplica estándares de calidad
content-ingestion     - Estructura contenido de cualquier fuente
document-generation   - Genera documentos, reportes y presentaciones
git                   - Operaciones y estrategias de branching
kb-management         - Mantenimiento de vaults de conocimiento
pdf-extraction        - Extrae texto literal de PDFs
vault-pdf-export      - Exporta vaults de Obsidian a PDF profesional
youtube               - Obtiene transcripciones de videos
```

## Cargar una skill

Cuando trabajas con un agente, puedes cargar una skill explícitamente:

```
/usar skill youtube
```

O el agente puede cargarla automáticamente según la tarea.

## Ejemplo: Transcripción de YouTube

```bash
node shared/skills/youtube/scripts/youtube-transcript.js https://youtube.com/watch?v=XXXX --lang es
```

La skill `youtube` provee las instrucciones para obtener, procesar y guardar la transcripción.

## Ejemplo: Exportar vault a PDF

```bash
node shared/skills/vault-pdf-export/scripts/docgen-vault.js --scope module --module "Módulo 1" --mode merged
```

La skill `vault-pdf-export` guía todo el proceso de exportación.

---

**Siguiente**: [[06-Skills/02-crear-skills.md|Crear skills nuevas]]
