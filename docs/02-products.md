# 02 — Products (Productos)

## Nombre
Sistema de Productos y Variantes

## Función
Gestiona el catálogo completo: productos, variantes (talla+color), colores, imágenes, y movimientos de stock. Soporta CRUD completo desde el admin y lectura paginada desde el shop.

## Importancia
🔴 **CRÍTICO** — Es el corazón del e-commerce. Sin productos, no hay tienda.

## Archivos Involucrados

### Services
| Archivo | Función |
|---------|---------|
| `src/services/product.service.ts` | CRUD productos, paginación, búsqueda por slug/género |
| `src/services/variant.service.ts` | CRUD variantes, stock, toggle activo |
| `src/services/color.service.ts` | CRUD colores, imágenes por color, reorden |
| `src/services/category.service.ts` | CRUD categorías |

### Actions
| Archivo | Función |
|---------|---------|
| `src/actions/product/get-product-by-slug.ts` | Obtener producto por slug |
| `src/actions/product/get-stock-by-slug.ts` | Obtener stock por slug |
| `src/actions/product/product-pagination.ts` | Paginación de productos |
| `src/actions/admin/products.ts` | CRUD admin de productos |
| `src/actions/admin/variants.ts` | CRUD admin de variantes |
| `src/actions/admin/colors.ts` | CRUD admin de colores |
| `src/actions/admin/categories.ts` | CRUD admin de categorías |

### Components
| Archivo | Función |
|---------|---------|
| `src/components/products/product-grid/ProductGrid.tsx` | Grid de productos |
| `src/components/products/product-grid/ProductGridItem.tsx` | Item del grid |
| `src/components/product/size-selector/SizeSelector.tsx` | Selector de tallas |
| `src/components/product/color-selector/ColorSelector.tsx` | Selector de colores |
| `src/components/product/quantity-selector/QuantitySelector.tsx` | Selector de cantidad |
| `src/components/product/slideshow/ProductSlideshow.tsx` | Slideshow de imágenes |
| `src/components/product/slideshow/ProductMobileSlideshow.tsx` | Slideshow mobile |
| `src/components/product/stock-label/StockLabel.tsx` | Label de stock |
| `src/components/admin/products/product-form.tsx` | Formulario admin |
| `src/components/admin/products/product-thumbnail.tsx` | Thumbnail admin |

### Pages
| Ruta | Función |
|------|---------|
| `(shop)/page.tsx` | Home con grid |
| `(shop)/product/[slug]/page.tsx` | Detalle de producto |
| `(shop)/gender/[gender]/page.tsx` | Productos por género |
| `admin/products/page.tsx` | Lista admin |
| `admin/products/new/page.tsx` | Crear producto |
| `admin/products/[id]/page.tsx` | Editar producto |
| `admin/products/[id]/variants/page.tsx` | Gestionar variantes |
| `admin/products/[id]/colors/page.tsx` | Gestionar colores |

### Modelos Relacionados
- `Product` — Producto principal (título, descripción, precio, slug, género, tags)
- `ProductVariant` — Variante por talla+color con stock y SKU único
- `ProductColor` — Colores human-readable con label y hexCode
- `ProductColorImage` — Imágenes específicas por color
- `ProductImage` — Imágenes principales del producto
- `StockMovement` — Trazabilidad de movimientos de stock
- `Category` — Categorías de productos

## Flujo de Creación (Admin)

```
1. Admin llena formulario (Zod validation)
2. action products.ts → product.service.ts
3. Crear Product en DB
4. Crear ProductImage (upload a Cloudinary)
5. Crear ProductVariant por cada talla+color
6. Crear StockMovement por cada variante
7. revalidatePath → actualizar cache
```

## Flujo de Visualización (Shop)

```
1. Usuario navega a home/género/producto
2. Server Component llama action
3. action → product.service.ts
4. Prisma query con includes (images, variants, colors)
5. Retornar DTO limpio (sin tipos Prisma)
6. Renderizar componente
```

## Sistema de Variantes

Cada producto tiene variantes por combinación talla+color:
- **SKU único**: Identificador único por variante
- **Stock individual**: Cada variante tiene su propio stock
- **Trazabilidad**: Cada movimiento de stock se registra en StockMovement
- **Imágenes por color**: ProductColorImage permite fotos diferentes por color

## Requiere Revisión

- [ ] Verificar que el stock se actualice correctamente al crear órdenes
- [ ] Testear paginación con filtros combinados (género + categoría)
- [ ] Revisar que las imágenes de colores se muestren correctamente
- [ ] Confirmar que ColorSelector muestre colores con label legible (no "gris_melange")
- [ ] Verificar que el toggle de variantes (isActive) funcione

## Bugs Conocidos y Resueltos

- **Selector de colores mostraba strings crudos de DB**: Se resolvió uniendo con ProductColor para mostrar labels legibles
- **Double stock decrement**: Al cambiar variantes, el decremento se ejecutaba dos veces
