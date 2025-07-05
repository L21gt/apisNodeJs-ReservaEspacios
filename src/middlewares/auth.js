const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization']; // "Bearer
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

    if (!token) {
        return res.status(403).json({ error: 'Token no proporcionado' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token inválido' });
        }
        req.usuariold = decoded.id;
        req.usuarioRol = decoded.rol;
        next();
    });
}

function esAdmin(req, res, next) {
    // El rol de admin es 1
    if (req.usuarioRol !== 1) {
        return res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' });
    }
    next();
}

module.exports = {
    verificarToken,
    esAdmin,
};