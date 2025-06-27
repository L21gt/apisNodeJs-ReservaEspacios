// src/websocket.js
const WebSocket = require('ws');

function setupWebSocket(server) {
    const wss = new WebSocket.Server({ server });
    
    wss.on('connection', (ws) => {
        console.log('Nuevo cliente conectado');
        
        ws.on('message', (message) => {
            console.log(`Mensaje recibido: ${message}`);
        });
        
        // Enviar notificación cuando se crea una reserva
        ws.send(JSON.stringify({
            type: 'connection_established',
            message: 'Conectado al servidor de notificaciones'
        }));
    });
    
    return wss;
}

module.exports = setupWebSocket;