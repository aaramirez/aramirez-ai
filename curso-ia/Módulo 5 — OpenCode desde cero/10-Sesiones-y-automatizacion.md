# Sesiones y automatización

## Idea central

OpenCode gestiona el trabajo en **sesiones** que puedes guardar, compartir y reanudar. También puedes ejecutarlo desde la terminal sin TUI para automatizar flujos.

## Sesiones de trabajo

Cada vez que usas OpenCode, trabajas en una **sesión**. La sesión guarda:

- Historial de conversación
- Archivos modificados
- Contexto del proyecto

```bash
# Ver sesiones disponibles
/session list

# Cambiar a otra sesión
/session switch <nombre>

# Crear una nueva sesión
/session new
```

### ¿Para qué sirven las sesiones?

- **Contextos separados**: una sesión para frontend, otra para backend
- **Experimentar**: prueba enfoques en sesiones distintas sin contaminar
- **Reanudar trabajo**: retoma donde lo dejaste

## Compartir sesiones de código

Puedes exportar una sesión para compartirla con otros:

```bash
# Exportar sesión
/session export <nombre>

# El resultado es un archivo que se puede compartir
# Quien lo recibe puede importarlo
/session import <archivo>
```

Esto es útil para:

- Compartir debugging con compañeros
- Demostrar un flujo de trabajo
- Guardar contexto para revisión

## Ejecutar OpenCode desde la terminal

Puedes usar OpenCode directamente desde la terminal sin la TUI interactiva:

```bash
# Ejecutar un prompt directo
opencode "Refactoriza src/utils.ts y crea tests"

# Con archivo de especificación
opencode "Implementa lo que hay en spec.md"

# Con pipes
cat spec.md | opencode "Implementa esto"
```

### Automatización con scripts

```bash
#!/bin/bash
# script-build.sh
opencode "Limpia el código, ejecuta tests y despliega" --non-interactive
```

Esto permite integrar OpenCode en pipelines de CI/CD.

## Crear servidores y aplicaciones web

OpenCode puede ayudarte a crear y gestionar servidores web completos:

```bash
/plan "Crea un servidor Express con rutas CRUD para usuarios"
/build
shell: npm start
```

El agente puede:

- Crear el servidor desde cero
- Configurar rutas y middleware
- Ayudar a depurar errores en tiempo real
- Sugerir mejoras de rendimiento y seguridad

## Flujo de automatización típico

```
1. /session new "feature-auth"    → Nueva sesión para la feature
2. Desarrollas con /plan y /build
3. /commit                          → Commit de los cambios
4. /session export "feature-auth"   → Guardas la sesión
5. opencode "Despliega a staging"   → Automatización desde terminal
```

## Enlaces

- [[09-Comandos-personalizados|Anterior: Comandos personalizados]]
- [[11-Caso-practico-completo|Siguiente: Caso práctico completo]]
- Video: [Curso de OpenCode desde cero](https://www.youtube.com/watch?v=ZZq4TpNgnvg) — Capítulo 6
