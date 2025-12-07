# 🔄 Solución a Problemas de Caché

## Problema: El navegador muestra código antiguo

Si ves errores sobre funciones que ya no existen (como `actualizarEstadisticasCliente`), es porque el navegador tiene el archivo en caché.

## Soluciones Rápidas

### Opción 1: Hard Refresh (Más Rápido)
Presiona en tu navegador:
- **Chrome/Edge**: `Ctrl + Shift + R` o `Ctrl + F5`
- **Firefox**: `Ctrl + Shift + R` o `Ctrl + F5`

### Opción 2: Limpiar Caché
1. Presiona `Ctrl + Shift + Delete`
2. Selecciona "Caché" o "Imágenes y archivos en caché"
3. Selecciona "Última hora" o "Todo el tiempo"
4. Haz clic en "Borrar datos"

### Opción 3: Modo Incógnito
Abre la página en una ventana de incógnito:
- **Chrome/Edge**: `Ctrl + Shift + N`
- **Firefox**: `Ctrl + Shift + P`

Esto evita usar el caché.

## Verificar que el Servidor Sirve los Archivos Correctos

1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Network" (Red)
3. Recarga la página
4. Busca `pedidos-cliente.html`
5. Verifica la fecha/hora del archivo

Si el archivo es muy antiguo, el caché está activo.

## Deshabilitar Caché en Desarrollo

En la consola del navegador (F12):
1. Ve a la pestaña "Network" (Red)
2. Marca la casilla "Disable cache"
3. Mantén la consola abierta mientras desarrollas

Esto evita problemas de caché durante el desarrollo.

