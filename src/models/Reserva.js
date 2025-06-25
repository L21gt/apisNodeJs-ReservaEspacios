const pool = require('../config/db');  // Conexión a PostgreSQL

class Reserva {  // Clase Reserva que representa la tabla de reservas en la base de datos
  static async verificarEspacio(id_espacio) { // Método estático para verificar si un espacio existe y está disponible
    try { // Verifica si el espacio existe y está disponible
      const query = 'SELECT id FROM espacio WHERE id = $1 AND id_estado = 1'; // 1 = disponible
      const { rows } = await pool.query(query, [id_espacio]); // Ejecuta la consulta en la base de datos y obtiene las filas resultantes
      if (!rows[0]) throw new Error('Espacio no existe o no está disponible'); // Si no se encuentra el espacio, lanza un error
      return true; // Si el espacio existe y está disponible, retorna true
    } catch (error) {  // Captura cualquier error que ocurra durante la verificación
      throw new Error(`Error al verificar espacio: ${error.message}`); // Lanza un error con un mensaje descriptivo
    }
  }

  static async crear({ fecha_inicio, fecha_fin, id_usuario, id_espacio }) { // Método estático para crear una nueva reserva
    try {  // Maneja la creación de una nueva reserva
      // Primero verifica si el espacio existe
      await this.verificarDisponibilidad(id_espacio, fecha_inicio, fecha_fin); // Verifica si el espacio está disponible en el rango de fechas especificado
      const query = `
        INSERT INTO reserva 
          (fecha_inicio, fecha_fin, estado, id_usuario, id_espacio) 
        VALUES 
          ($1, $2, 'confirmada', $3, $4) 
        RETURNING *;
      `;  // Consulta SQL para insertar una nueva reserva en la base de datos
      const values = [fecha_inicio, fecha_fin, id_usuario, id_espacio]; // Valores a insertar en la consulta
      const { rows } = await pool.query(query, values); // Ejecuta la consulta en la base de datos y obtiene las filas resultantes
      return rows[0]; // Retorna la reserva creada
    } catch (error) { // Captura cualquier error que ocurra durante la creación de la reserva
      throw new Error(`Error al crear reserva: ${error.message}`); // Lanza un error con un mensaje descriptivo
    }
  }

  static async listarPorUsuario(id_usuario) { // Método estático para listar todas las reservas de un usuario
    const query = `
        SELECT 
            r.id,
            r.estado,
            e.nombre as espacio_nombre,
            e.tipo as espacio_tipo,
            TO_CHAR(r.fecha_inicio, 'YYYY-MM-DD HH24:MI') as fecha_inicio,
            TO_CHAR(r.fecha_fin, 'YYYY-MM-DD HH24:MI') as fecha_fin
        FROM reserva r
        JOIN espacio e ON r.id_espacio = e.id
        WHERE r.id_usuario = $1`; // Consulta SQL para obtener todas las reservas de un usuario específico, uniendo la tabla de reservas con la tabla de espacios para obtener información adicional del espacio reservado
    // Utiliza TO_CHAR para formatear las fechas de inicio y fin de la reserva
    const { rows } = await pool.query(query, [id_usuario]); // Ejecuta la consulta en la base de datos y obtiene las filas resultantes
    return rows; // Retorna las reservas obtenidas
    }

    static async cancelar(id_reserva, id_usuario) { // Método estático para cancelar una reserva
        const query = `
            UPDATE reserva 
            SET estado = 'cancelada'
            WHERE id = $1 AND id_usuario = $2
            RETURNING *`;  // Consulta SQL para actualizar el estado de una reserva a 'cancelada' donde el id de la reserva y el id del usuario coincidan
        const { rows } = await pool.query(query, [id_reserva, id_usuario]);  // Ejecuta la consulta en la base de datos y obtiene las filas resultantes
        if (!rows[0]) throw new Error('Reserva no encontrada o no autorizada');  // Si no se encuentra la reserva o el usuario no está autorizado, lanza un error
        return rows[0]; // Retorna la reserva cancelada
    }

    static async verificarDisponibilidad(id_espacio, fecha_inicio, fecha_fin) { // Método estático para verificar la disponibilidad de un espacio en un rango de fechas
        const query = `
            SELECT * FROM reserva 
            WHERE id_espacio = $1 
            AND estado != 'cancelada'
            AND (
            (fecha_inicio BETWEEN $2 AND $3) 
            OR (fecha_fin BETWEEN $2 AND $3)
            )`; // Consulta SQL para verificar si hay reservas existentes para el espacio en el rango de fechas especificado
        const { rows } = await pool.query(query, [id_espacio, fecha_inicio, fecha_fin]);  // Ejecuta la consulta en la base de datos y obtiene las filas resultantes
        if (rows.length > 0) throw new Error('El espacio no está disponible en ese horario');  // Si hay reservas existentes, lanza un error indicando que el espacio no está disponible
    }
}

module.exports = Reserva; // Exporta la clase Reserva para que pueda ser utilizada en otras partes de la aplicación