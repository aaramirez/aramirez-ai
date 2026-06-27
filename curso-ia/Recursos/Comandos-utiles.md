# Comandos útiles

## CLI arai

```bash
# Estado de todos los agentes
arai status

# Instalar agentes
arai install opencode --global
arai install claude --global

# Instalar en proyecto (modo env-var)
arai install opencode --project .

# Instalar en proyecto (modo copia)
arai install opencode --project . --copy

# Actualizar configuración
arai update
arai sync           # Re-aplicar en proyectos con --copy

# Desinstalar
arai uninstall opencode
arai uninstall opencode --project . --copy

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

```
# Comandos disponibles
/test       → Ejecutar tests
/deploy     → Desplegar proyecto
/commit     → Crear commit convencional

# Subagentes
/review     → Revisar código
/docs       → Generar documentación
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
