# Producción y mantenimiento

## De desarrollo a producción

Migrar un proyecto asistido por IA a producción requiere pasos adicionales:

```
Desarrollo → Staging → Producción
   IA asiste     Revisión     IA monitorea
```

## Checklist pre-producción

- [ ] **Seguridad**: revisar dependencias, secretos, autenticación
- [ ] **Rendimiento**: identificar cuellos de botella
- [ ] **Logging**: asegurar trazabilidad
- [ ] **Monitorización**: alertas ante fallos
- [ ] **Backup**: datos y configuraciones
- [ ] **Documentación**: actualizada para el equipo

## Mantenimiento continuo con IA

### Actualización de dependencias

La IA puede ayudarte a migrar versiones:

```
Input: "Actualiza Prisma de v4 a v5"
Output: cambios necesarios, breaking changes, nuevo schema
```

### Refactorización

```
Input: "Refactoriza este controlador para usar servicios"
Output: código refactorizado manteniendo la misma API
```

### Depuración en producción

```
Input: "Los usuarios reportan error 500 al registrar. Logs: ..."
Output: análisis de logs, posible causa, fix sugerido
```

## Deuda técnica gestionada por IA

La IA puede:

1. Identificar código con baja cobertura de tests
2. Señalar funciones demasiado largas
3. Detectar patrones duplicados
4. Sugerir mejoras de rendimiento

## Evolución del proyecto

```
Semana 1: MVP con 1 agente generalista
Mes 1:   3-4 agentes especializados
Mes 3:   Pipeline multiagente completo
Mes 6:   Agentes de mantenimiento autónomo
```

## Errores comunes en producción

- **Confianza excesiva**: La IA no conoce tu dominio de negocio
- **Falta de revisión**: Código no revisado = bugs en producción
- **Dependencia total**: Si la IA falla, el equipo debe poder continuar

> *"La IA es una herramienta, no un miembro del equipo. El responsable eres tú."*

## Enlaces

- [[04-Caso-practico-completo|Anterior: Caso práctico completo]]
- [[Recursos/Glosario|Glosario]]
- [[Recursos/Comandos-utiles|Comandos útiles]]
