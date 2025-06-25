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
}

module.exports = Espacio; // Exporta la clase Espacio para que pueda ser utilizada en otras partes de la aplicación