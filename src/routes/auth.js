const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Ruta para login de usuario
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        const usuario = await Usuario.verificarCredenciales(email, password);

        const payload = {
            id: usuario.id,
            rol: usuario.id_rol,
            nombre: usuario.primer_nombre
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '1h'
        });

        res.json({
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.primer_nombre,
                email: usuario.email,
                rol: usuario.id_rol
            }
        });

    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// Ruta para registro de un nuevo usuario
router.post('/registro', async (req, res) => {
    try {
        const { primer_nombre, primer_apellido, email, password, telefono } = req.body;

        if (!primer_nombre || !email || !password) {
            return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
        }

        const nuevoUsuario = await Usuario.crear({
            primer_nombre,
            primer_apellido: primer_apellido || null,
            email,
            password,
            telefono: telefono || null, // <-- EL ERROR ESTABA AQUÍ, FALTABA ESTA COMA.
            id_rol: 2 // Rol de usuario regular por defecto
        });

        const payload = {
            id: nuevoUsuario.id,
            rol: nuevoUsuario.id_rol
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '1h'
        });

        res.status(201).json({ token, usuario: nuevoUsuario });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;