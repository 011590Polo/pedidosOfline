# ⚡ Inicio Rápido

## 🖥️ Desde Windows (PC de desarrollo)

1. **Instalar dependencias** (solo la primera vez):
```bash
cd servidor
npm install
```

2. **Iniciar el servidor**:
```bash
node server.js
```

O simplemente haz doble clic en `servidor/start.bat`

3. **Abrir en el navegador**:
   - Desde la misma PC: `http://localhost:3000`
   - Desde otro dispositivo: usa la IP que muestra el servidor (ej: `http://192.168.1.100:3000`)

## 📱 Desde Android (Teléfono Servidor)

1. **Instalar Termux** desde F-Droid o Google Play

2. **Instalar Node.js en Termux**:
```bash
pkg update && pkg upgrade
pkg install nodejs
```

3. **Transferir los archivos** al teléfono (ver [INSTRUCCIONES_ANDROID.md](./INSTRUCCIONES_ANDROID.md))

4. **Instalar dependencias**:
```bash
cd servidor
npm install
```

5. **Iniciar el servidor**:
```bash
node server.js
```

6. **Anotar la IP** que muestra el servidor (ej: `192.168.1.100`)

7. **Desde otro dispositivo**, abrir en el navegador: `http://192.168.1.100:3000`

## ✅ Verificación

Si todo está bien, verás:

```
==================================================
🚀 Servidor iniciado correctamente!
==================================================
📱 Accede desde este dispositivo: http://localhost:3000
🌐 Accede desde otros dispositivos en la red:
   http://192.168.1.XXX:3000
==================================================

💡 Asegúrate de que ambos dispositivos estén en la misma red WiFi
```

## 📚 Documentación Completa

- **README.md**: Información general del proyecto
- **INSTRUCCIONES_ANDROID.md**: Guía detallada para Android/Termux
