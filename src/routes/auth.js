const express = require('express'); // Importa el framework Express para crear rutas
const router = express.Router(); // Crea un enrutador de Express para manejar las rutas de autenticación
const Usuario = require('../models/Usuario'); // Importa el modelo de Usuario para interactuar con la base de datos

// Ruta para registrar un nuevo usuario
router.post('/registro', async (req, res) => { // Maneja las solicitudes POST a la ruta /registro
  try { // Intenta crear un nuevo usuario con los datos del cuerpo de la solicitud
    const usuario = await Usuario.crear(req.body);
    res.status(201).json(usuario); // Responde con el usuario creado y un código de estado 201 (Creado)
  } catch (error) { // Si ocurre un error, captura la excepción
    res.status(400).json({ error: error.message }); // Responde con un código de estado 400 (Solicitud incorrecta) y el mensaje de error
  }
});

module.exports = router; // Exporta el enrutador para que pueda ser utilizado en otras partes de la aplicación