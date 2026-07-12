# Módulo 1: ¿Qué es un Harness?

## Definición

Un **harness** es el contexto/contenido que se le pasa a un modelo IA generativa para lograr un objetivo, es decir, para que se comporte como un agente. Usualmente la configuración especifica una especie de ciclo y por ello hoy en día se puede considerar como ingeniería de ciclos o ingeniería de arneses. Es el "motor" que:

1. Recibe las **tool calls** que emite el modelo de IA
2. Las **ejecuta** contra el sistema (bash, edición de archivos, web, etc.)
3. **Gestiona permisos** para cada operación
4. **Orquesta el flujo de trabajo** entre agentes, skills y herramientas

Sin un harness, el modelo solo es un cerebro sin guión. El harness son las especificaciones que sigue el agente, recordemos que los modelos generan de acuerdo al contexto y hoy en día estás más entrenados para seguir instrucciones.

## Analogía

Cuando trabajas con un agente de IA en opencode, el flujo es siempre el mismo:

```
Tú: "Agente, actualiza la función login()"
  ↓
Agente (modelo) → emite: tool_call(edit, "login.js", "nuevo código")
  ↓
Harness (runtime) → recibe la tool call → chequea permisos → ejecuta → devuelve resultado
  ↓
Agente (modelo) → recibe el resultado → decide próximo paso o responde
  ↓
Tú: ves el resultado
```

El modelo **propone** acciones; el harness **las ejecuta**. Esta separación es clave para la seguridad y el control.

## Anatomía de un Harness

Un harness típico tiene estos componentes:

```
mi-proyecto/
├── opencode.json          ← Configuración principal (modelo, permisos, runtime)
├── AGENTS.md              ← Instrucciones globales para todos los agentes
└── .opencode/
    ├── agents/            ← Definiciones de agentes (.md con frontmatter YAML)
    ├── skills/            ← Skills instalados (SKILL.md)
    └── ...                ← Plugins, MCP servers, etc.
```

### opencode.json

El archivo central. Define modelo, shell, permisos, agentes, skills, referencias, y opciones de runtime. Lo exploramos a fondo en el Módulo 2.

### .opencode/agents/

Cada agente es un archivo Markdown con frontmatter YAML:

```yaml
---
description: Code review specialist
mode: subagent
permission:
  edit: deny
  bash: deny
---
```

### .opencode/skills/

Skills instalados desde repositorios de la comunidad o locales. Cada skill es un `SKILL.md` con frontmatter:

```yaml
---
name: code-review
description: Use for reviewing pull requests and enforcing quality standards
license: MIT
---
```

### AGENTS.md

Instrucciones globales en Markdown que se inyectan al sistema de todos los agentes. Útil para políticas del proyecto.

## Harness vs Configuración Simple vs Agente Individual

| Concepto | Qué incluye | Uso típico |
|----------|-------------|------------|
| **Configuración simple** | Solo `opencode.json` | Proyecto pequeño, 1 agente |
| **Agente individual** | `opencode.json` + 1 agente `.md` | Tarea específica |
| **Harness completo** | `opencode.json` + múltiples agentes + skills + referencias + MCP | Equipo, múltiples dominios, CI/CD |

Un harness es una **configuración orquestada**: varios agentes colaboran, skills especializados se activan según el contexto, y los permisos están ajustados por rol.

## Ejemplos de la Comunidad

| Harness | Componentes | Destacado |
|---------|-------------|-----------|
| **opencode-workspace** | 16 componentes | Referencia canónica de Anthropic |
| **iceglober/harness-opencode** | 19 skills | Enfoque en skills reutilizables |
| **aramirez-ai** (este repo) | 12+ skills, 5 agentes | Harness completo con pipeline docgen |

Cada uno organiza los mismos bloques (opencode.json, agentes, skills) de forma distinta. No hay un harness "correcto" — hay el que funciona para tu flujo.

## El Ecosistema de 16 Creator Scripts

En este curso vamos a explorar **16 scripts creadores** que automatizan la generación de componentes de harness:

| Script | Genera |
|--------|--------|
| `create-config.js` | `opencode.json` base |
| `create-agent.js` | Agente primario o subagente (`--mode subagent`) |
| `create-skill.js` | Skill con SKILL.md |
| `create-command.js` | Comando opencode |
| `create-prompt.js` | Fragmento de prompt |
| `create-rule.js` | Regla de codificación |
| `create-instructions.js` | Instrucciones globales |
| `create-tool.js` | Herramienta personalizada |
| `create-plugin.js` | Plugin opencode |
| `create-mcp.js` | MCP server |
| `create-flow.js` | Flujo multi-agente |
| `create-base.js` | Base para otros creadores |
| `create-permission.js` | Configuración de permisos |
| `create-reference.js` | Referencia externa |
| `create-script.js` | Script reutilizable |
| `create-architecture.js` | Documento de arquitectura |

Todos viven en `.opencode/scripts/` y usan `create-base.js` como interfaz común con `--help`, `--dry-run`, y parseo de argumentos unificado.

## Pruébalo tú mismo

Ejecuta el siguiente comando para inspeccionar tu configuración actual de opencode:

```bash
opencode debug config
```

Este comando muestra el harness activo en tu sesión: modelo, shell, permisos, agentes registrados, y rutas de skills. Compáralo con la anatomía que vimos arriba.

### Preguntas de reflexión

1. ¿Cuántos agentes tienes configurados actualmente?
2. ¿Qué permisos tiene tu agente por defecto?
3. ¿Tienes skills instalados? ¿Cuáles?
4. ¿Tu configuración está en el repositorio o es solo local?
