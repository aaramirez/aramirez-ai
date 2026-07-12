# Módulo 5: Modelo de Permisos

## Principio Fundamental

El modelo de permisos de opencode es el **guardarraíl** del harness. Determina qué puede hacer cada agente, con qué herramientas, y bajo qué condiciones.

La guía de Anthropic es clara: **empieza permisivo, restringe solo lo que necesitas**. Es más fácil endurecer permisos sobre la marcha que debuggear por qué un agente no puede hacer su trabajo.

## Permisos Globales vs por Agente

Los permisos se definen en dos niveles:

### Global (opencode.json)

Aplica a todos los agentes por defecto:

```json
{
  "permission": {
    "read": "allow",
    "edit": "ask",
    "bash": {
      "git *": "allow",
      "npm *": "allow",
      "npx *": "ask",
      "*": "ask"
    }
  }
}
```

### Por agente (frontmatter del .md o agent en opencode.json)

Sobrescribe los globales para un agente específico:

```yaml
---
permission:
  edit: deny
  bash: deny
---
```

Regla: **el permiso más restrictivo gana**. Si global dice `bash: allow` pero el agente dice `bash: deny`, el agente no puede ejecutar bash.

## Claves de Permiso

| Clave | Controla | Ejemplo de valor |
|-------|----------|------------------|
| `read` | Lectura de archivos | `"allow"` |
| `edit` | Escritura/creación de archivos | `"ask"` |
| `glob` | Búsqueda de archivos por patrón | `"allow"` |
| `grep` | Búsqueda de contenido en archivos | `"allow"` |
| `list` | Listado de directorios | `"allow"` |
| `bash` | Ejecución de comandos en shell | `{"git *": "allow", "*": "ask"}` |
| `task` | Creación de tareas/subtareas | `"allow"` |
| `skill` | Carga de skills | `{"internal-*": "deny", "*": "allow"}` |
| `webfetch` | Fetch de URLs | `"ask"` |
| `websearch` | Búsqueda web | `"ask"` |
| `external_directory` | Acceso a directorios fuera del proyecto | `"deny"` |
| `lsp` | Diagnóstico con Language Server | `"allow"` |

## Valores de Permiso

| Valor | Comportamiento |
|-------|----------------|
| `"allow"` | El agente puede usar la herramienta sin preguntar |
| `"ask"` | opencode pide confirmación al usuario antes de ejecutar |
| `"deny"` | La herramienta no está disponible para el agente |

## Patrones Glob para bash

La clave `bash` acepta tanto un string como un objeto con patrones glob:

```json
{
  "permission": {
    "bash": {
      "git push": "ask",
      "git *": "allow",
      "npm *": "allow",
      "npx *": "ask",
      "ls": "allow",
      "pwd": "allow",
      "node --version": "allow",
      "*": "ask"
    }
  }
}
```

El orden importa: opencode evalúa los patrones en orden y usa la **primera coincidencia**. Pon los patrones más específicos primero.

| Patrón | Coincide con |
|--------|-------------|
| `"git push"` | Solo `git push` |
| `"git *"` | Cualquier comando que empiece con `git ` |
| `"npm *"` | Cualquier comando que empiece con `npm ` |
| `"npx *"` | Cualquier comando que empiece con `npx ` |
| `"*"` | **Cualquier comando** (comodín final) |

Sin un comodín `"*"` al final, los comandos no listados se comportan según el valor por defecto del sistema.

## Control de Skills por Patrón

Puedes restringir qué skills puede cargar un agente:

```json
{
  "permission": {
    "skill": {
      "internal-*": "deny",
      "*": "allow"
    }
  }
}
```

Esto permite todos los skills excepto los que empiezan con `internal-`.

## Permisos de Tarea (`task`)

Controla qué subagentes puede invocar un agente:

```json
{
  "permission": {
    "task": {
      "reviewer": "allow",
      "tester": "allow",
      "secret-agent": "deny",
      "*": "allow"
    }
  }
}
```

Si no se especifica, todos los subagentes registrados están disponibles.

## Niveles de Strictness

### Relaxed

```json
{
  "permission": {
    "bash": "allow",
    "edit": "ask",
    "read": "allow"
  }
}
```

Ideal para: prototipado, proyectos personales, confianza total.

### Balanced

```json
{
  "permission": {
    "bash": {
      "git *": "allow",
      "npm *": "allow",
      "npx *": "ask",
      "*": "ask"
    },
    "edit": "ask",
    "read": "allow"
  }
}
```

Ideal para: equipos pequeños, proyectos en desarrollo activo. **Recomendado por defecto.**

### Strict

```json
{
  "permission": {
    "bash": {
      "git *": "allow",
      "npm *": "allow",
      "ls": "allow",
      "pwd": "allow",
      "echo *": "allow",
      "cat *": "allow",
      "which *": "allow",
      "node --version": "allow",
      "npm --version": "allow",
      "npx *": "ask",
      "*": "ask"
    },
    "edit": "ask",
    "read": "allow"
  }
}
```

Ideal para: producción, equipos grandes, agentes con acceso a datos sensibles.

## Usando create-permission.js

El script `create-permission.js` genera configuraciones de permisos según el nivel de strictness:

```bash
node .opencode/scripts/create-permission.js \
  --strictness balanced \
  --output ./permission.json
```

Niveles disponibles: `relaxed`, `balanced`, `strict`.

Usa `--dry-run` para previsualizar:

```bash
node .opencode/scripts/create-permission.js --strictness strict --dry-run
```

Salida para `strict`:

```json
{
  "bash": {
    "git *": "allow",
    "npm *": "allow",
    "ls": "allow",
    "pwd": "allow",
    "echo *": "allow",
    "cat *": "allow",
    "which *": "allow",
    "node --version": "allow",
    "npm --version": "allow",
    "npx *": "ask",
    "*": "ask"
  },
  "edit": "ask",
  "read": "allow"
}
```

## Ejemplo Completo: Equipo de 3 Agentes

Configuración para un equipo con `build` (desarrollador), `reviewer` (revisor), `docs` (documentador):

```json
{
  "permission": {
    "read": "allow",
    "edit": "ask",
    "bash": {
      "git *": "allow",
      "npm *": "allow",
      "npx *": "ask",
      "*": "ask"
    },
    "webfetch": "ask",
    "websearch": "ask"
  },
  "agent": {
    "build": {
      "mode": "primary",
      "permission": {
        "edit": "allow",
        "bash": {
          "git *": "allow",
          "npm *": "allow",
          "npx *": "allow",
          "*": "ask"
        }
      }
    },
    "reviewer": {
      "mode": "subagent",
      "permission": {
        "edit": "deny",
        "bash": "deny"
      }
    },
    "docs": {
      "mode": "subagent",
      "permission": {
        "bash": "deny",
        "edit": "allow"
      }
    }
  }
}
```

| Agente | edit | bash | read |
|--------|------|------|------|
| **build** (primario) | allow | allow (npm/git/npx) | allow |
| **reviewer** (sub) | deny | deny | allow |
| **docs** (sub) | allow | deny | allow |

## Pruébalo tú mismo

### Ejercicio 1: Genera niveles de strictness

```bash
# Compara los 3 niveles
node .opencode/scripts/create-permission.js --strictness relaxed --dry-run
node .opencode/scripts/create-permission.js --strictness balanced --dry-run
node .opencode/scripts/create-permission.js --strictness strict --dry-run
```

### Ejercicio 2: Configura un equipo de 3 agentes

1. Genera los agentes:

```bash
node .opencode/scripts/create-agent.js --name build --description "Desarrollador principal" --output ./.opencode/agents/build.md

node .opencode/scripts/create-agent.js --mode subagent --name reviewer --description "Code review specialist" --output ./.opencode/agents/reviewer.md

node .opencode/scripts/create-agent.js --mode subagent --name docs --description "Documentation specialist" --output ./.opencode/agents/docs.md
```

2. Genera permisos balanceados:

```bash
node .opencode/scripts/create-permission.js --strictness balanced --output ./permisos-base.json
```

3. Integra en tu `opencode.json` siguiendo el ejemplo completo de arriba.

### Ejercicio 3: Prueba las restricciones

Con la configuración del equipo:

- Invoca al agente `reviewer` e intenta que edite un archivo. Debería fallar.
- Invoca al agente `docs` e intenta que ejecute `npm install`. Debería fallar.
- El agente `build` debería poder hacer ambas cosas (con confirmación si es `ask`).

### Preguntas de reflexión

1. ¿Por qué es mejor empezar permisivo y luego restringir?
2. ¿Qué comando pondrías como `"deny"` en un entorno de producción?
3. ¿En qué casos pondrías `external_directory: "deny"`?
4. ¿Cómo manejarías un agente que necesita `bash: allow` pero quieres evitar que borre archivos (`rm -rf`)?
