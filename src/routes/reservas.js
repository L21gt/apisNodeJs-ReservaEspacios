const express = require('express');  // Importa el framework Express para crear rutas
const router = express.Router();  // Crea un enrutador de Express para manejar las rutas de reservas
const { verificarToken } = require('../middlewares/auth');  // Importa el middleware de autenticación para verificar el token JWT
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

// Listar reservas del usuario actual
// En src/routes/reservas.js, modificar el endpoint de listar reservas
router.get('/', verificarToken, async (req, res) => {
    try {
        const reservas = await Reserva.listarPorUsuario(req.usuarioId);
        
        // Formatear fechas y asegurar que siempre devolvemos un array
        const reservasFormateadas = Array.isArray(reservas) ? 
            reservas.map(r => ({
                ...r,
                fecha_inicio: new Date(r.fecha_inicio).toISOString(),
                fecha_fin: new Date(r.fecha_fin).toISOString()
            })) : [];
            
        res.json(reservasFormateadas);
    } catch (error) {
        console.error('Error en GET /reservas:', error);
        res.status(500).json({ 
            error: 'Error al obtener reservas',
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Ruta para obtener una reserva por ID
router.get('/:id', verificarToken, async (req, res) => {  // Ruta para obtener una reserva específica por ID
  try { // Maneja las solicitudes GET a la ruta /reservas/:id
    const reserva = await Reserva.obtenerPorId(req.params.id, req.usuarioId); // Llama al método estático obtenerPorId del modelo Reserva, pasando el ID de la reserva y el ID del usuario del token decodificado
    res.json(reserva); // Responde con la reserva obtenida
  } catch (error) { // Si ocurre un error, captura la excepción
    res.status(404).json({ error: error.message });  // Responde con un código de estado 404 (No encontrado) y el mensaje de error
  }
});

// Ruta para cancelar una reserva
router.patch('/:id/cancelar', verificarToken, async (req, res) => { // Maneja las solicitudes PATCH a la ruta /reservas/:id/cancelar
  try { // Intenta cancelar una reserva con el ID proporcionado en los parámetros de la solicitud
    const reserva = await Reserva.cancelar(req.params.id, req.usuarioId); // Llama al método estático cancelar del modelo Reserva, pasando el ID de la reserva y el ID del usuario del token decodificado
    res.json(reserva); // Responde con la reserva cancelada
  } catch (error) { // Si ocurre un error, captura la excepción
    res.status(400).json({ error: error.message });// Responde con un código de estado 400 (Solicitud incorrecta) y el mensaje de error
  }
});

// Ruta para actualizar una reserva
router.patch('/:id', verificarToken, async (req, res) => {// Maneja las solicitudes PATCH a la ruta /reservas/:id
  try { // Intenta actualizar una reserva con el ID proporcionado en los parámetros de la solicitud
    const reserva = await Reserva.actualizar( // Llama al método estático actualizar del modelo Reserva, pasando el ID de la reserva, el ID del usuario del token decodificado y los datos de actualización del cuerpo de la solicitud
      req.params.id,    // ID de la reserva a actualizar
      req.usuarioId,    // ID del usuario que realiza la actualización
      req.body // { fecha_inicio?, fecha_fin?, motivo? }
    );
    res.json(reserva); // Responde con la reserva actualizada
  } catch (error) { // Si ocurre un error, captura la excepción
    res.status(400).json({ error: error.message }); // Responde con un código de estado 400 (Solicitud incorrecta) y el mensaje de error
  }
});

module.exports = router; // Exporta el enrutador para que pueda ser utilizado en otras partes de la aplicación