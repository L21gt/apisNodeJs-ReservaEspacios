const express = require('express'); // Importa el framework Express para crear rutas
const router = express.Router(); // Crea un enrutador de Express para manejar las rutas de espacios
const Espacio = require('../models/Espacio'); // Importa el modelo de Espacio para interactuar con la base de datos
const { verificarToken, esAdmin } = require('../middlewares/auth'); // Opcional: proteger la ruta con autenticación

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

// Actualizar espacio (solo admin)
router.put('/:id', verificarToken, esAdmin, async (req, res) => { // Ruta para actualizar un espacio existente
  try { // Maneja las solicitudes PUT a la ruta /espacios/:id
    const { nombre, tipo, capacidad, ubicacion, id_estado } = req.body; // Extrae los campos del cuerpo de la solicitud
    const espacio = await Espacio.actualizar(req.params.id, {  // Llama al método estático actualizar del modelo Espacio para actualizar el espacio con el ID proporcionado
      nombre, tipo, capacidad, ubicacion, id_estado // Asigna los campos extraídos del cuerpo de la solicitud
    }); 
    res.json(espacio); // Responde con el espacio actualizado
  } catch (error) { // Si ocurre un error, captura la excepción
    res.status(400).json({ error: error.message }); // Responde con un código de estado 400 (Solicitud incorrecta) y el mensaje de error
  }
});


// Eliminar espacio (solo admin)
router.delete('/:id', verificarToken, esAdmin, async (req, res) => { // Ruta para eliminar un espacio existente
  try { // Maneja las solicitudes DELETE a la ruta /espacios/:id
    await Espacio.eliminar(req.params.id);  // Llama al método estático eliminar del modelo Espacio para eliminar el espacio con el ID proporcionado
    res.status(204).send(); // 204 = No Content
  } catch (error) {  // Si ocurre un error, captura la excepción
    res.status(400).json({ error: error.message }); // Responde con un código de estado 400 (Solicitud incorrecta) y el mensaje de error
  }
});


// Listar reservas de un espacio específico (solo admin)
router.get('/:id/reservas', verificarToken, esAdmin, async (req, res) => {  // Ruta para listar las reservas de un espacio específico
  try { // Maneja las solicitudes GET a la ruta /espacios/:id/reservas
    const reservas = await Espacio.listarReservas(req.params.id); // Llama al método estático listarReservas del modelo Espacio para obtener las reservas del espacio con el ID proporcionado
    res.json(reservas); // Responde con las reservas obtenidas en formato JSON
  } catch (error) {  // Si ocurre un error, captura la excepción
    res.status(500).json({ error: error.message }); // Responde con un código de estado 500 (Error interno del servidor) y el mensaje de error
  }
});

// Listar todos los espacios (opcionalmente protegido)
router.get('/', async (req, res) => { // Ruta para listar todos los espacios
  try { // Maneja las solicitudes GET a la ruta /espacios
    const espacios = await Espacio.buscar(req.query); // Llama al método estático buscar del modelo Espacio para obtener todos los espacios, filtrando por los parámetros de consulta si se proporcionan
    res.json(espacios); // Responde con los espacios obtenidos en formato JSON
  } catch (error) { // Si ocurre un error, captura la excepción
    res.status(500).json({ error: error.message }); // Responde con un código de estado 500 (Error interno del servidor) y el mensaje de error
  }
});

module.exports = router;  // Exporta el enrutador para que pueda ser utilizado en otras partes de la aplicación