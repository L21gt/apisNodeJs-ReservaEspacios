const express = require('express'); // Importa el framework Express para crear rutas
const router = express.Router(); // Crea un enrutador de Express para manejar las rutas de autenticación
const Usuario = require('../models/Usuario'); // Importa el modelo de Usuario para interactuar con la base de datos
const jwt = require('jsonwebtoken'); // Importa la librería jsonwebtoken para manejar tokens JWT


// Ruta para registrar un nuevo usuario
router.post('/registro', async (req, res) => { // Maneja las solicitudes POST a la ruta /registro
  try { // Intenta crear un nuevo usuario con los datos del cuerpo de la solicitud
    const usuario = await Usuario.crear(req.body);
    res.status(201).json(usuario); // Responde con el usuario creado y un código de estado 201 (Creado)
  } catch (error) { // Si ocurre un error, captura la excepción
    res.status(400).json({ error: error.message }); // Responde con un código de estado 400 (Solicitud incorrecta) y el mensaje de error
  }
});

// Ruta para iniciar sesión
router.post('/login', async (req, res) => { // Maneja las solicitudes POST a la ruta /login
  try { // Intenta verificar las credenciales del usuario con los datos del cuerpo de la solicitud
    const { email, password } = req.body; // Extrae el email y la contraseña del cuerpo de la solicitud
    const usuario = await Usuario.verificarCredenciales(email, password);  // Verifica las credenciales del usuario
    
    // Generar token JWT (expira en 1 hora)
    const token = jwt.sign(
  { id: usuario.id, rol: usuario.id_rol }, // Añade el rol al payload
  process.env.JWT_SECRET, // Utiliza una clave secreta almacenada en las variables de entorno para firmar el token
  { expiresIn: '1h' } // Configura la expiración del token a 1 hora
);
    
    res.json({ token }); // Responde con el token generado
  } catch (error) { // Si ocurre un error, captura la excepción
    res.status(401).json({ error: error.message }); // Responde con un código de estado 401 (No autorizado) y el mensaje de error
  }
});


module.exports = router; // Exporta el enrutador para que pueda ser utilizado en otras partes de la aplicación