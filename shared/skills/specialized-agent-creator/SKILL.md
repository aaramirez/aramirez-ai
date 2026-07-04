---
name: specialized-agent-creator
description: Create domain-specific agents with pre-built prompts for review, testing, docs, security, devops, and architecture roles.
license: MIT
---

# Creador de agentes especializados

## Agentes disponibles

### reviewer
- **Permisos por defecto**: `edit: deny`, `bash: allow`
- **Propósito**: Revisión de PR, auditoría de código, enforcement de estándares de calidad.
- **Prompt incluido**: Enfocado en correctness, seguridad, performance, maintainability, consistencia.

### tester
- **Permisos por defecto**: `bash: allow`
- **Propósito**: Escribir y ejecutar tests, analizar cobertura, generar reportes de calidad.
- **Prompt incluido**: Instrucciones para usar `node:test`, Jest o Vitest según el proyecto.

### docs
- **Permisos por defecto**: `edit: allow`, `bash: deny`
- **Propósito**: Generar y mantener documentación técnica, README, API docs, guías.
- **Prompt incluido**: Patrones de documentación, formato markdown, secciones obligatorias.

### security
- **Permisos por defecto**: `edit: deny`, `bash: allow`
- **Propósito**: Auditoría de seguridad, análisis de dependencias, revisión de autenticación y autorización.
- **Prompt incluido**: OWASP Top 10, secret scanning, hardening de configuración.

### devops
- **Permisos por defecto**: `bash: allow`
- **Propósito**: CI/CD, Docker, infraestructura como código, monitoreo.
- **Prompt incluido**: Pipelines, Dockerfiles, scripts de despliegue, Terraform.

### architect
- **Permisos por defecto**: `edit: deny`, `bash: deny`
- **Propósito**: Diseño de arquitectura, decisiones tecnológicas, revisión de patrones.
- **Prompt incluido**: Evaluación de trade-offs, principios SOLID, patrones de diseño.

## Cuándo elegir cada uno
- Usa **reviewer** para code review estándar.
- Usa **tester** cuando necesites coverage o test suite nueva.
- Usa **docs** para documentar APIs o features existentes.
- Usa **security** antes de un release o cuando se manejen datos sensibles.
- Usa **devops** para pipelines y configuración de infraestructura.
- Usa **architect** para decisiones de alto nivel al inicio del proyecto.

## Uso

```bash
node shared/scripts/create-specialized-agent.js --domain reviewer --output ./.opencode/agents/reviewer.md
```
