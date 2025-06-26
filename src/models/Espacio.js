const pool = require('../config/db'); // Conexión a PostgreSQL

class Espacio { // Clase Espacio que representa la tabla de espacios en la base de datos
    static async crear({ nombre, tipo, capacidad, ubicacion, id_estado }) { // Método estático para crear un nuevo espacio
    const query = `
      INSERT INTO espacio 
        (nombre, tipo, capacidad, ubicacion, id_estado) 
      VALUES 
        ($1, $2, $3, $4, $5) 
      RETURNING *;
    `;  // Consulta SQL para insertar un nuevo espacio en la base de datos
    const values = [nombre, tipo, capacidad, ubicacion, id_estado]; // Valores a insertar en la consulta
    const { rows } = await pool.query(query, values);  // Ejecuta la consulta en la base de datos y obtiene las filas resultantes
    return rows[0];  // Retorna el espacio creado
  }

  static async listarDisponibles(fecha_inicio, fecha_fin) { // Método estático para listar todos los espacios disponibles en un rango de fechas
        const query = `
            SELECT e.* FROM espacio e
            WHERE e.id_estado = 1
            AND e.id NOT IN (
            SELECT r.id_espacio FROM reserva r
            WHERE r.estado != 'cancelada'
            AND (
                (r.fecha_inicio BETWEEN $1 AND $2)
                OR (r.fecha_fin BETWEEN $1 AND $2)
            )
            )`; // Consulta SQL para obtener todos los espacios que están disponibles (id_estado = 1) y que no están reservados en el rango de fechas especificado
        const { rows } = await pool.query(query, [fecha_inicio, fecha_fin]);  // Ejecuta la consulta en la base de datos y obtiene las filas resultantes
        return rows;  // Retorna los espacios disponibles
    }

    // Método estático para actualizar un espacio existente
    static async actualizar(id, datos) { // Método estático para actualizar un espacio existente
        const { nombre, tipo, capacidad, ubicacion, id_estado } = datos; // Extrae los campos del objeto de datos proporcionado
        const query = `
            UPDATE espacio 
            SET nombre = $1, tipo = $2, capacidad = $3, ubicacion = $4, id_estado = $5
            WHERE id = $6
            RETURNING *;
        `; // Consulta SQL para actualizar un espacio en la base de datos, estableciendo los nuevos valores para los campos especificados
        const values = [nombre, tipo, capacidad, ubicacion, id_estado, id]; // Valores a actualizar en la consulta, incluyendo el ID del espacio a actualizar
        const { rows } = await pool.query(query, values); // Ejecuta la consulta en la base de datos y obtiene las filas resultantes
        if (!rows[0]) throw new Error('Espacio no encontrado'); // Si no se encuentra el espacio con el ID proporcionado, lanza un error
        return rows[0]; // Retorna el espacio actualizado
    }

    // Método estático para eliminar un espacio existente
    static async eliminar(id) { // Método estático para eliminar un espacio existente
        await pool.query('DELETE FROM espacio WHERE id = $1', [id]); // Consulta SQL para eliminar un espacio de la base de datos por su ID
    } // Método estático para eliminar un espacio existente


    // Método estático para listar reservas de un espacio específico
    static async listarReservas(id_espacio) { // Método estático para listar reservas de un espacio específico
        const query = `
            SELECT r.*, u.email as usuario_email
            FROM reserva r
            JOIN usuario u ON r.id_usuario = u.id
            WHERE r.id_espacio = $1
            ORDER BY r.fecha_inicio DESC;
        `;  // Consulta SQL para obtener todas las reservas de un espacio específico, uniendo la tabla de reservas con la tabla de usuarios para obtener el email del usuario que hizo la reserva
        const { rows } = await pool.query(query, [id_espacio]);  // Ejecuta la consulta en la base de datos y obtiene las filas resultantes
        return rows;  // Retorna las reservas del espacio
    }


    // Método estático para buscar espacios según filtros
    static async buscar(filtros = {}) { // Método estático para buscar espacios según filtros
        let query = 'SELECT * FROM espacio WHERE 1 = 1'; // Consulta SQL inicial para seleccionar todos los espacios, comenzando con una condición siempre verdadera (1 = 1) para facilitar la adición de filtros
        const valores = []; // Array para almacenar los valores de los filtros que se agregarán a la consulta
        const { tipo, capacidad, ubicacion } = filtros; // Extrae los filtros del objeto proporcionado

        if (tipo) { // Si se proporciona un tipo de espacio, agrega un filtro para el tipo
            valores.push(tipo); // Agrega el tipo al array de valores
            query += ` AND tipo = $${valores.length}`;  // Agrega la condición del tipo a la consulta, utilizando el índice del valor en el array de valores
        }
        if (capacidad) { // Si se proporciona una capacidad mínima, agrega un filtro para la capacidad
            valores.push(capacidad); // Agrega la capacidad al array de valores
            query += ` AND capacidad >= $${valores.length}`; // Agrega la condición de capacidad a la consulta, utilizando el índice del valor en el array de valores
        }
        if (ubicacion) { // Si se proporciona una ubicación, agrega un filtro para la ubicación
            valores.push(`%${ubicacion}%`); // Agrega la ubicación al array de valores, utilizando el comodín % para buscar coincidencias parciales
            query += ` AND ubicacion ILIKE $${valores.length}`; // Agrega la condición de ubicación a la consulta, utilizando ILIKE para una búsqueda insensible a mayúsculas y minúsculas, y el índice del valor en el array de valores
        }

        const { rows } = await pool.query(query, valores);  // Ejecuta la consulta en la base de datos con los filtros aplicados y obtiene las filas resultantes
        return rows; // Retorna los espacios que coinciden con los filtros aplicados
    }
}

module.exports = Espacio; // Exporta la clase Espacio para que pueda ser utilizada en otras partes de la aplicación