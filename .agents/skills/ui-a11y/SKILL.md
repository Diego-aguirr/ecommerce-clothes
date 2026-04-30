---
name: ui-a11y
description: >
  UI components, UX patterns, and Accessibility (a11y) standards for the project.
  Trigger: When building or modifying UI components, styling layouts, or adding interactive elements.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Building new React components for the user interface.
- Implementing interactive elements (modals, dropdowns, buttons).
- Styling forms, inputs, and interactive widgets.
- Improving SEO and screen-reader accessibility.

## Critical Patterns

### 1. Semantic HTML & Keyboard Navigation (A11y)
Never use a `<div>` or `<span>` for an interactive element. If it's clickable, it MUST be a `<button>` or an `<a>`. 

**Bad:**
```tsx
<div onClick={() => submit()} className="cursor-pointer bg-blue-500">Enviar</div>
```

**Good:**
```tsx
<button 
  type="button" 
  onClick={() => submit()} 
  className="bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-all"
  aria-label="Enviar formulario"
>
  Enviar
</button>
```
*Note: Always include `focus-visible` styles so keyboard users know where they are.*

### 2. ARIA Attributes for State
Dynamic components like dropdowns, accordions, and modals must communicate their state to screen readers.

**Do:**
```tsx
<button 
  aria-expanded={isOpen} 
  aria-controls="dropdown-menu"
>
  Menú
</button>
<div id="dropdown-menu" hidden={!isOpen} aria-hidden={!isOpen}>
  {/* contenido */}
</div>
```

### 3. Icons are Decorative
When using icons (like `react-icons`), they should be hidden from screen readers unless they are the *only* content in a button.

**Do:**
```tsx
// Solo un icono (el botón necesita aria-label)
<button aria-label="Cerrar ventana"><FiX aria-hidden="true" /></button>

// Icono con texto (el texto ya es suficiente)
<button><FiShoppingCart className="mr-2" aria-hidden="true" /> Comprar</button>
```

### 4. Micro-animations & UX Feedback
Always provide visual feedback when the user interacts (hover, active, disabled) and when data is loading (Skeletons/Spinners).

**Do:**
```tsx
<button 
  disabled={isLoading}
  className="... hover:-translate-y-0.5 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isLoading ? <Spinner aria-label="Cargando..." /> : 'Guardar'}
</button>
```

### 5. Color Contrast & Semantic Colors
Avoid raw generic colors for semantic states. Use Tailwind's palette logically:
- `red-500` to `red-700` for destructive actions / errors.
- `green-500` to `green-700` for success.
- `gray-900` or `indigo-600` for primary actions.
Ensure text over background always has high contrast (e.g., white text over `indigo-600`).

## Resources
- **W3C WAI-ARIA Practices**: [https://www.w3.org/WAI/ARIA/apg/](https://www.w3.org/WAI/ARIA/apg/)
- **Tailwind CSS Accessibility**: [https://tailwindcss.com/docs/screen-readers](https://tailwindcss.com/docs/screen-readers)
