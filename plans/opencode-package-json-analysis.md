# Análisis: `.opencode/package.json` + `node_modules` + lockfiles

## Contexto

Existe un `package.json` en `.opencode/` con una sola dependencia:
```json
{ "dependencies": { "@opencode-ai/plugin": "1.17.11" } }
```

Junto con `node_modules/` (28 paquetes transativos), `package-lock.json`, y un `.opencode/.gitignore` que los ignora.

## ¿Por qué existe?

**Es manejado por opencode, no por arai.** El flujo es:

1. `custom-logo.tsx` importa `@opencode-ai/plugin/tui` y `@opentui/solid`
2. opencode detecta que hay un plugin en `tui.json`
3. opencode crea/actualiza `.opencode/package.json` con la dependencia del plugin SDK
4. opencode ejecuta `npm install` (o `bun install`) dentro de `.opencode/`
5. El `.opencode/.gitignore` (auto-generado por opencode) ignora `node_modules`, `package.json`, `package-lock.json`, `bun.lock`

**El `.opencode/package.json` es tracked por git** (commit `84108e5`), pero opencode lo gestiona internamente.

## El problema

| Archivo | Tracked | Propósito | ¿Necesario? |
|---------|---------|-----------|-------------|
| `.opencode/package.json` | Sí | Declara `@opencode-ai/plugin` | Sí, para el plugin |
| `.opencode/node_modules/` | No (gitignored) | Instalación del SDK | Sí, runtime |
| `.opencode/package-lock.json` | No (gitignored) | Lockfile | Sí, reproducibilidad |
| `.opencode/.gitignore` | No | Ignora lo de arriba | Sí, lo genera opencode |

**No hay problema funcional.** El sistema funciona correctamente:
- opencode gestiona `.opencode/package.json` internamente
- Los lockfiles y node_modules están gitignored
- El plugin `custom-logo.tsx` funciona porque opencode instala el SDK

## Pregunta: ¿Debería arai copiar `.opencode/package.json` a proyectos nuevos?

**Sí, si el proyecto usa plugins.** Actualmente:

- `arai init --template full` copia `custom-logo.tsx` a `.opencode/plugins/` y `tui.json` a `.opencode/`
- Pero NO copia `.opencode/package.json`
- Resultado: opencode auto-genera el `package.json` cuando detecta el plugin, pero el primer arranque puede fallar o ser lento

- `arai init --template minimal` NO copia plugins → no necesita `.opencode/package.json`

- `arai install platform` NO copia `.opencode/package.json` (ahora copia de `shared/`)

## Recomendación

### Opción A: No cambiar nada (recomendada)

El sistema actual funciona:
- opencode auto-gestiona `.opencode/package.json` cuando detecta plugins
- Los lockfiles están gitignored
- No hay duplicación ni inconsistencia

**Ventaja:** Simplicidad. opencode es el dueño de este archivo.
**Riesgo:** Primer arranque puede ser lento (opencode instala el SDK).

### Opción B: Copiar `.opencode/package.json` en templates

Agregar `shared/templates/partials/.opencode/package.json` y copiarlo en `arai init --template full`.

**Ventaja:** Primer arranque más rápido.
**Riesgo:** Versión del SDK hardcoded en el template, puede quedar desactualizada.

### Opción C: Eliminar el tracking de `.opencode/package.json`

Dejar que opencode lo genere completamente. No trackearlo.

**Ventaja:** opencode siempre tiene la versión correcta del SDK.
**Riesgo:** Primer arranque siempre instala el SDK.

## Conclusión

**No hay problema que resolver.** El `.opencode/package.json` es un archivo interno de opencode que:
1. Es managed by opencode (no by arai)
2. Está gitignored junto con sus lockfiles
3. Funciona correctamente para el plugin `custom-logo.tsx`
4. No necesita ser copiado a proyectos nuevos (opencode lo auto-genera)

La唯一ua mejora sería agregar `.opencode/package.json` al template `full` para que el primer arranque sea más rápido, pero es opcional.
