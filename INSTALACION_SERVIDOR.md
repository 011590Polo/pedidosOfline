# 📦 Instalación del Servidor

## Pasos para instalar y ejecutar

### 1. Instalar dependencias

```bash
cd servidor
npm install
```

Esto instalará:
- `express` - Servidor web
- `socket.io` - Sincronización en tiempo real  
- `sqlite3` - Base de datos SQLite

### 2. Verificar instalación

Verifica que sqlite3 esté instalado:

```bash
cd servidor
npm list sqlite3
```

Si no está instalado, instálalo manualmente:

```bash
cd servidor
npm install sqlite3
```

### 3. Iniciar el servidor

```bash
cd servidor
node server.js
```

O usando npm:

```bash
cd servidor
npm start
```

### 4. Verificar que funciona

Cuando el servidor inicie, deberías ver:

```
==================================================
🚀 Servidor iniciado correctamente!
==================================================
📱 Accede desde este dispositivo: http://localhost:3000
🌐 Accede desde otros dispositivos en la red:
   http://192.168.1.XXX:3000
==================================================

💡 Asegúrate de que ambos dispositivos estén en la misma red WiFi
📊 Base de datos: C:\...\servidor\pedidos.db
```

### 5. Probar la API

Abre tu navegador y visita:

- http://localhost:3000 - Debería cargar la aplicación
- http://localhost:3000/api/clientes - Debería devolver un array JSON (puede estar vacío)

## Problemas Comunes

### Error: "Cannot find module 'sqlite3'"

```bash
cd servidor
npm install sqlite3
```

### Error: "EADDRINUSE: address already in use"

El puerto 3000 está en uso. Cierra otras aplicaciones o cambia el puerto en `server.js`.

### Error: "Base de datos no inicializada"

Verifica que el archivo `servidor/pedidos.db` se haya creado. Si no, revisa los permisos de escritura en la carpeta `servidor/`.

### Las rutas API devuelven 404

1. Verifica que el servidor esté corriendo
2. Verifica que las rutas estén definidas ANTES de `express.static` en `server.js`
3. Revisa la consola del servidor para ver errores

## Estructura de la Base de Datos

La base de datos se crea automáticamente en: `servidor/pedidos.db`

Tablas:
- `productos` - Productos disponibles
- `clientes` - Clientes registrados
- `pedidos` - Pedidos realizados

