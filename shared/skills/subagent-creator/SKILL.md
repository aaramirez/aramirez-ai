---
name: subagent-creator
description: Create subagent definitions for specialized tasks — auto-invoked or @-mentioned.
license: MIT
scripts:
  - create-subagent.js
  - create-base.js
---

# Subagent Creator

Crea definiciones de subagentes para tareas especializadas. Los subagentes se invocan automáticamente mediante delegación o manualmente con `@nombre` en el chat.

## Subagentes vs agentes primarios

- **Subagentes** trabajan en tareas paralelas o independientes mientras el agente primario mantiene el contexto principal
- No aparecen en el Tab-cycling de la UI a menos que tengan `hidden: false`
- Suelen tener permisos más restrictivos por diseño

## Cuándo usar subagentes

| Situación | Subagente |
|-----------|-----------|
| Tarea paralela independiente | ✅ Ideal |
| Búsqueda exploratoria de código | ✅ Ideal |
| Tarea que requiere permisos distintos | ✅ Ideal |
| Tarea que depende del resultado anterior | ❌ Mejor secuencial con primario |
| Tarea que necesita el contexto completo | ❌ Mejor el primario |

## Campos YAML frontmatter

```yaml
---
description: Descripción del subagente
mode: subagent
model: anthropic/claude-haiku-4-5   # opcional, modelo más ligero
temperature: 0.3                    # opcional
hidden: true                        # si true, no aparece en Tab-cycling
permission:
  edit: deny
  bash: ask
  read: allow
---
```

## Flag hidden

- `hidden: true` — El subagente no aparece en la lista Tab pero puede ser invocado por `@nombre` o automáticamente por delegación
- `hidden: false` (default) — Aparece en la UI como agente seleccionable

## Permisos típicos por tipo de subagente

| Tipo | edit | bash | read | Propósito |
|------|------|------|------|-----------|
| Explorador | `deny` | `ask` | `allow` | Buscar y leer código |
| Revisor | `deny` | `deny` | `allow` | Code review, solo lectura |
| Documentador | `allow` | `deny` | `allow` | Escribir docs |
| Tester | `ask` | `allow` | `allow` | Escribir y ejecutar tests |

## Script de referencia

```bash
node shared/scripts/create-subagent.js --name explorer --description "Codebase explorer" --read-only --output ./.opencode/agents/explorer.md
```

### Opciones

| Flag | Descripción | Default |
|------|-------------|---------|
| `--name <name>` | Nombre del subagente (requerido) | — |
| `--description <desc>` | Descripción (requerido) | — |
| `--read-only` | Shorthand: edit=deny, bash=ask | — |
| `--model <name>` | Modelo específico | — |
| `--temperature <n>` | Temperatura | `0.3` |
| `--hidden` | Oculta el agente en la UI | — |
| `--prompt <text>` | Prompt del sistema | — |
| `--output <file>` | Archivo de salida (requerido) | — |
| `--dry-run` | Vista previa sin escribir | — |

## Ejemplo de uso

```bash
# Crear subagente revisor (solo lectura)
node shared/scripts/create-subagent.js \
  --name revisor \
  --description "Revisor de código y calidad" \
  --read-only \
  --model anthropic/claude-haiku-4-5 \
  --temperature 0.2 \
  --output ./.opencode/agents/revisor.md

# Crear subagente documentador (solo edita docs, no ejecuta comandos)
node shared/scripts/create-subagent.js \
  --name doc-writer \
  --description "Redactor de documentación técnica" \
  --edit allow \
  --bash deny \
  --read allow \
  --hidden \
  --output ./.opencode/agents/doc-writer.md
```
