require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Crear aplicación Express
const app = express();

// Configuración básica
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Usamos una configuración de CORS simple por ahora
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../public')));

// --- ÁREA DE DEPURACIÓN DE RUTAS ---
// A continuación, vamos a activar las rutas una por una.

app.use('/api/auth', require('./routes/auth'));
app.use('/api/espacios', require('./routes/espacios'));
app.use('/api/reservas', require('./routes/reservas'));
app.use('/api/admin', require('./routes/admin'));


// --- FIN DEL ÁREA DE DEPURACIÓN ---

// Ruta de prueba para saber que el servidor funciona
app.get('/api/test', (req, res) => {
    res.json({ message: '¡El servidor está funcionando sin errores de rutas!' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log('--- Inicia la prueba de rutas ---');
});