require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path'); // Importante para manejar rutas de archivos
const jwt = require('jsonwebtoken');

// Importar modelos y middlewares
const Usuario = require('./models/Usuario');
const Espacio = require('./models/Espacio');
const Reserva = require('./models/Reserva');
const { verificarToken, esAdmin } = require('./middlewares/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares & Configuración ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ¡LÍNEA IMPORTANTE AÑADIDA! ---
// Esta línea le dice a Express que sirva los archivos HTML, CSS y JS desde la carpeta 'public'.
app.use(express.static(path.join(__dirname, '../public')));


// --- DEFINICIÓN DE TODAS LAS RUTAS DIRECTAMENTE AQUÍ ---

// -- Rutas de Autenticación --
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        
        const usuario = await Usuario.verificarCredenciales(email, password);
        const payload = { id: usuario.id, rol: usuario.id_rol, nombre: usuario.primer_nombre };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.json({ token, usuario });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

app.post('/api/auth/registro', async (req, res) => {
    try {
        const { primer_nombre, email, password } = req.body;
        if (!primer_nombre || !email || !password) return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
        
        const nuevoUsuario = await Usuario.crear({ ...req.body, id_rol: 2 });
        const payload = { id: nuevoUsuario.id, rol: nuevoUsuario.id_rol };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.status(201).json({ token, usuario: nuevoUsuario });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


// -- Rutas de Espacios --
app.get('/api/espacios', verificarToken, async (req, res) => {
    try {
        // Pasamos los parámetros de la query al modelo
        const espacios = await Espacio.buscarTodos(req.query);
        res.json(espacios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Ruta para obtener un espacio específico por ID
app.post('/api/espacios', [verificarToken, esAdmin], async (req, res) => {
    try {
        const nuevoEspacio = await Espacio.crear(req.body);
        res.status(201).json(nuevoEspacio);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


// Ruta para obtener un espacio específico por ID
app.get('/api/espacios/:id', [verificarToken, esAdmin], async (req, res) => {
    try {
        const espacio = await Espacio.buscarPorId(req.params.id);
        res.json(espacio);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});


// Ruta para verificar la disponibilidad de un espacio en una fecha específica
app.get('/api/espacios/:id/disponibilidad', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha } = req.query; // La fecha vendrá como ?fecha=YYYY-MM-DD
        if (!fecha) {
            return res.status(400).json({ error: 'Se requiere una fecha.' });
        }
        const reservas = await Reserva.obtenerPorEspacioYFecha(id, fecha);
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/espacios/:id', [verificarToken, esAdmin], async (req, res) => {
    try {
        const espacioActualizado = await Espacio.actualizar(req.params.id, req.body);
        res.json(espacioActualizado);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Ruta para borrar un espacio existente
app.delete('/api/espacios/:id', [verificarToken, esAdmin], async (req, res) => {
    try {
        await Espacio.eliminar(req.params.id);
        res.status(204).send(); // 204 significa "No Content", la operación fue exitosa
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// -- Rutas de Reservas --
app.post('/api/reservas', verificarToken, async (req, res) => {
    try {
        const reserva = await Reserva.crear({ ...req.body, id_usuario: req.usuariold });
        res.status(201).json(reserva);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/reservas', verificarToken, async (req, res) => {
    try {
        const reservas = await Reserva.listarPorUsuario(req.usuariold);
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las reservas' });
    }
});

app.patch('/api/reservas/:id/cancelar', verificarToken, async (req, res) => {
    try {
        const reserva = await Reserva.cancelar(req.params.id, req.usuariold);
        res.json(reserva);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


// -- Rutas de Admin --
app.get('/api/admin/usuarios', [verificarToken, esAdmin], async (req, res) => {
    try {
        // Pasamos todo el objeto de query al modelo
        const usuarios = await Usuario.listarTodos(req.query);
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/admin/usuarios/:id/rol', [verificarToken, esAdmin], async (req, res) => {
    try {
        const { id } = req.params;
        const { id_rol } = req.body;

        if (!id_rol) {
            return res.status(400).json({ error: "El nuevo rol (id_rol) es requerido." });
        }

        const usuarioActualizado = await Usuario.actualizarRol(id, id_rol);
        res.json(usuarioActualizado);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Ruta para cambiar el estado de un usuario (activo/inactivo)
app.patch('/api/admin/usuarios/:id/estado', [verificarToken, esAdmin], async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        const usuarioActualizado = await Usuario.cambiarEstado(id, estado);
        res.json(usuarioActualizado);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


// Ruta para listar todas las reservas (solo para administradores)
app.get('/api/admin/reservas', [verificarToken, esAdmin], async (req, res) => {
    try {
        // Pasamos los parámetros de la query al modelo
        const reservas = await Reserva.listarTodas(req.query);
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/admin/reservas/:id/cancelar', [verificarToken, esAdmin], async (req, res) => {
    try {
        const reservaCancelada = await Reserva.cancelarPorAdmin(req.params.id);
        res.json(reservaCancelada);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


// --- Iniciar Servidor ---
app.listen(PORT, () => {
    console.log(`✅ ¡Servidor de ARCHIVO ÚNICO iniciado! Escuchando en http://localhost:${PORT}`);
});