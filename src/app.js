const express = require('express'); // Importa el framework Express para crear la aplicación
const cors = require('cors'); // Importa el middleware CORS para permitir solicitudes desde otros dominios
const app = express(); // Crea una instancia de la aplicación Express
const espaciosRoutes = require('./routes/espacios'); // Importa las rutas de espacios
const reservasRoutes = require('./routes/reservas'); // Importa las rutas de reservas
const adminRoutes = require('./routes/admin'); // Importa las rutas de administración


// Middlewares
app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.static('public')); // 👈 Servir archivos estáticos
app.use(express.json()); // Para parsear JSON
app.use('/api/espacios', espaciosRoutes); // Define la ruta base para las rutas de espacios
app.use('/api/reservas', reservasRoutes); // Define la ruta base para las rutas de reservas
app.use('/api/admin', adminRoutes); // Define la ruta base para las rutas de administración

// Rutas
const authRoutes = require('./routes/auth'); // Importa las rutas de autenticación
app.use('/api/auth', authRoutes); // Define la ruta base para las rutas de autenticación

// Iniciar servidor
const PORT = process.env.PORT || 3000; // Define el puerto en el que se ejecutará el servidor, usando una variable de entorno o 3000 por defecto
// app.listen(PORT, () => { // Inicia el servidor y escucha en el puerto definido
//   console.log(`Servidor corriendo en http://localhost:${PORT}`);    // Imprime un mensaje en la consola indicando que el servidor está corriendo
// });

// Al final de app.js
const server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Configurar WebSocket
const setupWebSocket = require('./websocket');
setupWebSocket(server);