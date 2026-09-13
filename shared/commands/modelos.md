---
description: Aplicar modelos mentales a una pregunta o a un problema concreto.
---

Load the modelos-mentales skill. The user's input is either a direct question about a mental model, or a problem to solve.

If it's a direct question about a specific model or concept, answer it directly using the appropriate section of `../modelos-kb`.

If it's a problem to solve:
1. Consult `matriz-problema-modelos.md` to find the closest arquetipo(s) de problema.
2. Select 3–6 modelos covering at least 2 disciplinas distintas — never a single model.
3. Explain why each applies and what it suggests.
4. Flag explicitly any tension between what different models suggest.
5. Synthesize into one actionable recommendation.

If the problem spans ≥3 disciplinas or has unresolved model tensions, delegate to the modelos-expert subagent for deeper synthesis.

Always:
1. Cite the source KB section (wikilink) for every model used
2. Respond in Spanish
3. If a selected model's note is still "Pendiente" (not yet written), say so rather than inventing content
