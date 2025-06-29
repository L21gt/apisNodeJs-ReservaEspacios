const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth');
const Reserva = require('../models/Reserva');

// Crear una nueva reserva
router.post('/', verificarToken, async (req, res) => {
    try {
        const reserva = await Reserva.crear({
            ...req.body,
            id_usuario: req.usuariold // El ID de usuario se toma del token
        });
        res.status(201).json(reserva);
    } catch (error) {
        // Diferenciar errores para dar una mejor respuesta al cliente
        if (error.message.includes('Espacio no existe') || error.message.includes('no está disponible')) {
            res.status(404).json({ error: error.message });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
});

// Listar todas las reservas del usuario que está logueado
router.get('/', verificarToken, async (req, res) => {
    try {
        const reservas = await Reserva.listarPorUsuario(req.usuariold);
        res.json(reservas);
    } catch (error) {
        console.error('Error en GET /reservas:', error);
        res.status(500).json({ error: 'Error al obtener las reservas' });
    }
});

// Obtener una reserva específica por su ID
router.get('/:id', verificarToken, async (req, res) => {
    try {
        const reserva = await Reserva.obtenerPorId(req.params.id, req.usuariold);
        res.json(reserva);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Cancelar una reserva
router.patch('/:id/cancelar', verificarToken, async (req, res) => {
    try {
        const reserva = await Reserva.cancelar(req.params.id, req.usuariold);
        res.json(reserva);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Actualizar una reserva
router.patch('/:id', verificarToken, async (req, res) => {
    try {
        const reserva = await Reserva.actualizar(
            req.params.id,
            req.usuariold,
            req.body
        );
        res.json(reserva);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;