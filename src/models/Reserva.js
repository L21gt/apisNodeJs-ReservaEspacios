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
      await this.verificarEspacio(id_espacio); // Llama al método verificarEspacio para asegurarse de que el espacio está disponible

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
}

module.exports = Reserva; // Exporta la clase Reserva para que pueda ser utilizada en otras partes de la aplicación