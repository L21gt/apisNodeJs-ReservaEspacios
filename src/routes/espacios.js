const express = require('express');
const router = express.Router();
const Espacio = require('../models/Espacio');
const { verificarToken, esAdmin } = require('../middlewares/auth');

// Ruta para listar todos los espacios (para usuarios y administradores)
router.get('/', verificarToken, async (req, res) => {
    try {
        const espacios = await Espacio.buscar(req.query);
        res.json(espacios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para buscar espacios por un término de búsqueda
router.get('/buscar', verificarToken, async (req, res) => {
    try {
        const { q } = req.query;
        // Asumimos que el modelo "buscar" puede manejar la búsqueda por nombre
        const espacios = await Espacio.buscar({ nombre: q });
        res.json(espacios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para listar espacios disponibles en un rango de fechas
router.get('/disponibles', verificarToken, async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin } = req.query;
        const espacios = await Espacio.listarDisponibles(fecha_inicio, fecha_fin);
        res.json(espacios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para crear un nuevo espacio (solo admin)
router.post('/', verificarToken, esAdmin, async (req, res) => {
    try {
        const espacio = await Espacio.crear(req.body);
        res.status(201).json(espacio);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Listar reservas de un espacio especifico (solo admin)
router.get('/:id/reservas', verificarToken, esAdmin, async (req, res) => {
    try {
        const reservas = await Espacio.listarReservas(req.params.id);
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar un espacio (solo admin)
router.put('/:id', verificarToken, esAdmin, async (req, res) => {
    try {
        const { nombre, tipo, capacidad, ubicacion, id_estado } = req.body;
        const espacio = await Espacio.actualizar(req.params.id, {
            nombre,
            tipo,
            capacidad,
            ubicacion,
            id_estado
        });
        res.json(espacio);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Eliminar un espacio (solo admin)
router.delete('/:id', verificarToken, esAdmin, async (req, res) => {
    try {
        await Espacio.eliminar(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;