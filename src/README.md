# Colección de Pruebas en Postman

### Configuración Inicial
Headers comunes para todas las solicitudes:
```
Content-Type: application/json
```

### Datos Mínimos en BD (Ejecutar primero en DataGrip)
sql
```
-- Roles esenciales
INSERT INTO rol (id, nombre) VALUES 
(1, 'admin'), 
(2, 'usuario regular');

-- Estados de espacios
INSERT INTO estado_espacio (id, nombre) VALUES 
(1, 'disponible'), 
(2, 'en mantenimiento'), 
(3, 'reservado');
```

### Comandos para reiniciar los registros de la base de datos para pruebas

DataGrip
```
-- Reinicia los contadores de las tablas principales
ALTER SEQUENCE usuario_id_seq RESTART WITH 1;
ALTER SEQUENCE espacio_id_seq RESTART WITH 1;
ALTER SEQUENCE reserva_id_seq RESTART WITH 1;
ALTER SEQUENCE equipamiento_id_seq RESTART WITH 1;

-- Opcional: Vacía las tablas (¡CUIDADO! Esto borrará todos los datos)
TRUNCATE TABLE reserva CASCADE;
TRUNCATE TABLE usuario CASCADE;
TRUNCATE TABLE espacio CASCADE;
TRUNCATE TABLE equipamiento CASCADE;
TRUNCATE TABLE espacio_equipamiento CASCADE;
```

# Flujo de Pruebas (Ejecutar en orden)
### Registrar un Usuario
```
Método: POST

URL: http://localhost:3000/api/auth/registro
```
Body:
```
{
  "primer_nombre": "Ana",
  "primer_apellido": "Gómez",
  "email": "ana@example.com",
  "password": "password123",
  "telefono": "1234567890",
  "id_rol": 2
}
```
```
RESULTADO ESPERADO:

    Éxito: Código 201 con datos del usuario (sin password)
```

### Iniciar Sesión (Obtener Token)
```
Método: POST

URL: http://localhost:3000/api/auth/login
```

Body:
```
{
  "email": "ana@example.com",
  "password": "password123"
}
```
```
RESULTADO ESPERADO

    Éxito: Código 200 con token en la respuesta.

    ⚠️ Copia este token para los siguientes pasos.
```


### Crear un Espacio (Opcional, si tu API lo permite)
```
Método: POST

URL: http://localhost:3000/api/espacios
```

Headers:
```
Authorization: Bearer <token_obtenido_en_paso_2>
```

Body:
```
{
  "nombre": "Sala de Reuniones A",
  "tipo": "Sala",
  "capacidad": 10,
  "ubicacion": "Piso 1",
  "id_estado": 1
}
```
```
RESULTADO ESPERADO

    Éxito: Código 201 con datos del espacio creado (nota el id).
```

### Crear una Reserva
```
Método: POST

URL: http://localhost:3000/api/reservas
```

Headers:

```
Authorization: Bearer <token_obtenido_en_paso_2>
```

Body:
```
{
  "fecha_inicio": "2025-01-01T09:00:00",
  "fecha_fin": "2025-01-01T11:00:00",
  "id_espacio": 1  // Usa el ID del espacio creado
}
```

Validaciones:
```
Si fecha_fin <= fecha_inicio: Error 400.

Si el espacio no existe: Error 404.

Si hay solapamiento: Error 400.
```

### Listar Reservas del Usuario

```
Método: GET

URL: http://localhost:3000/api/reservas
```

Headers:
```
    Authorization: Bearer <token_obtenido_en_paso_2>
```
```
RESULTADO ESPERADO

    Éxito: Código 200 con array de reservas.
```

### Cancelar una Reserva

```
Método: PATCH

URL: http://localhost:3000/api/reservas/1/cancelar
```

Headers:

```
Authorization: Bearer <token_obtenido_en_paso_2>
```

Body: Vacío.

```
RESULTADO ESPERADO

    Éxito: Código 200 con reserva actualizada (estado: "cancelada").
```

### Listar Espacios Disponibles
```
Método: GET

URL: http://localhost:3000/api/espacios/disponibles?fecha_inicio=2025-01-01T09:00:00&fecha_fin=2025-01-01T11:00:00
```

Headers:

```
Authorization: Bearer <token_obtenido_en_paso_2>
```
```
RESULTADO ESPERADO

    Éxito: Código 200 con array de espacios disponibles.
```

### Actualizar espacio (PUT)
```
PUT /api/espacios/1
```
Headers:

```
Authorization: Bearer <token_admin>
Content-Type: application/json
```
Body:
```
{
  "nombre": "Sala VIP",
  "tipo": "Sala",
  "capacidad": 15,
  "ubicacion": "Piso 2",
  "id_estado": 1
}
```


### Eliminar espacio (Delete)
```
DELETE /api/espacios/1
```
Headers: Igual que arriba.

```
RESULTADO ESPERADO

    Response: 204 No Content.
```

### Detalles de reserva
```
GET /api/reservas/1
```

Headers:
```
Authorization: Bearer <token_usuario>
```

Response
```
RESPUESTA ESPERADA

    {
    "id": 1,
    "fecha_inicio": "2025-01-01T09:00:00.000Z",
    "espacio_nombre": "Sala VIP"
    }
```

### Actualizar Reservas
```
Método: PATCH

http://localhost:3000/api/reservas/1
```
Headers
```
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

Body
```
{
  "fecha_inicio": "2025-01-01T10:00:00",
  "motivo": "Reunión de equipo"
}
```