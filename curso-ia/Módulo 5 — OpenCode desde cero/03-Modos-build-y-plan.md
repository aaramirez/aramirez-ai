# Modos build y plan

## Idea central

OpenCode separa la **planificación** de la **ejecución**. El modo `plan` permite explorar soluciones sin riesgo, y `build` materializa los cambios de forma controlada.

## Modo Plan

Cuando usas `/plan`, el agente:

1. Lee los archivos relevantes del proyecto
2. Analiza los requisitos
3. Propone una estrategia de implementación
4. **NO modifica ningún archivo**

```bash
/plan "Crea un componente de login con validación"

# El agente responderá con algo como:
# 📋 Plan:
# 1. Crear src/components/LoginForm.tsx
# 2. Añadir validación con Zod
# 3. Crear tests unitarios
# 4. Integrar en App.tsx
```

### Cuándo usar /plan

- Tareas complejas con múltiples pasos
- Cuando no estás seguro del enfoque
- Para revisar antes de ejecutar
- Para aprender cómo abordaría el agente un problema

## Modo Build

Cuando usas `/build`, el agente:

1. Ejecuta el plan que ha diseñado (o el que tú le indiques)
2. Crea y modifica archivos
3. Ejecuta comandos necesarios (npm install, etc.)
4. Te pide confirmación antes de cada cambio

```bash
/build  # Ejecuta el último plan generado
```

### Confirmación de cambios

OpenCode siempre pide confirmación antes de:

- Crear archivos nuevos
- Modificar archivos existentes
- Ejecutar comandos del sistema
- Eliminar código

```
🔧 Modificar src/App.tsx
  → ¿Aceptas este cambio? (y/N)
```

## Flujo de trabajo ideal

```
1. /plan "Añade autenticación con JWT"
2. Revisas el plan → pides ajustes si es necesario
3. /build
4. Revisas cada cambio
5. /commit para guardar

# Si algo no gusta:
/timeline  → Ver historial de cambios
/revert    → Revertir cambios
```

## Combinación con subagentes

```bash
/plan "Diseña la arquitectura"     # Plan principal
  → invoca /review "Revisa este plan"  # Subagente revisa
/build                              # Construye
  → invoca /test "Ejecuta tests"    # Subagente testea
```

## Consejo del video

> *"Usa `/plan` siempre que no estés seguro. Es más barato en tokens que arreglar código mal generado."* — Midudev

## Enlaces

- [[02-Comandos-esenciales-y-TUI|Anterior: Comandos esenciales y TUI]]
- [[04-Ahorro-de-tokens-y-modo-shell|Siguiente: Ahorro de tokens y modo shell]]
- [[Módulo 2 — Agentes/03-Planificacion-con-agentes|Planificación con agentes]]
- Video: [Curso de OpenCode desde cero](https://www.youtube.com/watch?v=ZZq4TpNgnvg) — Capítulo 2
