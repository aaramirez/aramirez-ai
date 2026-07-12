---
tags:
  - mcp
  - comandos
created: 2026-07-05
---

# Comandos personalizados

> **Objetivo**: Crear comandos reutilizables de opencode para tareas repetitivas, usando `$ARGUMENTS` y plantillas personalizadas.

**⏱ Tiempo estimado**: 6 minutos
**🎯 Nivel**: Intermedio
**📋 Requisitos**: [[07-MCP/01-servidores-mcp.md|Servidores MCP]]

## Resultado esperado

Poder definir comandos opencode que ejecuten tareas frecuentes con un solo nombre, incluyendo argumentos dinámicos.

## ¿Qué son?

Los comandos personalizados son atajos en `opencode.json` que ejecutan templates predefinidos. Aparecen en la interfaz de opencode y aceptan argumentos.

## Configuración básica

```json
"commands": {
  "test": {
    "description": "Ejecutar tests del proyecto",
    "template": "npm test"
  },
  "deploy": {
    "description": "Desplegar a producción",
    "template": "npm run deploy -- $ARGUMENTS"
  }
}
```

## Parámetros con $ARGUMENTS

```json
"commit": {
  "description": "Hacer commit con mensaje",
  "template": "git add -A && git commit -m \"$ARGUMENTS\""
}
```

## Agente y modelo específicos

```json
"review": {
  "description": "Revisar código en PR",
  "template": "gh pr review $ARGUMENTS",
  "agent": "reviewer",
  "model": "opencode/big-pickle"
}
```

## Comandos como archivos .md

Alternativa: define comandos en `.opencode/commands/<nombre>.md`:

```markdown
---
description: Ejecutar tests del proyecto
agent: tester
---
npm test
```

## Crear un comando

```bash
node .opencode/scripts/create-command.js --name test --template "npm test"
node .opencode/scripts/create-command.js \
  --name deploy \
  --template "npm run deploy -- $ARGUMENTS" \
  --description "Desplegar a producción"
```

---

**Siguiente**: [[07-MCP/03-plugins.md|Plugins]]
