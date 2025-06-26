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

  static async crear({ fecha_inicio, fecha_fin, id_usuario, id_espacio }) {  // Método estático para crear una nueva reserva
    try {  // Maneja la creación de una reserva
        // ======================================
        // 1. VALIDACIONES DE FECHAS
        // ======================================
        const ahora = new Date(); // Fecha/hora actual

        // A. Validar formato ISO 8601 (YYYY-MM-DDTHH:MM:SS)
        const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;  // Expresión regular para validar el formato ISO 8601
        if (!isoRegex.test(fecha_inicio)) {  // Verifica si la fecha de inicio cumple con el formato
        throw new Error('Formato de fecha_inicio inválido. Use YYYY-MM-DDTHH:MM:SS (ej: 2025-01-01T09:00:00)');  // Si no cumple, lanza un error
        }
        if (!isoRegex.test(fecha_fin)) { // Verifica si la fecha de fin cumple con el formato
        throw new Error('Formato de fecha_fin inválido. Use YYYY-MM-DDTHH:MM:SS (ej: 2025-01-01T11:00:00)'); // Si no cumple, lanza un error
        }

        // B. Convertir a objetos Date
        const inicio = new Date(fecha_inicio);  // Convierte la fecha de inicio a un objeto Date
        const fin = new Date(fecha_fin);  // Convierte la fecha de fin a un objeto Date

        // C. Validar lógica de fechas
        if (fin <= inicio) {  // Verifica si la fecha de fin es posterior a la de inicio
        throw new Error(`La fecha de fin (${fecha_fin}) debe ser POSTERIOR a la de inicio (${fecha_inicio})`);  // Si no es así, lanza un error
        }
        if (inicio < ahora) {  // Verifica si la fecha de inicio es anterior a la fecha/hora actual
        throw new Error(`No se pueden crear reservas en el pasado (${fecha_inicio} < ${ahora.toISOString()})`);  // Si es así, lanza un error
        }

        // ======================================
        // 2. VERIFICAR DISPONIBILIDAD (existente)
        // ======================================
        await this.verificarDisponibilidad(id_espacio, fecha_inicio, fecha_fin);  // Llama al método estático verificarDisponibilidad para asegurarse de que el espacio esté disponible en el rango de fechas especificado

        // ======================================
        // 3. CREAR RESERVA EN BD (existente)
        // ======================================
        const query = `
        INSERT INTO reserva 
            (fecha_inicio, fecha_fin, estado, id_usuario, id_espacio) 
        VALUES 
            ($1, $2, 'confirmada', $3, $4) 
        RETURNING *;
        `;  // Consulta SQL para insertar una nueva reserva en la base de datos, estableciendo el estado como 'confirmada'
        const values = [fecha_inicio, fecha_fin, id_usuario, id_espacio]; // Valores a insertar en la consulta
        const { rows } = await pool.query(query, values); // Ejecuta la consulta en la base de datos y obtiene las filas resultantes

        // ======================================
        // 4. RETORNAR RESULTADO (existente)
        // ======================================
        return rows[0]; // Retorna la reserva creada

        } catch (error) { // Captura cualquier error que ocurra durante el proceso de creación de la reserva
            // Mejoramos el mensaje de error para desarrollo
            console.error('[Error en Reserva.crear] Detalles:', { // Imprime el error en la consola para depuración
            error: error.message, // Mensaje de error original
            fecha_inicio, // Fecha de inicio proporcionada
            fecha_fin, // Fecha de fin proporcionada
            id_usuario, // ID del usuario que realiza la reserva
            id_espacio // ID del espacio reservado
            });
            
            // Relanzamos el error con contexto claro para el cliente
            throw new Error(`No se pudo crear la reserva: ${error.message}`); // Lanza un error con un mensaje claro para el cliente
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

    // Método estático para obtener una reserva por su ID y el ID del usuario
    static async obtenerPorId(id_reserva, id_usuario) { // Método estático para obtener una reserva específica por su ID y el ID del usuario
        const query = `
            SELECT r.*, e.nombre as espacio_nombre 
            FROM reserva r
            JOIN espacio e ON r.id_espacio = e.id
            WHERE r.id = $1 AND r.id_usuario = $2;
        `;  // Consulta SQL para obtener una reserva específica por su ID y el ID del usuario, uniendo la tabla de reservas con la tabla de espacios para obtener información adicional del espacio reservado
        const { rows } = await pool.query(query, [id_reserva, id_usuario]); // Ejecuta la consulta en la base de datos y obtiene las filas resultantes
        if (!rows[0]) throw new Error('Reserva no encontrada'); // Si no se encuentra la reserva, lanza un error
        return rows[0]; // Retorna la reserva obtenida
    }


    static async actualizar(id_reserva, id_usuario, nuevosDatos) {  // Método estático para actualizar una reserva existente
    // 1. Verificar que la reserva pertenezca al usuario
        const reservaActual = await this.obtenerPorId(id_reserva, id_usuario); // Obtiene la reserva actual por su ID y el ID del usuario para asegurarse de que el usuario tenga permiso para actualizarla

        // 2. Validar nuevas fechas (si existen)
        if (nuevosDatos.fecha_inicio || nuevosDatos.fecha_fin) { // Si se proporcionan nuevas fechas de inicio o fin
            const fecha_inicio = nuevosDatos.fecha_inicio || reservaActual.fecha_inicio;  // Usa la nueva fecha de inicio si se proporciona, o la actual si no
            const fecha_fin = nuevosDatos.fecha_fin || reservaActual.fecha_fin; // Usa la nueva fecha de fin si se proporciona, o la actual si no
            await this.verificarDisponibilidad(reservaActual.id_espacio, fecha_inicio, fecha_fin, id_reserva); // Verifica la disponibilidad del espacio para las nuevas fechas, pasando el ID de la reserva actual para evitar conflictos con la propia reserva
        }

        // 3. Actualizar
        const campos = Object.keys(nuevosDatos); // Obtiene los nombres de los campos que se van a actualizar desde el objeto nuevosDatos
        const valores = campos.map(campo => nuevosDatos[campo]);  // Mapea los valores de los campos a un array, extrayendo los valores del objeto nuevosDatos
        const sets = campos.map((campo, i) => `${campo} = $${i + 1}`).join(', ');  // Crea una cadena de asignación para la consulta SQL, formateando cada campo con su respectivo índice para los parámetros de la consulta

        const query = `
            UPDATE reserva
            SET ${sets}
            WHERE id = $${campos.length + 1} AND id_usuario = $${campos.length + 2}
            RETURNING *;
        `; // Consulta SQL para actualizar la reserva, estableciendo los nuevos valores para los campos especificados y asegurándose de que el ID de la reserva y el ID del usuario coincidan
        const { rows } = await pool.query(query, [...valores, id_reserva, id_usuario]); // Ejecuta la consulta en la base de datos, pasando los valores de los campos a actualizar, el ID de la reserva y el ID del usuario como parámetros
        return rows[0]; // Retorna la reserva actualizada
    }
}

module.exports = Reserva; // Exporta la clase Reserva para que pueda ser utilizada en otras partes de la aplicación