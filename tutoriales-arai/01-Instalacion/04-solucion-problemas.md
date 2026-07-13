---
tags:
  - instalacion
  - problemas
created: 2026-07-05
---

# Solución de problemas comunes

> **Objetivo**: Diagnosticar y resolver los errores más frecuentes al instalar y usar arai.

**⏱ Tiempo estimado**: 5 minutos
**🎯 Nivel**: Básico
**📋 Requisitos**: [[01-Instalacion/01-instalar-arai.md|Instalar arai]] completado

## Resultado esperado

Conocer los errores típicos, sus causas y las soluciones para resolverlos rápidamente.

## Error: `SyntaxError: Unexpected reserved word`

**Causa**: Ejecutando el script fuera del directorio raíz del proyecto. Node.js no encuentra `package.json` con `"type": "module"`.

**Solución**: Ejecutar desde la raíz del repositorio:

```bash
cd /ruta/a/aramirez-ai
node shared/scripts/docgen-vault.js ...
```

## Error: `spawnSync /Applications/Google Chrome.app/... ETIMEDOUT`

**Causa**: Chrome tarda más de 60 segundos en generar el PDF en modo headless.

**Solución**: Ejecutar de nuevo (el timeout ahora es de 120s). Si persiste:

```bash
pkill -9 -f "Google Chrome"  # Matar procesos zombies
```

## Error: `No Chromium browser found`

**Causa**: No hay Chrome, Edge, Brave o Chromium instalado.

**Solución**: Instalar Chrome o definir variable:

```bash
export DOCGEN_BROWSER=/ruta/al/chrome
```

## Error: `command not found: arai`

**Causa**: No se ejecutó `npm link` durante la instalación, o el symlink se rompió.

**Solución**:

```bash
cd ~/.config/aramirez
npm link
```

Esto recrea el symlink global. Después, `arai` estará disponible desde cualquier directorio.

## Los PDFs se ven mal (sin formato, texto plano)

**Causa**: Faltan las skills de documentación o el branding no está configurado.

**Solución**:

```bash
arai sync
# Editar shared/brand.json con los colores deseados
```

---

**Siguiente**: [[02-Comandos/Index|Comandos esenciales]]
