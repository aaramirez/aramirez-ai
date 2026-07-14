---
name: tool-creator
description: Create custom tool definitions with JSON Schema input validation for specialized agent capabilities.
license: MIT
scripts:
  - create-tool.js
  - create-base.js
---

# Creación de herramientas personalizadas

Las herramientas personalizadas amplían las capacidades de los agentes con validación de entrada mediante JSON Schema.

## JSON Schema básico

```json
{
  "type": "object",
  "properties": {
    "input": { "type": "string", "description": "Texto de entrada" },
    "format": { "type": "string", "enum": ["json", "csv", "md"] }
  },
  "required": ["input"]
}
```

## ¿Cuándo crear una herramienta?

| Situación | Recomendación |
|-----------|---------------|
| Operación atómica repetitiva | Herramienta personalizada |
| Necesita bash y parseo | Usar bash directamente |
| API externa con esquema complejo | MCP server |
| Validación estricta de entrada | Herramienta con JSON Schema |

## Descubrimiento

Las herramientas se registran en `opencode.json` y opencode las descubre automáticamente al iniciar. El agente puede invocarlas por nombre. El handler se implementa en el plugin o en el archivo de tool definido.

## Referencia

```bash
node .opencode/skills/tool-creator/scripts/create-tool.js \
  --name my-tool \
  --description "Does X" \
  --schema '{"type":"object","properties":{"input":{"type":"string"}}}' \
  --output ./tool.json
```
