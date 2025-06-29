// src/websocket.js
const WebSocket = require('ws');

module.exports = function setupWebSocket(server) {
    const wss = new WebSocket.Server({ server });
    
    wss.on('connection', (ws) => {
        console.log('Nuevo cliente WebSocket conectado');
        
        ws.on('message', (message) => {
            console.log('Mensaje WebSocket recibido:', message);
        });
        
        ws.send(JSON.stringify({
            type: 'connection_established',
            message: 'Conexión WebSocket exitosa'
        }));
    });
    
    return wss;
};

//module.exports = setupWebSocket;