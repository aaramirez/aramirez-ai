---
tags:
  - comandos
  - uninstall
created: 2026-07-05
---

# arai uninstall — Desinstalar componentes

## Uso básico

```bash
arai uninstall                    # Desinstala opencode del proyecto
arai uninstall skill youtube      # Desinstala una skill específica
arai uninstall agent build        # Desinstala un agente específico
```

## Por tipo

| Comando | Descripción |
|---------|-------------|
| `arai uninstall` | Desinstala la plataforma opencode completa |
| `arai uninstall skill <nombre>` | Elimina una skill de `.opencode/skills/` |
| `arai uninstall agent <nombre>` | Elimina un agente y su registro en opencode.json |

## Flags

```bash
arai uninstall --project /ruta/al/proyecto
```

---

**Siguiente**: [[02-Comandos/08-list.md|arai list]]
