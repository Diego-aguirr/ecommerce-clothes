# Transcripción del Chat – Sección Administrador

**Fecha:** 2026-03-31

---

**Resumen del flujo de trabajo de agentes**

- Principios arquitectónicos: Scope determina estructura, Screaming Architecture, Co‑location.
- Organización por dominios (auth, products, cart, admin, etc.).
- Uso de skills según la tarea (nextjs-15, zod-4, react-19, tailwind-4, zustand-5, typescript, skill-sync).
- Buenas prácticas de seguridad: validación Zod, Prisma, NextAuth v5, manejo de errores seguros.
- Flujo recomendado: Orquestador → Agente de dominio → Selección de skill → Implementación → Post‑implementación.

---

**Conversación completa**

```
[Usuario] en este chat vamos a trabajar con este archivos md. ahi mismo explica el flujo de trabajo de contexto de agentes pro dominio y slkill en conjuntos para las buenas practicas y seguridad leelo
[Asistente] (Resumen del flujo de trabajo de contexto de agentes por dominio y conjuntos de skills ...)
[Usuario] si el flujo es este esta el agente princiapal elorquetador depues consulta el agente de dominio y todos siguen las reglas establicidas y usas las skill dependiendo del trabajo que se le pida
[Asistente] (Resumen del flujo de trabajo de agentes ...)
[Usuario] quiero que se guarde este chat esta es la seccion de adminitrador
```

---

*Este archivo se genera automáticamente para documentar la conversación y servir como referencia en la sección de administración del proyecto.*
