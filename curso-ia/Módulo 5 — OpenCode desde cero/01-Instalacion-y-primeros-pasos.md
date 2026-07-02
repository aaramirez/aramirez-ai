# Instalación y primeros pasos

## Idea central

OpenCode es un **agente de código con IA de código abierto** que se ejecuta en la terminal. Es la alternativa comunitaria a Claude Code, con la ventaja de ser gratuito y tener soporte en español.

> *"OpenCode es una herramienta de codificación con agentes que funciona en la terminal."* — Midudev

## ¿Qué necesitas?

- **Una terminal**: Ghostty (recomendada, multiplataforma y open source), Kitty, iTerm2, Windows Terminal, etc.
- **Node.js 18+**
- **OpenCode TUI** — La interfaz principal

## Instalación de OpenCode TUI

```bash
# Instalación global
npm install -g @opencode/tui

# Verificar instalación
opencode --version

# Iniciar en un proyecto
opencode
```

## Ventajas frente a Claude Code

| OpenCode | Claude Code |
|----------|-------------|
| Código abierto | Código cerrado |
| Gratuito | Suscripción de pago |
| Comunidad activa | Soporte corporativo |
| Soporte en español | Solo inglés |
| Personalizable | Limitado |

## Tu primer prompt

1. Abre tu terminal en la carpeta de un proyecto
2. Ejecuta `opencode`
3. Escribe tu primer prompt: *"Explícame la estructura de este proyecto"*
4. Observa cómo el agente lee archivos, analiza el contexto y responde

```bash
# Flujo típico
cd mi-proyecto
opencode
# Dentro de OpenCode:
# /explain → explica el código
# /plan    → planifica una tarea
```

## Conceptos clave

- **TUI** — Interfaz de usuario en terminal con paneles, atajos y navegación
- **Contexto automático** — OpenCode lee el proyecto automáticamente, no necesitas pegar código
- **Modo conversacional** — Puedes iterar con el agente como con un compañero de desarrollo

## Recursos

- Documentación oficial: https://opencode.ai
- Siguiente: [[02-Comandos-esenciales-y-TUI|Comandos esenciales y TUI]]
- Video original: [Curso de OpenCode desde cero](https://www.youtube.com/watch?v=ZZq4TpNgnvg) — Capítulo 1
