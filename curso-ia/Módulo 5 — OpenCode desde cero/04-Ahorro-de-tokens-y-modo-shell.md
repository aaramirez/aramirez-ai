# Ahorro de tokens y modo shell

## Idea central

Los tokens son el combustible de la IA. Aprender a gestionarlos significa **gastar menos y obtener mejores resultados**. OpenCode incluye herramientas específicas para optimizar el consumo.

## Estrategias para ahorrar tokens

### 1. Usar `/clear` entre tareas

Cada conversación acumula contexto. Al terminar una tarea:

```bash
/clear  # Limpia el contexto, empieza fresco
```

Esto evita que el agente arrastre información innecesaria de tareas anteriores.

### 2. Especificar archivos concretos

En lugar de dejar que el agente explore todo el proyecto:

```
# Mal: contexto innecesario
"Refactoriza toda la app"

# Bien: acotado
"Refactoriza src/utils/auth.ts y src/utils/validation.ts"
```

### 3. Usar `/plan` antes de `/build`

Planificar gasta menos tokens que generar código incorrecto y tener que corregirlo.

### 4. Controlar el límite de tokens

OpenCode permite configurar el límite máximo de tokens por respuesta:

```json
{
  "model": {
    "maxTokens": 4096
  }
}
```

## Modo Shell

El modo shell permite ejecutar comandos directamente desde OpenCode sin salir de la TUI.

```bash
# Dentro de OpenCode:
shell: npm test
shell: git status
shell: node --check src/index.js
```

### Ventajas del modo shell

- No necesitas abrir otra terminal
- OpenCode ve la salida del comando y puede reaccionar
- Ideal para depuración rápida

### Uso combinado

```
# 1. El agente sugiere un cambio
# 2. Verificas con shell
shell: npm run lint
# 3. Si hay errores, el agente los ve y corrige
```

## Importancia del historial

OpenCode mantiene un **historial de comandos** que puedes navegar con `↑/↓`.

```
↑ → recupera el último prompt
↑ → recupera el anterior
```

### ¿Por qué importa?

- **Reutilización**: puedes repetir prompts complejos sin reescribirlos
- **Iteración**: corrige prompts anteriores con pequeños cambios
- **Aprendizaje**: ver qué prompts funcionaron mejor

## Consejos del video

> *"Cada token que ahorras es dinero que no gastas. Sé preciso en tus prompts."* — Midudev

> *"El modo shell es tu mejor amigo para depurar: el agente ve los errores y los arregla solo."* — Midudev

## Enlaces

- [[03-Modos-build-y-plan|Anterior: Modos build y plan]]
- [[05-Construyendo-proyectos|Siguiente: Construyendo proyectos]]
- [[Módulo 1 — Fundamentos/02-Prompts-efectivos|Prompts efectivos]]
- Video: [Curso de OpenCode desde cero](https://www.youtube.com/watch?v=ZZq4TpNgnvg) — Capítulo 2
