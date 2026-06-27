# ¿Qué es un agente?

## Definición

Un **agente de IA** es un asistente que tiene acceso a **herramientas** y **contexto** para realizar tareas de forma autónoma dentro de unos límites definidos.

> *"Un agente no es solo un chat: es un chat con capacidad de hacer cosas."*

## Diferencia entre chat y agente

| Chat | Agente |
|------|--------|
| Solo conversación | Puede ejecutar comandos |
| No tiene contexto del proyecto | Lee y modifica archivos |
| No sabe lo que hay en tu código | Explora el códigobase |
| Das tú la información | La obtiene por sí mismo |

## Componentes de un agente

```
Agente IA
├── 🧠 Modelo (LLM) — El cerebro
├── 📋 Instrucciones — System prompt, reglas
├── 🔧 Herramientas — Lo que puede hacer
├── 📁 Contexto — Archivos, proyecto, histórico
└── 🎯 Modo — Primary (autónomo) o subagent (especializado)
```

## Modos de agente en opencode

### Primary mode
El agente principal. Tiene acceso completo al proyecto, puede crear/modificar archivos, ejecutar comandos.

```json
{
  "agent": {
    "build": {
      "mode": "primary",
      "description": "Agente principal de desarrollo"
    }
  }
}
```

### Subagent mode
Agente especializado con permisos limitados. Se invoca desde el agente principal.

```json
{
  "agent": {
    "reviewer": {
      "mode": "subagent",
      "description": "Revisor de código",
      "permission": { "edit": "deny" }
    }
  }
}
```

## Agentes en el ecosistema

- **Claude Code** — Agente de Anthropic para terminal
- **opencode** — Alternativa open-source con más control
- **Cursor** — Editor con IA integrada
- **GitHub Copilot** — Autocompletado en el IDE

## Enlaces

- [[02-Configuracion-de-agentes|Siguiente: Configuración de agentes]]
- [[Módulo 1 — Fundamentos/03-Herramientas-y-MCP|Herramientas y MCP]]
- [[Módulo 3 — Multiagentes/01-Arquitectura-multiagente|Arquitectura multiagente]]
