# Comandos esenciales y TUI

## Idea central

La TUI de OpenCode está diseñada para ser eficiente: todo se maneja desde el teclado, con atajos y comandos slash que aceleran el flujo de trabajo.

## Navegación en la TUI

```
┌─────────────────────────────────┐
│  Panel de conversación          │
│  (historial de mensajes)        │
├─────────────────────────────────┤
│  Entrada de texto               │
│  > /                            │
└─────────────────────────────────┘
```

### Atajos de teclado

| Tecla | Acción |
|-------|--------|
| `Ctrl+C` | Cancelar / salir |
| `Ctrl+L` | Limpiar pantalla |
| `↑ / ↓` | Navegar historial de prompts |
| `Tab` | Autocompletar comandos |
| `Esc` | Cerrar panel / cancelar |

## Comandos slash (/)

Los comandos slash son la forma principal de interactuar con OpenCode:

```bash
/help       → Muestra todos los comandos disponibles
/plan       → Crea un plan sin ejecutar código
/build      → Ejecuta el plan y construye
/test       → Ejecuta tests
/commit     → Crea un commit convencional
/deploy     → Despliega el proyecto
/review     → Revisa el código (invoca subagente)
/docs       → Genera documentación
```

### Diferencia entre /plan y /build

| /plan | /build |
|-------|--------|
| Solo analiza y propone | Ejecuta cambios |
| No modifica archivos | Crea y edita archivos |
| Pide confirmación | Pide confirmación |
| Ideal para explorar | Ideal para ejecutar |

## Comandos especiales

```bash
/clear      → Limpia el contexto de la conversación
/status     → Muestra el estado del agente y archivos
/session    → Gestiona sesiones de trabajo
/timeline   → Historial de cambios realizados
```

## Modos de trabajo

OpenCode tiene dos modos principales que se alternan con `/plan` y `/build`:

1. **Plan mode** — El agente analiza, piensa y propone sin tocar archivos
2. **Build mode** — El agente ejecuta el plan, crea y modifica archivos

```bash
# Flujo recomendado
/plan "Añade un endpoint de login"  # Primero planifica
# ... revisas el plan ...
/build                               # Luego construye
```

## Buenas prácticas

- Empieza siempre con `/plan` para tareas complejas
- Usa `/clear` entre tareas no relacionadas para evitar contaminación de contexto
- Aprende los atajos de teclado para no sacar las manos del teclado

## Enlaces

- [[01-Instalacion-y-primeros-pasos|Anterior: Instalación y primeros pasos]]
- [[03-Modos-build-y-plan|Siguiente: Modos build y plan]]
- Video: [Curso de OpenCode desde cero](https://www.youtube.com/watch?v=ZZq4TpNgnvg) — Capítulo 2
