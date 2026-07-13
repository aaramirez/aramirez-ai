---
tags:
  - caso-de-uso
  - reportes
  - automatizacion
created: 2026-07-05
---

# Automatizar reportes semanales

## Objetivo

Generar un reporte semanal de estado del proyecto usando el pipeline docgen.

## Paso 1: Usar la plantilla semanal

```bash
npm run docgen:weekly
```

Esto genera un reporte usando la plantilla `assets/templates/specs/weekly-status.json`.

## Paso 2: Personalizar la plantilla

Edita `assets/templates/specs/weekly-status.json` con los datos de tu proyecto:

```json
{
  "title": "Reporte Semanal — Semana 27",
  "sections": [
    {
      "type": "executive-summary",
      "content": "Esta semana completamos el Módulo 1 y comenzamos el Módulo 2..."
    },
    {
      "type": "metrics",
      "kpis": [
        { "label": "Lecciones completadas", "value": "5" },
        { "label": "Horas invertidas", "value": "12" },
        { "label": "Pendientes", "value": "3" }
      ]
    }
  ]
}
```

## Paso 3: Crear un script de automatización

Crea `shared/scripts/generar-reporte-semanal.sh`:

```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d)
cp assets/templates/specs/weekly-status.json "reports/semana-$TIMESTAMP.json"
node shared/scripts/docgen/build-report.js "reports/semana-$TIMESTAMP.json" --output "reports/"
echo "Reporte generado: reports/semana-$TIMESTAMP.pdf"
```

## Paso 4: Agregar como comando opencode

```bash
node .opencode/scripts/create-command.js weekly-report
```

Esto registra el comando en `opencode.json` para ejecutarlo desde la interfaz de opencode.

---

**Siguiente**: [[11-Casos-de-uso/04-crear-harness-completo.md|Crear un harness completo]]
