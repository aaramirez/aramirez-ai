---
name: command-creator
description: Create custom opencode commands for repetitive tasks with templates and optional agent/model overrides.
license: MIT
scripts:
  - create-command.js
  - create-base.js
---

# Creador de comandos

## Sintaxis de comandos

### Template
Define el prompt que se ejecuta al invocar el comando. Puede incluir la variable `$ARGUMENTS` que se reemplaza con los argumentos del usuario en tiempo de ejecución.

```
"Ejecuta el linter y corrige los errores encontrados en: $ARGUMENTS"
```

### Description
Texto breve que aparece en el autocompletado con `@`. Ayuda al usuario a recordar qué hace cada comando.

## Agent / Model override
Cada comando puede especificar un agente o modelo diferente al del contexto actual, permitiendo rutas especializadas sin cambiar de chat.

## Archivos markdown alternativos
Los comandos también pueden definirse como archivos `.md` independientes, útiles para comandos largos o con mucha documentación.

## Uso

```bash
node .opencode/scripts/create-command.js --name test --description "Run tests" --template "Run test suite with coverage" --output ./command.json
```
