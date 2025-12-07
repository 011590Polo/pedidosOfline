#!/bin/bash

# Script de inicio para el servidor
# Uso: ./start.sh

echo "🚀 Iniciando servidor de Control de Pedidos..."
echo ""

# Navegar al directorio del servidor
cd "$(dirname "$0")"

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado"
    echo "📦 Instala Node.js con: pkg install nodejs"
    exit 1
fi

# Verificar que las dependencias estén instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
    echo ""
fi

# Iniciar el servidor
echo "✅ Iniciando servidor..."
echo ""
node server.js
