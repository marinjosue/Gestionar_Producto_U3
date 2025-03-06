// server.js
const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const WebSocket = require('ws');
const db = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const { setWss } = require('./utils/broadcast');

const PORT = 3000;

// Crear servidor WebSocket
const wss = new WebSocket.Server({ server: http });
setWss(wss);

// Singleton para almacenar los productos seleccionados
class SelectedProducts {
    constructor() {
        if (!SelectedProducts.instance) {
            this.products = new Map();
            SelectedProducts.instance = this;
        }
        return SelectedProducts.instance;
    }

    set(productId, userId) {
        this.products.set(productId, userId);
    }

    delete(productId) {
        this.products.delete(productId);
    }

    entries() {
        return this.products.entries();
    }
}

const selectedProducts = new SelectedProducts();

// Configuración de Express
app.use(express.json());
app.use(express.static(path.join(__dirname, 'view')));
app.use('/controller', express.static(path.join(__dirname, 'controller')));
app.use('/api', productRoutes);

// Manejar conexiones WebSocket
wss.on('connection', (ws) => {
    // Envía un mensaje a todos los clientes con el número de conexiones
    const clientCount = wss.clients.size;
    const message = JSON.stringify({ type: 'clientCount', count: clientCount });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
    ws.send(JSON.stringify({
        type: 'initialState',
        selectedProducts: Array.from(selectedProducts.entries())
    }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'selectProduct':
                    selectedProducts.set(data.productId, data.userId);
                    break;
                case 'deselectProduct':
                    selectedProducts.delete(data.productId);
                    break;
            }

            // Broadcast a todos los clientes excepto al remitente
            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        // Limpiar productos seleccionados por este cliente
        for (const [productId, userId] of selectedProducts.entries()) {
            if (userId === ws.userId) {
                selectedProducts.delete(productId);
            }
        }
    });
});

// Exportar wss para que esté disponible en otros módulos
module.exports = { wss };

// Rutas Express existentes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'index.html'));
});

// Usar http.listen en lugar de app.listen
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});
