const express = require('express');
const router = express.Router();
const { verificarToken, esAdmin } = require('../middlewares/auth');
const Usuario = require('../models/Usuario');

router.get('/usuarios', [verificarToken, esAdmin], async (req, res) => {
    try {
        const usuarios = await Usuario.listarTodos();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;