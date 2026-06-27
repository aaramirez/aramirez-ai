# Caso práctico completo

## Escenario

Construir una **API de gestión de tareas** con autenticación, operaciones CRUD, y tests usando un flujo multiagente.

## Paso 1: Planificación

**Agente: plan**

```
Input: "API REST para gestión de tareas con Node.js, Express, SQLite"
Output:
├── Fase 1: Setup del proyecto
├── Fase 2: Autenticación JWT
├── Fase 3: CRUD de tareas
├── Fase 4: Tests
└── Fase 5: Documentación
```

Cada fase incluye especificaciones detalladas (ver [[Módulo 1 — Fundamentos/05-Especificaciones]]).

## Paso 2: Implementación

**Agente: build**

Basado en las specs de la fase 1, el agente build genera:

```
project/
├── package.json
├── src/
│   ├── index.js
│   ├── routes/
│   ├── middleware/
│   └── models/
└── tests/
```

## Paso 3: Revisión

**Agente: reviewer**

```bash
/review
```

El reviewer verifica:
- [ ] Estructura del proyecto correcta
- [ ] Seguridad en autenticación
- [ ] Manejo de errores
- [ ] Sin secretos hardcodeados
- [ ] Sigue convenciones del proyecto

## Paso 4: Tests

**Agente: tester**

```bash
/test
```

El tester:
1. Detecta el framework de tests (Vitest, Jest, etc.)
2. Genera tests para cada endpoint
3. Ejecuta los tests
4. Reporta resultados

## Paso 5: Documentación

**Agente: docs**

```bash
/docs
```

Genera:
- README.md con instrucciones de instalación y uso
- Documentación de la API (endpoints, parámetros, ejemplos)
- CHANGELOG.md

## Flujo completo

```
1. Plan → spec.md                    [Agente plan]
2. Build → código                    [Agente build]
3. Review → fixes                    [Agente reviewer]
4. Test → tests + ejecución          [Agente tester]
5. Docs → README + API docs          [Agente docs]
6. Commit → conventional commit      [Comando /commit]
```

## Lecciones aprendidas

- **La spec inicial ahorra horas de iteración**
- **El reviewer encuentra problemas que el build no ve**
- **Los tests generados por IA necesitan revisión humana**
- **La documentación es mucho mejor cuando parte de una spec**

## Enlaces

- [[03-Orquestacion-y-flujos|Anterior: Orquestación y flujos]]
- [[05-Produccion-y-mantenimiento|Siguiente: Producción y mantenimiento]]
- [[Recursos/Comandos-utiles|Comandos útiles para el flujo]]
