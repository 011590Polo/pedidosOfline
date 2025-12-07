/**
 * Cliente API para comunicarse con el servidor
 * Reemplaza las funciones de IndexedDB con peticiones HTTP al servidor
 */

const API_BASE_URL = window.location.origin; // Usar la misma URL del servidor

/**
 * Obtener la URL del servidor
 */
function getServerURL() {
  return API_BASE_URL;
}

// ==================== PRODUCTOS ====================

async function obtenerProductos() {
  try {
    const response = await fetch(`${getServerURL()}/api/productos`);
    if (!response.ok) {
      throw new Error('Error al obtener productos');
    }
    return await response.json();
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
}

async function agregarProducto(productoData) {
  try {
    const response = await fetch(`${getServerURL()}/api/productos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productoData)
    });
    
    if (!response.ok) {
      throw new Error('Error al agregar producto');
    }
    
    const producto = await response.json();
    return producto.id;
  } catch (error) {
    console.error('Error al agregar producto:', error);
    throw error;
  }
}

// ==================== CLIENTES ====================

async function obtenerClientes() {
  try {
    const response = await fetch(`${getServerURL()}/api/clientes`);
    if (!response.ok) {
      throw new Error('Error al obtener clientes');
    }
    const clientes = await response.json();
    
    // Calcular estado de cada cliente basado en sus pedidos
    for (const cliente of clientes) {
      if (cliente.numeroPedidos > 0) {
        try {
          const pedidosResponse = await fetch(`${getServerURL()}/api/pedidos/cliente/${cliente.id}`);
          if (pedidosResponse.ok) {
            const pedidos = await pedidosResponse.json();
            const todosEntregados = pedidos.length > 0 && pedidos.every(p => p.estado === 'Entregado');
            cliente.estado = todosEntregados ? 'Entregado' : 'Pendiente';
          }
        } catch (error) {
          console.error('Error al calcular estado del cliente:', error);
        }
      }
    }
    
    return clientes;
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    throw error;
  }
}

async function obtenerClientePorId(id) {
  try {
    const response = await fetch(`${getServerURL()}/api/clientes/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Error al obtener cliente');
    }
    return await response.json();
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    throw error;
  }
}

async function buscarClientePorNombre(nombre) {
  try {
    const clientes = await obtenerClientes();
    return clientes.find(c => c.nombre.toLowerCase() === nombre.toLowerCase().trim()) || null;
  } catch (error) {
    console.error('Error al buscar cliente:', error);
    throw error;
  }
}

async function obtenerOCrearCliente(nombre) {
  try {
    const response = await fetch(`${getServerURL()}/api/clientes/buscar-o-crear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nombre })
    });
    
    if (!response.ok) {
      throw new Error('Error al buscar o crear cliente');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al buscar o crear cliente:', error);
    throw error;
  }
}

// ==================== PEDIDOS ====================

async function obtenerPedidos() {
  try {
    const response = await fetch(`${getServerURL()}/api/pedidos`);
    if (!response.ok) {
      throw new Error('Error al obtener pedidos');
    }
    return await response.json();
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    throw error;
  }
}

async function obtenerPedidosPorCliente(clienteId) {
  try {
    const response = await fetch(`${getServerURL()}/api/pedidos/cliente/${clienteId}`);
    if (!response.ok) {
      throw new Error('Error al obtener pedidos del cliente');
    }
    return await response.json();
  } catch (error) {
    console.error('Error al obtener pedidos del cliente:', error);
    throw error;
  }
}

async function obtenerPedidoPorId(id) {
  try {
    const pedidos = await obtenerPedidos();
    return pedidos.find(p => p.id === parseInt(id)) || null;
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    throw error;
  }
}

async function agregarPedido(pedidoData) {
  try {
    const response = await fetch(`${getServerURL()}/api/pedidos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pedidoData)
    });
    
    if (!response.ok) {
      throw new Error('Error al agregar pedido');
    }
    
    const pedido = await response.json();
    
    // El servidor ya emite el evento automáticamente, no necesitamos hacerlo aquí
    // Esto evita eventos duplicados
    
    return pedido.id;
  } catch (error) {
    console.error('Error al agregar pedido:', error);
    throw error;
  }
}

async function actualizarEstadoPedido(pedidoId, estado) {
  try {
    const response = await fetch(`${getServerURL()}/api/pedidos/${pedidoId}/estado`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ estado })
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar estado del pedido');
    }
    
    const result = await response.json();
    
    // El servidor ya emite el evento automáticamente, no necesitamos hacerlo aquí
    // Esto evita eventos duplicados
    
    return result;
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    throw error;
  }
}

// Funciones de utilidad (mantener compatibilidad)
function formatearMoneda(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(valor);
}

function formatearFechaEspañol(fechaISO) {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Funciones dummy para compatibilidad (no se usan porque la BD está en el servidor)
function initDB() {
  return Promise.resolve();
}

function getDB() {
  return Promise.resolve();
}

// Exportar funciones globalmente
if (typeof window !== 'undefined') {
  window.obtenerProductos = obtenerProductos;
  window.agregarProducto = agregarProducto;
  window.obtenerClientes = obtenerClientes;
  window.obtenerClientePorId = obtenerClientePorId;
  window.buscarClientePorNombre = buscarClientePorNombre;
  window.obtenerOCrearCliente = obtenerOCrearCliente;
  window.obtenerPedidos = obtenerPedidos;
  window.obtenerPedidosPorCliente = obtenerPedidosPorCliente;
  window.obtenerPedidoPorId = obtenerPedidoPorId;
  window.agregarPedido = agregarPedido;
  window.actualizarEstadoPedido = actualizarEstadoPedido;
  window.formatearMoneda = formatearMoneda;
  window.formatearFechaEspañol = formatearFechaEspañol;
  window.initDB = initDB;
  window.getDB = getDB;
}

