# ✅ Instalación Completada

## ¿Qué se hizo?

1. ✅ Se instaló `sqlite3` - Base de datos SQLite
2. ✅ Se instalaron todas las dependencias del servidor
3. ✅ El servidor debería estar corriendo ahora

## Cómo verificar que funciona

### 1. Verifica en la terminal del servidor

Deberías ver algo como:

```
✅ Conectado a la base de datos SQLite
✅ Tablas creadas correctamente
✅ Productos iniciales migrados
==================================================
🚀 Servidor iniciado correctamente!
==================================================
📱 Accede desde este dispositivo: http://localhost:3000
🌐 Accede desde otros dispositivos en la red:
   http://192.168.1.XXX:3000
==================================================
```

### 2. Prueba en el navegador

Abre tu navegador y visita:
- http://localhost:3000 - Debería cargar la aplicación
- http://localhost:3000/api/clientes - Debería devolver `[]` (array vacío si no hay clientes)

### 3. Prueba crear un pedido

1. Abre http://localhost:3000
2. Haz clic en "Agregar Pedido"
3. Ingresa un nombre de cliente
4. Agrega productos al pedido
5. Guarda el pedido

## Si hay problemas

### El servidor no inicia

Verifica que no haya errores en la consola. Si ves errores de base de datos, verifica los permisos de escritura en la carpeta `servidor/`.

### Error 404 en las rutas API

1. Asegúrate de que el servidor esté corriendo
2. Verifica que las rutas estén definidas antes de `express.static` en `server.js`
3. Revisa la consola del servidor para errores

### Error de conexión desde otro dispositivo

1. Verifica que ambos dispositivos estén en la misma red WiFi
2. Usa la IP que muestra el servidor (no `localhost`)
3. Verifica el firewall de Windows

## Base de Datos

La base de datos se crea automáticamente en:
- `servidor/pedidos.db`

Puedes hacer backup copiando este archivo.

