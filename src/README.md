# Documentación de la API - Sistema de Reservas de Espacios
Este documento describe los endpoints disponibles en la API del sistema de reservas.
```
URL Base: http://localhost:3000
```

## Autenticación
Todas las rutas protegidas requieren un Token JWT que debe ser enviado en el encabezado de la solicitud de la siguiente manera:
```
Header: Authorization

Value: Bearer <tu_token_jwt>
```

Para obtener un token, utiliza el endpoint de /api/auth/login.

## Endpoints de Autenticación /api/auth

### Registrar un Nuevo Usuario
Crea una nueva cuenta de usuario. Por defecto, se crea con el rol "Usuario" (id_rol=2) y estado "activo".

    Método: POST

    URL: /api/auth/registro

Body (JSON):
```
JSON

{
    "primer_nombre": "Carlos",
    "primer_apellido": "Pérez",
    "email": "carlos.perez@example.com",
    "password": "password123",
    "telefono": "55554444"
}
```

```
    Respuesta Exitosa (201 Created):

JSON

{
    "token": "ey...",
    "usuario": {
        "id": 5,
        "email": "carlos.perez@example.com",
        "primer_nombre": "Carlos",
        "id_rol": 2
    }
}
```

Validaciones para Probar:

`Devuelve error 400 si el email ya existe.`

`Devuelve error 400 si faltan primer_nombre, email o password.`

### Iniciar Sesión
Autentica a un usuario y devuelve un token de acceso.

    Método: POST

    URL: /api/auth/login

Body (JSON):
```
JSON

{
    "email": "carlos.perez@example.com",
    "password": "password123"
}
```

```
    Respuesta Exitosa (200 OK):

JSON

{
    "token": "ey...",
    "usuario": {
        "id": 5,
        // ...otros datos del usuario
    }
}
```

Validaciones para Probar:

`Devuelve error 401 si las credenciales son incorrectas.`

`Devuelve error 401 con el mensaje "Esta cuenta de usuario ha sido bloqueada" si el estado del usuario es "bloqueado".`

## Endpoints de Espacios /api/espacios
Requieren autenticación de Usuario.

### Obtener Lista de Espacios
Devuelve todos los espacios con su estado de disponibilidad actual ("Libre" u "Ocupado").

    Método: GET

    URL: /api/espacios

Autenticación: Usuario / Admin

Respuesta Exitosa (200 OK):
```
JSON

[
  {
    "id": 1,
    "nombre": "Sala de Juntas Principal",
    "tipo": "Reunión",
    "capacidad": 10,
    "ubicacion": "Piso 1, Edificio A",
    "id_estado": 1,
    "estado_actual": "Libre"
  }
]
```

### Obtener Disponibilidad de un Espacio
Devuelve las reservas de un espacio para una fecha específica.

    Método: GET

    URL: /api/espacios/:id/disponibilidad?fecha=YYYY-MM-DD

Ejemplo: /api/espacios/1/disponibilidad?fecha=2025-07-02

Autenticación: Usuario / Admin
```
    Respuesta Exitosa (200 OK):

JSON

[
    {
        "fecha_inicio": "2025-07-02T14:00:00.000Z",
        "fecha_fin": "2025-07-02T16:00:00.000Z"
    }
]
```

Validaciones para Probar:

`Devuelve error 400 si no se proporciona el parámetro fecha.`

## Endpoints de Reservas /api/reservas
Requieren autenticación de Usuario.

### Crear una Nueva Reserva
Crea una nueva reserva para el usuario autenticado.

    Método: POST

    URL: /api/reservas

Autenticación: Usuario / Admin

Body (JSON):

```
JSON

{
    "id_espacio": 1,
    "fecha_inicio": "2025-07-02T10:00:00",
    "fecha_fin": "2025-07-02T11:00:00"
}

    Respuesta Exitosa (201 Created): Devuelve el objeto de la reserva creada.
```

Validaciones para Probar:

`Duración: Devuelve error 400 si la duración es menor a 1 hora o mayor a 4 horas.`

`Conflicto de Horario: Devuelve error 400 si el espacio ya está ocupado en ese horario.`

`Horario Hábil: Devuelve error 400 si la reserva es antes de las 8 AM o termina después de las 8 PM.`

`Fin de Semana: Devuelve error 400 si la reserva es en sábado o domingo.`

### Obtener Mis Reservas
Devuelve una lista de todas las reservas hechas por el usuario autenticado.

    Método: GET

    URL: /api/reservas

Autenticación: Usuario / Admin

    Respuesta Exitosa (200 OK): Devuelve un array de objetos de reserva.

### Cancelar Mi Reserva
Cancela una reserva que pertenece al usuario autenticado.

    Método: PATCH

    URL: /api/reservas/:id/cancelar

Ejemplo: /api/reservas/3/cancelar

Autenticación: Usuario / Admin

    Respuesta Exitosa (200 OK): Devuelve el objeto de la reserva actualizada con estado: "cancelada".

## Endpoints de Administración /api/admin
Requieren autenticación de Administrador.

### Obtener Todos los Usuarios
Devuelve una lista de todos los usuarios con opciones de filtro y ordenamiento.

    Método: GET

    URL: /api/admin/usuarios

Ejemplo de Filtros: /api/admin/usuarios?rol=2&estado=activo&sortBy=email&order=desc

Autenticación: Admin

    Respuesta Exitosa (200 OK): Devuelve un array de objetos de usuario.

### Cambiar Rol de Usuario
    Método: PATCH

    URL: /api/admin/usuarios/:id/rol

Autenticación: Admin
```
Body (JSON): { "id_rol": 1 }
```
    Respuesta Exitosa (200 OK): Devuelve { "id": 5, "id_rol": 1 }.

### Cambiar Estado de Usuario (Bloquear/Activar)
    Método: PATCH

    URL: /api/admin/usuarios/:id/estado

Autenticación: Admin

    Body (JSON): { "estado": "bloqueado" } o { "estado": "activo" }

    Respuesta Exitosa (200 OK): Devuelve { "id": 5, "estado": "bloqueado" }.

### Obtener Todas las Reservas
Devuelve todas las reservas del sistema con opciones de filtro y ordenamiento.

    Método: GET

    URL: /api/admin/reservas

Ejemplo de Filtros: /api/admin/reservas?estado=confirmada&sortBy=fecha_inicio

Autenticación: Admin

    Respuesta Exitosa (200 OK): Devuelve un array de objetos de reserva.

### Cancelar Cualquier Reserva (Admin)
    Método: PATCH

    URL: /api/admin/reservas/:id/cancelar

Autenticación: Admin

    Respuesta Exitosa (200 OK): Devuelve el objeto de la reserva cancelada.