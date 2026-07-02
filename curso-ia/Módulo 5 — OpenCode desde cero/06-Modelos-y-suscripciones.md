# Modelos y suscripciones

## Idea central

OpenCode funciona con múltiples modelos de IA. Puedes usar **modelos gratuitos** (con límites) o **modelos de pago** vía OpenCode Go, y también conectar tus propias suscripciones como ChatGPT.

## OpenCode Go (modelos de pago)

OpenCode Go es el plan de pago que da acceso a modelos más potentes.

### Modelos disponibles

| Modelo | Coste | Calidad |
|--------|-------|---------|
| GPT-4o | Incluido en Go | Excelente |
| Claude Sonnet | Incluido en Go | Excelente |
| Claude Haiku | Incluido en Go | Buena |
| GPT-4.1 | Incluido en Go | Excelente |
| Modelos gratuitos (locales) | Gratis | Variable |

### Precios

```bash
# Consultar tu plan y consumo
opencode status

# Ver modelos disponibles
opencode models
```

## Modelos gratuitos

OpenCode también soporta modelos gratuitos ejecutados localmente o vía APIs gratuitas:

- Modelos open-source (Llama, Mistral, etc.)
- Límite de tokens más restrictivo
- Ideales para aprendizaje y proyectos pequeños

## Conectar tu suscripción a OpenCode

Puedes usar tu propia suscripción de ChatGPT u otros proveedores:

```json
{
  "model": "chatgpt/gpt-4o",
  "apiKey": "sk-..."
}
```

### Pasos:

1. Obtén una API key del proveedor (OpenAI, Anthropic, etc.)
2. Configúrala en `opencode.json`
3. Selecciona el modelo al iniciar

```bash
# Usar un modelo específico
opencode --model anthropic/claude-sonnet-4-6
```

## Reducir el porcentaje de uso

Para controlar el gasto, puedes limitar el uso de modelos de pago:

```json
{
  "model": {
    "budget": {
      "maxCostPerHour": 0.50,
      "maxCostPerDay": 5.00
    }
  }
}
```

## Comparativa de modelos

| Modelo | Velocidad | Calidad código | Precio |
|--------|-----------|----------------|--------|
| Claude Sonnet 4 | Rápida | Excelente | Medio |
| GPT-4o | Rápida | Excelente | Medio |
| Claude Haiku | Muy rápida | Buena | Bajo |
| GPT-4.1 | Media | Excelente | Alto |
| Locales (Llama) | Variable | Buena | Gratis |

### Recomendación

> *"Para el día a día, Claude Haiku o GPT-4o dan suficiente calidad. Guarda Claude Sonnet para tareas complejas."* — Midudev

## Enlaces

- [[05-Construyendo-proyectos|Anterior: Construyendo proyectos]]
- [[07-Agents-y-agents-md|Siguiente: Agents y agents.md]]
- Video: [Curso de OpenCode desde cero](https://www.youtube.com/watch?v=ZZq4TpNgnvg) — Capítulo 4
