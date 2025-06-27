// src/routes/admin.js (nuevo archivo)
const express = require('express');
const router = express.Router();
const { verificarToken, esAdmin } = require('../middlewares/auth');
const Usuario = require('../models/Usuario');
const Espacio = require('../models/Espacio');
const Reserva = require('../models/Reserva');

// Listar todos los usuarios
router.get('/usuarios', verificarToken, esAdmin, async (req, res) => {
    try {
        const usuarios = await Usuario.listarTodos();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Listar todos los espacios
router.get('/espacios', verificarToken, esAdmin, async (req, res) => {
    try {
        const espacios = await Espacio.buscar({});
        res.json(espacios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Listar todas las reservas con filtros
router.get('/reservas', verificarToken, esAdmin, async (req, res) => {
    try {
        const { fecha, estado } = req.query;
        const reservas = await Reserva.listarTodas({ fecha, estado });
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;