const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth');
const Reserva = require('../models/Reserva');

router.post('/', verificarToken, async (req, res) => {
    try {
        const reserva = await Reserva.crear({ ...req.body, id_usuario: req.usuariold });
        res.status(201).json(reserva);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/', verificarToken, async (req, res) => {
    try {
        const reservas = await Reserva.listarPorUsuario(req.usuariold);
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las reservas' });
    }
});

router.patch('/:id/cancelar', verificarToken, async (req, res) => {
    try {
        const reserva = await Reserva.cancelar(req.params.id, req.usuariold);
        res.json(reserva);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;