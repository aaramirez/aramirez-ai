---
tags:
  - harness
  - harness-generator
created: 2026-07-05
---

# Harness Generator

> **Objetivo**: Usar `harness-generator.js` para generar un harness completo de opencode a partir de una especificación JSON.

**⏱ Tiempo estimado**: 10 minutos
**🎯 Nivel**: Avanzado
**📋 Requisitos**: [[05-Harness/02-creator-scripts.md|Los 18 creator scripts]]

## Resultado esperado

Poder crear una especificación JSON de proyecto y generar todo el harness (agentes, skills, MCP, permisos) en un solo paso.

## Descripción

`harness-generator.js` es el orquestador de todo el ecosistema de creación. Toma una descripción JSON del proyecto y genera un harness completo invocando a los creator scripts apropiados.

## Uso

```bash
node .opencode/scripts/create-config.js (individual scripts) --project spec.json
```

## El archivo de especificación

`spec.json` describe tu proyecto:

```json
{
  "project": {
    "name": "mi-proyecto",
    "description": "API REST con autenticación JWT",
    "language": "typescript",
    "framework": "express"
  },
  "agents": {
    "primary": [
      { "name": "build", "description": "Agente de desarrollo" },
      { "name": "plan", "description": "Agente de planificación" }
    ],
    "subagents": [
      { "name": "reviewer", "domain": "reviewer" },
      { "name": "tester", "domain": "tester" }
    ]
  },
  "architecture": {
    "pattern": "tiered",
    "agents": ["plan", "build", "reviewer"]
  },
  "commands": [
    { "name": "test", "template": "npm test" },
    { "name": "deploy", "template": "npm run deploy" }
  ],
  "skills": [
    { "name": "code-review" },
    { "name": "git" }
  ],
  "mcp_servers": [
    {
      "name": "context7",
      "type": "remote",
      "url": "https://context7.com/mcp"
    }
  ]
}
```

## Proceso

1. `harness-generator.js` lee `spec.json`
2. Propone una configuración concreta (patrón "propose, don't interrogate")
3. Carga las skills creator relevantes
4. Cada skill delega a su companion script
5. Valida y compone todas las salidas
6. Escribe los archivos finales

## Vista previa

```bash
node .opencode/scripts/create-config.js (individual scripts) --project spec.json --dry-run
```

---

**Siguiente**: [[05-Harness/04-ciclo-completo.md|Ciclo completo de creación]]
