---
name: instructions-creator
description: Create AGENTS.md with project instructions, workflow guidelines, and coding conventions.
license: MIT
scripts:
  - create-instructions.js
  - create-base.js
---

# Instructions Creator

Genera el archivo `AGENTS.md` con las instrucciones del proyecto: guías de workflow, convenciones de código, y reglas que los agentes de opencode deben seguir.

## Estructura de AGENTS.md

El archivo `AGENTS.md` vive en la raíz del proyecto y contiene:

- **Descripción del proyecto** — qué hace, stack tecnológico, arquitectura
- **Workflow** — ciclo de desarrollo, convenciones de commits, branching
- **Convenciones de código** — estilo, nombramiento, estructura de archivos
- **Reglas de testing** — framework, cobertura esperada, cómo ejecutar
- **Skills y agentes** — qué skills están disponibles y cómo usarlos
- **Referencias** — enlaces a documentación interna

## Personalización por tipo de proyecto

| Tipo | Stack típico | Énfasis |
|------|-------------|---------|
| `web` | Node.js, Express, React | Componentes, SSR/CSR, estilos |
| `api` | Node.js, Fastify, Express | Endpoints, validación, OpenAPI |
| `cli` | Node.js, Commander | Interfaz de usuario, flags, errores |
| `library` | TypeScript, Node.js | API pública, tipos, documentación |
| `mobile` | React Native, Expo | Plataformas, builds, assets |
| `data` | Python, Pandas | Pipelines, notebooks, visualización |
| `infra` | Terraform, Ansible | Infraestructura como código, entornos |

## Cómo se usa en opencode

El contenido de `AGENTS.md` se inyecta en el array `instructions` de `opencode.json`. Los agentes lo reciben como parte de su system prompt, asegurando que todos sigan las mismas reglas.

## Script de referencia

```bash
node shared/scripts/create-instructions.js --type web --language typescript --description "Mi proyecto" --output ./AGENTS.md
```

### Opciones

| Flag | Descripción | Default |
|------|-------------|---------|
| `--type <tipo>` | Tipo de proyecto: `web`, `api`, `cli`, `library`, `mobile`, `data`, `infra` | — |
| `--language <lang>` | Lenguaje principal | auto-detectado del tipo |
| `--description <text>` | Descripción del proyecto | — |
| `--output <file>` | Archivo de salida | `./AGENTS.md` |
| `--dry-run` | Vista previa sin escribir | — |
| `--help` | Muestra la ayuda | — |

## Ejemplo de uso

```bash
# Generar instructions para API TypeScript
node shared/scripts/create-instructions.js \
  --type api \
  --language typescript \
  --description "API REST para gestión de usuarios" \
  --output ./AGENTS.md

# Vista previa
node shared/scripts/create-instructions.js --type web --dry-run
```
