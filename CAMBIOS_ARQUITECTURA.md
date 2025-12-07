# 🔄 Cambios de Arquitectura: Cliente-Servidor

## ¿Qué cambió?

Se migró de una arquitectura **distribuida** (cada dispositivo con su propia IndexedDB) a una arquitectura **cliente-servidor** donde:

- ✅ **El servidor maneja TODA la base de datos** (SQLite)
- ✅ **Los clientes solo se conectan** y hacen peticiones HTTP
- ✅ **La sincronización es automática** porque todos usan la misma BD del servidor

## Ventajas

1. **Datos centralizados**: Todos los dispositivos ven los mismos datos
2. **Sin conflictos**: No hay problemas de sincronización
3. **Más simple**: Los clientes solo hacen peticiones HTTP
4. **Mejor rendimiento**: El servidor maneja toda la lógica de BD

## Instalación

### 1. Instalar dependencias del servidor

```bash
cd servidor
npm install
```

Esto instalará:
- `express`: Servidor web
- `socket.io`: Sincronización en tiempo real
- `sqlite3`: Base de datos SQLite

### 2. Iniciar el servidor

```bash
cd servidor
node server.js
```

O usando npm:

```bash
cd servidor
npm start
```

La primera vez que inicies el servidor, creará automáticamente:
- El archivo de base de datos: `servidor/pedidos.db`
- Las tablas necesarias
- Los productos iniciales

## Estructura de Archivos

```
servidor/
├── server.js          # Servidor Express + Socket.IO
├── database.js        # Configuración de SQLite
├── api.js             # Endpoints REST API
├── pedidos.db         # Base de datos SQLite (se crea automáticamente)
└── package.json       # Dependencias

api-client.js          # Cliente API para los HTML (reemplaza db.js)
```

## API Endpoints

### Productos
- `GET /api/productos` - Obtener todos los productos
- `POST /api/productos` - Agregar nuevo producto

### Clientes
- `GET /api/clientes` - Obtener todos los clientes
- `GET /api/clientes/:id` - Obtener un cliente por ID
- `POST /api/clientes/buscar-o-crear` - Buscar o crear cliente

### Pedidos
- `GET /api/pedidos` - Obtener todos los pedidos
- `GET /api/pedidos/cliente/:clienteId` - Pedidos de un cliente
- `POST /api/pedidos` - Crear nuevo pedido
- `PUT /api/pedidos/:id/estado` - Actualizar estado del pedido

## Cómo Funciona

1. **Servidor**: Gestiona la base de datos SQLite y expone API REST
2. **Clientes**: Se conectan al servidor y hacen peticiones HTTP
3. **Socket.IO**: Sincroniza cambios en tiempo real entre dispositivos

## Migración de Datos

Si tenías datos en IndexedDB de la versión anterior:

1. Exporta los datos manualmente desde la consola del navegador
2. O simplemente vuelve a ingresar los datos (son pocos)

Los productos iniciales se migran automáticamente la primera vez.

## Resolución de Problemas

### Error: "Cannot find module 'sqlite3'"

```bash
cd servidor
npm install sqlite3
```

### Error: "EADDRINUSE"

El puerto 3000 está en uso. Cambia el puerto en `server.js` o cierra la aplicación que lo está usando.

### La base de datos no se crea

Verifica los permisos de escritura en la carpeta `servidor/`. El archivo `pedidos.db` se crea automáticamente.

## Notas

- La base de datos está en: `servidor/pedidos.db`
- Puedes hacer backup copiando este archivo
- Si eliminas `pedidos.db`, se recreará con las tablas vacías

