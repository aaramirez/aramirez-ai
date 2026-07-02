# Prompts efectivos

## Estructura de un buen prompt

Un prompt para generar código debe incluir:

1. **Rol** — "Eres un experto en React con TypeScript"
2. **Contexto** — "Estoy construyendo un dashboard de analytics"
3. **Tarea específica** — "Crea un componente de gráfico de líneas"
4. **Restricciones** — "Usa Recharts, datos mock, responsive"
5. **Formato de salida** — "Devuelve el código del componente + un ejemplo de uso"

## Tipos de prompts

| Tipo | Ejemplo | Cuándo usarlo |
|------|---------|---------------|
| Directo | "Crea una función que valide emails" | Tareas simples y conocidas |
| Contextual | "En mi app Next.js con Prisma, crea un endpoint para usuarios" | Cuando necesitas integrar con código existente |
| Iterativo | "Ahora añádele paginación" | Para construir paso a paso |
| Crítico | "¿Qué errores tiene este código?" | Para review de código generado |

## Técnicas avanzadas

### Few-shot prompting

Dale ejemplos de lo que esperas:

```
Input: "usuario@example.com" → Output: true
Input: "usuario@" → Output: false
Input: "hola" → Output: ?
```

### Chain of thought

Pídele a la IA que razone antes de responder:

```
Antes de escribir código, explica cómo abordarías este problema.
```

### System prompt persistente

Configura un system prompt en `opencode.json` o `CLAUDE.md` con tus preferencias:

```json
{
  "instructions": ["AGENTS.md"]
}
```

## Errores frecuentes

- **Prompt demasiado largo** — La IA pierde el foco. Ve al grano.
- **Prompt sin contexto** — "Haz un CRUD" no es suficiente.
- **No especificar tecnologías** — La IA asume lo que quiere.

## Enlaces

- [[01-De-prompt-a-programacion|Anterior: De prompt a programación]]
- [[03-Herramientas-y-MCP|Siguiente: Herramientas y MCP]]
