# Glosario

## A

**Agente (Agent)** — Instancia de IA con acceso a herramientas y un contexto definido. Puede operar en modo primary (autónomo) o subagent (especializado).

**ADR (Architectural Decision Record)** — Documento que registra una decisión arquitectónica importante, incluyendo contexto, opciones consideradas y justificación.

## C

**CLI (Command Line Interface)** — Interfaz de línea de comandos. Forma de interactuar con programas mediante texto en la terminal.

**Commander** — Librería Node.js para construir interfaces de línea de comandos.

**Conventional Commit** — Convención para mensajes de commit: `tipo(scope): descripción`. Ej: `feat(auth): add login endpoint`.

## E

**ESM (ECMAScript Modules)** — Sistema de módulos nativo de JavaScript/Node.js usando `import`/`export`.

## G

**Glob** — Patrón para buscar archivos usando comodines (ej: `**/*.js`).

## I

**Issue** — Tarea, bug o mejora registrada en un sistema de tracking (GitHub Issues, Jira, etc.).

## M

**MCP (Model Context Protocol)** — Protocolo estándar para conectar agentes de IA con herramientas externas. Permite que los agentes interactúen con APIs, navegadores, bases de datos, etc.

**Multiagente** — Arquitectura donde múltiples agentes especializados colaboran para completar tareas complejas.

## O

**Opencode** — Herramienta open-source de codificación asistida por IA, similar a Claude Code pero con más control sobre configuración, agentes y permisos.

## P

**Plugin** — Extensión de opencode que permite personalizar el comportamiento del agente (hooks, configuración custom).

**Prompt** — Instrucción o pregunta que se le da a un modelo de IA para generar una respuesta.

**PR (Pull Request)** — Solicitud de fusión de cambios en un repositorio Git.

## S

**Skill** — Conjunto de instrucciones especializadas en formato SKILL.md que se carga según la tarea. Las skills son reutilizables entre opencode y Claude Code.

**Spec (Specification)** — Documento detallado que describe qué debe hacer una funcionalidad, incluyendo criterios de aceptación.

**Subagente** — Agente especializado con permisos limitados que se ejecuta dentro del contexto de un agente principal.

## T

**Tool (Herramienta)** — Capacidad que tiene un agente para interactuar con el entorno: leer/escribir archivos, ejecutar comandos, hacer peticiones web, etc.
