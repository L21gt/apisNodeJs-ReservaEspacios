const express = require('express');
const router = express.Router();
const { verificarToken, esAdmin } = require('../middlewares/auth');
const Usuario = require('../models/Usuario');
const Espacio = require('../models/Espacio');
const Reserva = require('../models/Reserva');

// NOTA: Estas rutas solo deben ser accesibles por un administrador.
// El middleware 'verificarToken' y 'esAdmin' se encarga de esa protección.

// Listar todos los usuarios
router.get('/usuarios', [verificarToken, esAdmin], async (req, res) => {
    try {
        // OJO: Esta función 'listarTodos' no existe aún en el modelo Usuario.
        // La crearemos después de que el servidor inicie.
        const usuarios = await Usuario.listarTodos();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Listar todos los espacios
router.get('/espacios', [verificarToken, esAdmin], async (req, res) => {
    try {
        // Usamos el método 'buscar' sin filtros para obtener todos los espacios.
        const espacios = await Espacio.buscar({});
        res.json(espacios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Listar todas las reservas (con filtros opcionales)
router.get('/reservas', [verificarToken, esAdmin], async (req, res) => {
    try {
        const { fecha, estado } = req.query;
        // OJO: Esta función 'listarTodas' no existe aún en el modelo Reserva.
        // La crearemos más adelante.
        const reservas = await Reserva.listarTodas({ fecha, estado });
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener estadísticas para el dashboard
router.get('/estadisticas', [verificarToken, esAdmin], async (req, res) => {
    try {
        const estadisticas = await Reserva.obtenerEstadisticas();
        res.json(estadisticas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;