const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const app = express();
const http = require('http').createServer(app);
const WebSocket = require('ws');

const PORT = 3000;

// Crear servidor WebSocket
const wss = new WebSocket.Server({ server: http });

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

// Rutas Express existentes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'index.html'));
});

app.get('/productos', async (req, res) => {
    try {
        const response = await axios.get('https://gestionar-producto.vercel.app/productos');
        res.setHeader('Content-Type', 'text/plain');
        res.send(response.data);
    } catch (error) {
        console.error("Error al obtener productos desde la URL remota:", error);
        res.status(500).send('Error al obtener el archivo de productos');
    }
});
app.post('/guardar-productos', async (req, res) => {
    const fileContent = req.body.fileContent;
    try {
        await axios.post('https://gestionar-producto.vercel.app/guardar-productos', { fileContent });
        
        // Enviar mensaje a todos los clientes conectados
        const message = JSON.stringify({
            type: 'updateProducts',
            fileContent: fileContent
        });
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });

        res.send('Archivo de productos guardado exitosamente');
    } catch (error) {
        console.error('Error al guardar productos en la URL remota:', error);
        res.status(500).send('Error al guardar el archivo de productos');
    }
});

// Usar http.listen en lugar de app.listen
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});