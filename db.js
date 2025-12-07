/**
 * Sistema de Base de Datos IndexedDB para Control de Pedidos
 * Maneja: Clientes, Pedidos, Items de Pedidos
 */

const DB_NAME = 'PedidosDB';
const DB_VERSION = 2; // Incrementado para agregar store de productos

// Nombres de los stores (tablas)
const STORES = {
  CLIENTES: 'clientes',
  PEDIDOS: 'pedidos',
  ITEMS: 'items', // Items de pedidos (opcional, también pueden estar en el pedido)
  PRODUCTOS: 'productos' // Productos disponibles para pedidos
};

// Variable global para la conexión a la BD
let db = null;

/**
 * Inicializar la base de datos
 * @returns {Promise<IDBDatabase>}
 */
function initDB() {
  return new Promise((resolve, reject) => {
    // Si ya tenemos una conexión, devolverla
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error al abrir la base de datos:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('Base de datos abierta correctamente');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Store de Clientes
      if (!database.objectStoreNames.contains(STORES.CLIENTES)) {
        const clientesStore = database.createObjectStore(STORES.CLIENTES, {
          keyPath: 'id',
          autoIncrement: true
        });
        clientesStore.createIndex('nombre', 'nombre', { unique: false });
      }

      // Store de Pedidos
      if (!database.objectStoreNames.contains(STORES.PEDIDOS)) {
        const pedidosStore = database.createObjectStore(STORES.PEDIDOS, {
          keyPath: 'id',
          autoIncrement: true
        });
        pedidosStore.createIndex('clienteId', 'clienteId', { unique: false });
        pedidosStore.createIndex('fecha', 'fecha', { unique: false });
        pedidosStore.createIndex('estado', 'estado', { unique: false });
      }

      // Store de Items (opcional, para normalización)
      if (!database.objectStoreNames.contains(STORES.ITEMS)) {
        const itemsStore = database.createObjectStore(STORES.ITEMS, {
          keyPath: 'id',
          autoIncrement: true
        });
        itemsStore.createIndex('pedidoId', 'pedidoId', { unique: false });
      }

      // Store de Productos
      if (!database.objectStoreNames.contains(STORES.PRODUCTOS)) {
        const productosStore = database.createObjectStore(STORES.PRODUCTOS, {
          keyPath: 'id',
          autoIncrement: true
        });
        productosStore.createIndex('nombre', 'nombre', { unique: false });
      }

      console.log('Base de datos inicializada correctamente');
    };
  });
}

/**
 * Obtener la conexión a la base de datos
 * @returns {Promise<IDBDatabase>}
 */
function getDB() {
  if (db) {
    return Promise.resolve(db);
  }
  return initDB();
}

// ==================== CLIENTES ====================

/**
 * Agregar un nuevo cliente
 * @param {string} nombre - Nombre del cliente
 * @returns {Promise<number>} - ID del cliente creado
 */
async function agregarCliente(nombre) {
  const database = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.CLIENTES], 'readwrite');
    const store = transaction.objectStore(STORES.CLIENTES);
    
    const cliente = {
      nombre: nombre.trim(),
      totalAcumulado: 0,
      numeroPedidos: 0,
      estado: 'Sin pedidos',
      fechaCreacion: new Date().toISOString()
    };
    
    const request = store.add(cliente);
    
    request.onsuccess = () => {
      console.log('Cliente agregado con ID:', request.result);
      resolve(request.result);
    };
    
    request.onerror = () => {
      console.error('Error al agregar cliente:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Obtener todos los clientes
 * @returns {Promise<Array>}
 */
async function obtenerClientes() {
  const database = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.CLIENTES], 'readonly');
    const store = transaction.objectStore(STORES.CLIENTES);
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      console.error('Error al obtener clientes:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Obtener un cliente por ID
 * @param {number} id - ID del cliente
 * @returns {Promise<Object>}
 */
async function obtenerClientePorId(id) {
  const database = await getDB();
  
  // Asegurarse de que el ID sea un número
  const idNum = typeof id === 'string' ? parseInt(id, 10) : id;
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.CLIENTES], 'readonly');
    const store = transaction.objectStore(STORES.CLIENTES);
    const request = store.get(idNum);
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      console.error('Error al obtener cliente:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Buscar cliente por nombre
 * @param {string} nombre - Nombre a buscar
 * @returns {Promise<Object|null>}
 */
async function buscarClientePorNombre(nombre) {
  const database = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.CLIENTES], 'readonly');
    const store = transaction.objectStore(STORES.CLIENTES);
    const index = store.index('nombre');
    const request = index.getAll(nombre.trim());
    
    request.onsuccess = () => {
      const clientes = request.result;
      resolve(clientes.length > 0 ? clientes[0] : null);
    };
    
    request.onerror = () => {
      console.error('Error al buscar cliente:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Obtener o crear cliente por nombre
 * @param {string} nombre - Nombre del cliente
 * @returns {Promise<Object>}
 */
async function obtenerOCrearCliente(nombre) {
  let cliente = await buscarClientePorNombre(nombre);
  
  if (!cliente) {
    const clienteId = await agregarCliente(nombre);
    cliente = await obtenerClientePorId(clienteId);
  }
  
  return cliente;
}

/**
 * Actualizar estadísticas del cliente
 * @param {number} clienteId - ID del cliente
 * @returns {Promise<void>}
 */
async function actualizarEstadisticasCliente(clienteId) {
  const database = await getDB();
  
  return new Promise(async (resolve, reject) => {
    // Obtener todos los pedidos del cliente
    const pedidos = await obtenerPedidosPorCliente(clienteId);
    
    // Calcular total acumulado y número de pedidos
    const totalAcumulado = pedidos.reduce((sum, pedido) => sum + pedido.total, 0);
    const numeroPedidos = pedidos.length;
    
    // Calcular estado del cliente basado en sus pedidos
    // Si todos están entregados → "Entregado", si al menos uno está pendiente → "Pendiente"
    let estadoCliente = 'Entregado';
    if (numeroPedidos > 0) {
      const todosEntregados = pedidos.every(pedido => {
        const estado = pedido.estado === 'Entregado' || pedido.estado === 'Pagado';
        return estado;
      });
      estadoCliente = todosEntregados ? 'Entregado' : 'Pendiente';
    } else {
      // Si no hay pedidos, estado por defecto
      estadoCliente = 'Sin pedidos';
    }
    
    // Actualizar cliente
    const transaction = database.transaction([STORES.CLIENTES], 'readwrite');
    const store = transaction.objectStore(STORES.CLIENTES);
    const getRequest = store.get(clienteId);
    
    getRequest.onsuccess = () => {
      const cliente = getRequest.result;
      if (cliente) {
        cliente.totalAcumulado = totalAcumulado;
        cliente.numeroPedidos = numeroPedidos;
        cliente.estado = estadoCliente;
        
        const updateRequest = store.put(cliente);
        updateRequest.onsuccess = () => {
          console.log('Estadísticas del cliente actualizadas');
          resolve();
        };
        updateRequest.onerror = () => {
          reject(updateRequest.error);
        };
      } else {
        reject(new Error('Cliente no encontrado'));
      }
    };
    
    getRequest.onerror = () => {
      reject(getRequest.error);
    };
  });
}

// ==================== PEDIDOS ====================

/**
 * Agregar un nuevo pedido
 * @param {Object} pedidoData - Datos del pedido
 * @param {number} pedidoData.clienteId - ID del cliente
 * @param {Array} pedidoData.items - Array de items del pedido
 * @param {number} pedidoData.total - Total del pedido
 * @param {string} pedidoData.estado - Estado del pedido ('Pendiente' o 'Entregado')
 * @returns {Promise<number>} - ID del pedido creado
 */
async function agregarPedido(pedidoData) {
  const database = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.PEDIDOS], 'readwrite');
    const store = transaction.objectStore(STORES.PEDIDOS);
    
    const ahora = new Date();
    // Asegurarse de que clienteId sea un número
    const clienteIdNum = typeof pedidoData.clienteId === 'string' 
      ? parseInt(pedidoData.clienteId, 10) 
      : pedidoData.clienteId;
    
    const pedido = {
      clienteId: clienteIdNum,
      items: pedidoData.items || [],
      total: pedidoData.total || 0,
      estado: pedidoData.estado || 'Pendiente',
      fecha: ahora.toISOString().split('T')[0], // YYYY-MM-DD
      hora: ahora.toTimeString().split(' ')[0].substring(0, 5), // HH:MM
      fechaCompleta: ahora.toISOString(),
      createdAt: ahora.toISOString()
    };
    
    const request = store.add(pedido);
    
    request.onsuccess = async () => {
      const pedidoId = request.result;
      console.log('Pedido agregado con ID:', pedidoId);
      
      // Obtener el pedido completo que acabamos de crear
      const pedidoCompleto = {
        id: pedidoId,
        clienteId: clienteIdNum,
        items: pedidoData.items || [],
        total: pedidoData.total || 0,
        estado: pedidoData.estado || 'Pendiente',
        fecha: pedido.fecha,
        hora: pedido.hora,
        fechaCompleta: pedido.fechaCompleta,
        createdAt: pedido.createdAt
      };
      
      // Actualizar estadísticas del cliente
      try {
        await actualizarEstadisticasCliente(clienteIdNum);
      } catch (error) {
        console.error('Error al actualizar estadísticas:', error);
      }
      
      // Sincronizar con otros dispositivos - enviar el pedido completo
      sincronizarDatos({
        type: 'pedido-creado',
        pedido: pedidoCompleto,
        clienteId: clienteIdNum,
        timestamp: new Date().toISOString()
      });
      
      resolve(pedidoId);
    };
    
    request.onerror = () => {
      console.error('Error al agregar pedido:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Obtener todos los pedidos
 * @returns {Promise<Array>}
 */
async function obtenerPedidos() {
  const database = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.PEDIDOS], 'readonly');
    const store = transaction.objectStore(STORES.PEDIDOS);
    const request = store.getAll();
    
    request.onsuccess = () => {
      // Ordenar por fecha más reciente
      const pedidos = request.result.sort((a, b) => 
        new Date(b.fechaCompleta) - new Date(a.fechaCompleta)
      );
      resolve(pedidos);
    };
    
    request.onerror = () => {
      console.error('Error al obtener pedidos:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Obtener pedidos de un cliente
 * @param {number} clienteId - ID del cliente
 * @returns {Promise<Array>}
 */
async function obtenerPedidosPorCliente(clienteId) {
  const database = await getDB();
  
  // Asegurarse de que clienteId sea un número
  const clienteIdNum = typeof clienteId === 'string' ? parseInt(clienteId, 10) : Number(clienteId);
  
  console.log('Buscando pedidos para clienteId:', clienteIdNum, 'Tipo:', typeof clienteIdNum);
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.PEDIDOS], 'readonly');
    const store = transaction.objectStore(STORES.PEDIDOS);
    const index = store.index('clienteId');
    const request = index.getAll(clienteIdNum);
    
    request.onsuccess = () => {
      console.log('Pedidos encontrados (raw):', request.result.length);
      // Ordenar por fecha más reciente
      const pedidos = request.result.sort((a, b) => {
        const fechaA = new Date(a.fechaCompleta || a.createdAt || 0);
        const fechaB = new Date(b.fechaCompleta || b.createdAt || 0);
        return fechaB - fechaA;
      });
      console.log('Pedidos ordenados:', pedidos.length);
      resolve(pedidos);
    };
    
    request.onerror = () => {
      console.error('Error al obtener pedidos del cliente:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Obtener un pedido por ID
 * @param {number} id - ID del pedido
 * @returns {Promise<Object>}
 */
async function obtenerPedidoPorId(id) {
  const database = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.PEDIDOS], 'readonly');
    const store = transaction.objectStore(STORES.PEDIDOS);
    const request = store.get(id);
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      console.error('Error al obtener pedido:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Actualizar estado de un pedido
 * @param {number} pedidoId - ID del pedido
 * @param {string} estado - Nuevo estado ('Pendiente' o 'Entregado')
 * @returns {Promise<void>}
 */
async function actualizarEstadoPedido(pedidoId, estado) {
  const database = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.PEDIDOS], 'readwrite');
    const store = transaction.objectStore(STORES.PEDIDOS);
    const getRequest = store.get(pedidoId);
    
    getRequest.onsuccess = async () => {
      const pedido = getRequest.result;
      if (pedido) {
        pedido.estado = estado;
        
        const updateRequest = store.put(pedido);
        updateRequest.onsuccess = async () => {
          console.log('Estado del pedido actualizado');
          
          // Actualizar estadísticas del cliente
          try {
            await actualizarEstadisticasCliente(pedido.clienteId);
            
            // Sincronizar con otros dispositivos
            sincronizarDatos({
              type: 'pedido-actualizado',
              pedidoId: pedidoId,
              clienteId: pedido.clienteId,
              estado: estado,
              timestamp: new Date().toISOString()
            });
            
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        updateRequest.onerror = () => {
          reject(updateRequest.error);
        };
      } else {
        reject(new Error('Pedido no encontrado'));
      }
    };
    
    getRequest.onerror = () => {
      reject(getRequest.error);
    };
  });
}

/**
 * Eliminar un pedido
 * @param {number} pedidoId - ID del pedido
 * @returns {Promise<void>}
 */
async function eliminarPedido(pedidoId) {
  const database = await getDB();
  
  return new Promise(async (resolve, reject) => {
    // Obtener el pedido primero para actualizar estadísticas del cliente
    const pedido = await obtenerPedidoPorId(pedidoId);
    if (!pedido) {
      reject(new Error('Pedido no encontrado'));
      return;
    }
    
    const clienteId = pedido.clienteId;
    
    const transaction = database.transaction([STORES.PEDIDOS], 'readwrite');
    const store = transaction.objectStore(STORES.PEDIDOS);
    const request = store.delete(pedidoId);
    
    request.onsuccess = async () => {
      console.log('Pedido eliminado');
      
      // Actualizar estadísticas del cliente
      try {
        await actualizarEstadisticasCliente(clienteId);
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    
    request.onerror = () => {
      console.error('Error al eliminar pedido:', request.error);
      reject(request.error);
    };
  });
}

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Formatear fecha para mostrar
 * @param {string} fechaISO - Fecha en formato ISO
 * @returns {string} - Fecha formateada
 */
function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  const opciones = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return fecha.toLocaleDateString('es-ES', opciones);
}

/**
 * Formatear número como moneda
 * @param {number} cantidad - Cantidad a formatear
 * @returns {string} - Cantidad formateada
 */
function formatearMoneda(cantidad) {
  return `$${cantidad.toLocaleString('es-ES')}`;
}

/**
 * Limpiar toda la base de datos (útil para desarrollo)
 * @returns {Promise<void>}
 */
async function limpiarBaseDatos() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    
    request.onsuccess = () => {
      console.log('Base de datos eliminada');
      db = null;
      resolve();
    };
    
    request.onerror = () => {
      console.error('Error al eliminar base de datos:', request.error);
      reject(request.error);
    };
    
    request.onblocked = () => {
      console.warn('Eliminación de base de datos bloqueada');
    };
  });
}

/**
 * Exportar todos los datos (útil para backup)
 * @returns {Promise<Object>}
 */
async function exportarDatos() {
  const [clientes, pedidos] = await Promise.all([
    obtenerClientes(),
    obtenerPedidos()
  ]);
  
  return {
    clientes,
    pedidos,
    exportadoEn: new Date().toISOString()
  };
}

// ==================== PRODUCTOS ====================

/**
 * Agregar un nuevo producto
 * @param {Object} productoData - Datos del producto
 * @param {string} productoData.nombre - Nombre del producto
 * @param {number} productoData.precio - Precio del producto
 * @returns {Promise<number>} - ID del producto creado
 */
async function agregarProducto(productoData) {
  const database = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.PRODUCTOS], 'readwrite');
    const store = transaction.objectStore(STORES.PRODUCTOS);
    
    const producto = {
      nombre: productoData.nombre.trim(),
      precio: Number(productoData.precio) || 0,
      createdAt: new Date().toISOString()
    };
    
    const request = store.add(producto);
    
    request.onsuccess = () => {
      console.log('Producto agregado con ID:', request.result);
      resolve(request.result);
    };
    
    request.onerror = () => {
      console.error('Error al agregar producto:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Obtener todos los productos
 * @returns {Promise<Array>}
 */
async function obtenerProductos() {
  const database = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.PRODUCTOS], 'readonly');
    const store = transaction.objectStore(STORES.PRODUCTOS);
    const request = store.getAll();
    
    request.onsuccess = () => {
      // Ordenar por nombre
      const productos = request.result.sort((a, b) => 
        a.nombre.localeCompare(b.nombre)
      );
      resolve(productos);
    };
    
    request.onerror = () => {
      console.error('Error al obtener productos:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Eliminar un producto
 * @param {number} productoId - ID del producto a eliminar
 * @returns {Promise<void>}
 */
async function eliminarProducto(productoId) {
  const database = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.PRODUCTOS], 'readwrite');
    const store = transaction.objectStore(STORES.PRODUCTOS);
    const request = store.delete(productoId);
    
    request.onsuccess = () => {
      console.log('Producto eliminado');
      resolve();
    };
    
    request.onerror = () => {
      console.error('Error al eliminar producto:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Inicializar la base de datos al cargar
 */
if (typeof window !== 'undefined') {
  // Auto-inicializar cuando se carga el script
  initDB().catch(error => {
    console.error('Error al inicializar la base de datos:', error);
  });
}

// ==================== PRODUCTOS ====================

/**
 * Agregar un nuevo producto
 * @param {Object} productoData - Datos del producto
 * @param {string} productoData.nombre - Nombre del producto
 * @param {number} productoData.precio - Precio del producto
 * @returns {Promise<number>} - ID del producto creado
 */
async function agregarProducto(productoData) {
  const database = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.PRODUCTOS], 'readwrite');
    const store = transaction.objectStore(STORES.PRODUCTOS);
    
    const producto = {
      nombre: productoData.nombre.trim(),
      precio: Number(productoData.precio) || 0,
      createdAt: new Date().toISOString()
    };
    
    const request = store.add(producto);
    
    request.onsuccess = () => {
      console.log('Producto agregado con ID:', request.result);
      resolve(request.result);
    };
    
    request.onerror = () => {
      console.error('Error al agregar producto:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Obtener todos los productos
 * @returns {Promise<Array>}
 */
async function obtenerProductos() {
  const database = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.PRODUCTOS], 'readonly');
    const store = transaction.objectStore(STORES.PRODUCTOS);
    const request = store.getAll();
    
    request.onsuccess = () => {
      // Ordenar por nombre
      const productos = request.result.sort((a, b) => 
        a.nombre.localeCompare(b.nombre)
      );
      resolve(productos);
    };
    
    request.onerror = () => {
      console.error('Error al obtener productos:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Eliminar un producto
 * @param {number} productoId - ID del producto a eliminar
 * @returns {Promise<void>}
 */
async function eliminarProducto(productoId) {
  const database = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.PRODUCTOS], 'readwrite');
    const store = transaction.objectStore(STORES.PRODUCTOS);
    const request = store.delete(productoId);
    
    request.onsuccess = () => {
      console.log('Producto eliminado');
      resolve();
    };
    
    request.onerror = () => {
      console.error('Error al eliminar producto:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Función helper para sincronizar datos con otros dispositivos
 * Usa socket-client.js si está disponible
 */
function sincronizarDatos(data) {
  // Si socket-client está disponible, usar la función de sincronización
  if (typeof window !== 'undefined' && window.socketSync) {
    window.socketSync.syncData(data);
  } else {
    console.log('Socket.IO no disponible. Datos no sincronizados:', data);
  }
}

// Exportar funciones (si está en un módulo)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initDB,
    getDB,
    agregarCliente,
    obtenerClientes,
    obtenerClientePorId,
    buscarClientePorNombre,
    obtenerOCrearCliente,
    actualizarEstadisticasCliente,
    agregarPedido,
    obtenerPedidos,
    obtenerPedidosPorCliente,
    obtenerPedidoPorId,
    actualizarEstadoPedido,
    eliminarPedido,
    agregarProducto,
    obtenerProductos,
    eliminarProducto,
    formatearFecha,
    formatearMoneda,
    limpiarBaseDatos,
    exportarDatos
  };
}

