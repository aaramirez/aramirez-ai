---
description: Consultar conocimiento sobre harness engineering o aplicar el marco a un problema concreto con un agente.
---

Load the arnes skill. The user's input is either a direct question about harness engineering (contexto, memoria, herramientas, sandbox, bucles, evals, orquestación, producción) or a concrete problem to solve with an agent.

If it's a direct question about a specific concept, answer it directly using the appropriate notes of `../kb/arnes-kb`.

If it's a problem to solve:
1. Consult `matriz-problema-conocimiento.md` to find the closest row(s).
2. Read the relevant notes and apply them to the concrete case.
3. Synthesize into one actionable recommendation, citing each note and its speaker/channel.

If the problem spans ≥3 temas or the speakers disagree, delegate to the arnes-expert subagent for deeper synthesis.

Always:
1. Cite the source note and its speaker/channel (and the transcript timestamp for literal quotes)
2. Respond in Spanish
3. Present the content as the speakers' views and experience, never as an established standard
