// Esto define el modelo de Usuario para la base de datos
const pool = require('../config/db'); // Conexión a PostgreSQL
const bcrypt = require('bcrypt'); // Librería para encriptar contraseñas
const saltRounds = 10; // Número de rondas para encriptar la contraseña


// Clase Usuario que representa la tabla de usuarios en la base de datos
// Contiene métodos para crear un usuario y obtener un usuario por email
class Usuario {
    // Método estático para crear un nuevo usuario
  static async crear({ primer_nombre, primer_apellido, email, password, telefono, id_rol }) {
    const hashedPassword = await bcrypt.hash(password, saltRounds); // Hasheo de la contraseña
    // Verifica si el email ya existe en la base de datos
    const query = `
      INSERT INTO usuario 
        (primer_nombre, primer_apellido, email, password, telefono, id_rol) 
      VALUES 
        ($1, $2, $3, $4, $5, $6) 
      RETURNING *;
    `;
    // Inserta un nuevo usuario en la base de datos y retorna el usuario creado
    const values = [primer_nombre, primer_apellido, email, hashedPassword, telefono, id_rol];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  // Método para obtener un usuario por su email
  static async obtenerPorEmail(email) {
    const query = 'SELECT * FROM usuario WHERE email = $1;';
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  }

  // Método para verificar las credenciales de un usuario
  static async verificarCredenciales(email, password) { // Verifica si el email y la contraseña son correctos
    const usuario = await Usuario.obtenerPorEmail(email); // Obtiene el usuario por su email
    if (!usuario) throw new Error("Email no registrado"); // Si no se encuentra el usuario, lanza un error

    const passwordValida = await bcrypt.compare(password, usuario.password); // Compara la contraseña proporcionada con la almacenada en la base de datos
    if (!passwordValida) throw new Error("Contraseña incorrecta"); // Si la contraseña no es válida, lanza un error

    return usuario; // Si todo está bien, retorna el usuario
  }
}

// Exporta la clase Usuario para que pueda ser utilizada en otras partes de la aplicación
module.exports = Usuario;