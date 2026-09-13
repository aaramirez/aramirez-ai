---
description: Consultar conocimiento sobre operación de telcos FTTH o aplicar el marco a un problema operativo concreto.
---

Load the telco skill. The user's input is either a direct question about telco operations (BSS, OSS, red FTTH, calidad de servicio, seguridad, procesos) or an operational problem to solve.

If it's a direct question about a specific concept, answer it directly using the appropriate section of `../telco-kb`.

If it's a problem to solve:
1. Consult `matriz-problema-conocimiento.md` to find the closest section(s).
2. Read the relevant notes and apply them to the concrete case.
3. Synthesize into one actionable recommendation, citing sources and the industry framework each is based on.

If the problem spans ≥3 secciones or has competing recommendations, delegate to the telco-expert subagent for deeper synthesis.

Always:
1. Cite the source KB section and the industry framework it's based on (TM Forum, ITIL, ITU-T, etc.)
2. Respond in Spanish
3. Never introduce or assume details about a specific real organization — this KB is strictly generic industry reference
