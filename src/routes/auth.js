const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

router.post('/login', async (req, res) => {
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

router.post('/registro', async (req, res) => {
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

module.exports = router;