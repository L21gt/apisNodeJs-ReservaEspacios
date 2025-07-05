document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('loginForm')) {
        setupAuthForms();
    }
});

const API_BASE_URL = 'http://localhost:3000/api';

function setupAuthForms() {
    const loginWrapper = document.getElementById('login-wrapper');
    const registerWrapper = document.getElementById('register-wrapper');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    const toggleToRegisterLink = document.getElementById('toggleToRegister');
    const toggleToLoginLink = document.getElementById('toggleToLogin');

    toggleToRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginWrapper.style.display = 'none';
        registerWrapper.style.display = 'block';
    });

    toggleToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerWrapper.style.display = 'none';
        loginWrapper.style.display = 'block';
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            
           
            guardarTokenYRedirigir(data.token, data.usuario);

        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            primer_nombre: document.getElementById('primer_nombre').value,
            primer_apellido: document.getElementById('primer_apellido').value,
            email: document.getElementById('emailReg').value,
            password: document.getElementById('passwordReg').value,
            telefono: document.getElementById('telefonoReg').value,
        };
        try {
            const response = await fetch(`${API_BASE_URL}/auth/registro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            
            alert('¡Registro exitoso! Ahora serás redirigido.'); // Mensaje de éxito
            guardarTokenYRedirigir(data.token, data.usuario); // Aquí también pasamos el objeto 'usuario' completo

        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });
}

// --- 👇 FUNCIÓN MODIFICADA PARA ACEPTAR Y GUARDAR 'usuario' 👇 ---
function guardarTokenYRedirigir(token, usuario) {
    if (!token || !usuario) return alert('No se recibió la información completa. Intente de nuevo.');

    try {
        localStorage.setItem('token', token);
        // Guardamos los datos del usuario como un string JSON
        localStorage.setItem('usuario', JSON.stringify(usuario));
        
        // La redirección usa el rol del objeto usuario que recibimos
        if (usuario.id_rol === 1) { // 1 = Admin
            window.location.href = 'admin.html';
        } else { // Cualquier otro rol
            window.location.href = 'espacios.html';
        }
    } catch (error) {
        console.error('Error al guardar datos de sesión:', error);
        alert('Ocurrió un error inesperado durante la autenticación.');
    }
}