# 08 — Uploads (Imágenes)

## Nombre
Sistema de Subida de Imágenes

## Función
Gestiona la subida, eliminación y optimización de imágenes a través de Cloudinary. Soporta imágenes de productos y colores.

## Importancia
🟠 **ALTO** — Las imágenes son críticas para la experiencia de compra.

## Archivos Involucrados

### Services
| Archivo | Función |
|---------|---------|
| `src/services/upload.service.ts` | Upload y eliminación en Cloudinary |

### Actions
| Archivo | Función |
|---------|---------|
| `src/actions/admin/upload.ts` | Acción admin de upload |

### Config
| Archivo | Función |
|---------|---------|
| `src/lib/storage/cloudinary.ts` | Configuración de Cloudinary |

### Modelos Relacionados
- `ProductImage` — Imágenes principales del producto
- `ProductColorImage` — Imágenes específicas por color

## Tipos de Imagen

| Tipo | Modelo | Uso |
|------|--------|-----|
| Producto | ProductImage | Imágenes principales del catálogo |
| Color | ProductColorImage | Imágenes específicas por variante de color |

## Flujo de Upload

```
1. Admin selecciona imagen en formulario
2. action upload.ts → upload.service.ts
3. Upload a Cloudinary (`upload_stream`: solo `folder` + `resource_type: image`, sin transformaciones)
4. Retornar URL + publicId
5. Guardar en ProductImage o ProductColorImage
6. imagen disponible para el shop
```

## Configuración Cloudinary

- **Cloud name**: En .env como `CLOUDINARY_URL` (el SDK se auto-configura)
- **API Key**: En .env como `CLOUDINARY_API_KEY`
- **API Secret**: En .env como `CLOUDINARY_API_SECRET`
- **Cloud name (fallback manual)**: si no hay `CLOUDINARY_URL`, la config usa la variable pública NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
- **Carpeta**: el único caller (`actions/admin/upload.ts`) pasa `admin-products`; el default del service es `ecommerce`

## Requiere Revisión

- [ ] Verificar que las imágenes se suban correctamente
- [ ] Testear eliminación de imágenes (cascade delete)
- [ ] Confirmar que solo se acepten JPG/PNG/WEBP (validación de tipo en `upload.ts`)
- [ ] Revisar que las imágenes de colores se muestren en el shop
