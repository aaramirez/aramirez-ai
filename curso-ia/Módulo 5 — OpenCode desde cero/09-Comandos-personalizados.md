# Comandos personalizados

## Idea central

OpenCode permite crear **comandos slash personalizados** para tareas frecuentes. En lugar de escribir el mismo prompt cada vez, creas un atajo.

> *"Los comandos personalizados son macros de productividad: un / y lo que sea que necesites hacer."* — Midudev

## Definir comandos en opencode.json

```json
{
  "command": {
    "test": {
      "description": "Ejecutar tests y reportar resultados",
      "template": "Ejecuta el suite de tests y reporta resultados detallados. Si hay fallos, sugiere correcciones."
    },
    "deploy": {
      "description": "Desplegar a producción",
      "template": "Despliega el proyecto a producción siguiendo el proceso definido en docs/deploy.md."
    },
    "commit": {
      "description": "Commit convencional",
      "template": "Crea un commit convencional basado en los cambios actuales. Usa el formato: tipo(ámbito): descripción."
    },
    "lint": {
      "description": "Ejecutar linter",
      "template": "Ejecuta el linter del proyecto y corrige los errores automáticamente."
    }
  }
}
```

## Cómo funcionan

Cuando escribes `/test` en OpenCode:

1. OpenCode busca en `command.test` de la configuración
2. Usa el `template` como prompt semilla
3. Añade el contexto actual del proyecto
4. Ejecuta el agente con esas instrucciones

## Comandos con parámetros

Puedes definir comandos que acepten entrada adicional:

```json
{
  "command": {
    "generate": {
      "description": "Generar un componente",
      "template": "Crea un componente {{name}} en src/components/ siguiendo las convenciones del proyecto. Incluye tests y documentación."
    },
    "api": {
      "description": "Crear un endpoint API",
      "template": "Crea un endpoint {{method}} {{path}} en el backend siguiendo la arquitectura existente."
    }
  }
}
```

Uso:

```bash
/generate LoginForm
/api "POST /users/register"
```

## Estrategias para buenos comandos

1. **Descriptivos**: el template debe guiar al agente paso a paso
2. **Concisos**: no demasiado largos, o mejor usa una skill
3. **Reutilizables**: diseñados para usarse muchas veces
4. **Específicos del proyecto**: aprovechan las convenciones definidas en agents.md

## Comandos vs Skills

| Comando | Skill |
|---------|-------|
| Atajo para un prompt | Instrucción detallada y estructurada |
| Se define en JSON | Se define en SKILL.md |
| Ideal para tareas rápidas | Ideal para flujos complejos |
| Un template corto | Documento completo con ejemplos |

## Enlaces

- [[08-Skills-personalizadas|Anterior: Skills personalizadas]]
- [[10-Sesiones-y-automatizacion|Siguiente: Sesiones y automatización]]
- Video: [Curso de OpenCode desde cero](https://www.youtube.com/watch?v=ZZq4TpNgnvg) — Capítulo 5
