// Objeto para mantener el estado de los filtros y ordenamiento
const adminState = {
    usuarios: {  
        filtros: { rol: '', estado: '' }, 
        orden: { sortBy: 'id', order: 'asc' } 
    },
    espacios: {
        filtros: { tipo: '' },
        orden: { sortBy: 'id', order: 'asc' }
    },
    reservas: {
        filtros: { estado: '' },
        orden: { sortBy: 'id', order: 'asc' }
    }
};

// --- LÓGICA DE MODAL PARA ESPACIOS ---
document.addEventListener('DOMContentLoaded', () => { 
    const token = localStorage.getItem('token');
    if (!token || JSON.parse(atob(token.split('.')[1])).rol !== 1) { // 1 = Admin
        window.location.href = 'index.html';
        return;
    }
    
    setupTabs(token);
    setupEspacioModal(token);
    setupUserFiltersAndSorting(token);
    setupSpaceFiltersAndSorting(token);
    setupReservaFiltersAndSorting(token); // <--- NUEVA LLAMADA
});

const API_BASE_URL = 'http://localhost:3000/api';

// --- LÓGICA DE FILTROS Y ORDENAMIENTO (NUEVA) ---
function setupUserFiltersAndSorting(token) {
    const filtroRol = document.getElementById('filtro-rol');
    const filtroEstado = document.getElementById('filtro-estado');

    // Event listeners para los filtros
    const aplicarFiltros = () => {
        adminState.usuarios.filtros.rol = filtroRol.value;
        adminState.usuarios.filtros.estado = filtroEstado.value;
        cargarUsuarios(token);
    };
    filtroRol.addEventListener('change', aplicarFiltros);
    filtroEstado.addEventListener('change', aplicarFiltros);

    // Event listeners para los encabezados de la tabla
    document.querySelectorAll('#usuarios-table th[data-sort]').forEach(header => {
        header.addEventListener('click', () => {
            const sortBy = header.getAttribute('data-sort');
            const currentSort = adminState.usuarios.orden;
            if (currentSort.sortBy === sortBy) {
                currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.sortBy = sortBy;
                currentSort.order = 'asc';
            }
            cargarUsuarios(token);
        });
    });
}

// --- LÓGICA DE FILTROS Y ORDENAMIENTO PARA ESPACIOS (NUEVA) ---
function setupSpaceFiltersAndSorting(token) {
    const filtroTipo = document.getElementById('filtro-espacio-tipo');

    // Event listener para el filtro de tipo
    filtroTipo.addEventListener('input', () => {
        adminState.espacios.filtros.tipo = filtroTipo.value;
        cargarEspacios(token);
    });

    // Event listeners para los encabezados de la tabla de espacios
    document.querySelectorAll('#espacios-table th[data-sort]').forEach(header => {
        header.addEventListener('click', () => {
            const sortBy = header.getAttribute('data-sort');
            const currentSort = adminState.espacios.orden;
            if (currentSort.sortBy === sortBy) {
                currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.sortBy = sortBy;
                currentSort.order = 'asc';
            }
            cargarEspacios(token);
        });
    });
}


// --- LÓGICA DE FILTROS Y ORDENAMIENTO PARA RESERVAS (NUEVA) ---
function setupReservaFiltersAndSorting(token) {
    const filtroEstado = document.getElementById('filtro-reserva-estado');

    filtroEstado.addEventListener('change', () => {
        adminState.reservas.filtros.estado = filtroEstado.value;
        cargarTodasLasReservas(token);
    });

    document.querySelectorAll('#reservas-table th[data-sort]').forEach(header => {
        header.addEventListener('click', () => {
            const sortBy = header.getAttribute('data-sort');
            const currentSort = adminState.reservas.orden;
            if (currentSort.sortBy === sortBy) {
                currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.sortBy = sortBy;
                currentSort.order = 'asc';
            }
            cargarTodasLasReservas(token);
        });
    });
}


// --- LÓGICA DE PESTAÑAS ---
function setupTabs(token) {
    const tabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('.admin-section');
    cargarUsuarios(token);
    document.querySelector('.nav-tab[data-section="usuarios"]').setAttribute('data-loaded', 'true');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.style.display = 'none');
            tab.classList.add('active');
            const sectionId = tab.getAttribute('data-section');
            document.getElementById(`${sectionId}-section`).style.display = 'block';
            if (!tab.hasAttribute('data-loaded')) {
                if (sectionId === 'espacios') cargarEspacios(token);
                if (sectionId === 'reservas') cargarTodasLasReservas(token);
                tab.setAttribute('data-loaded', 'true');
            }
        });
    });
}

// --- GESTIÓN DE USUARIOS (MODIFICADA) ---
async function cargarUsuarios(token) {
    const { filtros, orden } = adminState.usuarios;
    const params = new URLSearchParams();
    if (filtros.rol) params.append('rol', filtros.rol);
    if (filtros.estado) params.append('estado', filtros.estado);
    params.append('sortBy', orden.sortBy);
    params.append('order', orden.order);
    try {
        const response = await fetch(`${API_BASE_URL}/admin/usuarios?${params.toString()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('No se pudo cargar la lista de usuarios.');
        const usuarios = await response.json();
        renderizarUsuarios(usuarios);
    } catch (error) {
        alert(error.message);
    }
}

function renderizarUsuarios(usuarios) {
    const tablaBody = document.querySelector('#usuarios-table tbody');
    tablaBody.innerHTML = '';
    
    document.querySelectorAll('#usuarios-table th[data-sort]').forEach(th => {
        const sortKey = th.getAttribute('data-sort');
        if (sortKey === adminState.usuarios.orden.sortBy) {
            th.textContent = th.textContent.replace(/ [↑↓⇅]/g, '') + (adminState.usuarios.orden.order === 'asc' ? ' ↑' : ' ↓');
        } else {
            th.textContent = th.textContent.replace(/ [↑↓⇅]/g, '') + ' ⇅';
        }
    });

    usuarios.forEach(usuario => {
        const rolTexto = usuario.id_rol === 1 ? 'Admin' : 'Usuario';
        const estadoBotonTexto = usuario.estado === 'activo' ? 'Bloquear' : 'Activar';
        const estadoClase = usuario.estado === 'activo' ? 'estado-activo' : 'estado-bloqueado';
        const fila = document.createElement('tr');
        fila.id = `user-row-${usuario.id}`;
        fila.innerHTML = `
            <td>${usuario.id}</td>
            <td>${usuario.primer_nombre} ${usuario.primer_apellido || ''}</td>
            <td>${usuario.email}</td>
            <td class="rol-cell"><span>${rolTexto}</span><select style="display: none;"><option value="2" ${usuario.id_rol === 2 ? 'selected' : ''}>Usuario</option><option value="1" ${usuario.id_rol === 1 ? 'selected' : ''}>Admin</option></select></td>
            <td class="estado-cell"><span class="${estadoClase}">${usuario.estado}</span></td>
            <td>
                <button class="btn-edit-user" data-id="${usuario.id}">Editar Rol</button>
                <button class="btn-save-user" data-id="${usuario.id}" style="display: none;">Guardar</button>
                <button class="btn-toggle-estado" data-id="${usuario.id}" data-estado-actual="${usuario.estado}">${estadoBotonTexto}</button>
            </td>
        `;
        tablaBody.appendChild(fila);
    });
    addUserEventListeners();
}

function addUserEventListeners() {
    const token = localStorage.getItem('token');
    document.querySelectorAll('.btn-edit-user').forEach(button => {
        button.addEventListener('click', (e) => {
            const fila = e.target.closest('tr');
            fila.querySelector('.rol-cell span').style.display = 'none';
            fila.querySelector('.rol-cell select').style.display = 'inline-block';
            e.target.style.display = 'none';
            fila.querySelector('.btn-save-user').style.display = 'inline-block';
        });
    });
    document.querySelectorAll('.btn-save-user').forEach(button => {
        button.addEventListener('click', async (e) => {
            const userId = e.target.getAttribute('data-id');
            const fila = e.target.closest('tr');
            const select = fila.querySelector('.rol-cell select');
            const nuevoRolId = select.value;
            try {
                const response = await fetch(`${API_BASE_URL}/admin/usuarios/${userId}/rol`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                    body: JSON.stringify({ id_rol: nuevoRolId })
                });
                if (!response.ok) throw new Error('No se pudo actualizar el rol.');
                fila.querySelector('.rol-cell span').textContent = select.options[select.selectedIndex].text;
                fila.querySelector('.rol-cell span').style.display = 'inline-block';
                select.style.display = 'none';
                e.target.style.display = 'none';
                fila.querySelector('.btn-edit-user').style.display = 'inline-block';
                alert('Rol actualizado con éxito.');
            } catch (error) {
                alert(error.message);
            }
        });
    });
    document.querySelectorAll('.btn-toggle-estado').forEach(button => {
        button.addEventListener('click', async (e) => {
            const userId = e.target.getAttribute('data-id');
            const estadoActual = e.target.getAttribute('data-estado-actual');
            const nuevoEstado = estadoActual === 'activo' ? 'bloqueado' : 'activo';
            if (!confirm(`¿Seguro que deseas ${nuevoEstado === 'bloqueado' ? 'bloquear' : 'activar'} a este usuario?`)) return;
            try {
                const response = await fetch(`${API_BASE_URL}/admin/usuarios/${userId}/estado`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ estado: nuevoEstado })
                });
                if (!response.ok) throw new Error('No se pudo cambiar el estado del usuario.');
                const fila = document.getElementById(`user-row-${userId}`);
                fila.querySelector('.estado-cell span').className = `estado-${nuevoEstado}`;
                fila.querySelector('.estado-cell span').textContent = nuevoEstado;
                e.target.textContent = nuevoEstado === 'activo' ? 'Bloquear' : 'Activar';
                e.target.setAttribute('data-estado-actual', nuevoEstado);
                alert('Estado del usuario actualizado con éxito.');
            } catch (error) {
                alert(error.message);
            }
        });
    });
}

// ===============================================
// GESTIÓN DE ESPACIOS
// ===============================================
async function cargarEspacios(token) {
    const { filtros, orden } = adminState.espacios;
    const params = new URLSearchParams();
    if (filtros.tipo) params.append('tipo', filtros.tipo);
    params.append('sortBy', orden.sortBy);
    params.append('order', orden.order);

    try {
        const response = await fetch(`${API_BASE_URL}/espacios?${params.toString()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('No se pudo cargar la lista de espacios.');
        const espacios = await response.json();
        renderizarEspacios(espacios);
    } catch (error) {
        alert(error.message);
    }
}

function renderizarEspacios(espacios) {
    const tablaBody = document.querySelector('#espacios-table tbody');
    tablaBody.innerHTML = '';
    
    // Actualizar indicador visual de ordenamiento
    document.querySelectorAll('#espacios-table th[data-sort]').forEach(th => {
        const sortKey = th.getAttribute('data-sort');
        const arrow = sortKey === adminState.espacios.orden.sortBy 
            ? (adminState.espacios.orden.order === 'asc' ? ' ↑' : ' ↓')
            : ' ⇅';
        th.textContent = th.textContent.replace(/ [↑↓⇅]/g, '') + arrow;
    });

    if (espacios.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="6">No hay espacios que coincidan con el filtro.</td></tr>';
        return;
    }
    
    espacios.forEach(espacio => {
        const fila = document.createElement('tr');
        fila.id = `espacio-row-${espacio.id}`;
        fila.innerHTML = `
            <td>${espacio.id}</td>
            <td>${espacio.nombre}</td>
            <td>${espacio.tipo}</td>
            <td>${espacio.capacidad}</td>
            <td>${espacio.ubicacion}</td>
            <td>
                <button class="btn-edit-espacio" data-id="${espacio.id}">Editar</button>
                <button class="btn-delete-espacio" data-id="${espacio.id}">Eliminar</button>
            </td>
        `;
        tablaBody.appendChild(fila);
    });
    addEspacioEventListeners();
}

function addEspacioEventListeners() {
    const token = localStorage.getItem('token');
    document.querySelectorAll('.btn-delete-espacio').forEach(button => {
        button.addEventListener('click', async (e) => {
            const espacioId = e.target.getAttribute('data-id');
            if (!confirm(`¿Estás seguro de que deseas eliminar el espacio con ID ${espacioId}?`)) return;
            try {
                const response = await fetch(`${API_BASE_URL}/espacios/${espacioId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('No se pudo eliminar el espacio.');
                document.getElementById(`espacio-row-${espacioId}`).remove();
                alert('Espacio eliminado con éxito.');
            } catch (error) {
                alert(error.message);
            }
        });
    });
    document.querySelectorAll('.btn-edit-espacio').forEach(button => {
        button.addEventListener('click', async (e) => {
            const espacioId = e.target.getAttribute('data-id');
            try {
                const response = await fetch(`${API_BASE_URL}/espacios/${espacioId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('No se encontraron los datos del espacio.');
                const espacio = await response.json();
                document.getElementById('modal-titulo').textContent = 'Editar Espacio';
                document.getElementById('espacio-id-edit').value = espacio.id;
                document.getElementById('nombre').value = espacio.nombre;
                document.getElementById('tipo').value = espacio.tipo;
                document.getElementById('capacidad').value = espacio.capacidad;
                document.getElementById('ubicacion').value = espacio.ubicacion;
                document.getElementById('espacio-modal').style.display = 'flex';
            } catch (error) {
                alert(error.message);
            }
        });
    });
}

function setupEspacioModal(token) {
    const modal = document.getElementById('espacio-modal');
    const btnNuevoEspacio = document.getElementById('btn-nuevo-espacio');
    const closeModalButton = modal.querySelector('.close-modal');
    const espacioForm = document.getElementById('espacio-form');

    btnNuevoEspacio.addEventListener('click', () => {
        espacioForm.reset();
        document.getElementById('espacio-id-edit').value = '';
        document.getElementById('modal-titulo').textContent = 'Nuevo Espacio';
        modal.style.display = 'flex';
    });

    closeModalButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    espacioForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const espacioId = document.getElementById('espacio-id-edit').value;
        const esEdicion = !!espacioId;
        const datosEspacio = {
            nombre: document.getElementById('nombre').value,
            tipo: document.getElementById('tipo').value,
            capacidad: document.getElementById('capacidad').value,
            ubicacion: document.getElementById('ubicacion').value,
        };
        const url = esEdicion ? `${API_BASE_URL}/espacios/${espacioId}` : `${API_BASE_URL}/espacios`;
        const method = esEdicion ? 'PUT' : 'POST';
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                body: JSON.stringify(datosEspacio)
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || `No se pudo ${esEdicion ? 'actualizar' : 'crear'} el espacio.`);
            }
            alert(`¡Espacio ${esEdicion ? 'actualizado' : 'creado'} con éxito!`);
            modal.style.display = 'none';
            cargarEspacios(token);
        } catch (error) {
            alert(error.message);
        }
    });
}

// ===============================================
// GESTIÓN DE TODAS LAS RESERVAS
// ===============================================
async function cargarTodasLasReservas(token) {
    const { filtros, orden } = adminState.reservas;
    const params = new URLSearchParams();
    if (filtros.estado) params.append('estado', filtros.estado);
    params.append('sortBy', orden.sortBy);
    params.append('order', orden.order);

    try {
        const response = await fetch(`${API_BASE_URL}/admin/reservas?${params.toString()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('No se pudo cargar la lista de reservas.');
        const reservas = await response.json();
        renderizarTodasLasReservas(reservas);
    } catch (error) {
        alert(error.message);
    }
}

function renderizarTodasLasReservas(reservas) {
    const tablaBody = document.querySelector('#reservas-table tbody');
    tablaBody.innerHTML = '';

    document.querySelectorAll('#reservas-table th[data-sort]').forEach(th => {
        const sortKey = th.getAttribute('data-sort');
        const arrow = sortKey === adminState.reservas.orden.sortBy 
            ? (adminState.reservas.orden.order === 'asc' ? ' ↑' : ' ↓')
            : ' ⇅';
        th.textContent = th.textContent.replace(/ [↑↓⇅]/g, '') + arrow;
    });

    if (reservas.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="7">No hay reservas que coincidan con el filtro.</td></tr>';
        return;
    }
    
    reservas.forEach(reserva => {
        const estadoClase = reserva.estado === 'confirmada' ? 'estado-confirmada' : 'estado-cancelada';
        const fila = document.createElement('tr');
        fila.id = `admin-reserva-row-${reserva.id}`;
        fila.innerHTML = `
            <td>${reserva.id}</td>
            <td>${reserva.espacio_nombre}</td>
            <td>${reserva.usuario_email}</td>
            <td>${new Date(reserva.fecha_inicio).toLocaleString()}</td>
            <td>${new Date(reserva.fecha_fin).toLocaleString()}</td>
            <td class="estado"><span class="${estadoClase}">${reserva.estado}</span></td>
            <td class="actions">
                ${reserva.estado === 'confirmada' ? `<button class="btn-cancelar-admin" data-id="${reserva.id}">Cancelar</button>` : ''}
            </td>
        `;
        tablaBody.appendChild(fila);
    });
    addReservaEventListeners();
}

function addReservaEventListeners() {
    const token = localStorage.getItem('token');
    document.querySelectorAll('.btn-cancelar-admin').forEach(button => {
        button.addEventListener('click', async (e) => {
            const reservaId = e.target.getAttribute('data-id');
            if (!confirm(`¿Seguro que quieres cancelar la reserva con ID ${reservaId}?`)) return;
            try {
                const response = await fetch(`${API_BASE_URL}/admin/reservas/${reservaId}/cancelar`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('No se pudo cancelar la reserva.');
                const fila = document.getElementById(`admin-reserva-row-${reservaId}`);
                fila.querySelector('.estado span').className = 'estado-cancelada';
                fila.querySelector('.estado span').textContent = 'cancelada';
                fila.querySelector('.actions').innerHTML = '';
                alert('Reserva cancelada con éxito.');
            } catch (error) {
                alert(error.message);
            }
        });
    });
}