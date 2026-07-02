# Caso práctico completo: App de Running

## Idea central

Construir una aplicación completa paso a paso usando todas las herramientas de OpenCode: spec.md, agents.md, skills, comandos, sesiones y modelos.

*Basado en el caso práctico del Capítulo 3 del video.*

## El proyecto

**App de Running** — Una aplicación para registrar carreras, ver estadísticas y hacer seguimiento del progreso.

```
running-app/
├── spec.md
├── AGENTS.md
├── src/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   └── utils/
├── server/
│   ├── routes/
│   └── db/
└── tests/
```

## Paso 1: Definir el spec.md

```markdown
# Running App

## Funcionalidades
- [ ] Registro y login de usuarios
- [ ] Registrar carreras: distancia, tiempo, fecha
- [ ] Dashboard con estadísticas
- [ ] Historial de carreras
- [ ] Gráficos de progreso

## Stack
- Frontend: React + Vite + TypeScript + Tailwind
- Backend: Node.js + Express + SQLite
- Tests: Vitest
```

## Paso 2: Configurar agents.md

```markdown
# Running App

## Stack
React + Vite + TypeScript + Tailwind (frontend)
Node.js + Express + SQLite (backend)

## Convenciones
- camelCase para funciones y variables
- PascalCase para componentes React
- Tests junto al componente: `LoginForm.test.tsx`
- Commits en español: `feat(auth): agregar registro de usuarios`
```

## Paso 3: Crear el proyecto

```bash
mkdir running-app && cd running-app
opencode
```

```
/plan "Inicializa proyecto con Vite + React + TypeScript, Express backend, y SQLite según spec.md"
/build
```

## Paso 4: Implementar autenticación

```
/plan "Implementa registro y login:
  - Formularios con validación Zod
  - Endpoints /api/auth/register y /api/auth/login
  - JWT para sesiones
  - Tests de integración"
/build
```

## Paso 5: Registrar carreras

```
/plan "CRUD de carreras:
  - Formulario: distancia, tiempo, fecha
  - Endpoint /api/runs (GET, POST, DELETE)
  - Validación de datos
  - Calcular ritmo automáticamente"
/build
```

## Paso 6: Dashboard y estadísticas

```
/plan "Dashboard con:
  - Total KM acumulados
  - Media de ritmo
  - Mejor marca
  - Gráfico de progreso semanal"
/build
```

## Paso 7: Revisión y calidad

```bash
/review          # Revisión de código
/test            # Ejecutar tests
/timeline        # Ver historial
```

## Paso 8: Finalizar

```bash
/commit "feat: app de running completa con auth, CRUD y dashboard"
/session export "running-app-v1"
```

## Lecciones del caso práctico

1. **Empieza con spec.md** — Define antes de construir
2. **Itera en pequeñas tandas** — Un plan, un build, un commit
3. **Usa /plan siempre** — Más barato que corregir
4. **Revisa con /timeline** — Siempre puedes revertir
5. **Documenta con agents.md** — El contexto permanente mejora cada interacción

## Enlaces

- [[10-Sesiones-y-automatizacion|Anterior: Sesiones y automatización]]
- [[05-Construyendo-proyectos|Construyendo proyectos (detalle)]]
- [[Módulo 3 — Multiagentes/04-Caso-practico-completo|Caso práctico multiagente]]
- Video: [Curso de OpenCode desde cero](https://www.youtube.com/watch?v=ZZq4TpNgnvg) — Capítulo 3
