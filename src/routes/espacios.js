const express = require('express'); // Importa el framework Express para crear rutas
const router = express.Router(); // Crea un enrutador de Express para manejar las rutas de espacios
const Espacio = require('../models/Espacio'); // Importa el modelo de Espacio para interactuar con la base de datos
const verificarToken = require('../middlewares/auth'); // Opcional: proteger la ruta con autenticación

router.get('/disponibles', async (req, res) => { // Ruta para listar espacios disponibles
  try { // Maneja las solicitudes GET a la ruta /espacios/disponibles
    const { fecha_inicio, fecha_fin } = req.query;  // Extrae las fechas de inicio y fin de las consultas de la solicitud
    const espacios = await Espacio.listarDisponibles(fecha_inicio, fecha_fin);  // Llama al método estático listarDisponibles del modelo Espacio para obtener los espacios disponibles en el rango de fechas especificado
    res.json(espacios); // Responde con los espacios disponibles en formato JSON
  } catch (error) { // Si ocurre un error, captura la excepción
    res.status(500).json({ error: error.message }); // Responde con un código de estado 500 (Error interno del servidor) y el mensaje de error
  }
});

router.post('/', verificarToken, async (req, res) => { // Ruta para crear un nuevo espacio
  try { // Maneja las solicitudes POST a la ruta /espacios
    const espacio = await Espacio.crear(req.body); // Crea un nuevo espacio con los datos del cuerpo de la solicitud utilizando el método estático crear del modelo Espacio
    res.status(201).json(espacio); // Responde con el espacio creado y un código de estado 201 (Creado)
  } catch (error) { // Si ocurre un error, captura la excepción
    res.status(400).json({ error: error.message }); // Responde con un código de estado 400 (Solicitud incorrecta) y el mensaje de error
  }
});

module.exports = router;  // Exporta el enrutador para que pueda ser utilizado en otras partes de la aplicación