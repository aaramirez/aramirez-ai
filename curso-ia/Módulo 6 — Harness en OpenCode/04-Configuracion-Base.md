# Módulo 4: Configuración Base — opencode.json

## El Archivo Central

`opencode.json` es el corazón del harness. Todo lo demás (agentes, skills, MCP) se referencia desde aquí. opencode lo busca en la raíz del proyecto.

## Schema

El archivo debe comenzar con el schema oficial:

```json
{
  "$schema": "https://opencode.ai/config.json"
}
```

Esto habilita autocompletado y validación en editores compatibles con JSON Schema.

## Estructura Completa

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "opencode/big-pickle",
  "small_model": "anthropic/claude-haiku-4-5",
  "default_agent": "build",
  "shell": "/bin/zsh",
  "instructions": ["AGENTS.md"],
  "skills": {
    "paths": [
      ".opencode/skills",
      "~/.config/opencode/skills"
    ]
  },
  "references": {
    "shared-scripts": {
      "path": "../shared/scripts",
      "description": "Reusable automation scripts"
    }
  },
  "agent": {},
  "command": {},
  "mcp": {},
  "permission": { ... },
  "formatter": true,
  "lsp": true,
  "compaction": {
    "auto": true,
    "tail_turns": 10
  },
  "tool_output": {
    "max_lines": 1000,
    "max_bytes": 40960
  }
}
```

## Configuración de Modelos

| Clave | Descripción | Ejemplo |
|-------|-------------|---------|
| `model` | Modelo principal para tareas complejas | `"opencode/big-pickle"` |
| `small_model` | Modelo ligero para tareas rápidas | `"anthropic/claude-haiku-4-5"` |

El `small_model` se usa para operaciones baratas (formateo, completado simple). El `model` se usa para razonamiento profundo y edición.

## Runtime

| Clave | Descripción |
|-------|-------------|
| `shell` | Shell del sistema (`/bin/zsh`, `/bin/bash`, `powershell.exe`) |
| `formatter` | `true`/`false` — formatea archivos al editarlos |
| `lsp` | `true`/`false` — Language Server Protocol para diagnóstico en vivo |

Con `formatter: true`, opencode ejecuta el formateador del proyecto tras cada edición. Con `lsp: true`, obtienes errores y advertencias en tiempo real.

## Compaction

La compactación controla cómo opencode gestiona el historial de la conversación para no exceder el contexto del modelo:

```json
{
  "compaction": {
    "auto": true,
    "prune": true,
    "reserved": 2048,
    "tail_turns": 10
  }
}
```

| Clave | Descripción |
|-------|-------------|
| `auto` | Compactación automática cuando se acerca al límite |
| `prune` | Elimina mensajes redundantes del medio |
| `reserved` | Tokens reservados para la respuesta |
| `tail_turns` | Últimos N turnos que siempre se conservan |

## Tool Output

Controla cuánto output de herramientas se pasa al modelo:

```json
{
  "tool_output": {
    "max_lines": 1000,
    "max_bytes": 40960
  }
}
```

Si un comando produce 50,000 líneas, solo las primeras `max_lines` líneas (hasta `max_bytes`) se envían al modelo. El resto se trunca.

## Capas de Configuración

Las configuraciones se fusionan en este orden (de menor a mayor prioridad):

```
1. Remota       ← Settings sync / dotfiles
2. Global       ← ~/.config/opencode/opencode.json
3. Custom       ← variable de entorno OPENCODE_CONFIG_PATH
4. Proyecto     ← <proyecto>/opencode.json
5. .opencode/   ← <proyecto>/.opencode/opencode.json
6. Managed      ← Configuración inyectada por herramientas como arai
```

Cada capa **fusiona** sus valores con la capa anterior. Un `permission` definido en `.opencode/opencode.json` sobrescribe el mismo campo de `opencode.json` del proyecto.

Puedes ver tu configuración final fusionada con:

```bash
opencode debug config
```

## Mejores Prácticas

### 1. Commitea opencode.json al repositorio

`opencode.json` debe estar versionado. Es parte de la configuración del proyecto, como `package.json` o `.eslintrc`.

### 2. Usa variables {env:} para secrets

Nunca hardcodees tokens o API keys:

```json
{
  "mcp": {
    "github": {
      "headers": {
        "Authorization": "Bearer {env:GITHUB_TOKEN}"
      }
    }
  }
}
```

### 3. Skills paths relativos y absolutos

```json
{
  "skills": {
    "paths": [
      ".opencode/skills",
      "~/.config/opencode/skills",
      "../shared/skills"
    ]
  }
}
```

- `.opencode/skills` — skills instalados en el proyecto
- `~/.config/opencode/skills` — skills globales
- `../shared/skills` — skills compartidos entre proyectos (path relativo)

### 4. Instrucciones desde AGENTS.md

```json
{
  "instructions": ["AGENTS.md"]
}
```

Mantén las instrucciones globales separadas del JSON. Es más legible y permite edición sin tocar la configuración.

## Usando create-config.js

El script `create-config.js` genera un `opencode.json` listo para usar:

```bash
node .opencode/scripts/create-config.js \
  --model opencode/big-pickle \
  --small-model anthropic/claude-haiku-4-5 \
  --shell /bin/zsh \
  --formatter true \
  --lsp true \
  --auto-compact true \
  --tail-turns 10 \
  --output ./opencode.json
```

Usa `--dry-run` para ver el resultado sin escribirlo:

```bash
node .opencode/scripts/create-config.js --dry-run
```

Usa `--help` para ver todas las opciones:

```bash
node .opencode/scripts/create-config.js --help
```

## Pruébalo tú mismo

### Ejercicio 1: Inspeccionar y comparar

```bash
# Mira tu configuración actual
opencode debug config

# Genera una configuración por defecto en dry-run
node .opencode/scripts/create-config.js --dry-run
```

Compara ambas. ¿Qué diferencias encuentras?

### Ejercicio 2: Generar tu propio opencode.json

```bash
node .opencode/scripts/create-config.js \
  --model opencode/big-pickle \
  --formatter true \
  --lsp true \
  --output ./mi-opencode.json
```

### Ejercicio 3: Capas de configuración

Crea un archivo `~/.config/opencode/opencode.json` de prueba:

```json
{
  "formatter": false,
  "lsp": false
}
```

Luego ejecuta `opencode debug config` y observa cómo las capas se fusionan (el proyecto debería tener `formatter: true` si tu `opencode.json` local lo especifica).

### Preguntas de reflexión

1. ¿Qué ventaja tiene tener `small_model` separado de `model`?
2. ¿Por qué es importante configurar `tool_output.max_lines`?
3. ¿En qué capa pondrías configuraciones específicas de un desarrollador?
4. ¿Por qué `{env:GITHUB_TOKEN}` es más seguro que poner el token directamente?
