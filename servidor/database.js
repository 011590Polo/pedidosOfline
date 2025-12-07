/**
 * Base de datos del servidor usando SQLite
 * Maneja: Clientes, Pedidos, Productos
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ruta de la base de datos
const DB_PATH = path.join(__dirname, 'pedidos.db');

let db = null;

/**
 * Inicializar la base de datos
 */
function initDatabase() {
  return new Promise((resolve, reject) => {
    // Crear directorio si no existe
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error al conectar con la base de datos:', err);
        reject(err);
        return;
      }
      
      console.log('✅ Conectado a la base de datos SQLite');
      createTables().then(resolve).catch(reject);
    });
  });
}

/**
 * Crear las tablas si no existen
 */
function createTables() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tabla de Productos
      db.run(`
        CREATE TABLE IF NOT EXISTS productos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          precio REAL NOT NULL,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error al crear tabla productos:', err);
          reject(err);
          return;
        }
      });

      // Tabla de Clientes
      db.run(`
        CREATE TABLE IF NOT EXISTS clientes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          totalAcumulado REAL DEFAULT 0,
          numeroPedidos INTEGER DEFAULT 0,
          estado TEXT DEFAULT 'Sin pedidos',
          fechaCreacion TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error al crear tabla clientes:', err);
          reject(err);
          return;
        }
      });

      // Tabla de Pedidos
      db.run(`
        CREATE TABLE IF NOT EXISTS pedidos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          clienteId INTEGER NOT NULL,
          total REAL NOT NULL,
          estado TEXT DEFAULT 'Pendiente',
          fecha TEXT NOT NULL,
          hora TEXT NOT NULL,
          fechaCompleta TEXT NOT NULL,
          items TEXT NOT NULL,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (clienteId) REFERENCES clientes(id)
        )
      `, (err) => {
        if (err) {
          console.error('Error al crear tabla pedidos:', err);
          reject(err);
          return;
        }
        
        // Migrar productos iniciales si la tabla está vacía
        migrateInitialProducts().then(() => {
          console.log('✅ Tablas creadas correctamente');
          resolve();
        }).catch(reject);
      });
    });
  });
}

/**
 * Migrar productos iniciales
 */
function migrateInitialProducts() {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM productos', (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (row.count === 0) {
        console.log('📦 Migrando productos iniciales...');
        const productosIniciales = [
          { nombre: 'Perro caliente sencillo', precio: 8000 },
          { nombre: 'Perro caliente especial', precio: 12000 },
          { nombre: 'Hamburguesa sencilla', precio: 10000 },
          { nombre: 'Hamburguesa especial', precio: 15000 },
          { nombre: 'Doble carne', precio: 18000 },
          { nombre: 'Salchipapas pequeñas', precio: 9000 },
          { nombre: 'Salchipapas grandes', precio: 14000 },
          { nombre: 'Mazorcada', precio: 10000 },
          { nombre: 'Mazorcada especial', precio: 13000 },
          { nombre: 'Papas a la francesa', precio: 7000 },
          { nombre: 'Nuggets (6 und)', precio: 9000 },
          { nombre: 'Chuzo de pollo', precio: 11000 },
          { nombre: 'Chuzo de carne', precio: 13000 },
          { nombre: 'Arepa rellena mixta', precio: 12000 },
          { nombre: 'Arepa rellena de queso', precio: 7000 },
          { nombre: 'Empanada', precio: 2000 },
          { nombre: 'Deditos de queso (5 und)', precio: 6000 },
          { nombre: 'Gaseosa', precio: 3000 }
        ];

        const stmt = db.prepare('INSERT INTO productos (nombre, precio) VALUES (?, ?)');
        let completed = 0;

        productosIniciales.forEach(producto => {
          stmt.run([producto.nombre, producto.precio], (err) => {
            if (err) {
              console.error('Error al insertar producto:', err);
            }
            completed++;
            if (completed === productosIniciales.length) {
              stmt.finalize();
              console.log('✅ Productos iniciales migrados');
              resolve();
            }
          });
        });
      } else {
        resolve();
      }
    });
  });
}

/**
 * Obtener la instancia de la base de datos
 */
function getDatabase() {
  return db;
}

/**
 * Cerrar la base de datos
 */
function closeDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Base de datos cerrada');
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

module.exports = {
  initDatabase,
  getDatabase,
  closeDatabase
};

