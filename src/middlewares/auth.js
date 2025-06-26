const jwt = require('jsonwebtoken');  // Importa la librería jsonwebtoken para manejar tokens JWT

function verificarToken(req, res, next) { // Middleware para verificar el token JWT

  const authHeader = req.headers['authorization']; // Obtiene el encabezado de autorización de la solicitud
  const token = authHeader && authHeader.split(' ')[1]; // Extrae "Bearer token"
  if (!token) return res.status(403).json({ error: 'Token no proporcionado' }); // Si no se proporciona un token, responde con un error 403 (Prohibido)

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {  // Verifica el token usando la clave secreta
    if (err) { // Si hay un error al verificar el token, responde con un error 401 (No autorizado)
      console.error("Error al verificar token:", err.message); // Debug
      return res.status(401).json({ error: 'Token inválido' }); // Responde con un error 401 (No autorizado)
    }
    req.usuarioId = decoded.id; // Si el token es válido, extrae el ID del usuario del token decodificado y lo agrega al objeto de solicitud
    req.usuarioRol = decoded.rol; // Extrae el rol del usuario del token decodificado y lo agrega al objeto de solicitud
    next(); // Llama al siguiente middleware o ruta
  });
}

// Middleware para verificar si el usuario es admin
function esAdmin(req, res, next) { // Middleware para verificar si el usuario tiene rol de administrador
  if (req.usuarioRol !== 1) { // 1 = admin (según tu BD)
    return res.status(403).json({ error: 'Acceso denegado: se requiere rol admin' });  // Si el usuario no es admin, responde con un error 403 (Prohibido)
  } // Si el usuario es admin, continúa con la siguiente función middleware o ruta
  next(); // Llama al siguiente middleware o ruta
}

// Exporta ambos middlewares:
module.exports = { 
  verificarToken, 
  esAdmin  
};