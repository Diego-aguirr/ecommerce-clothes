# Guía de Comandos para Gentle AI Orchestrator

> Cómo interactuar conmigo para que use correctamente el flujo SDD (Spec-Driven Development)

---

## Comandos Meta (Tú los escribís, yo los ejecuto)

### `/sdd-new <nombre-cambio>`
**Cuándo usar:** Empezar un cambio nuevo desde cero.

**Ejemplos:**
```
/sdd-new refactor-colors-service
/sdd-new add-payment-webhook
/sdd-new fix-stock-race-condition
```

**Lo que hace:**
1. Pregunta modo de ejecución (auto/interactive)
2. Pregunta artifact store (engram/openspec/hybrid)
3. Pregunta estrategia de delivery (ask-on-risk/auto-chain/single-pr)
4. Lanza `sdd-explore` → `sdd-propose` → `sdd-spec` → `sdd-design` → `sdd-tasks`

---

### `/sdd-continue [nombre-cambio]`
**Cuándo usar:** Seguir un cambio ya empezado.

**Ejemplos:**
```
/sdd-continue refactor-colors-service
/sdd-continue            # usa el último cambio activo
```

**Lo que hace:**
1. Busca el estado actual en engram/openspec
2. Lanza la siguiente fase que falte (ej: si tenés specs, lanza design)

---

### `/sdd-ff <nombre-cambio>`
**Cuándo usar:** Fast-forward planning (saltar al código directo).

**Ejemplo:**
```
/sdd-ff quick-fix-login-redirect
```

**Lo que hace:**
- Va directo a fase de especificación y tareas sin tanta ceremonia
- Útil para cambios chicos (< 50 líneas)

---

## Decisiones que Vos Tomás (la primera vez por sesión)

### 1. Modo de Ejecución

| Opción | Cuándo usar |
|--------|-------------|
| **auto** | Confías en que haga todo de una sin parar |
| **interactive** | *(default)* Querés revisar cada fase antes de continuar |

**Ejemplo de diálogo:**
```
Yo: "¿Modo auto o interactive?"
Vos: "auto, confío en vos"
```

---

### 2. Artifact Store

| Opción | Cuándo usar |
|--------|-------------|
| **engram** | *(default si disponible)* Sin archivos, todo en memoria persistente |
| **openspec** | Querés archivos en `openspec/` para compartir con el equipo |
| **hybrid** | Ambos - archivos + memoria |

**Ejemplo de diálogo:**
```
Yo: "¿engram, openspec o hybrid?"
Vos: "engram, no quiero archivos de más"
```

---

### 3. Estrategia de Delivery

| Opción | Cuándo usar |
|--------|-------------|
| **ask-on-risk** | *(default)* Pregunto si dividir en PRs si son > 400 líneas |
| **auto-chain** | Siempre dividir en PRs encadenados si es grande |
| **single-pr** | Querés todo en un PR (necesitarás `size:exception`) |
| **exception-ok** | PR grande aprobado por mantainer |

**Ejemplo de diálogo:**
```
Yo: "¿Cómo querés manejar el delivery?"
Vos: "auto-chain, prefiero PRs chicos"
```

---

## Durante el Trabajo

### Si querés que PARE y pregunte:
```
"Stop, tengo una duda sobre X"
"Pause, no estoy seguro de esto"
```

### Si querés que CONTINUE automático:
```
"Continuá con la siguiente fase"
"Dale para adelante"
"Siguiente"
```

### Si querés VER el estado:
```
"¿Qué hicimos hasta ahora?"
"¿En qué fase estamos?"
"Show me the current state"
```

---

## Reglas de Oro (para que no me vuelva loco)

| Situación | Tu Orden | Mi Respuesta |
|-----------|----------|--------------|
| Cambio nuevo | `/sdd-new nombre-cambio` | Lanza workflow completo |
| Seguir donde quedamos | `/sdd-continue` | Detecta fase actual y sigue |
| Fix rápido sin tanta vuelta | `/sdd-ff fix-login-bug` | Va directo a spec + tasks |
| Solo explorar, sin compromiso | `/sdd-explore tema` | Investiga, no crea nada |
| "¿Qué tenemos hecho?" | "What did we do so far?" | Muestro resumen de engram |

---

## Flujo Típico de una Sesión

```
Vos: /sdd-new refactor-cart-service

Yo: [Pregunta modo] ¿Auto o interactive?
Vos: interactive

Yo: [Pregunta store] ¿Engram, openspec o hybrid?
Vos: engram

Yo: [Pregunta delivery] ¿Ask-on-risk, auto-chain, single-pr?
Vos: ask-on-risk

Yo: [Lanza sdd-explore] Investigando el código...
     [Fase completa - esperando tu OK]

Vos: Continuá

Yo: [Lanza sdd-propose] Acá está la propuesta...
     [Esperando OK]

Vos: Dale, seguí

Yo: [Lanza sdd-spec] Especificaciones listas...

Vos: Ahora implementá

Yo: [Lanza sdd-tasks] Tareas definidas, son 3 PRs encadenados
     ¿Empezamos con el PR #1?

Vos: Sí

Yo: [Lanza sdd-apply] Implementando PR #1...
     [PR #1 listo para review]
```

---

## Checklist Rápido

Antes de cada comando, preguntate:

- [ ] ¿Es un cambio nuevo o estamos continuando?
- [ ] ¿Querés ver cada paso o que vaya solo?
- [ ] ¿Preferís engram (memoria) o archivos de verdad?
- [ ] ¿Es un fix rápido o algo grande que necesita planificación?

---

## Ejemplos Completos

### Escenario 1: Feature Nueva Mediana
```
Vos: /sdd-new add-wishlist-feature
Yo: ¿Modo? Vos: interactive
Yo: ¿Store? Vos: engram
Yo: ¿Delivery? Vos: ask-on-risk
[Exploro → Propongo → Especifico → Diseño → Tareas → Implemento]
```

### Escenario 2: Fix Urgente
```
Vos: /sdd-ff fix-critical-bug
Yo: [Detecta que es chico, va rápido a spec + apply]
```

### Escenario 3: Continuar Mañana
```
Vos: /sdd-continue add-wishlist-feature
Yo: [Lee estado de engram, sigue donde quedamos]
```

---

## Notas Importantes

1. **Siempre especificá el nombre del cambio** en `/sdd-new` y `/sdd-ff`
2. **Una vez elegido modo/store/delivery**, se cachea para la sesión
3. **En modo interactive**, te muestro resumen y espero tu "continuá"
4. **En modo auto**, hago todo de una y te muestro el resultado final
5. **Si no sabés qué comando usar**, preguntame "¿Qué hacemos ahora?"

---

**TL;DR:**
- Nuevo cambio: `/sdd-new nombre`
- Seguir: `/sdd-continue`
- Fix rápido: `/sdd-ff nombre`
- Siempre responde las 3 preguntas iniciales (modo, store, delivery)
