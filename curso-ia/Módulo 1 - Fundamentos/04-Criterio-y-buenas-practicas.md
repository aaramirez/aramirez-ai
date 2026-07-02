# Criterio y buenas prácticas

## La regla de oro

> *"La IA no reemplaza tu criterio: lo amplifica."*

Usar IA para desarrollar no significa dejar de pensar. Significa pensar **más** sobre la arquitectura y **menos** sobre la sintaxis.

## Cuándo confiar en la IA

| Situación | Confianza | Por qué |
|-----------|-----------|---------|
| Código boilerplate | Alta | Patrones conocidos y repetitivos |
| Tests unitarios | Alta | Casos claros, estructura definida |
| Refactorización | Media | Revisar que no cambie la lógica |
| Lógica de negocio | Baja | Requiere entender el dominio |
| Seguridad | Muy baja | Bugs sutiles, vulnerabilidades |

## Checklist de revisión

Antes de hacer commit de código generado por IA:

- [ ] **Compila/ejecuta** sin errores
- [ ] **Lógica correcta** para todos los casos borde
- [ ] **Sin secretos** hardcodeados (API keys, tokens)
- [ ] **Sigue el estilo** del proyecto
- [ ] **No introduce dependencias** innecesarias
- [ ] **Los tests pasan** (o los has escrito)

## Criterio arquitectónico

La IA puede escribir funciones, pero **tú** decides:

- Cómo estructurar el proyecto
- Qué patrones usar
- Cuándo simplificar vs. cuándo abstraer
- Qué tecnologías son apropiadas

## Sesgos de la IA a tener en cuenta

1. **Sesgo de popularidad** — Tiende a usar las librerías más conocidas, no siempre las mejores.
2. **Sesgo de actualidad** — Puede generar código con APIs obsoletas si no le das contexto temporal.
3. **Sesgo de sobreingeniería** — A veces genera soluciones más complejas de lo necesario.

## Flujo de trabajo recomendado

1. Planificar (tú)
2. Especificar (tú + IA)
3. Generar (IA)
4. Revisar (tú)
5. Testear (tú + IA)
6. Committear (tú)

## Enlaces

- [[03-Herramientas-y-MCP|Anterior: Herramientas y MCP]]
- [[05-Especificaciones|Siguiente: Especificaciones]]
- [[Módulo 2 — Agentes/04-Testing-y-calidad|Testing y calidad con agentes]]
