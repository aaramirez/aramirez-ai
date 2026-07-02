# Especificaciones

## Spec-driven Development

La **especificación (spec)** es la base de todo desarrollo con IA. Sin una spec clara, la IA genera código genérico que rara vez cumple lo que necesitas.

> *"Una buena especificación es el 50% del trabajo hecho."*

## ¿Qué debe incluir una spec?

```md
## Funcionalidad: Login de usuarios

### Objetivo
Permitir que usuarios registrados accedan a la aplicación.

### Criterios de aceptación
- [ ] Formulario con email y contraseña
- [ ] Validación en cliente y servidor
- [ ] Mensajes de error claros
- [ ] Redirección al dashboard tras login exitoso
- [ ] Token JWT almacenado en httpOnly cookie

### Tecnologías
- Next.js 14 (App Router)
- Prisma + PostgreSQL
- bcrypt para passwords
- next-auth para sesiones

### No incluye
- Registro de usuarios (será otro issue)
- Recuperación de contraseña
```

## Formatos de especificación

| Formato | Cuándo usarlo |
|---------|---------------|
| **Markdown** | Proyectos pequeños, documentación ligera |
| **Issue template** | GitHub Issues con checklist |
| **Architectural Decision Records (ADR)** | Decisiones importantes de arquitectura |
| **User Stories** | Desarrollo ágil con equipo |

## De la spec al código con IA

1. Escribir spec detallada → archivo .md
2. Compartir spec con la IA como contexto
3. IA genera código basado en la spec
4. Revisar que el código cumple cada punto
5. Marcar criterios como completados

## Beneficios

- **Menos iteraciones** — La IA acierta más al primer intento
- **Código más coherente** — Sigue un plan, no es aleatorio
- **Mejor para multiagentes** — Cada agente sabe exactamente qué hacer
- **Documentación viva** — La spec es el germen de la documentación

## Enlaces

- [[04-Criterio-y-buenas-practicas|Anterior: Criterio y buenas prácticas]]
- [[Módulo 2 — Agentes/01-Que-es-un-agente|Siguiente módulo: ¿Qué es un agente?]]
- [[Módulo 3 — Multiagentes/03-Orquestacion-y-flujos|Orquestación basada en specs]]
