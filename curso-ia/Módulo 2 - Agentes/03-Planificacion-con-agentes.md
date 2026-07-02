# Planificación con agentes

## Por qué planificar

Uno de los mayores errores al usar IA es lanzarse a escribir código sin plan. La IA genera código rápido, pero sin dirección produce resultados inconsistentes.

> *"La planificación es lo que separa un proyecto bien hecho de un prototipo."*

## Flujo de planificación

1. Describir el problema en lenguaje natural
2. La IA ayuda a descomponerlo en tareas
3. Definir arquitectura y tecnologías
4. Estimar esfuerzo y dependencias
5. Escribir specs para cada tarea
6. Ejecutar con agentes

## Rol del agente "plan"

En opencode puedes tener un agente dedicado a planificar:

```json
{
  "agent": {
    "plan": {
      "mode": "primary",
      "description": "Planning agent for architecture and design",
      "permission": { "edit": "deny" }
    }
  }
}
```

Este agente **no escribe código**, solo analiza y planifica. Esto evita que se salte el proceso.

## Técnicas de planificación

### 1. Descomposición funcional

Divide el proyecto en funciones atómicas. Cada función debe:
- Hacer una sola cosa
- Poder implementarse independientemente
- Tener criterios de aceptación claros

### 2. Mapa de dependencias

```
[Autenticación] → [Perfil de usuario] → [Dashboard]
                                      → [Notificaciones]
```

Las dependencias definen el orden de implementación.

### 3. Specs por tarea

Cada tarea tiene su propia especificación detallada (ver [[Módulo 1 — Fundamentos/05-Especificaciones]]).

## Ejemplo práctico

**Problema**: "App de gestión de tareas"

**Plan generado con IA**:

Fase 1: Setup (Next.js, Prisma, Tailwind)
Fase 2: Autenticación (next-auth, login/register)
Fase 3: CRUD de tareas (crear, leer, actualizar, eliminar)
Fase 4: Filtros y búsqueda
Fase 5: Testing y deploy

Cada fase tiene su propia spec con criterios de aceptación.

## Errores comunes

- **Sobreplanificar** — Demasiado tiempo planificando, poco ejecutando
- **No planificar** — Ir directo al código, resultados inconsistentes
- **Plan sin criterios** — No saber cuándo una tarea está completa

## Enlaces

- [[02-Configuracion-de-agentes|Anterior: Configuración de agentes]]
- [[04-Testing-y-calidad|Siguiente: Testing y calidad]]
- [[Módulo 3 — Multiagentes/03-Orquestacion-y-flujos|Orquestación de flujos]]
