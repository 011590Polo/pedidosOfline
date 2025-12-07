/**
 * API REST para manejar Clientes, Pedidos y Productos
 */

const { getDatabase } = require('./database');

// Variable para almacenar la instancia de Socket.IO
let ioInstance = null;

/**
 * Configurar la instancia de Socket.IO para emitir eventos
 */
function setSocketIO(io) {
  ioInstance = io;
}

/**
 * Emitir evento de sincronización a todos los clientes conectados
 */
function emitSyncEvent(data) {
  if (ioInstance) {
    ioInstance.emit('sync-data', data);
    console.log('📡 Evento de sincronización emitido desde el servidor:', data.type);
  }
}

// ==================== PRODUCTOS ====================

/**
 * Obtener todos los productos
 */
function getProductos(req, res) {
  const database = getDatabase();
  
  if (!database) {
    res.status(500).json({ error: 'Base de datos no inicializada' });
    return;
  }
  
  database.all('SELECT * FROM productos ORDER BY nombre', (err, rows) => {
    if (err) {
      console.error('Error al obtener productos:', err);
      res.status(500).json({ error: 'Error al obtener productos' });
      return;
    }
    res.json(rows);
  });
}

/**
 * Agregar un nuevo producto
 */
function addProducto(req, res) {
  const { nombre, precio } = req.body;
  const database = getDatabase();
  
  if (!database) {
    res.status(500).json({ error: 'Base de datos no inicializada' });
    return;
  }

  if (!nombre || !precio) {
    res.status(400).json({ error: 'Nombre y precio son requeridos' });
    return;
  }

  database.run(
    'INSERT INTO productos (nombre, precio) VALUES (?, ?)',
    [nombre.trim(), parseFloat(precio)],
    function(err) {
      if (err) {
        console.error('Error al agregar producto:', err);
        res.status(500).json({ error: 'Error al agregar producto' });
        return;
      }
      res.json({ id: this.lastID, nombre, precio: parseFloat(precio) });
    }
  );
}

// ==================== CLIENTES ====================

/**
 * Obtener todos los clientes
 */
function getClientes(req, res) {
  const database = getDatabase();
  
  if (!database) {
    res.status(500).json({ error: 'Base de datos no inicializada' });
    return;
  }
  
  database.all(`
    SELECT 
      c.*,
      COUNT(p.id) as numeroPedidos,
      COALESCE(SUM(p.total), 0) as totalAcumulado,
      MAX(p.fechaCompleta) as ultimoPedidoFecha
    FROM clientes c
    LEFT JOIN pedidos p ON c.id = p.clienteId
    GROUP BY c.id
    ORDER BY 
      COALESCE(c.fechaCreacion, datetime('now')) DESC,
      MAX(p.fechaCompleta) DESC,
      c.id DESC
  `, (err, rows) => {
    if (err) {
      console.error('Error al obtener clientes:', err);
      res.status(500).json({ error: 'Error al obtener clientes' });
      return;
    }
    
    // Calcular estado de cada cliente de forma asíncrona
    const clientesPromises = rows.map(cliente => {
      return new Promise((resolve) => {
        let estado = 'Sin pedidos';
        const numeroPedidos = parseInt(cliente.numeroPedidos) || 0;
        
        if (numeroPedidos > 0) {
          // Verificar si todos los pedidos están entregados
          database.all(
            'SELECT estado FROM pedidos WHERE clienteId = ?',
            [cliente.id],
            (err, pedidos) => {
              if (!err && pedidos.length > 0) {
                const todosEntregados = pedidos.every(p => p.estado === 'Entregado');
                estado = todosEntregados ? 'Entregado' : 'Pendiente';
              }
              
              resolve({
                ...cliente,
                estado: estado,
                numeroPedidos: numeroPedidos,
                totalAcumulado: parseFloat(cliente.totalAcumulado) || 0
              });
            }
          );
        } else {
          resolve({
            ...cliente,
            estado: estado,
            numeroPedidos: numeroPedidos,
            totalAcumulado: parseFloat(cliente.totalAcumulado) || 0
          });
        }
      });
    });
    
    Promise.all(clientesPromises).then(clientes => {
      res.json(clientes);
    });
  });
}

/**
 * Obtener un cliente por ID
 */
function getClienteById(req, res) {
  const { id } = req.params;
  const database = getDatabase();
  
  if (!database) {
    res.status(500).json({ error: 'Base de datos no inicializada' });
    return;
  }
  
  database.get('SELECT * FROM clientes WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error al obtener cliente:', err);
      res.status(500).json({ error: 'Error al obtener cliente' });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }
    res.json(row);
  });
}

/**
 * Buscar o crear cliente por nombre
 */
function buscarOCrearCliente(req, res) {
  const { nombre } = req.body;
  const database = getDatabase();
  
  if (!database) {
    res.status(500).json({ error: 'Base de datos no inicializada' });
    return;
  }

  if (!nombre) {
    res.status(400).json({ error: 'Nombre es requerido' });
    return;
  }

  // Buscar cliente existente
  database.get('SELECT * FROM clientes WHERE nombre = ?', [nombre.trim()], (err, row) => {
    if (err) {
      console.error('Error al buscar cliente:', err);
      res.status(500).json({ error: 'Error al buscar cliente' });
      return;
    }

    if (row) {
      res.json(row);
      return;
    }

    // Crear nuevo cliente con fecha de creación explícita
    const fechaCreacion = new Date().toISOString();
    database.run(
      'INSERT INTO clientes (nombre, fechaCreacion) VALUES (?, ?)',
      [nombre.trim(), fechaCreacion],
      function(err) {
        if (err) {
          console.error('Error al crear cliente:', err);
          res.status(500).json({ error: 'Error al crear cliente' });
          return;
        }
        
        const nuevoCliente = { 
          id: this.lastID, 
          nombre: nombre.trim(), 
          totalAcumulado: 0, 
          numeroPedidos: 0, 
          estado: 'Sin pedidos' 
        };
        
        // Emitir evento de sincronización
        emitSyncEvent({
          type: 'cliente-actualizado',
          cliente: nuevoCliente,
          timestamp: new Date().toISOString()
        });
        
        res.json(nuevoCliente);
      }
    );
  });
}

// ==================== PEDIDOS ====================

/**
 * Obtener todos los pedidos
 */
function getPedidos(req, res) {
  const database = getDatabase();
  
  if (!database) {
    res.status(500).json({ error: 'Base de datos no inicializada' });
    return;
  }
  
  database.all(`
    SELECT 
      p.*,
      c.nombre as clienteNombre
    FROM pedidos p
    JOIN clientes c ON p.clienteId = c.id
    ORDER BY p.fechaCompleta DESC
  `, (err, rows) => {
    if (err) {
      console.error('Error al obtener pedidos:', err);
      res.status(500).json({ error: 'Error al obtener pedidos' });
      return;
    }
    
    // Parsear items JSON
    const pedidos = rows.map(pedido => ({
      ...pedido,
      items: JSON.parse(pedido.items || '[]'),
      total: parseFloat(pedido.total),
      clienteId: parseInt(pedido.clienteId)
    }));
    
    res.json(pedidos);
  });
}

/**
 * Obtener pedidos por cliente
 */
function getPedidosPorCliente(req, res) {
  const { clienteId } = req.params;
  const database = getDatabase();
  
  if (!database) {
    res.status(500).json({ error: 'Base de datos no inicializada' });
    return;
  }
  
  database.all(
    'SELECT * FROM pedidos WHERE clienteId = ? ORDER BY fechaCompleta DESC',
    [clienteId],
    (err, rows) => {
      if (err) {
        console.error('Error al obtener pedidos:', err);
        res.status(500).json({ error: 'Error al obtener pedidos' });
        return;
      }
      
      // Parsear items JSON
      const pedidos = rows.map(pedido => ({
        ...pedido,
        items: JSON.parse(pedido.items || '[]'),
        total: parseFloat(pedido.total),
        clienteId: parseInt(pedido.clienteId)
      }));
      
      res.json(pedidos);
    }
  );
}

/**
 * Agregar un nuevo pedido
 */
function addPedido(req, res) {
  const { clienteId, items, total, estado } = req.body;
  const database = getDatabase();
  
  if (!database) {
    res.status(500).json({ error: 'Base de datos no inicializada' });
    return;
  }

  if (!clienteId || !items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'ClienteId e items son requeridos' });
    return;
  }

  const ahora = new Date();
  const fecha = ahora.toISOString().split('T')[0];
  const hora = ahora.toTimeString().split(' ')[0].substring(0, 5);
  const fechaCompleta = ahora.toISOString();
  const totalPedido = parseFloat(total) || items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const estadoPedido = estado || 'Pendiente';

  // Insertar pedido
  database.run(
    'INSERT INTO pedidos (clienteId, total, estado, fecha, hora, fechaCompleta, items) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [parseInt(clienteId), totalPedido, estadoPedido, fecha, hora, fechaCompleta, JSON.stringify(items)],
    function(err) {
      if (err) {
        console.error('Error al agregar pedido:', err);
        res.status(500).json({ error: 'Error al agregar pedido' });
        return;
      }

      const pedidoId = this.lastID;

      // Actualizar estadísticas del cliente
      updateClienteStats(clienteId, database, (err) => {
        if (err) {
          console.error('Error al actualizar estadísticas:', err);
        }

        // Retornar el pedido creado
        database.get('SELECT * FROM pedidos WHERE id = ?', [pedidoId], (err, row) => {
          const pedidoRetornado = err || !row 
            ? { id: pedidoId, clienteId: parseInt(clienteId), items, total: totalPedido, estado: estadoPedido, fecha, hora, fechaCompleta }
            : {
                ...row,
                items: JSON.parse(row.items || '[]'),
                total: parseFloat(row.total),
                clienteId: parseInt(row.clienteId)
              };

          res.json(pedidoRetornado);
          
          // Emitir evento de sincronización DESPUÉS de completar todo
          emitSyncEvent({
            type: 'pedido-creado',
            pedido: pedidoRetornado,
            clienteId: parseInt(clienteId),
            timestamp: new Date().toISOString()
          });
        });
      });
    }
  );
}

/**
 * Actualizar estado de un pedido
 */
function updatePedidoEstado(req, res) {
  const { id } = req.params;
  const { estado } = req.body;
  const database = getDatabase();
  
  if (!database) {
    res.status(500).json({ error: 'Base de datos no inicializada' });
    return;
  }

  if (!estado) {
    res.status(400).json({ error: 'Estado es requerido' });
    return;
  }

  // Obtener el pedido primero para saber el clienteId
  database.get('SELECT clienteId FROM pedidos WHERE id = ?', [id], (err, pedido) => {
    if (err || !pedido) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }

    database.run(
      'UPDATE pedidos SET estado = ? WHERE id = ?',
      [estado, id],
      function(err) {
        if (err) {
          console.error('Error al actualizar pedido:', err);
          res.status(500).json({ error: 'Error al actualizar pedido' });
          return;
        }

        // Actualizar estadísticas del cliente
        updateClienteStats(pedido.clienteId, database, (err) => {
          if (err) {
            console.error('Error al actualizar estadísticas:', err);
          }
          
          // Emitir evento de sincronización DESPUÉS de actualizar
          emitSyncEvent({
            type: 'pedido-actualizado',
            pedidoId: parseInt(id),
            estado: estado,
            clienteId: pedido.clienteId,
            timestamp: new Date().toISOString()
          });
          
          res.json({ success: true, id: parseInt(id), estado });
        });
      }
    );
  });
}

/**
 * Actualizar estadísticas de un cliente
 */
function updateClienteStats(clienteId, database, callback) {
  database.get(
    'SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total FROM pedidos WHERE clienteId = ?',
    [clienteId],
    (err, stats) => {
      if (err) {
        callback(err);
        return;
      }

      // Calcular estado del cliente
      database.all('SELECT estado FROM pedidos WHERE clienteId = ?', [clienteId], (err, pedidos) => {
        if (err) {
          callback(err);
          return;
        }

        let estado = 'Sin pedidos';
        if (pedidos.length > 0) {
          const todosEntregados = pedidos.every(p => p.estado === 'Entregado');
          estado = todosEntregados ? 'Entregado' : 'Pendiente';
        }

        database.run(
          'UPDATE clientes SET numeroPedidos = ?, totalAcumulado = ?, estado = ? WHERE id = ?',
          [stats.count, stats.total, estado, clienteId],
          (err) => {
            callback(err);
          }
        );
      });
    }
  );
}

module.exports = {
  // Productos
  getProductos,
  addProducto,
  
  // Clientes
  getClientes,
  getClienteById,
  buscarOCrearCliente,
  
  // Pedidos
  getPedidos,
  getPedidosPorCliente,
  addPedido,
  updatePedidoEstado,
  
  // Socket.IO
  setSocketIO
};

