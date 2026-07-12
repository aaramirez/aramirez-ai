# Módulo 3: Arquitectura de Agentes

## El Patrón Anthropic

Anthropic recomienda una arquitectura de agentes con dos roles:

- **Agentes primarios** — Autónomos, con ciclo completo de tool calling. opencode los ejecuta en tab-cycling (alternando entre ellos en la UI).
- **Subagentes** — Invocados mediante `@`-mention o auto-invocados para tareas específicas. Sesiones hijo con permisos acotados.

```
┌─────────────────────────────────────────┐
│  Sesión principal                       │
│  Agente: build (primario)              │
│  Permisos: edit=allow, bash=allow      │
│                                          │
│  @reviewer ──→ sesión hijo              │
│  @tester   ──→ sesión hijo              │
│  @docs     ──→ sesión hijo              │
└─────────────────────────────────────────┘
```

Los subagentes NO se usan para trabajo secuencial. Son para trabajo **paralelo o independiente**. Si necesitas que un agente revise y otro edite, hazlo secuencial en el mismo agente primario, no encadenando subagentes.

## Agentes Built-in

Los agentes que vienen preconfigurados en opencode:

| Agente | Modo | Acceso típico | Uso |
|--------|------|---------------|-----|
| `build` | primary | edit: allow, bash: allow | Tareas de desarrollo |
| `plan` | primary | edit: deny | Diseño y arquitectura (solo lectura) |
| `general` | primary | Mixto | Multipropósito |
| `explore` | primary | edit: deny, bash: allow | Exploración rápida, consultas |
| `scout` | primary | Dependencias externas | Análisis de dependencias |

## Opciones de Configuración de Agente

Cada agente se define con frontmatter YAML en `.opencode/agents/<nombre>.md`:

```yaml
---
description: Code review specialist. Use for PR reviews and quality checks.
mode: subagent
model: opencode/big-pickle
temperature: 0.2
steps: 20
max_tokens: 4096
color: "#4CAF50"
hidden: false
permission:
  edit: deny
  bash: deny
---
```

| Campo | Descripción |
|-------|-------------|
| `description` | Texto que describe el propósito del agente |
| `mode` | `primary` (tab-cycled), `subagent` (invocado), o `all` |
| `model` | Modelo específico para este agente (opcional) |
| `prompt` | Sistema de prompt personalizado (en el cuerpo del .md) |
| `temperature` | Creatividad del modelo (0.0 - 1.0, default 0.3) |
| `steps` | Máximo de iteraciones por sesión |
| `max_tokens` | Máximo de tokens en la respuesta |
| `color` | Color del agente en la UI (hex) |
| `hidden` | Si `true`, no aparece en la lista de agentes |
| `permission` | Permisos específicos del agente (ver Módulo 4) |

### Modo `all`

El modo `all` combina primary y subagent: el agente aparece en la UI como primario pero también puede ser invocado como subagente.

## Cómo Funcionan los Subagentes

Cuando invocas un subagente:

1. opencode crea una **sesión hijo** con su propio contexto
2. El subagente recibe el prompt y el contexto relevante
3. Ejecuta su trabajo dentro de sus límites de permisos
4. Devuelve el resultado a la sesión padre
5. La sesión hijo se cierra

Puedes navegar entre sesiones padre e hijo en la UI de opencode. Cada una mantiene su propio historial.

### ¿Cuándo usar subagentes?

| Situación | ¿Subagente? |
|-----------|-------------|
| Revisar código mientras desarrollas | ✅ Sí — paralelo |
| Ejecutar tests en segundo plano | ✅ Sí — independiente |
| Investigar documentación | ✅ Sí — solo lectura |
| Pipeline secuencial (revisar → editar) | ❌ No — hazlo en el primario |
| Dependencia de resultados previos | ❌ No — secuencial en un agente |

## Usando create-agent.js

Genera un agente primario con frontmatter YAML:

```bash
node .opencode/scripts/create-agent.js \
  --name mi-agente \
  --description "Agente para automatizar despliegues" \
  --mode primary \
  --temperature 0.3 \
  --color "#2196F3" \
  --edit allow \
  --bash allow \
  --read allow \
  --output ./.opencode/agents/mi-agente.md
```

Esto crea:

```yaml
---
description: Agente para automatizar despliegues
mode: primary
temperature: 0.3
color: "#2196F3"
permission:
  edit: allow
  bash: allow
  read: allow
---

You are mi-agente, an AI agent specialized in: Agente para automatizar despliegues.

Operate according to the following guidelines:
- Mode: primary
- Always respect the permission boundaries defined in the frontmatter.
- Be concise, accurate, and thorough in your responses.
- Follow the user's instructions precisely.
```

## Usando create-agent.js con --mode subagent

Genera un subagente con modo `subagent` automáticamente:

```bash
node .opencode/scripts/create-agent.js \
  --name helper \
  --description "Asistente de análisis de logs" \
  --mode subagent \
  --read-only \
  --output ./.opencode/agents/helper.md
```

La flag `--read-only` configura `edit: deny` y `bash: ask`. Sin ella, los permisos por defecto son `allow`.

Para un subagente oculto (no aparece en la lista):

```bash
node .opencode/scripts/create-agent.js \
  --name interno \
  --description "Agente interno para tareas de mantenimiento" \
  --mode subagent \
  --hidden \
  --output ./.opencode/agents/interno.md
```

## Usando create-agent.js con --domain

Genera agentes con prompts preconstruidos por dominio:

```bash
node .opencode/scripts/create-agent.js \
  --mode subagent \
  --name reviewer \
  --domain reviewer \
  --output ./.opencode/agents/reviewer.md
```

Dominios disponibles:

| Dominio | Descripción | Permisos |
|---------|-------------|----------|
| `reviewer` | Code review specialist | edit: deny, bash: ask |
| `tester` | Testing specialist | edit: allow, bash: allow |
| `docs` | Documentation specialist | edit: allow, bash: deny |
| `security` | Security auditor | edit: deny, bash: ask |
| `devops` | DevOps and infrastructure | edit: allow, bash: allow |
| `architect` | Architecture designer | edit: deny, bash: deny |

Cada dominio incluye un prompt especializado de 8-10 líneas con directrices específicas.

## Registro en opencode.json

Los agentes creados deben registrarse en `opencode.json` bajo la clave `agent`:

```json
{
  "agent": {
    "mi-agente": {
      "description": "Agente para automatizar despliegues",
      "mode": "primary"
    },
    "helper": {
      "description": "Asistente de análisis de logs",
      "mode": "subagent",
      "permission": {
        "edit": "deny"
      }
    }
  }
}
```

Si el agente ya tiene permisos en su frontmatter, no es necesario repetirlos aquí. Los valores en `opencode.json` **sobrescriben** los del frontmatter.

## Pruébalo tú mismo

### Ejercicio 1: Crea un agente primario

```bash
node .opencode/scripts/create-agent.js \
  --name arquitecto \
  --description "Diseña la arquitectura del sistema y documenta decisiones técnicas" \
  --mode primary \
  --temperature 0.2 \
  --color "#9C27B0" \
  --edit deny \
  --bash ask \
  --read allow \
  --output ./.opencode/agents/arquitecto.md
```

### Ejercicio 2: Crea un subagente

```bash
node .opencode/scripts/create-agent.js \
  --name lint-helper \
  --description "Ejecuta linting y reporta errores" \
  --mode subagent \
  --read-only \
  --output ./.opencode/agents/lint-helper.md
```

### Ejercicio 3: Usa el agente por dominio

```bash
node .opencode/scripts/create-agent.js \
  --name qa-engineer \
  --domain tester \
  --mode subagent \
  --output ./.opencode/agents/qa-engineer.md
```

### Ejercicio 4: Regístralos y verifica

Agrega los 3 agentes a tu `opencode.json`:

```json
{
  "agent": {
    "arquitecto": {
      "description": "Diseña la arquitectura del sistema",
      "mode": "primary"
    },
    "lint-helper": {
      "description": "Ejecuta linting y reporta errores",
      "mode": "subagent"
    },
    "qa-engineer": {
      "description": "Testing specialist",
      "mode": "subagent"
    }
  }
}
```

Luego verifica que opencode los reconozca:

```bash
opencode debug config
```

Deberías ver los 3 agentes listados en la sección `agent`.

### Preguntas de reflexión

1. ¿Por qué Anthropic desaconseja encadenar subagentes secuencialmente?
2. ¿Qué ventaja tiene un agente `read-only` para tareas de revisión?
3. ¿En qué casos usarías `hidden: true` para un subagente?
4. ¿Cuándo preferirías definir permisos en el frontmatter vs en `opencode.json`?
