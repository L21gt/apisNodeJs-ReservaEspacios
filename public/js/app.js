// ======================
// Configuración Global
// ======================
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api';
console.log('API Base URL:', API_BASE_URL); // Para depuración

// ======================
// Funciones del Loader
// ======================
function mostrarLoader() {
    document.getElementById('loader').style.display = 'flex';
}

function ocultarLoader() {
    document.getElementById('loader').style.display = 'none';
}

// ======================
// Manejo de Errores
// ======================
function mostrarError(mensaje, tipo = 'error') {
    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    notification.innerHTML = `
        <p>${mensaje}</p>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Crear contenedor si no existe
    if (!document.getElementById('notification-container')) {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 300px;
        `;
        document.body.appendChild(container);
    }
    
    document.getElementById('notification-container').appendChild(notification);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => notification.remove(), 5000);
}

// ======================
// Funciones de Autenticación
// ======================
async function handleLogin(email, password) {
    mostrarLoader();
    
    try {
        console.log('Intentando login con:', { email }); // Log sin password por seguridad
        
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include' // Necesario para cookies/sesiones
        });

        console.log('Respuesta del servidor:', response.status, response.statusText);

        if (!response.ok) {
            // Intentar parsear el error como JSON, si falla usar texto plano
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { error: await response.text() };
            }
            throw new Error(errorData.error || `Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.token) {
            throw new Error('No se recibió token en la respuesta');
        }

        return data;

    } catch (error) {
        console.error('Error completo en login:', error);
        
        // Mensajes más amigables para errores comunes
        let mensajeError = error.message;
        if (error.message.includes('Failed to fetch')) {
            mensajeError = 'No se pudo conectar al servidor. Verifica tu conexión.';
        } else if (error.message.includes('NetworkError')) {
            mensajeError = 'Problema de red. Intenta nuevamente.';
        }
        
        throw new Error(mensajeError);
    } finally {
        ocultarLoader();
    }
}

function guardarTokenYRedirigir(token) {
    try {
        // Verificar token básico
        if (typeof token !== 'string' || token.split('.').length !== 3) {
            throw new Error('Token no válido');
        }

        // Decodificar payload del token
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Guardar en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify({
            id: payload.id,
            nombre: payload.nombre,
            rol: payload.rol,
            expira: payload.exp * 1000 // Convertir a milisegundos
        }));

        // Redirigir
        window.location.href = 'espacios.html';

    } catch (error) {
        console.error('Error al guardar token:', error);
        mostrarError('Error en la autenticación. Por favor, intente nuevamente.');
        // Limpiar datos inválidos
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
    }
}

// ======================
// Configuración de Eventos
// ======================
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            mostrarError('Por favor ingresa email y contraseña');
            return;
        }

        try {
            const result = await handleLogin(email, password);
            guardarTokenYRedirigir(result.token);
        } catch (error) {
            mostrarError(error.message);
        }
    });
}

// ======================
// Inicialización
// ======================
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación al cargar
    if (!window.location.pathname.includes('index.html')) {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'index.html';
            return;
        }
    }

    // Configurar formularios
    setupLoginForm();

    // Configurar botón de cerrar sesión
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
});

// ======================
// Funciones Globales
// ======================
window.mostrarError = mostrarError;