---
name: ecommerce-cro
description: >
  Conversion Rate Optimization (CRO) and Ecommerce UX rules to maximize sales and reduce abandoned carts.
  Trigger: When building product pages, shopping carts, checkouts, or call-to-action buttons.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Designing the Product Detail Page (PDP).
- Modifying the Cart or Mini-cart components.
- Building the Checkout flow.
- Placing primary action buttons (Add to Cart, Buy Now).

## Critical Patterns

### 1. The Call-to-Action (CTA) Hierarchy
The primary action (e.g., "Agregar al Carrito") must be the most visually prominent element on the screen.
- **Color:** Use high-contrast, action-oriented colors (e.g., Indigo, Black, or Brand Primary).
- **Position (Mobile):** Keep the CTA sticky at the bottom of the screen on mobile devices so the user can always tap it while reading the description.
- **Position (Desktop):** Always "Above the fold" (visible without scrolling).

**Do:**
```tsx
<button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all text-lg">
  Agregar al Carrito
</button>
```

### 2. Isolated Checkout (Friction Reduction)
When the user is in the `/checkout` route, **remove distractions**. 
Hide the main navigation bar, search inputs, and footer links. The only options should be completing the purchase or returning to the cart safely.

**Do:**
- Create a specific layout for `(checkout)` that only shows the Logo (secure connection) and a "Volver" button.

### 3. Immediate UX Feedback (Don't kidnap the user)
When a user clicks "Add to Cart", **never** redirect them immediately to the Cart or Checkout page, as this prevents cross-selling.
Instead, show visual confirmation (a toast notification or open a sliding side-cart) and let them continue shopping.

**Do:**
```tsx
const handleAddToCart = () => {
  addToCart(product);
  toast.success(`¡${product.title} se agregó a tu carrito!`);
  openSideCart(); // Abre un carrito lateral (Drawer)
};
```

### 4. Trust Signals & Clarity
Buyers abandon carts if they feel insecure or encounter hidden fees.
- **Security:** Place payment provider icons (Mercado Pago, Visa, SSL) near the Buy button.
- **Clarity:** Clearly state "Envío Gratis" or estimate shipping costs *before* the final step.
- **Scarcity/Urgency (Ethical):** If stock is low (e.g., `< 5`), show it prominently to encourage immediate action.

**Do:**
```tsx
{product.inStock <= 5 && (
  <p className="text-orange-600 font-semibold text-sm animate-pulse">
    ¡Solo quedan {product.inStock} unidades!
  </p>
)}
```

## Resources
- **Baymard Institute (Ecommerce UX):** [https://baymard.com/ecommerce-design-examples](https://baymard.com/ecommerce-design-examples)
