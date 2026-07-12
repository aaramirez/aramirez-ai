# Módulo 8: Comandos Personalizados y Scripts

## El Key `command` en opencode.json

Los comandos personalizados se definen bajo la clave `command` en `opencode.json`. Cada comando tiene:

```json
{
  "command": {
    "test": {
      "description": "Ejecuta la suite de tests",
      "template": "Ejecuta npm test y reporta resultados detallados",
      "agent": "tester",
      "model": "opencode/big-pickle"
    }
  }
}
```

## Estructura de un Comando

| Campo | Descripción | Obligatorio |
|-------|-------------|-------------|
| `template` | Instrucción que se inyecta al agente al invocar el comando | Sí |
| `description` | Texto descriptivo para `opencode list commands` | No |
| `agent` | Agente específico a usar (default: agente activo) | No |
| `model` | Modelo específico a usar | No |

## Variable $ARGUMENTS

Los comandos aceptan parámetros con la variable `$ARGUMENTS`:

```json
{
  "deploy": {
    "description": "Despliega una rama a producción",
    "template": "Despliega la rama $ARGUMENTS a producción siguiendo el runbook"
  }
}
```

Uso: `opencode deploy feature-x`

## Archivos Markdown Alternativos

Los comandos también pueden definirse como archivos `.md` independientes en `.opencode/commands/`:

```
.opencode/commands/
├── test.md
├── deploy.md
├── commit.md
└── review.md
```

Cada archivo contiene el template y frontmatter con metadata.

## Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `test` | Ejecuta la suite de tests y reporta resultados |
| `deploy` | Despliega a un entorno específico |
| `commit` | Prepara y ejecuta un commit convencional |
| `lint` | Corre el linter y auto-corrige |
| `review` | Revisa el código pendiente |

## Scripts Reutilizables

Los scripts se almacenan en `.opencode/scripts/` y pueden ser invocados por comandos o directamente:

```bash
node .opencode/scripts/mi-script.js --arg valor
```

## Scripts de Creación

```bash
# Crear comando
node .opencode/scripts/create-command.js \
  --name test \
  --description "Ejecuta tests" \
  --template "Run the test suite and report results"

# Crear script
node .opencode/scripts/create-script.js \
  --name mi-script \
  --lang js \
  --description "Utilidad" \
  --output ./.opencode/scripts/mi-script.js
```

## Práctica

Crea 3 comandos personalizados para tu flujo de trabajo:

1. `test` — ejecuta tests con el agente `tester`
2. `commit` — genera un mensaje de commit convencional
3. `review` — revisa el código en staging con el agente `reviewer`

Verifica que aparecen con `opencode list commands` y pruébalos uno por uno.
