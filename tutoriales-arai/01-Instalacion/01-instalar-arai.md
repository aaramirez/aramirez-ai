---
tags:
  - instalacion
  - setup
created: 2026-07-05
---

# Instalar arai

> **Objetivo**: Clonar el repositorio de arai, instalar sus dependencias y verificar que todo funciona correctamente.

**⏱ Tiempo estimado**: 5 minutos
**🎯 Nivel**: Básico
**📋 Requisitos**: Node.js 18+, Git, npm

## Resultado esperado

Al completar este tutorial tendrás el repositorio de arai clonado, dependencias instaladas y `npm test` pasando en tu máquina local.

## Paso 1: Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/aramirez-ai.git
cd aramirez-ai
```

## Paso 2: Instalar dependencias

```bash
npm install
```

Esto instala `commander` y otras dependencias necesarias para el CLI.

## Paso 3: Verificar la instalación

```bash
node bin/arai.js --help
```

Deberías ver la lista de comandos disponibles: `init`, `install`, `sync`, `status`, `generate`, etc.

## Paso 4: Verificar los tests

```bash
npm test
```

Todos los tests deben pasar. Esto confirma que el entorno está correctamente configurado.

## Solución de problemas

| Problema | Causa probable | Solución |
|----------|----------------|----------|
| `command not found: node` | Node.js no instalado | Instalar Node.js 18+ desde nodejs.org |
| `SyntaxError: Unexpected reserved word` | Ejecutando fuera del directorio del proyecto | Ejecutar desde `aramirez-ai/` donde está `package.json` |
| `npm ERR!` | Dependencias corruptas | Borrar `node_modules/` y ejecutar `npm install` de nuevo |

---

**Siguiente**: [[01-Instalacion/02-primer-proyecto.md|Crear tu primer proyecto]]
