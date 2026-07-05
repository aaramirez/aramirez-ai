# Módulo 7: Gestión de Contexto

## Compaction

El harness comprime el historial automáticamente para mantener el contexto dentro del límite de ventana del modelo.

- **auto** (default: `true`): compaction automático cuando se acerca al límite.
- **prune**: poda agresiva de turnos antiguos.
- **reserved**: porcentaje de contexto reservado para el siguiente turno.

Configuración en `opencode.json`:

```json
{
  "context": {
    "compaction": { "auto": true, "prune": false, "reserved": 0.2 }
  }
}
```

## Memoria

La memoria provee persistencia *cross-session* mediante archivos planos en `.opencode/memory/`. Los datos sobreviven entre sesiones y pueden ser consultados por el agente.

## Reglas Anthropic para Cache

1. **No cambiar el system prompt mid-session**: invalida el cache de contexto y fuerza un reprocesamiento completo.
2. **No cambiar de modelo mid-session**: cada modelo tiene su propia representación interna; alternar entre ellos rompe la coherencia.
3. **Usar subagentes con modelos más baratos**: delega subtareas (búsqueda, validación) a modelos pequeños; reserva el modelo grande para razonamiento complejo.

## Context Editing

El harness limpia *tool results* viejos automáticamente. Puedes forzar la limpieza con `opencode context clear` o editar el contexto manualmente.

## Snapshot

El sistema mantiene un snapshot del estado para permitir undo/redo de cambios. Los snapshots se almacenan en `.opencode/snapshots/`.

## Tool Output Limits

Para prevenir saturación del contexto, cada herramienta tiene límites configurables:

```json
{
  "tools": {
    "outputLimit": {
      "max_lines": 500,
      "max_bytes": 10240
    }
  }
}
```

## Buenas Prácticas para Sesiones Largas

1. Usa compaction automático con `reserved` suficiente (0.2-0.3).
2. Divide tareas grandes en subtareas con subagentes.
3. Persiste resultados intermedios en archivos de memoria.
4. Limpia tool results irrelevantes periódicamente.
5. Reevalúa si el modelo empieza a perder coherencia — quizás necesitas un nuevo turno.

## Práctica

Configura compaction óptimo para un proyecto grande: activa `auto`, desactiva `prune`, reserva 25% de contexto, y establece tool output limits de 300 líneas y 8KB. Verifica el comportamiento con `opcode status context`.
