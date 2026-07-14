---
tags:
  - agentes
  - especializados
created: 2026-07-05
---

# Agentes especializados

> **Objetivo**: Conocer los agentes especializados preconfigurados (reviewer, tester, docs, security, devops) y cómo usarlos en tu flujo de trabajo.

**⏱ Tiempo estimado**: 6 minutos
**🎯 Nivel**: Intermedio
**📋 Requisitos**: [[04-Agentes/02-subagentes.md|Subagentes]]

## Resultado esperado

Saber cuándo y cómo utilizar cada agente especializado, y qué permisos y capacidades tiene cada uno.

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
node .opencode/skills/agent-creator/scripts/create-agent.js --mode subagent --name mi-reviewer --domain reviewer
```

Esto genera un agente con:
- Prompt específico para code review
- Permisos de solo lectura
- Instrucciones detalladas sobre qué buscar

## Ejemplo: security agent

```bash
node .opencode/skills/agent-creator/scripts/create-agent.js --mode subagent \
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
