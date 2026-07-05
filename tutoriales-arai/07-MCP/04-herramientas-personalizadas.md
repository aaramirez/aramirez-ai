---
tags:
  - mcp
  - herramientas
created: 2026-07-05
---

# Herramientas personalizadas

> **Objetivo**: Definir herramientas personalizadas con schemas JSON y handlers para que los agentes ejecuten tareas específicas.

**⏱ Tiempo estimado**: 8 minutos
**🎯 Nivel**: Avanzado
**📋 Requisitos**: [[07-MCP/01-servidores-mcp.md|Servidores MCP]]

## Resultado esperado

Crear herramientas con validación de entrada mediante JSON Schema, asignarlas a agentes específicos y controlar sus permisos.

## ¿Qué son?

Las herramientas personalizadas (`custom_tools`) extienden las capacidades de los agentes con funciones específicas, definidas mediante JSON Schema.

## Definición

```json
"custom_tools": {
  "analyze-deps": {
    "description": "Analiza dependencias del proyecto",
    "input_schema": {
      "type": "object",
      "properties": {
        "path": {
          "type": "string",
          "description": "Ruta al proyecto"
        }
      },
      "required": ["path"]
    }
  }
}
```

## Handler asociado

Cada herramienta necesita un handler que implemente la lógica. El handler puede ser:
- Un script en `shared/scripts/`
- Una función en un plugin
- Un comando bash

## Buenas prácticas (Anthropic)

- Empieza con **bash** para prototipar — es más rápido
- Promueve a herramienta dedicada cuando necesites:
  - **Gatear** permisos específicos
  - **Renderizar** salida estructurada
  - **Auditar** uso (logging)
  - **Paralelizar** ejecución
- Define schemas estrictos para validación de entrada

## Crear una herramienta

```bash
node shared/scripts/create-tool.js \
  --name analyze-deps \
  --description "Analiza dependencias" \
  --schema '{"type":"object","properties":{"path":{"type":"string"}},"required":["path"]}'
```

---

**Siguiente**: [[07-MCP/05-uso-creators.md|Usar MCP/command/plugin/tool creators]]
