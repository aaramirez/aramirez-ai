---
tags:
  - agentes
  - especializados
created: 2026-07-05
---

# Agentes especializados

## ¿Qué son?

Agentes pre-configurados para dominios específicos. Vienen con prompts, permisos y configuraciones optimizadas para su función.

## Tipos disponibles

| Tipo | Descripción |
|------|-------------|
| `reviewer` | Revisa código, PRs, aplica estándares de calidad |
| `tester` | Escribe y ejecuta tests, analiza cobertura |
| `docs` | Genera y mantiene documentación, READMEs, wikis |
| `security` | Audita seguridad, detecta vulnerabilidades, secretos |
| `devops` | CI/CD, Docker, Kubernetes, infraestructura |
| `architecture` | Diseño de sistemas, ADRs, diagramas |

## Crear un agente especializado

```bash
node shared/scripts/create-specialized-agent.js --name mi-reviewer --domain reviewer
```

Esto genera un agente con:
- Prompt específico para code review
- Permisos de solo lectura
- Instrucciones detalladas sobre qué buscar

## Ejemplo: security agent

```bash
node shared/scripts/create-specialized-agent.js \
  --name security-auditor \
  --domain security \
  --model anthropic/claude-sonnet-4-6
```

El agente generado incluirá instrucciones para detectar:
- API keys hardcodeadas
- Inyección SQL
- XSS
- Dependencias vulnerables

---

**Siguiente**: [[04-Agentes/04-arquitecturas.md|Arquitecturas multi-agente]]
