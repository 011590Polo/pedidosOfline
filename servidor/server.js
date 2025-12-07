const express = require("express");
const path = require("path");
const os = require("os");
const app = express();
const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: "*" } });

// Importar base de datos y API
const { initDatabase } = require("./database");
const api = require("./api");

// Configurar Express para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar CORS para Express
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  // Evitar caché en archivos HTML y JS para desarrollo
  if (req.path.endsWith('.html') || req.path.endsWith('.js')) {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", "0");
  }
  
  next();
});

// ========== API REST (ANTES de archivos estáticos) ==========

// Productos
app.get("/api/productos", api.getProductos);
app.post("/api/productos", api.addProducto);

// Clientes
app.get("/api/clientes", api.getClientes);
app.get("/api/clientes/:id", api.getClienteById);
app.post("/api/clientes/buscar-o-crear", api.buscarOCrearCliente);

// Pedidos
app.get("/api/pedidos", api.getPedidos);
app.get("/api/pedidos/cliente/:clienteId", api.getPedidosPorCliente);
app.post("/api/pedidos", api.addPedido);
app.put("/api/pedidos/:id/estado", api.updatePedidoEstado);

// Servir archivos estáticos desde el directorio padre (donde están los HTML)
const parentDir = path.join(__dirname, "..");
app.use(express.static(parentDir));

// Manejar favicon.ico para evitar errores 404
app.get("/favicon.ico", (req, res) => {
  res.status(204).end(); // 204 No Content
});

// Ruta por defecto - servir index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(parentDir, "index.html"));
});

// Configurar Socket.IO en la API para que pueda emitir eventos
api.setSocketIO(io);

// Socket.IO - conexiones
io.on("connection", (socket) => {
  console.log("Nuevo dispositivo conectado:", socket.id);

  // Cuando un dispositivo envía datos para sincronización
  // NOTA: Ya no es necesario reenviar eventos desde clientes porque el servidor
  // ya emite eventos automáticamente después de cada operación en la base de datos
  socket.on("sync-data", (data) => {
    console.log("📤 Evento sync-data recibido desde cliente (ignorado, servidor ya emite automáticamente):", data.type);
    // NO reenviar - el servidor ya emite eventos automáticamente desde la API
  });

  socket.on("disconnect", () => {
    console.log("Dispositivo desconectado:", socket.id);
  });
});

// Función para obtener la IP local
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Ignorar direcciones internas (no IPv4) o loopback
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

// Inicializar base de datos y luego iniciar el servidor
const PORT = 3000;

initDatabase()
  .then(() => {
    server.listen(PORT, "0.0.0.0", () => {
      const localIP = getLocalIP();
      console.log("\n" + "=".repeat(50));
      console.log("🚀 Servidor iniciado correctamente!");
      console.log("=".repeat(50));
      console.log(`📱 Accede desde este dispositivo: http://localhost:${PORT}`);
      console.log(`🌐 Accede desde otros dispositivos en la red:`);
      console.log(`   http://${localIP}:${PORT}`);
      console.log("=".repeat(50));
      console.log(`\n💡 Asegúrate de que ambos dispositivos estén en la misma red WiFi`);
      console.log(`📊 Base de datos: ${path.join(__dirname, 'pedidos.db')}\n`);
    });
  })
  .catch((error) => {
    console.error("❌ Error al inicializar la base de datos:", error);
    process.exit(1);
  });
