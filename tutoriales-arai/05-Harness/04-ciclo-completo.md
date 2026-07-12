---
tags:
  - harness
  - ciclo-completo
created: 2026-07-05
---

# Ciclo completo de creación de harness

> **Objetivo**: Seguir el flujo completo desde la idea de un proyecto hasta tener un harness de opencode funcionando.

**⏱ Tiempo estimado**: 15 minutos
**🎯 Nivel**: Avanzado
**📋 Requisitos**: [[05-Harness/03-harness-generator.md|Harness Generator]]

## Resultado esperado

Poder llevar un proyecto desde cero hasta tener un harness completo de opencode con agentes, skills, MCP y flujos de trabajo.

## Paso 1: Definir el proyecto

Crea un `spec.json` con la descripción de tu proyecto (ver [[05-Harness/03-harness-generator.md|Harness Generator]]).

## Paso 2: Generar el harness

```bash
node .opencode/scripts/create-config.js (individual scripts) --project spec.json --dry-run
```

Revisa la salida. Si todo se ve bien:

```bash
node .opencode/scripts/create-config.js (individual scripts) --project spec.json
```

## Paso 3: Personalizar agentes y skills

```bash
# Crear agentes adicionales
node .opencode/scripts/create-agent.js --name security-auditor --mode subagent --description "Audita seguridad"

# Instalar skills
arai install skill code-review
arai install skill git
```

## Paso 4: Configurar permisos

```bash
node .opencode/scripts/create-permission.js --strictness balanced
```

Ajusta los permisos en `opencode.json` según sea necesario.

## Paso 5: Agregar comandos personalizados

```bash
node .opencode/scripts/create-command.js --name test --template "npm test"
node .opencode/scripts/create-command.js --name deploy --template "npm run deploy -- $ARGUMENTS"
```

## Paso 6: Agregar servidores MCP

```bash
node .opencode/scripts/create-mcp.js --name context7 --type remote --url https://context7.com/mcp
```

## Paso 7: Validar

```bash
# Tests de consistencia
node shared/scripts/ci-validate.js

# Tests del proyecto
npm test
```

## Paso 8: Usar

Abre opencode en el proyecto y empieza a trabajar con tus agentes.

---

**Siguiente**: [[06-Skills/Index|Trabajar con skills]]
