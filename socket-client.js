/**
 * Cliente Socket.IO para sincronización entre dispositivos
 * Se conecta automáticamente al servidor cuando está disponible
 */

let socket = null;
let isConnected = false;

/**
 * Obtener la URL del servidor automáticamente
 */
function getServerURL() {
  // Si estamos en localhost, usar localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  
  // Si estamos accediendo por IP, usar la misma IP pero con el puerto 3000 para Socket.IO
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:3000`;
}

/**
 * Inicializar conexión Socket.IO
 */
function initSocketConnection() {
  // Verificar si Socket.IO está disponible
  if (typeof io === 'undefined') {
    console.warn('Socket.IO no está cargado. Cargando desde CDN...');
    loadSocketIO(() => {
      connectToServer();
    });
    return;
  }
  
  connectToServer();
}

/**
 * Cargar Socket.IO desde CDN si no está disponible
 */
function loadSocketIO(callback) {
  if (typeof io !== 'undefined') {
    callback();
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://cdn.socket.io/4.8.1/socket.io.min.js';
  script.onload = callback;
  script.onerror = () => {
    console.error('Error al cargar Socket.IO. La sincronización no estará disponible.');
  };
  document.head.appendChild(script);
}

/**
 * Conectar al servidor
 */
function connectToServer() {
  try {
    const serverURL = getServerURL();
    console.log('🔌 Conectando a Socket.IO server:', serverURL);
    
    socket = io(serverURL, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      isConnected = true;
      console.log('✅ Conectado al servidor Socket.IO. ID:', socket.id);
      showConnectionStatus(true);
      
      // Notificar a otras partes de la aplicación
      window.dispatchEvent(new CustomEvent('socket:connected', { detail: { socketId: socket.id } }));
    });

    socket.on('disconnect', () => {
      isConnected = false;
      console.log('❌ Desconectado del servidor Socket.IO');
      showConnectionStatus(false);
      
      window.dispatchEvent(new CustomEvent('socket:disconnected'));
    });

    socket.on('connect_error', (error) => {
      console.warn('⚠️ Error de conexión Socket.IO:', error.message);
      isConnected = false;
      showConnectionStatus(false);
    });

    // Escuchar eventos de sincronización
    socket.on('sync-data', (data) => {
      console.log('📥 Datos recibidos para sincronización:', data);
      handleSyncData(data);
    });

  } catch (error) {
    console.error('Error al inicializar Socket.IO:', error);
    isConnected = false;
  }
}

// Cache para evitar procesar eventos duplicados
let processedEvents = new Set();
let processingEvent = false;
let processingTimeout = null;

/**
 * Manejar datos recibidos para sincronización
 */
async function handleSyncData(data) {
  if (!data || !data.type) {
    console.warn('Datos de sincronización inválidos:', data);
    return;
  }

  // Prevenir procesamiento si ya estamos procesando un evento
  if (processingEvent) {
    console.log('⏳ Ya hay un evento en proceso, ignorando duplicado:', data.type);
    return;
  }

  // Crear una clave única para el evento basada en su contenido
  const timestamp = data.timestamp || Date.now();
  const eventId = String(data.pedidoId || data.clienteId || data.pedido?.id || '');
  const eventKey = `${data.type}-${timestamp}-${eventId}`;
  
  // Ignorar si es el mismo evento que ya procesamos recientemente
  if (processedEvents.has(eventKey)) {
    console.log('⏭️ Evento ya procesado, ignorando duplicado:', data.type);
    return;
  }

  // Marcar que estamos procesando y agregar al cache
  processingEvent = true;
  processedEvents.add(eventKey);

  // Limpiar eventos antiguos del cache periódicamente (mantener solo los últimos 50)
  if (processedEvents.size > 50) {
    const entries = Array.from(processedEvents).slice(-50);
    processedEvents.clear();
    entries.forEach(e => processedEvents.add(e));
  }

  console.log('📥 Procesando datos de sincronización:', data.type);

  try {
    // Limpiar timeout anterior si existe
    if (processingTimeout) {
      clearTimeout(processingTimeout);
    }

    // Disparar evento personalizado para que cada página lo maneje
    // Las páginas HTML manejarán la sincronización usando las funciones de api-client.js
    window.dispatchEvent(new CustomEvent('sync:data', { detail: data }));
  } catch (error) {
    console.error('Error al procesar sincronización:', error);
  } finally {
    // Permitir procesar el siguiente evento después de un delay
    processingTimeout = setTimeout(() => {
      processingEvent = false;
    }, 500);
  }
}

/**
 * Enviar datos para sincronizar a otros dispositivos
 */
function syncData(data) {
  if (!isConnected || !socket) {
    console.warn('No conectado al servidor. Los datos no se sincronizarán.');
    return false;
  }

  try {
    socket.emit('sync-data', data);
    console.log('📤 Datos enviados para sincronización:', data);
    return true;
  } catch (error) {
    console.error('Error al enviar datos:', error);
    return false;
  }
}

/**
 * Mostrar estado de conexión en la UI
 */
function showConnectionStatus(connected) {
  // Crear o actualizar indicador de conexión
  let indicator = document.getElementById('socket-status-indicator');
  
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'socket-status-indicator';
    indicator.style.cssText = `
    width: 80px;
    height: 30px;
      position: fixed;
      top: 10px;
      right: 10px;
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      z-index: 9999;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      transition: all 0.3s;
    `;
    document.body.appendChild(indicator);
  }

  if (connected) {
    indicator.textContent = '🟢 Activo';
    indicator.style.backgroundColor = '#10b981';
    indicator.style.color = 'white';
  } else {
    indicator.textContent = '🔴 Inactivo';
    indicator.style.backgroundColor = '#ef4444';
    indicator.style.color = 'white';
  }
}

/**
 * Verificar si está conectado
 */
function isSocketConnected() {
  return isConnected && socket && socket.connected;
}

/**
 * Desconectar Socket.IO
 */
function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    isConnected = false;
    showConnectionStatus(false);
  }
}

// Inicializar cuando se carga el script
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSocketConnection);
} else {
  initSocketConnection();
}

// Exponer funciones globalmente
window.socketSync = {
  syncData,
  isConnected: isSocketConnected,
  disconnect: disconnectSocket,
  reconnect: connectToServer
};
