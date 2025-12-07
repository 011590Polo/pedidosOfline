# 📦 Sistema de Control de Pedidos - Modo Offline

Sistema de gestión de pedidos que funciona completamente offline usando IndexedDB y puede sincronizarse entre dispositivos mediante Socket.IO.

## 🚀 Características

- ✅ Funcionamiento completamente offline (IndexedDB)
- ✅ Sincronización en tiempo real entre dispositivos (Socket.IO)
- ✅ Interfaz móvil responsive (DaisyUI + Tailwind CSS)
- ✅ Gestión de clientes, pedidos y productos
- ✅ Estados de pedidos (Pendiente/Entregado)
- ✅ Cálculo automático de totales y estadísticas

## 📋 Requisitos

- Node.js 14+ 
- npm o yarn

## 🔧 Instalación

### 1. Instalar dependencias

```bash
cd servidor
npm install
```

O si las dependencias están en la raíz:

```bash
npm install
```

## ▶️ Iniciar el Servidor

### Desde la carpeta servidor:

```bash
cd servidor
npm start
```

O directamente:

```bash
node servidor/server.js
```

### En Linux/Mac (usando el script):

```bash
cd servidor
chmod +x start.sh
./start.sh
```

## 🌐 Acceso

Una vez iniciado el servidor, verás algo como:

```
==================================================
🚀 Servidor iniciado correctamente!
==================================================
📱 Accede desde este dispositivo: http://localhost:3000
🌐 Accede desde otros dispositivos en la red:
   http://192.168.1.100:3000
==================================================
```

- **Desde el mismo dispositivo**: `http://localhost:3000`
- **Desde otros dispositivos en la red**: `http://[IP_MOSTRADA]:3000`

## 📱 Para Android

Consulta el archivo **[INSTRUCCIONES_ANDROID.md](./INSTRUCCIONES_ANDROID.md)** para instrucciones detalladas sobre cómo ejecutar este proyecto en un teléfono Android usando Termux.

## 📁 Estructura del Proyecto

```
ofline/
├── index.html              # Pantalla principal (lista de clientes)
├── agregar-pedido.html     # Formulario para crear pedidos
├── pedidos-cliente.html    # Detalle de pedidos de un cliente
├── agregar-cliente.html    # Formulario para agregar clientes (opcional)
├── db.js                   # Lógica de IndexedDB (clientes, pedidos, productos)
├── servidor/
│   ├── server.js          # Servidor Express + Socket.IO
│   ├── start.sh           # Script de inicio (Linux/Mac)
│   └── package.json       # Dependencias del servidor
├── README.md              # Este archivo
└── INSTRUCCIONES_ANDROID.md # Instrucciones para Android
```

## 🔌 Sincronización entre Dispositivos

El servidor usa Socket.IO para sincronizar datos en tiempo real entre dispositivos conectados. Cuando un dispositivo hace cambios (agrega pedidos, cambia estados, etc.), los otros dispositivos reciben las actualizaciones automáticamente.

### ¿Cómo funciona?

1. **Un celular ejecuta el servidor** (con Node.js en Termux)
2. **Otros dispositivos se conectan** vía WiFi local
3. **Los cambios se sincronizan automáticamente** entre todos los dispositivos conectados
4. **Cada dispositivo mantiene su propia copia** en IndexedDB (funciona offline)

Consulta **[SINCRONIZACION.md](./SINCRONIZACION.md)** para más detalles sobre cómo funciona la sincronización.

## 💾 Almacenamiento de Datos

Los datos se almacenan localmente en cada dispositivo usando IndexedDB. Esto permite que la aplicación funcione completamente offline.

### Estructura de Datos:

- **Clientes**: nombre, total acumulado, número de pedidos, estado
- **Pedidos**: cliente, fecha, hora, items, total, estado
- **Productos**: nombre, precio

## 🛠️ Desarrollo

### Modificar el servidor:

Edita `servidor/server.js` para cambiar el puerto o configuraciones.

### Modificar la aplicación:

- `index.html`: Pantalla principal
- `agregar-pedido.html`: Formulario de pedidos
- `pedidos-cliente.html`: Detalle de cliente
- `db.js`: Lógica de base de datos

## 📝 Notas

- El servidor debe estar en ejecución para que la sincronización funcione
- Los datos se guardan localmente en cada dispositivo
- Ambos dispositivos deben estar en la misma red WiFi para conectarse
- El servidor escucha en todas las interfaces de red (`0.0.0.0`) para permitir conexiones externas

## 🐛 Problemas Comunes

### El servidor no inicia

- Verifica que el puerto 3000 no esté en uso
- Asegúrate de haber instalado las dependencias (`npm install`)

### No puedo acceder desde otro dispositivo

- Verifica que ambos dispositivos estén en la misma red WiFi
- Verifica el firewall y permisos de red
- Usa la IP que muestra el servidor al iniciar

### Los datos no se sincronizan

- Verifica que el servidor esté corriendo
- Verifica la conexión de red
- Revisa la consola del navegador para errores

## 📄 Licencia

ISC
