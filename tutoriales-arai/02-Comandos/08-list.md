---
tags:
  - comandos
  - list
created: 2026-07-05
---

# arai list — Listar recursos

> **Objetivo**: Explorar los recursos disponibles en arai: skills, agents, scripts, templates, commands y servidores MCP.

**⏱ Tiempo estimado**: 3 minutos
**🎯 Nivel**: Básico
**📋 Requisitos**: [[01-Instalacion/01-instalar-arai.md|Instalar arai]] completado

## Resultado esperado

Saber cómo listar cualquier tipo de recurso en arai y entender la información que muestra cada comando.

## Uso básico

```bash
arai list skills       # Lista todas las skills disponibles
arai list agents       # Lista todos los agentes configurados
arai list scripts      # Lista todos los scripts reutilizables
arai list templates    # Lista todas las plantillas de proyecto
arai list commands     # Lista todos los comandos opencode
arai list mcp          # Lista todos los servidores MCP
```

## Ejemplo

```bash
arai list skills
```

Salida típica:

```
branding              - Define y aplica identidad visual
code-review           - Revisa código y aplica estándares
content-ingestion     - Estructura contenido de cualquier fuente
document-generation   - Genera documentos y presentaciones
git                   - Operaciones y estrategias de branching
youtube               - Transcripciones de videos
vault-pdf-export      - Exporta vaults de Obsidian a PDF
```

---

**Siguiente**: [[03-Configuracion/Index|Configuración de opencode]]
