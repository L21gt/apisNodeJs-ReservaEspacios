const pool = require('../config/db');
const bcrypt = require('bcrypt');
const saltRounds = 10;

class Usuario {
    static async crear({ primer_nombre, primer_apellido, email, password, telefono }) {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const query = `
            INSERT INTO usuario (primer_nombre, primer_apellido, email, password, telefono, id_rol, estado)
            VALUES ($1, $2, $3, $4, $5, 2, 'activo')
            RETURNING id, email, primer_nombre, id_rol;`;
        // El teléfono puede ser null si no se proporciona
        const values = [primer_nombre, primer_apellido || null, email, hashedPassword, telefono || null];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async verificarCredenciales(email, password) {
        const { rows } = await pool.query('SELECT * FROM usuario WHERE email = $1', [email]);
        const usuario = rows[0];
        if (!usuario) throw new Error("Credenciales incorrectas");

        if (usuario.estado === 'bloqueado') {
            throw new Error('Esta cuenta de usuario ha sido bloqueada.');
        }

        const match = await bcrypt.compare(password, usuario.password);
        if (!match) throw new Error("Credenciales incorrectas");
        return usuario;
    }

    static async listarTodos(filtros = {}) {
        let query = 'SELECT id, primer_nombre, primer_apellido, email, id_rol, estado FROM usuario';
        const values = [];
        const whereClauses = [];

        // Lógica de Filtro
        if (filtros.rol) {
            values.push(filtros.rol);
            whereClauses.push(`id_rol = $${values.length}`);
        }
        if (filtros.estado) {
            values.push(filtros.estado);
            whereClauses.push(`estado = $${values.length}`);
        }

        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }

        // Lógica de Ordenamiento
        const sortBy = filtros.sortBy || 'id'; // Ordenar por ID por defecto
        const order = filtros.order === 'desc' ? 'DESC' : 'ASC'; // Ascendente por defecto
        query += ` ORDER BY ${sortBy} ${order}`;
        
        const { rows } = await pool.query(query, values);
        return rows;
    }

    static async actualizarRol(id, id_rol) {
        const query = 'UPDATE usuario SET id_rol = $1 WHERE id = $2 RETURNING id, id_rol';
        const values = [id_rol, id];
        const { rows } = await pool.query(query, values);
        if (rows.length === 0) {
            throw new Error('Usuario no encontrado.');
        }
        return rows[0];
    }

    static async cambiarEstado(id, nuevoEstado) {
        if (nuevoEstado !== 'activo' && nuevoEstado !== 'bloqueado') {
            throw new Error('Estado no válido.');
        }
        const query = 'UPDATE usuario SET estado = $1 WHERE id = $2 RETURNING id, estado';
        const values = [nuevoEstado, id];
        const { rows } = await pool.query(query, values);
        if (rows.length === 0) {
            throw new Error('Usuario no encontrado.');
        }
        return rows[0];
    }
}

module.exports = Usuario;