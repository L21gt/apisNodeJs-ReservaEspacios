// admin.js
const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    // Verificar rol de admin
    verificarAdmin();
    
    // Navegación entre secciones
    document.querySelectorAll('.btn-nav').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.btn-nav').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            document.querySelectorAll('.admin-section').forEach(section => {
                section.style.display = 'none';
            });
            
            document.getElementById(`${e.target.dataset.section}-section`).style.display = 'block';
        });
    });

    // Cargar datos iniciales
    cargarUsuarios();
    
    // Eventos de botones
    document.getElementById('btnNuevoUsuario').addEventListener('click', mostrarFormularioUsuario);
    document.getElementById('btnNuevoEspacio').addEventListener('click', mostrarFormularioEspacio);
    document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesion);
    
    // Filtros
    document.getElementById('fechaFilter').addEventListener('change', cargarReservasAdmin);
    document.getElementById('estadoFilter').addEventListener('change', cargarReservasAdmin);
});

async function verificarAdmin() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.rol !== 1) { // 1 = admin
            mostrarError('Acceso denegado. Se requiere rol de administrador');
            setTimeout(() => window.location.href = 'espacios.html', 2000);
        }
    } catch (error) {
        console.error('Error al verificar rol:', error);
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    }
}

async function cargarUsuarios() {
    mostrarLoader();
    try {
        const response = await fetch(`${API_BASE_URL}/admin/usuarios`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.status === 401) {
            cerrarSesion();
            return;
        }
        
        const usuarios = await response.json();
        renderizarUsuarios(usuarios);
    } catch (error) {
        mostrarError('Error al cargar usuarios');
        console.error(error);
    } finally {
        ocultarLoader();
    }
}

function renderizarUsuarios(usuarios) {
    const container = document.getElementById('usuariosList');
    let html = '';
    
    if (usuarios.length === 0) {
        html = '<p>No hay usuarios registrados</p>';
    } else {
        html = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${usuarios.map(usuario => `
                <tr>
                    <td>${usuario.primer_nombre} ${usuario.primer_apellido}</td>
                    <td>${usuario.email}</td>
                    <td>${usuario.id_rol === 1 ? 'Admin' : 'Usuario'}</td>
                    <td class="actions">
                        <button onclick="editarUsuario(${usuario.id})" class="btn-edit">Editar</button>
                        ${usuario.id_rol !== 1 ? `<button onclick="eliminarUsuario(${usuario.id})" class="btn-delete">Eliminar</button>` : ''}
                    </td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        `;
    }
    
    container.innerHTML = html;
}

// ... (funciones similares para espacios y reservas)

function mostrarFormularioUsuario(usuario = null) {
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    
    modalTitle.textContent = usuario ? 'Editar Usuario' : 'Nuevo Usuario';
    
    modalContent.innerHTML = `
    <form id="usuarioForm">
        <div class="form-group">
            <label for="nombre">Nombre:</label>
            <input type="text" id="nombre" value="${usuario?.primer_nombre || ''}" required>
        </div>
        <div class="form-group">
            <label for="apellido">Apellido:</label>
            <input type="text" id="apellido" value="${usuario?.primer_apellido || ''}" required>
        </div>
        <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" value="${usuario?.email || ''}" required ${usuario ? 'readonly' : ''}>
        </div>
        <div class="form-group">
            <label for="rol">Rol:</label>
            <select id="rol" required>
                <option value="2" ${usuario?.id_rol === 2 ? 'selected' : ''}>Usuario</option>
                <option value="1" ${usuario?.id_rol === 1 ? 'selected' : ''}>Administrador</option>
            </select>
        </div>
        ${!usuario ? `
        <div class="form-group">
            <label for="password">Contraseña:</label>
            <input type="password" id="password" required>
        </div>
        ` : ''}
    </form>
    `;
    
    document.getElementById('adminModal').style.display = 'block';
    
    // Configurar eventos del modal
    configurarModal(usuario ? guardarEdicionUsuario : crearUsuario);
}

// ... (resto de funciones para CRUD)

function cerrarSesion() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Funciones globales para usar en onclick
window.editarUsuario = editarUsuario;
window.eliminarUsuario = eliminarUsuario;
// ... otras funciones globales necesarias