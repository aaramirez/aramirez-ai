# Módulo 2: Modelos y Harness Engineering

Hasta ahora hemos visto cómo construir harness en OpenCode. Pero el harness no funciona sin el motor que lo impulsa: el modelo de lenguaje. Este módulo explica cómo los modelos hacen posible el harness engineering, qué capacidades ofrecen y cómo se diferencian entre sí.

## El ciclo agente: el core del harness

Cada vez que un agente responde, se ejecuta este ciclo:

```
Modelo recibe prompt + tools
  ↓
Genera respuesta (texto + tool calls)
  ↓
Harness ejecuta las tool calls
  ↓
Resultados vuelven al modelo como nuevo mensaje
  ↓
Modelo decide siguiente paso
  ↓
Repetir hasta completar el objetivo
```

Este ciclo es la base de cualquier harness. Sin él, los agentes no podrían interactuar con el sistema, editar archivos, ejecutar comandos ni usar MCPs.

## Evolución de los modelos hacia el comportamiento agéntico

Los modelos de lenguaje no siempre pudieron comportarse como agentes. Hasta 2022 eran generadores de texto sin control — recibían un prompt y completaban, sin distinguir instrucciones de contenido. Cuatro saltos evolutivos lo hicieron posible:

### 1. Instruction Tuning (2022) — el modelo aprende a seguir instrucciones

Con RLHF y fine-tuning instructivo (InstructGPT, GPT-3.5), el modelo aprendió a **distinguir una instrucción de una mera completion**. Por primera vez se podía decir "traduce esto" o "resume este texto" y el modelo lo entendía como orden, no como continuación.

Esto habilitó el **system prompt**: un bloque separado que define el rol y las reglas del agente, que el modelo prioriza sobre el resto del contexto.

```
System: Eres un agente especializado en revisión de código...
User: Revisa este archivo
→ El modelo entiende que el system prompt es autoridad.
```

**Impacto en harness**: sin esto no podríamos definir roles de agente (líder, implementer, reviewer) con instrucciones consistentes.

### 2. Function Calling (2023) — el modelo declara intenciones

OpenAI lanzó function calling en GPT-4 (junio 2023). El modelo ya no solo generaba texto — podía generar objetos JSON estructurados declarando qué herramienta quería llamar y con qué parámetros. Ese mismo año Anthropic replicó con tool use nativo en Claude 3.

```
Modelo → genera texto + {"name": "edit", "arguments": {...}} → Harness ejecuta → Resultado → Modelo decide siguiente paso
```

**Impacto en harness**: nace el ciclo agente moderno. El modelo declara intenciones, el harness las ejecuta con control de permisos. Por primera vez un modelo puede *actuar* sobre el mundo real de forma estructurada y segura.

### 3. Entrenamiento en trayectorias agente (2024-2025) — el modelo entiende el ciclo completo

Los modelos empezaron a entrenarse con datos sintéticos de **ciclos completos de agente**: recibir una tarea, planificar, usar herramientas, observar resultados, iterar. Ya no aprenden pasos aislados — aprenden el flujo entero.

Hitos:
- **Claude 3.5 Sonnet + Computer Use**: entrenado para moverse en entornos gráficos (píxeles → clics)
- **Extended Thinking**: Claude genera tokens de razonamiento *internos* antes de decidir la respuesta final
- **o1/o3 (OpenAI)**: razonamiento encadenado antes de actuar
- **Modelos agente-nativos**: algunos modelos (Claude 4, Gemini 2.5) ya se pre-entrenan con datasets de tool use

**Impacto en harness**: los modelos entienden el ciclo agente de forma natural. Ya no necesitas prompts complejos para que usen herramientas — lo hacen por defecto, con mayor precisión y menos errores.

### 4. Contexto masivo + MCP (2024-2025) — espacio para proyectos enteros

El contexto pasó de **2K tokens (GPT-3, 2020)** a **200K (Claude 3), 1M (Gemini 2.5) y 2M (Claude 4)**. Esto permite pasar archivos completos como contexto sin perder el hilo. Paralelamente, **MCP** estandarizó cómo los modelos descubren y usan herramientas externas — cualquier servidor MCP expone tools que el modelo consume sin configuración especial.

**Impacto en harness**: puedes pasar el proyecto entero como contexto y conectar herramientas externas (APIs, bases de datos, ticketing) sin modificar el harness.

### Resumen evolutivo

| Hito | Año | Modelo clave | Qué habilitó |
|------|-----|-------------|--------------|
| GPT-3 | 2020 | GPT-3 | Generación de texto pura |
| Instruction Tuning | 2022 | InstructGPT | Seguir instrucciones → **system prompts** |
| Function Calling | 2023 | GPT-4, Claude 3 | Tool calls estructuradas → **ciclo agente** |
| Tool Use nativo | 2024 | Claude 3.5 | Tools como parte del flujo natural |
| Computer Use | 2024 | Claude 3.5 | Interacción con GUI |
| Extended Thinking | 2024 | Claude 3.5 Sonnet | Razonamiento interno antes de actuar |
| MCP v1 | 2024 | — | Estandarización de herramientas |
| Contexto masivo | 2025 | Claude 4, Gemini 2.5 | 1M-2M tokens, proyectos enteros en contexto |
| Modelos agente-nativos | 2025 | Claude 4, o-series | Entrenados desde cero para el ciclo agente |

### Tool calls: el puente entre el modelo y el mundo real

Los modelos de lenguaje modernos pueden **declarar intenciones de ejecución** mediante tool calls (también llamadas function calls). El modelo no ejecuta nada directamente — en su lugar, genera un objeto estructurado tipo:

```json
{
  "name": "edit",
  "arguments": {
    "filePath": "/src/app.ts",
    "oldString": "function foo()",
    "newString": "function bar()"
  }
}
```

El harness recibe esto, lo ejecuta y devuelve el resultado al modelo. Esto es lo que permite:

- **Editar archivos** sin que el modelo tenga acceso directo al sistema de archivos
- **Ejecutar bash** con permisos controlados
- **Consultar APIs** a través de MCP
- **Navegar por el web** mediante tools como fetch

> **Razonamiento y comportamiento agéntico son el mismo patrón en dos planos.** El modelo genera un paso, evalúa su progreso hacia un objetivo y decide el siguiente paso. Eso ocurre tanto en el plano interno (tokens de razonamiento, thinking mode) como en el plano externo (tool calls ejecutadas por el harness). El harness no es más que el **reasoning loop proyectado hacia afuera** — la misma mecánica de generar→evaluar→iterar, pero operando sobre el sistema real en vez de sobre el espacio de tokens.

**Diferencias entre modelos:**

| Modelo | Tool calls | Tool accuracy | Parallel calls | Structured output |
|--------|-----------|---------------|----------------|-------------------|
| Claude (3.5/4) | Excelente | Muy alta | Sí (nativa) | Sí (JSON mode) |
| GPT-4o | Muy buena | Alta | Sí | Sí (structured outputs) |
| Gemini 2.5 | Buena | Alta | Sí | Sí |
| Llama 3 (open) | Buena | Media | Limitada | Limitada |
| Mistral Large | Buena | Alta | Sí | Sí |

### Contexto y memoria

El contexto (ventana de tokens) es el espacio de trabajo del modelo. Allí conviven instrucciones, historial de conversación, tool results y contenido de archivos.

**Tamaños de contexto típicos:**

- **Claude**: 200K tokens (~150K palabras)
- **GPT-4o**: 128K tokens
- **Gemini 2.5**: 1M+ tokens (~750K palabras)
- **DeepSeek**: 128K tokens

Un contexto más grande permite procesar más información sin necesidad de recurrir a memoria externa. Sin embargo, el **costo y la latencia** crecen con el tamaño del prompt. Aquí entra el harness engineering:

1. **Contexto mínimo necesario**: no pasar todo el proyecto, solo los archivos relevantes
2. **Memoria externa**: specs, tickets y decisiones guardadas en ficheros fuera del contexto
3. **Context filtering**: cada subagente recibe solo la información que necesita para su tarea

Esto se ve claramente en el flujo SDD del vídeo de referencia: el Spec Author escribe los specs en ficheros MD, el Implementer solo recibe esos specs (no el historial de conversación del Spec Author), y el Reviewer valida contra lo mismo sin cargar con el contexto de implementación.

### MCP (Model Context Protocol)

MCP estandariza cómo los modelos se conectan a herramientas externas. En lugar de que cada CLIs implemente su propio sistema de tools, MCP define:

- **Servidores MCP**: exponen herramientas, recursos y prompts
- **Cliente MCP**: el harness (OpenCode, Claude Code, etc.) se conecta a estos servidores
- **Protocolo**: transporte JSON-RPC sobre stdio o HTTP

Los modelos no "hablan MCP". El harness traduce las tool calls del modelo a solicitudes MCP y viceversa.

**¿Qué aporta MCP al harness?**

| Capacidad | Sin MCP | Con MCP |
|-----------|---------|---------|
| Tools | Hardcodeadas en el CLI | Plugables, cualquier servidor |
| Contexto | Solo instrucciones del agente | Recursos remotos (docs, APIs) |
| Memoria | Interna del modelo | Servidores de memoria persistente |
| Escalabilidad | Monolítica | Distribuida |

## Modelos y su impacto en el harness

No todos los modelos son iguales para construir harness. Aquí las diferencias clave:

### Claude (Anthropic)

- **Tool use nativo**: el modelo entiende tools como parte del flujo natural
- **Thinking mode**: puede "pensar" antes de responder, mejorando la calidad de decisiones complejas
- **200K contexto**: suficiente para la mayoría de proyectos
- **Computer use**: puede interactuar con interfaces gráficas (experimental)
- **Buen seguimiento de instrucciones**: ideal para flujos complejos con múltiples agentes

Ideal para harness que requieren **razonamiento profundo**, **multi-agente** y **seguimiento preciso de formatos**.

### GPT-4o (OpenAI)

- **Function calling robusto**: primer modelo en popularizar tool calls
- **Structured outputs**: salida JSON con esquema validado
- **Ecosistema amplio**: integraciones con miles de herramientas
- **Razonamiento**: o-series para tareas complejas

Ideal para harness que necesitan **integración con herramientas externas** y **salida estructurada predecible**.

### Gemini (Google)

- **Contexto masivo**: 1M+ tokens, ideal para codebases grandes
- **Multimodal nativo**: texto, imágenes, audio, video
- **Tool use**: Google Search, YouTube, Maps integration

Ideal para harness que procesan **proyectos enormes** o contenido **multimodal**.

### Modelos open source (Llama, Mistral, Qwen, DeepSeek)

- **Tool use**: variable según el fine-tuning
- **Contexto**: generalmente menor (32K-128K)
- **Costo**: mucho menor (o nulo si self-hosted)
- **Privacidad**: datos nunca salen de tu infraestructura

Ideal para harness **on-premise**, con requisitos de **privacidad** o **presupuesto limitado**.

## Spec Driven Development: un harness concreto

El vídeo de [Mario Arnal](https://youtu.be/ElGlTv2A_bM) sobre SDD implementa todos estos conceptos en un harness real con Claude Code:

### Arquitectura

```
┌──────────┐
│  Líder   │ ← orquesta el flujo, lee memoria (tasks.json)
└────┬─────┘
     │
     ├──→ Spec Author   (escribe requirements.md, design.md, tasks.md)
     ├──→ Implementer   (implementa usando los specs)
     └──→ Reviewer      (valida contra los specs, ejecuta tests)
     └──→ Humano        (aprueba cada fase — human in the loop)
```

### Flujo de trabajo

1. **Líder** lee `tasks.json` y encuentra tareas pendientes
2. Si la tarea tiene `sdd: true`, lanza **Spec Author**
3. Spec Author genera tres ficheros en `specs/<feature>/`:
   - `requirements.md` — requisitos en notación EARS
   - `design.md` — diseño técnico (ficheros a tocar, cambios)
   - `tasks.md` — lista de tareas concretas para implementar
4. **Humano** revisa y aprueba (cambia estado de `pending` a `spec ready`)
5. **Implementer** recibe solo las tareas y specs necesarios (context filtering)
6. **Reviewer** valida implementación, ejecuta tests, verifica trazabilidad
7. Tarea se mueve a `done` y se guarda en `history.md`

### Gestión de memoria externa

- `tasks.json` — memoria de alto nivel del líder (estado del proyecto)
- `specs/<feature>/` — contexto de cada feature (requisitos, diseño, tareas)
- `history.md` — historial de tareas completadas
- Cada agente carga **solo su contexto necesario** — el Implementer no ve el historial del Spec Author

### Personalización vía MCPs y tools

El harness es totalmente personalizable. Cambiando las instrucciones de los agentes, se puede:

- Usar **MCP de Linear/Jira** para gestión de tickets en vez de ficheros locales
- Guardar decisiones en **memoria persistente MCP**
- Generar **branches automáticas** por cada spec
- Hacer **commits** al completar cada tarea
- Notificar por **Slack/Discord** cuando un agente completa una fase

> *"Para mí, lo realmente importante es que aprendas a construirte tu propio harness. Entiende cómo quieres trabajar, construye tu arnés y estarás desbloqueando una habilidad que cada vez será más buscada."* — Mario Arnal

## Resumen

| Concepto | Rol en el harness |
|----------|-------------------|
| **Tool calls** | Permiten que el modelo ejecute acciones en el mundo real |
| **Context window** | Espacio de trabajo del modelo; el harness lo gestiona para evitar degradación |
| **Memoria externa** | Ficheros, bases de datos o MCPs que guardan estado entre sesiones |
| **MCP** | Protocolo estándar para conectar modelos a herramientas externas |
| **Human in the loop** | Puntos de aprobación humana que mantienen el control de calidad |
| **Context filtering** | Cada subagente recibe solo la información necesaria para su tarea |
| **Reasoning = Agente interno** | El ciclo de pensar y el ciclo de actuar son idénticos — misma mecánica generación→evaluación→iteración |

Los modelos son el motor, pero el harness es el vehículo. Entender cómo funcionan ambos y cómo se complementan es la clave para construir sistemas multi-agente efectivos.

---

> **Referencia**: Este módulo está basado en el vídeo *"Esto es lo que Aprendí Adaptando Claude Code para SDD"* de Mario Arnal. La transcripción completa está disponible en `curso-ia/Transcripciones/ElGlTv2A_bM - Esto es lo que Aprendi Adaptando Claude Code para SDD.md`.
