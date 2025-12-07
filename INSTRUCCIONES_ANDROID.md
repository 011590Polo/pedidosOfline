# 📱 Instrucciones para Ejecutar en Android

Este proyecto puede ejecutarse en un teléfono Android y ser accedido desde otros dispositivos en la misma red.

## Requisitos

1. **Termux** - Terminal para Android
   - Descarga desde [F-Droid](https://f-droid.org/en/packages/com.termux/) o [Google Play](https://play.google.com/store/apps/details?id=com.termux)
   - ⚠️ **Importante**: La versión de Google Play puede estar desactualizada. Se recomienda F-Droid.

2. **Acceso a WiFi** - Ambos dispositivos deben estar en la misma red WiFi

## Instalación en Android (Teléfono Servidor)

### Paso 1: Instalar Termux

1. Descarga e instala Termux desde F-Droid o Google Play
2. Abre la aplicación Termux

### Paso 2: Actualizar el sistema

```bash
pkg update && pkg upgrade
```

### Paso 3: Instalar Node.js

```bash
pkg install nodejs
```

### Paso 4: Verificar la instalación

```bash
node --version
npm --version
```

Deberías ver las versiones de Node.js y npm.

### Paso 5: Transferir los archivos del proyecto

Tienes varias opciones:

#### Opción A: Usando USB (Recomendado)

1. Conecta tu Android a la PC con USB
2. Habilita "Transferencia de archivos" o "MTP" en el teléfono
3. Copia toda la carpeta del proyecto al teléfono (por ejemplo, a `/sdcard/Download/ofline`)
4. En Termux, navega a la ubicación:

```bash
cd /sdcard/Download/ofline
```

#### Opción B: Usando git (si tienes el proyecto en GitHub)

```bash
pkg install git
cd ~
git clone [URL_DE_TU_REPOSITORIO]
cd ofline
```

#### Opción C: Usando curl/wget para descargar un ZIP

```bash
pkg install unzip
cd ~
# Descarga tu proyecto (ejemplo con curl)
curl -L [URL_DEL_ZIP] -o proyecto.zip
unzip proyecto.zip
cd ofline
```

### Paso 6: Instalar dependencias

```bash
cd servidor
npm install
```

O si las dependencias están en la raíz:

```bash
npm install
```

### Paso 7: Iniciar el servidor

```bash
cd servidor
node server.js
```

O si estás en la raíz y el servidor está en la carpeta servidor:

```bash
node servidor/server.js
```

### Paso 8: Ver la IP del servidor

Cuando el servidor inicie, verás algo como:

```
==================================================
🚀 Servidor iniciado correctamente!
==================================================
📱 Accede desde este dispositivo: http://localhost:3000
🌐 Accede desde otros dispositivos en la red:
   http://192.168.1.100:3000
==================================================
```

**Anota la IP que aparece** (ejemplo: `192.168.1.100`)

## Acceder desde otro dispositivo

### En otro teléfono/tablet/PC en la misma red WiFi:

1. Abre el navegador (Chrome, Firefox, etc.)
2. Ingresa la URL: `http://[IP_DEL_SERVIDOR]:3000`
   - Ejemplo: `http://192.168.1.100:3000`
3. ¡La aplicación debería cargarse!

## Problemas Comunes

### 1. Error: "Cannot find module 'express'"

**Solución**: Asegúrate de haber ejecutado `npm install` en la carpeta correcta:

```bash
cd servidor
npm install
```

### 2. Error: "EADDRINUSE: address already in use"

**Solución**: El puerto 3000 está en uso. Cambia el puerto en `server.js` o cierra la aplicación que lo está usando.

### 3. No puedo acceder desde otro dispositivo

**Soluciones**:
- ✅ Verifica que ambos dispositivos estén en la misma red WiFi
- ✅ Verifica el firewall del teléfono servidor (puede necesitar permisos)
- ✅ Verifica que la IP mostrada sea correcta
- ✅ Intenta reiniciar Termux
- ✅ Verifica que el servidor esté corriendo y muestre la IP

### 4. Permisos de almacenamiento

Si Termux no puede acceder a los archivos:

```bash
termux-setup-storage
```

Luego acepta los permisos cuando se soliciten.

### 5. Mantener Termux activo

Para evitar que Termux se cierre en segundo plano:
- Ve a Configuración > Aplicaciones > Termux
- Desactiva "Optimización de batería"
- Activa "Permitir en segundo plano"

## Script de Inicio Rápido

Puedes crear un script para iniciar más fácilmente:

```bash
nano start.sh
```

Pega esto:

```bash
#!/data/data/com.termux/files/usr/bin/bash
cd ~/ofline/servidor
node server.js
```

Guardar: `Ctrl + X`, luego `Y`, luego `Enter`

Dar permisos de ejecución:

```bash
chmod +x start.sh
```

Para iniciar:

```bash
./start.sh
```

## Sincronización de Datos (Socket.IO)

El servidor está configurado para sincronizar datos entre dispositivos usando Socket.IO. Cuando un dispositivo hace cambios, los otros dispositivos conectados recibirán las actualizaciones automáticamente.

## Notas Importantes

- ⚠️ El servidor se detendrá si cierras Termux o si el teléfono se apaga
- 💡 Para mantener el servidor activo, no cierres Termux completamente
- 🔋 Asegúrate de tener suficiente batería o conecta el teléfono al cargador
- 📶 La conexión solo funcionará mientras ambos dispositivos estén en la misma red WiFi
