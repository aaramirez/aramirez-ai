# Construyendo proyectos

## Idea central

OpenCode brilla cuando se usa desde el inicio de un proyecto. La combinación de **spec.md**, **tareas agrupadas** y **timeline** permite construir software de forma estructurada y reversible.

## Crear un proyecto desde cero

```bash
mkdir mi-app && cd mi-app
opencode
```

Dentro de OpenCode:

```
/plan "Crea una app de running con React, Vite y TypeScript"
```

El agente analizará, propondrá estructura de carpetas, y al hacer `/build` generará todo el proyecto.

## Especificación en archivos MD (spec.md)

El archivo `spec.md` es la **fuente de verdad** del proyecto. Define qué construir sin entrar en detalles de implementación.

```markdown
# Running App

## Funcionalidades

- [ ] Registro de usuarios con email y contraseña
- [ ] Login con JWT
- [ ] Registrar carreras (distancia, tiempo, fecha)
- [ ] Ver historial de carreras
- [ ] Estadísticas básicas (KM total, media, mejores marcas)

## Stack

- Frontend: React + Vite + TypeScript + Tailwind
- Backend: Node.js + Express + SQLite
- Tests: Vitest
```

### Beneficios

- La IA entiende mejor el contexto
- Puedes iterar sobre el spec antes de escribir código
- Sirve como documentación viva del proyecto

## Agrupamiento de tareas

Para proyectos grandes, agrupa tareas relacionadas:

```
/plan "Implementa el módulo de autenticación según spec.md:
  - formulario de registro y login
  - validación con Zod
  - endpoints de auth
  - tests de integración"
```

El agente procesará el grupo como una unidad coherente, generando código consistente.

## Comando Timeline

`/timeline` muestra el historial completo de cambios realizados por el agente.

```bash
/timeline

# Muestra:
# [10:30] Crear src/components/LoginForm.tsx
# [10:31] Crear src/hooks/useAuth.ts
# [10:32] Modificar src/App.tsx
# [10:34] Ejecutar npm install zod
```

### Revertir cambios

Si algo no funciona, puedes revertir al estado anterior:

```bash
/timeline        # Ver cambios
/revert          # Revertir último cambio
/revert --all    # Revertir todos los cambios de la sesión
```

## Personalizar el editor

OpenCode permite personalizar la apariencia:

```json
{
  "theme": {
    "mode": "dark",
    "primaryColor": "#00ff00",
    "fontSize": 14
  }
}
```

## Caso práctico: App de Running

Durante el video se construyó una **app de running** completa:

1. **Spec**: Se definió en spec.md
2. **Plan**: `/plan` para diseñar la arquitectura
3. **Build**: `/build` para generar el código
4. **Iteración**: Se fueron añadiendo funcionalidades incrementalmente
5. **Timeline**: Se usó `/timeline` para revisar y revertir cuando fue necesario

```bash
# Flujo completo
/plan "Crea la app según spec.md"
/build
/timeline
# Revisar y repetir
```

## Enlaces

- [[04-Ahorro-de-tokens-y-modo-shell|Anterior: Ahorro de tokens y modo shell]]
- [[06-Modelos-y-suscripciones|Siguiente: Modelos y suscripciones]]
- [[Módulo 1 — Fundamentos/05-Especificaciones|Especificaciones]]
- [[Módulo 3 — Multiagentes/04-Caso-practico-completo|Casos prácticos multiagente]]
- Video: [Curso de OpenCode desde cero](https://www.youtube.com/watch?v=ZZq4TpNgnvg) — Capítulo 3
