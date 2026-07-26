# Plan: Corregir instrucciones de instalación de arai

## Problema

El tutorial principal (`01-instalar-arai.md`) nunca ejecuta `npm link`, por lo que los usuarios terminan con `command not found: arai`. El archivo de troubleshooting sugiere un workaround (`node bin/arai.js`) en vez de la solución real.

## Archivos a corregir

### 1. `tutoriales-arai/01-Instalacion/01-instalar-arai.md` — CRÍTICO

**Estado actual**: 3 pasos (clonar → npm install → verificar con `node bin/arai.js`)
**Problema**: Falta `npm link`. Los usuarios no pueden usar `arai` como comando global.

**Cambios**:
- Agregar **Paso 3: Registrar arai como comando global** con `npm link`
- Mover verificación al **Paso 4** usando `arai --help` (no `node bin/arai.js`)
- Actualizar la sección de verificación para confirmar que `arai` funciona desde cualquier directorio
- Agregar nota sobre `npm unlink` para desinstalar

### 2. `tutoriales-arai/01-Instalacion/04-solucion-problemas.md` — ALTO

**Estado actual**: Para "command not found: arai" sugiere `cd aramirez-ai && npm install && node bin/arai.js --help`
**Problema**: Es un workaround, no la solución real. Debería decir "ejecuta `npm link`".

**Cambios**:
- Reemplazar la solución por: `cd ~/.config/aramirez && npm link`
- Explicar que `npm link` crea el symlink global
- Agregar troubleshooting adicional: "Si npm link falla con EACCES" → `sudo npm link`

### 3. `curso-ia/Recursos/Comandos-utiles.md` — MEDIO

**Estado actual**: Líneas 10-11 listan `arai install opencode --global` y `arai install claude --global`
**Problema**: Estos flags no existen en el CLI. Son comandos inventados/obsoletos.

**Cambios**:
- Eliminar o corregir las líneas 10-11 (`--global` y `claude` no son argumentos válidos)
- Reemplazar con los comandos reales: `arai install` (instala opencode en el proyecto actual)
- Mover la mención de `npm link` (línea 154) a una sección de "Instalación de arai" si existe, o eliminarla si está fuera de contexto

### 4. `tutoriales-arai/01-Instalacion/Index.md` — BAJO

**Estado actual**: Describe el tutorial 01 como "clonar el repositorio, instalar dependencias y verificar la instalación"
**Problema**: La descripción no menciona `npm link`.

**Cambios**:
- Actualizar la descripción del paso 1 para incluir "registrar como comando global"

## Archivos que NO necesitan cambios

| Archivo | Razón |
|---------|-------|
| `README.md` | Ya tiene `npm link` correctamente |
| `AGENTS.md` | Documenta comandos del CLI, no su instalación |
| `02-primer-proyecto.md` | Referencia al tutorial 01 como prerequisito — se beneficia automáticamente |
| `03-instalar-en-existente.md` | Asume arai ya instalado — correcto |
| `shared/templates/partials/AGENTS.md` | Template para proyectos scaffolded |
| Otros tutoriales | Usan `arai` como comando asumiendo instalación previa |

## Validación

```bash
# 1. Verificar que los archivos editados tienen contenido correcto
grep -n "npm link" tutoriales-arai/01-Instalacion/01-instalar-arai.md
grep -n "npm link" tutoriales-arai/01-Instalacion/04-solucion-problemas.md

# 2. No debe haber referencias a comandos inexistentes
grep -rn "\-\-global" curso-ia/Recursos/Comandos-utiles.md

# 3. Tests
npm test
node shared/scripts/ci-validate.js --strict --verbose
```
