# aramirez-ai

Configuración centralizada de agentes AI: **opencode**, **Claude Code**, **Cursor**, **Codex**.

> Todo lo reusable se escribe una vez en `shared/` y se consume nativo o se transforma por agente.

## Estructura

```
aramirez-ai/
├── shared/           ★ Centralizado — skills, prompts, scripts, rules
│   ├── skills/       # SKILL.md estándar (compatible opencode + claude)
│   ├── prompts/      # Fragmentos de prompt reutilizables
│   ├── scripts/      # Scripts ejecutables (bash/node/py)
│   └── rules/        # Reglas de estilo, arquitectura y documentación
│
├── platforms/        ★ Específico por plataforma
│   ├── opencode/     # opencode.json, agents, commands, plugins, mcp, themes
│   ├── claude/       # CLAUDE.md
│   ├── cursor/       # .cursorrules + rules/ transformados
│   └── codex/        # Codex config
│
├── transforms/       # Scripts de transformación SKILL.md → formatos destino
│
└── bin/arai.js       # CLI multi-agente
```

## Instalación

### Global (tu máquina)

```bash
git clone git@github.com:aaramirez/aramirez-ai.git ~/.config/aramirez
cd ~/.config/aramirez
npm install
npm link

# Instalar agente opencode global
arai install opencode --global    # symlink a ~/.config/opencode/

# Instalar agente claude global
arai install claude --global       # symlink a ~/.claude/
```

### Por proyecto

```bash
cd mi-proyecto

# Modo OPENCODE_CONFIG_DIR (sin copias, recomendado para dev)
arai install opencode --project .
# → Crea .env con OPENCODE_CONFIG_DIR apuntando al repo

# Modo copia (portable, commiteable)
arai install opencode --project . --copy
# → Crea .opencode/agents, .opencode/skills, opencode.json, etc.
```

## CLI: `arai`

| Comando | Descripción |
|---|---|
| `arai status` | Estado de todos los agentes |
| `arai install opencode --global` | Instala agente globalmente |
| `arai install opencode --project .` | Instala en proyecto (env var) |
| `arai install opencode --project . --copy` | Instala en proyecto (copia) |
| `arai uninstall opencode` | Elimina instalación global |
| `arai update` | `git pull` + re-aplica todo |
| `arai transform skills --to cursor` | Transforma SKILL.md → reglas Cursor |
| `arai transform skills --all` | Transforma a todos los formatos |

## Flujo de trabajo

### Skills: escribe una vez, usa en todas partes

```
shared/skills/git/SKILL.md
  ├── opencode: consume directo (nativo)
  ├── claude:   consume directo (nativo)
  ├── cursor:   arai transform skills --to cursor → platforms/cursor/rules/
  └── codex:    arai transform skills --to codex  → platforms/codex/
```

### Herencia de configuración (opencode)

```
remote (.well-known/opencode)
  └── global (~/.config/opencode/)       ← arai install --global
       └── proyecto (opencode.json)       ← arai install --project --copy
```

## Agentes disponibles

### opencode

- **opencode.json** — config con `$schema`, skills paths, MCP, permisos
- **Agentes**: build, plan, reviewer, tester, docs
- **Comandos**: `/test`, `/deploy`, `/commit`
- **Plugins**: example.ts (template)
- **MCP**: playwright, github (deshabilitados por defecto)

### Claude Code

- CLAUDE.md con reglas globales
- Compatible con shared/skills/ (formato nativo)

### Cursor

- .cursorrules base
- Reglas generadas vía `arai transform skills --to cursor`

### Codex

- Config transformada desde shared/skills/

## Requisitos

- Node.js 18+
- npm 9+
- opencode, Claude Code, Cursor o Codex (según el agente a usar)

## Licencia

MIT
