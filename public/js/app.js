// ---
// 0. Funciones para el Loader (antes de todo)
// ---
function mostrarLoader() {
    document.getElementById('loader').style.display = 'flex';
}

function ocultarLoader() {
    document.getElementById('loader').style.display = 'none';
}

// ---
// 1. Variables Globales y Utilidades
// ---
const API_BASE_URL = 'http://localhost:3000/api';

// Guardar token en localStorage al hacer login/registro
function guardarTokenYRedirigir(token) {
    try {
        // Verificar que el token tenga la estructura básica de un JWT
        if (typeof token === 'string' && token.split('.').length === 3) {
            localStorage.setItem('token', token);
            window.location.href = 'espacios.html';
        } else {
            throw new Error('Token recibido no es válido');
        }
    } catch (error) {
        console.error('Error al guardar token:', error);
        mostrarError('Error en la autenticación. Por favor, intente nuevamente.');
        ocultarLoader();
    }
}

// Mostrar mensajes de error
function mostrarError(mensaje) {
    alert(`Error: ${mensaje}`);
}

// ---
// 2. Login y Registro (index.html)
// ---
document.addEventListener('DOMContentLoaded', () => {
    // Si ya está logueado, redirige a espacios.html
    if (localStorage.getItem('token') && window.location.pathname.includes('index.html')) {
        window.location.href = 'espacios.html';
    }

    // Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            mostrarLoader();
            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: document.getElementById('email').value,
                        password: document.getElementById('password').value
                    })
                });
                const data = await response.json();
                if (response.ok) {
                    guardarTokenYRedirigir(data.token);
                } else {
                    mostrarError(data.error || 'Credenciales incorrectas');
                }
            } catch (error) {
                mostrarError('Error de conexión');
            } finally {
                ocultarLoader();
            }
        });
    }

    // Registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            mostrarLoader();
            try {
                // Validar campos requeridos antes de enviar
                const primer_nombre = document.getElementById('primer_nombre').value;
                const primer_apellido = document.getElementById('primer_apellido').value;
                const email = document.getElementById('emailReg').value;
                const password = document.getElementById('passwordReg').value;

                if (!primer_nombre || !primer_apellido || !email || !password) {
                    throw new Error('Todos los campos marcados como obligatorios deben ser completados');
                }

                const response = await fetch(`${API_BASE_URL}/auth/registro`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        primer_nombre: primer_nombre,
                        primer_apellido: primer_apellido,
                        email: email,
                        password: password,
                        telefono: document.getElementById('telefonoReg').value || "",
                        id_rol: 2   // Rol por defecto (2 = usuario normal)
                    })
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error en el registro');
                }

                guardarTokenYRedirigir(data.token);
            } catch (error) {
                mostrarError(error.message);
                console.error("Error en registro:", error);
            } finally {
                ocultarLoader();
            }
        });
    }

    // Alternar entre login y registro
    const toggleRegister = document.getElementById('toggleRegister');
    if (toggleRegister) {
        toggleRegister.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('registerForm').style.display = 'block';
            document.querySelector('.toggle-form').style.display = 'none';
        });
    }
});

// ================================
// 3. Espacios Disponibles (espacios.html)
// ================================
async function cargarEspacios() {
    mostrarLoader();
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'index.html';
            return;
        }
        const response = await fetch(`${API_BASE_URL}/espacios/disponibles`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const espacios = await response.json();

        let html = "";
        espacios.forEach(espacio => {
            html += `
            <div class="espacio-card">
                <h3>${espacio.nombre}</h3>
                <p>Tipo: ${espacio.tipo}</p>
                <p>Capacidad: ${espacio.capacidad}</p>
                <button onclick="abrirModalReserva(${espacio.id})">Reservar</button>
            </div>
            `;
        });
        document.getElementById('espaciosList').innerHTML = html;
    } catch (error) {
        mostrarError('Error al cargar espacios');
    } finally {
        ocultarLoader();
    }
}

// Modal de reserva
function abrirModalReserva(idEspacio) {
    document.getElementById('modalReserva').style.display = 'block';
    document.getElementById('idEspacioReserva').value = idEspacio;
    
    // Establecer valores por defecto para las fechas
    const now = new Date();
    const startDate = new Date(now.getTime() + 3600000); // 1 hora desde ahora
    const endDate = new Date(startDate.getTime() + 3600000); // 2 horas desde ahora
    
    document.getElementById('fechaInicio').value = formatDateTimeLocal(startDate);
    document.getElementById('fechaFin').value = formatDateTimeLocal(endDate);
}

function formatDateTimeLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

async function confirmarReserva() {
    mostrarLoader();
    try {
        const token = localStorage.getItem('token');
        const idEspacio = document.getElementById('idEspacioReserva').value;

        // Obtener valores y formatearlos correctamente
        const fechaInicioInput = document.getElementById('fechaInicio').value;
        const fechaFinInput = document.getElementById('fechaFin').value;

        // Validar que las fechas estén completas
        if (!fechaInicioInput || !fechaFinInput) {
            throw new Error('Debe seleccionar ambas fechas');
        }

        // Asegurar que las fechas tengan segundos (:00)
        const fecha_inicio = fechaInicioInput + ":00";
        const fecha_fin = fechaFinInput + ":00";

        const response = await fetch(`${API_BASE_URL}/reservas`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_espacio: idEspacio,
                fecha_inicio: fecha_inicio,
                fecha_fin: fecha_fin
            })
        });
        
        if (response.ok) {
            alert('Reserva creada con éxito!');
            document.getElementById('modalReserva').style.display = 'none';
            cargarEspacios(); // Actualizar la lista
        } else {
            const error = await response.json();
            mostrarError(error.error);
        }
    } catch (error) {
        mostrarError('Error al crear reserva: ' + error.message);
        console.error("Detalle completo:", error);
    } finally {
        ocultarLoader();
    }
}

// ---
// 4. Mis Reservas (mis-reservas.html)
// ---
async function cargarMisReservas() {
    mostrarLoader();
    try {
        const token = localStorage.getItem('token');
        
        // Validar el token antes de usarlo
        if (!token || token.split('.').length !== 3) {
            throw new Error('Token no válido o no existe');
        }

        const response = await fetch(`${API_BASE_URL}/reservas`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // Verificar si la respuesta es 401 (No autorizado)
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
            return;
        }

        const reservas = await response.json();
        
        let html = "";
        if (reservas.length === 0) {
            html = `
            <div class="no-reservas">
                <p>No tienes reservas activas</p>
                <a href="espacios.html" class="btn-primary">Reservar un espacio</a>
            </div>
            `;
        } else {
            reservas.forEach(reserva => {
                html += `
                <div class="reserva-card">
                    <p><strong>${reserva.espacio_nombre}</strong> (${reserva.espacio_tipo})</p>
                    <p>Inicio: ${new Date(reserva.fecha_inicio).toLocaleString()}</p>
                    <p>Fin: ${new Date(reserva.fecha_fin).toLocaleString()}</p>
                    <p>Estado: <span class="estado-${reserva.estado}">${reserva.estado}</span></p>
                    ${reserva.estado === 'confirmada' ? 
                        `<button onclick="cancelarReserva(${reserva.id})" class="btn-cancelar">Cancelar</button>` : ''}
                </div>
                `;
            });
        }
        document.getElementById('reservasList').innerHTML = html;
    } catch (error) {
        console.error('Error en cargarMisReservas:', error);
        
        if (error.message.includes('Token')) {
            mostrarError('Sesión inválida. Serás redirigido al login.');
            localStorage.removeItem('token');
            setTimeout(() => window.location.href = 'index.html', 2000);
        } else {
            mostrarError('Error al cargar reservas. Por favor, intente nuevamente.');
        }
    } finally {
        ocultarLoader();
    }
}

async function cancelarReserva(idReserva) {
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
        return;
    }
    
    mostrarLoader();
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/reservas/${idReserva}/cancelar`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            alert('Reserva cancelada con éxito!');
            cargarMisReservas();
        } else {
            const error = await response.json();
            mostrarError(error.error);
        }
    } catch (error) {
        mostrarError('Error al cancelar reserva');
    } finally {
        ocultarLoader();
    }
}

// ---
// 5. Cerrar Sesión
// ---
function cerrarSesion() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// ---
// 6. Inicialización según la página
// ---
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('espacios.html')) {
        cargarEspacios();
    } else if (window.location.pathname.includes('mis-reservas.html')) {
        cargarMisReservas();
    }
    
    // Botón de cerrar sesión
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', cerrarSesion);
    }
});