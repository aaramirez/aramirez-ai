# Comandos útiles

## CLI arai

```bash
# Estado de todos los agentes
arai status

# Instalar opencode en el proyecto actual
arai install

# Instalar un componente específico
arai install skill git
arai install agent build

# Actualizar configuración
arai update
arai sync           # Re-aplicar configuración en proyectos

# Desinstalar
arai uninstall
arai uninstall skill git

# Transformar skills a otros formatos
arai transform skills --all
arai transform skills --to cursor
```

## YouTube Transcript

```bash
# Usando el script de este repo
node shared/scripts/youtube-transcript.js <video-id>
node shared/scripts/youtube-transcript.js <video-id> --lang es

# Ejemplos
node shared/scripts/youtube-transcript.js GarWqdHzwac
node shared/scripts/youtube-transcript.js https://youtu.be/GarWqdHzwac

# Guardar a archivo
node shared/scripts/youtube-transcript.js GarWqdHzwac > transcripcion.md
```

## opencode

### Comandos slash (/)

```
# Navegación y control
/help       → Mostrar todos los comandos disponibles
/clear      → Limpiar contexto de la conversación
/status     → Estado del agente y archivos
/session    → Gestionar sesiones de trabajo

# Desarrollo
/plan       → Planificar sin modificar archivos
/build      → Ejecutar el plan y construir
/timeline   → Ver historial de cambios realizados
/revert     → Revertir cambios

# Utilidades
/test       → Ejecutar tests
/commit     → Crear commit convencional
/deploy     → Desplegar proyecto
/review     → Revisar código (subagente)
/docs       → Generar documentación (subagente)
/lint       → Ejecutar linter
```

### Modo shell

```
# Ejecutar comandos sin salir de OpenCode
shell: npm test
shell: git status
shell: node --check src/index.js
```

### Lanzar OpenCode

```bash
# Iniciar en un proyecto
opencode

# Con un modelo específico
opencode --model anthropic/claude-sonnet-4-6

# Modo no interactivo (automatización)
opencode "Refactoriza src/utils.ts" --non-interactive

# Con archivo de especificación
opencode "Implementa lo que hay en spec.md"
```

### Gestión de sesiones

```bash
# Dentro de OpenCode:
/session list            → Ver sesiones
/session switch <nombre> → Cambiar de sesión
/session new             → Crear nueva sesión
/session export <nombre> → Exportar sesión
/session import <archivo>→ Importar sesión
```

### Atajos de teclado en TUI

```
Ctrl+C    → Cancelar / salir
Ctrl+L    → Limpiar pantalla
↑ / ↓     → Navegar historial de prompts
Tab       → Autocompletar comandos
Esc       → Cerrar panel / cancelar
```

## Git

```bash
# Commit convencional
git add -A && git commit -m "feat(auth): add login endpoint"

# Pull con rebase
git pull --rebase

# Merge con fast-forward
git merge --ff-only feature-branch
```

## Node.js

```bash
# Verificar sintaxis
node --check archivo.js

# Ejecutar script ESM
node archivo.js

# Instalar dependencias
npm install

# Ejecutar tests
npm test
npx vitest
npx jest
```

## npm / npx

```bash
# Crear link global
npm link

# Ejecutar paquete sin instalar
npx playwright test
npx @playwright/mcp

# Ver paquetes desactualizados
npm outdated
```

## Utilidades

```bash
# Buscar en archivos (cross-platform con node)
node -e "const fs=require('fs'); const p='./'; const files=fs.readdirSync(p); files.forEach(f=>console.log(f))"

# Ver estructura de directorios
find . -type f -not -path '*/node_modules/*' -not -path '*/.git/*' | sort
```
