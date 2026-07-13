---
tags:
  - caso-de-uso
  - harness
created: 2026-07-05
---

# Crear un harness completo desde cero

## Objetivo

Generar un harness opencode completo para un proyecto TypeScript + Express con autenticación, tests y CI.

## Paso 1: Definir el proyecto

```bash
mkdir api-project && cd api-project
```

## Paso 2: Generar configuración base

```bash
node /path/to/arai/.opencode/scripts/create-config.js \
  --model opencode/big-pickle \
  --shell zsh
```

## Paso 3: Crear agentes

```bash
# Agente build (default)
node /path/to/arai/.opencode/scripts/create-agent.js \
  --name build --mode primary --description "Agente de desarrollo"

# Agente plan (solo lectura)
node /path/to/arai/.opencode/scripts/create-agent.js \
  --name plan --mode primary --description "Agente de planificación"

# Agente reviewer
node /path/to/arai/.opencode/scripts/create-agent.js --mode subagent \
  --name reviewer --domain reviewer
```

## Paso 4: Configurar arquitectura

```bash
node /path/to/arai/.opencode/scripts/create-architecture.js \
  --name full-dev --pattern tiered --agents "plan,build,reviewer"
```

## Paso 5: Agregar comandos

```bash
node /path/to/arai/.opencode/scripts/create-command.js \
  --name test --template "npm test"

node /path/to/arai/.opencode/scripts/create-command.js \
  --name dev --template "npm run dev"

node /path/to/arai/.opencode/scripts/create-command.js \
  --name deploy --template "npm run deploy -- $ARGUMENTS"
```

## Paso 6: Instalar skills

```bash
arai install skill git
arai install skill code-review
```

## Paso 7: Agregar reglas

```bash
node .opencode/scripts/create-rule.js api-standards
arai install rule api-standards
```

## Paso 8: Validar

```bash
arai status
npm test
```

## Resultado

Un harness completo con agentes, comandos, skills y reglas listo para desarrollar tu API.

---

**Siguiente**: [[11-Casos-de-uso/05-migrar-proyecto-existente.md|Migrar un proyecto existente]]
