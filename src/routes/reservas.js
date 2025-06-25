const express = require('express');  // Importa el framework Express para crear rutas
const router = express.Router();  // Crea un enrutador de Express para manejar las rutas de reservas
const verificarToken = require('../middlewares/auth');  // Importa el middleware de autenticación para verificar el token JWT
const Reserva = require('../models/Reserva');  // Importa el modelo de Reserva para interactuar con la base de datos

router.post('/', verificarToken, async (req, res) => { // Ruta para crear una nueva reserva
  try { // Maneja las solicitudes POST a la ruta /reservas
    const reserva = await Reserva.crear({ // Crea una nueva reserva con los datos del cuerpo de la solicitud
      ...req.body,  // Desestructura los datos del cuerpo de la solicitud
      id_usuario: req.usuarioId  // Asigna el ID del usuario del token decodificado al campo id_usuario de la reserva
    });
    res.status(201).json(reserva);  // Responde con la reserva creada y un código de estado 201 (Creado)
  } catch (error) { // Si ocurre un error, captura la excepción
    if (error.message.includes('Espacio no existe')) {  // Si el error es por espacio no existente o no disponible
      res.status(404).json({ error: error.message }); // Responde con un código de estado 404 (No encontrado) y el mensaje de error
    } else { // Para otros errores, responde con un código de estado 400 (Solicitud incorrecta)
      res.status(400).json({ error: error.message }); // Responde con un código de estado 400 (Solicitud incorrecta) y el mensaje de error
    }
  }
});

module.exports = router; // Exporta el enrutador para que pueda ser utilizado en otras partes de la aplicación