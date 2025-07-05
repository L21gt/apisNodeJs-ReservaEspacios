const express = require('express');
const router = express.Router();
const Espacio = require('../models/Espacio');
const { verificarToken } = require('../middlewares/auth');

router.get('/', verificarToken, async (req, res) => {
    try {
        const espacios = await Espacio.buscarTodos();
        res.json(espacios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;