# Skills personalizadas

## Idea central

Las **skills** son instrucciones especializadas que le enseñan a OpenCode a realizar tareas concretas. Son como plugins de conocimiento que se activan según la necesidad.

> *"Una skill es un instructivo detallado para que el agente sepa exactamente cómo hacer algo."* — Midudev

## ¿Qué es una skill?

Una skill es un archivo `SKILL.md` con frontmatter YAML que describe **cómo realizar una tarea específica**. Cuando invocas la skill, el agente carga esas instrucciones como contexto.

```yaml
---
name: html-video-generator
description: Generate HTML/CSS/JS video-style presentations
license: MIT
---
```

## Estructura de una skill

```
shared/skills/<skill-name>/
└── SKILL.md
```

### Ejemplo: Skill para crear videos con HTML, CSS y JS

```markdown
---
name: html-video-generator
description: Create video-style presentations using HTML, CSS and JS
license: MIT
---

# HTML Video Generator

Genera presentaciones tipo video usando tecnologías web.

## Formato

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Animaciones CSS para transiciones */
  </style>
</head>
<body>
  <!-- Contenido de cada slide -->
  <script>
    // Control de reproducción
  </script>
</body>
</html>
```

## Reglas

- Cada slide es una sección con altura de viewport
- Transiciones con CSS animations
- Reproducción automática con JS
```

## Cómo se cargan las skills

```json
{
  "skills": {
    "paths": [
      ".opencode/skills",
      "~/.config/opencode/skills"
    ]
  }
}
```

### Instalar una skill

```bash
# Desde el CLI de arai (en este repo)
arai install skill html-video-generator

# O manualmente copiando a .opencode/skills/
```

## Usar una skill en un prompt

```bash
# Con la skill cargada automáticamente según la tarea
"Usando la skill html-video-generator, crea un video de presentación"

# O forzando su uso
/skill html-video-generator
```

## Skills vs agents.md

| agents.md | Skill |
|-----------|-------|
| Contexto permanente del proyecto | Instrucción específica para una tarea |
| Se carga siempre | Se carga solo cuando se necesita |
| Define el "qué" y "cómo" general | Define el "cómo" de una tarea concreta |
| Uno por proyecto | Múltiples skills reutilizables |

## Ejemplo práctico del video

Midudev creó una skill para **generar videos con HTML, CSS y JS** que:

1. Toma una descripción de contenido
2. Genera slides con animaciones
3. Produce un HTML listo para compartir
4. Incluye controles de reproducción

```bash
# Prompt usando la skill
"skill:html-video-generator Crea un video de 3 slides sobre OpenCode"
```

## Enlaces

- [[07-Agents-y-agents-md|Anterior: Agents y agents.md]]
- [[09-Comandos-personalizados|Siguiente: Comandos personalizados]]
- [[Módulo 2 — Agentes/02-Configuracion-de-agentes|Configuración de agentes y skills]]
- Video: [Curso de OpenCode desde cero](https://www.youtube.com/watch?v=ZZq4TpNgnvg) — Capítulo 5
