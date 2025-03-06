const { WebSocket } = require('ws');

let wss;

function setWss(webSocketServer) {
    wss = webSocketServer;
}

function broadcastMessage(message) {
    if (!wss) {
        console.error('WebSocket server is not defined');
        return;
    }
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

module.exports = { setWss, broadcastMessage };
