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

  static async listarDisponibles() { // Método estático para listar todos los espacios disponibles
    const query = `
      SELECT e.* FROM espacio e
      WHERE e.id_estado = 1  -- 1 = 'disponible' (según tu script DDL)
    `; // Consulta SQL para obtener todos los espacios que están disponibles
    const { rows } = await pool.query(query); // Ejecuta la consulta en la base de datos y obtiene las filas resultantes
    return rows; // Retorna las filas obtenidas 
  }
}

module.exports = Espacio; // Exporta la clase Espacio para que pueda ser utilizada en otras partes de la aplicación