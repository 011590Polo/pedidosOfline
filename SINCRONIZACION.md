# 🔄 Sistema de Sincronización

## ¿Cómo funciona?

Tu aplicación puede comunicarse entre dispositivos cuando **uno de los celulares ejecuta el servidor local**.

### Arquitectura

```
┌─────────────────┐         ┌─────────────────┐
│  Celular 1      │         │  Celular 2      │
│  (Servidor)     │◄───────►│  (Cliente)      │
│  - Node.js      │         │  - Navegador    │
│  - Socket.IO    │         │  - Socket.IO    │
│  - Puerto 3000  │         │  - IndexedDB    │
└─────────────────┘         └─────────────────┘
       ▲                            ▲
       │                            │
       └──────────────┬─────────────┘
                      │
              ┌───────┴───────┐
              │  WiFi Local   │
              │  (Misma Red)  │
              └───────────────┘
```

## Flujo de Funcionamiento

### 1. Celular Servidor (Android con Termux)

- ✅ Ejecuta Node.js
- ✅ Corre el servidor Express + Socket.IO en puerto 3000
- ✅ Sirve los archivos HTML/CSS/JS
- ✅ Escucha conexiones de otros dispositivos

### 2. Dispositivos Clientes

- ✅ Se conectan al servidor vía WiFi local
- ✅ Cargar la aplicación desde `http://[IP_SERVIDOR]:3000`
- ✅ Se conectan automáticamente a Socket.IO
- ✅ Almacenan datos localmente en IndexedDB
- ✅ Envían y reciben eventos de sincronización

## Sincronización de Datos

### Cuando se crea un pedido:

1. **Dispositivo A** crea un pedido
   - Se guarda en su IndexedDB local
   - Se envía evento `sync-data` al servidor
   - El servidor lo reenvía a todos los otros dispositivos

2. **Dispositivo B** recibe el evento
   - Recibe los datos del nuevo pedido
   - Actualiza su IndexedDB local
   - Refresca la interfaz automáticamente

### Cuando se cambia el estado de un pedido:

1. **Dispositivo A** cambia estado (Pendiente → Entregado)
   - Actualiza su IndexedDB
   - Envía evento de sincronización
   - Todos los otros dispositivos se actualizan

### Estado de Conexión

- 🟢 **Verde**: Conectado y sincronizado
- 🔴 **Rojo**: Sin conexión (modo offline)

## Ventajas

1. **Funciona Offline**: Cada dispositivo tiene su propia copia en IndexedDB
2. **Sincronización en Tiempo Real**: Los cambios se propagan automáticamente
3. **Sin Internet**: Solo necesitas WiFi local
4. **Rápido**: Los datos se almacenan localmente

## Requisitos

- ✅ Ambos dispositivos en la misma red WiFi
- ✅ El servidor debe estar corriendo en uno de ellos
- ✅ Puerto 3000 accesible en la red local

## Ejemplo de Uso

1. **Celular 1** (Servidor):
   ```bash
   cd servidor
   node server.js
   ```
   Verás: `Servidor corriendo en http://192.168.1.100:3000`

2. **Celular 2** (Cliente):
   - Abre navegador
   - Ingresa: `http://192.168.1.100:3000`
   - ¡La app carga y se conecta automáticamente!

3. **Ambos celulares**:
   - Pueden crear pedidos
   - Los cambios se sincronizan automáticamente
   - Cada uno tiene su propia copia local

## Eventos de Sincronización

Los eventos que se sincronizan:

- `pedido-creado`: Nuevo pedido creado
- `pedido-actualizado`: Estado de pedido cambiado
- `cliente-actualizado`: Estadísticas de cliente actualizadas
- `producto-creado`: Nuevo producto agregado

Cada página escucha estos eventos y recarga sus datos automáticamente.

## Troubleshooting

### No se sincroniza

1. Verifica que el servidor esté corriendo
2. Verifica que ambos dispositivos estén en la misma WiFi
3. Revisa el indicador de conexión (🟢/🔴) en la esquina superior
4. Revisa la consola del navegador para errores

### Datos no coinciden

- Cada dispositivo tiene su propia IndexedDB
- Los datos se sincronizan cuando hay conexión
- Si un dispositivo está offline, no recibirá actualizaciones
- Al reconectar, recibirá los últimos cambios
