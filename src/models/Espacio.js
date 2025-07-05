const pool = require('../config/db');

class Espacio {
    static async buscarTodos(filtros = {}) {
        let baseQuery = `
            SELECT 
                e.*,
                CASE 
                    WHEN r.id IS NOT NULL THEN 'Ocupado' 
                    ELSE 'Libre' 
                END as estado_actual
            FROM espacio e
            LEFT JOIN reserva r ON e.id = r.id_espacio
                AND r.estado = 'confirmada'
                AND NOW() BETWEEN r.fecha_inicio AND r.fecha_fin
        `;
        const values = [];
        const whereClauses = [];

        // Lógica de Filtro robusta
        if (filtros.tipo) {
            values.push(`%${filtros.tipo}%`);
            whereClauses.push(`e.tipo ILIKE $${values.length}`);
        }
        // Aquí podrías añadir más filtros en el futuro
        // if (filtros.capacidad) { ... }

        if (whereClauses.length > 0) {
            baseQuery += ' WHERE ' + whereClauses.join(' AND ');
        }

        // Lógica de Ordenamiento
        const sortBy = filtros.sortBy || 'id';
        const order = filtros.order === 'desc' ? 'DESC' : 'ASC';
        baseQuery += ` ORDER BY e.${sortBy} ${order}`;

        const { rows } = await pool.query(baseQuery, values);
        return rows;
    }

    // --- El resto de las funciones no cambian ---
    static async crear({ nombre, tipo, capacidad, ubicacion }) {
        const query = `
            INSERT INTO espacio (nombre, tipo, capacidad, ubicacion, id_estado)
            VALUES ($1, $2, $3, $4, 1) 
            RETURNING *;
        `;
        const values = [nombre, tipo, capacidad, ubicacion];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async buscarPorId(id) {
        const { rows } = await pool.query('SELECT * FROM espacio WHERE id = $1', [id]);
        if (rows.length === 0) {
            throw new Error('Espacio no encontrado.');
        }
        return rows[0];
    }

    static async actualizar(id, { nombre, tipo, capacidad, ubicacion }) {
        const query = `
            UPDATE espacio 
            SET nombre = $1, tipo = $2, capacidad = $3, ubicacion = $4
            WHERE id = $5
            RETURNING *;
        `;
        const values = [nombre, tipo, capacidad, ubicacion, id];
        const { rows } = await pool.query(query, values);
        if (rows.length === 0) {
            throw new Error('Espacio no encontrado para actualizar.');
        }
        return rows[0];
    }

    static async eliminar(id) {
        await pool.query('DELETE FROM reserva WHERE id_espacio = $1', [id]);
        const resultado = await pool.query('DELETE FROM espacio WHERE id = $1 RETURNING *', [id]);
        if (resultado.rowCount === 0) {
            throw new Error('No se encontró el espacio para eliminar.');
        }
        return resultado.rows[0];
    }
}

module.exports = Espacio;