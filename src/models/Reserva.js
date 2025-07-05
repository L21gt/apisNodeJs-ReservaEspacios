const pool = require('../config/db');

class Reserva {
    static async crear({ id_espacio, id_usuario, fecha_inicio, fecha_fin }) {
        
        // --- INICIO DE VALIDACIONES DE REGLAS DE NEGOCIO ---
        const inicio = new Date(fecha_inicio);
        const fin = new Date(fecha_fin);

        // validar minimo y máximo de horas para la reserva
        const duracionMilisegundos = fin - inicio;
        const duracionHoras = duracionMilisegundos / (1000 * 60 * 60);

        if (duracionHoras < 1) {
            throw new Error('La duración mínima de la reserva es de 1 hora.');
        }
        if (duracionHoras > 4) {
            throw new Error('La duración máxima de la reserva es de 4 horas.');
        }

        // 1. Validar que la fecha de inicio sea en el futuro.
        if (inicio < new Date()) {
            throw new Error('No se pueden crear reservas en fechas pasadas.');
        }

        // 2. Validar que la fecha de fin sea posterior a la de inicio.
        if (fin <= inicio) {
            throw new Error('La fecha de fin debe ser posterior a la fecha de inicio.');
        }

        const diaSemana = inicio.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
        const horaInicio = inicio.getHours();
        const horaFin = fin.getHours();
        const minutosFin = fin.getMinutes();

        // 3. Validar que no sea fin de semana (Sábado o Domingo).
        if (diaSemana === 0 || diaSemana === 6) {
            throw new Error('No se pueden hacer reservas en fines de semana (sábado o domingo).');
        }

        // 4. Validar que la reserva esté dentro del horario hábil (8:00 AM a 8:00 PM).
        if (horaInicio < 8) {
            throw new Error('El horario de reserva no puede comenzar antes de las 8:00 AM.');
        }
        // Una reserva puede terminar a las 20:00 en punto, pero no después.
        if (horaFin > 20 || (horaFin === 20 && minutosFin > 0)) {
            throw new Error('El horario de reserva no puede terminar después de las 8:00 PM.');
        }

        // --- FIN DE LAS NUEVAS VALIDACIONES ---


        // Lógica de validación de disponibilidad (ya existente)
        const checkQuery = "SELECT * FROM reserva WHERE id_espacio = $1 AND estado != 'cancelada' AND (fecha_inicio, fecha_fin) OVERLAPS ($2, $3)";
        const { rows: Ocupados } = await pool.query(checkQuery, [id_espacio, fecha_inicio, fecha_fin]);
        if (Ocupados.length > 0) {
            throw new Error('El espacio no está disponible en el horario seleccionado.');
        }

        const insertQuery = 'INSERT INTO reserva (id_espacio, id_usuario, fecha_inicio, fecha_fin, estado) VALUES ($1, $2, $3, $4, $5) RETURNING *';
        const values = [id_espacio, id_usuario, fecha_inicio, fecha_fin, 'confirmada'];
        const { rows } = await pool.query(insertQuery, values);
        return rows[0];
    }

    static async listarPorUsuario(id_usuario) {
        const query = `
            SELECT r.*, e.nombre as espacio_nombre FROM reserva r
            JOIN espacio e ON r.id_espacio = e.id
            WHERE r.id_usuario = $1 ORDER BY r.fecha_inicio DESC`;
        const { rows } = await pool.query(query, [id_usuario]);
        return rows;
    }

    static async cancelar(id, id_usuario) {
        const query = "UPDATE reserva SET estado = 'cancelada' WHERE id = $1 AND id_usuario = $2 RETURNING *";
        const { rows } = await pool.query(query, [id, id_usuario]);
        if (rows.length === 0) throw new Error('Reserva no encontrada o no pertenece al usuario');
        return rows[0];
    }
    
    static async listarTodas(filtros = {}) {
        let query = `
            SELECT r.id, r.fecha_inicio, r.fecha_fin, r.estado, 
                   u.email as usuario_email, e.nombre as espacio_nombre
            FROM reserva r
            JOIN usuario u ON r.id_usuario = u.id
            JOIN espacio e ON r.id_espacio = e.id
        `;
        const values = [];

        // Lógica de Filtro
        if (filtros.estado) {
            values.push(filtros.estado);
            query += ` WHERE r.estado = $${values.length}`;
        }

        // Lógica de Ordenamiento
        const sortByMap = {
            id: 'r.id',
            espacio_nombre: 'e.nombre',
            usuario_email: 'u.email',
            fecha_inicio: 'r.fecha_inicio',
            estado: 'r.estado'
        };
        const sortBy = sortByMap[filtros.sortBy] || 'r.id'; // Ordenar por ID de reserva por defecto
        const order = filtros.order === 'desc' ? 'DESC' : 'ASC';
        query += ` ORDER BY ${sortBy} ${order}`;
        
        const { rows } = await pool.query(query, values);
        return rows;
    }

    static async cancelarPorAdmin(id) {
        const query = "UPDATE reserva SET estado = 'cancelada' WHERE id = $1 RETURNING *";
        const { rows } = await pool.query(query, [id]);
        if (rows.length === 0) {
            throw new Error('Reserva no encontrada.');
        }
        return rows[0];
    }

    // Función para obtener reservas por espacio y fecha
    static async obtenerPorEspacioYFecha(id_espacio, fecha) {
        const query = `
            SELECT fecha_inicio, fecha_fin FROM reserva
            WHERE id_espacio = $1 
            AND estado = 'confirmada'
            AND fecha_inicio::date = $2::date
            ORDER BY fecha_inicio ASC;
        `;
        const { rows } = await pool.query(query, [id_espacio, fecha]);
        return rows;
    }
}

module.exports = Reserva;