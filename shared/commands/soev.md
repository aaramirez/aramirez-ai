---
description: Consultar el SOEV (Sistema Organizacional de Entrega de Valor) o aplicarlo a un problema organizacional concreto.
---

Load the soev skill. The user's input is either a direct question about the SOEV model (principios, liderazgo, modelo operativo, gobierno, entrega de valor, medición, aprendizaje, implementación) or a concrete organizational problem to solve.

If it's a direct question about a specific concept, answer it using the appropriate notes of `../soev`, starting from their Enunciado SOEV or canonical text.

If it's a problem to solve:
1. Consult `matriz-problema-conocimiento.md` to find the closest row(s).
2. Read the relevant notes and apply them to the concrete case.
3. Synthesize into one actionable recommendation, tying it to the SOEV principle it derives from and citing each note.

If the problem spans ≥3 sections, or the user asks for a diagnosis or adoption plan, delegate to the soev-expert subagent.

Always:
1. Cite the source note (and quote canonical documents literally)
2. Respond in Spanish
3. Distinguish what SOEV states from the KB's development and your own reasoning
