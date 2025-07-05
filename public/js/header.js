document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario')); // <-- Obtenemos los datos del usuario

    if (!token || !usuario) {
        // Si estamos en una página protegida y no hay datos, redirigir
        const protectedPages = ['espacios.html', 'mis-reservas.html', 'admin.html'];
        const currentPage = window.location.pathname.split('/').pop();
        if (protectedPages.includes(currentPage)) {
            window.location.href = 'index.html';
        }
        return;
    }

    try {
        const userRole = usuario.id_rol;
        const currentPage = window.location.pathname.split('/').pop();
        renderHeader(userRole, usuario, currentPage); // <-- Pasamos el objeto usuario completo
        setupLogoutButton();
    } catch (e) {
        console.error("Error en la sesión, cerrando sesión.", e);
        logout();
    }
});

function renderHeader(role, usuario, currentPage) {
    const headerElement = document.querySelector('.page-header');
    if (!headerElement) return;

    // Definimos los enlaces como antes
    const userLinks = `
        <a href="espacios.html" class="${currentPage === 'espacios.html' ? 'active' : ''}">Ver Espacios</a>
        <a href="mis-reservas.html" class="${currentPage === 'mis-reservas.html' ? 'active' : ''}">Mis Reservas</a>
    `;
    const adminLinks = `
        <a href="admin.html" class="${currentPage === 'admin.html' ? 'active' : ''}">Panel Admin</a>
        <a href="espacios.html" class="${currentPage === 'espacios.html' ? 'active' : ''}">Ver Espacios</a>
        <a href="mis-reservas.html" class="${currentPage === 'mis-reservas.html' ? 'active' : ''}">Mis Reservas</a>
    `;
    const navLinks = (role === 1) ? adminLinks : userLinks;

    // --- 👇 CONSTRUIMOS EL TEXTO DE BIENVENIDA 👇 ---
    const nombreUsuario = usuario.primer_nombre || 'Usuario';
    const tipoUsuario = role === 1 ? 'Admin' : 'Usuario';
    const userInfoHTML = `<span class="user-info">Hola, ${nombreUsuario} (${tipoUsuario})</span>`;

    // Actualizamos el HTML del header para incluir la bienvenida
    headerElement.innerHTML = `
        <div class="header-container">
            <a href="espacios.html" class="logo">Reservas Galileo</a>
            <nav class="main-nav">
                ${userInfoHTML}
                ${navLinks}
                <button id="btnCerrarSesion" class="btn-logout">Cerrar Sesión</button>
            </nav>
        </div>
    `;
}

function setupLogoutButton() {
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', logout);
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario'); // <-- Limpiamos también los datos del usuario
    window.location.href = 'index.html';
}