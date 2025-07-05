document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    cargarEspacios(token);
    setupEventListeners(token);
});

const API_BASE_URL = 'http://localhost:3000/api';

async function cargarEspacios(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/espacios`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('No se pudo cargar la lista de espacios.');
        const espacios = await response.json();
        renderizarEspacios(espacios);
    } catch (error) {
        console.error('Error en cargarEspacios:', error);
        alert(error.message);
    }
}

function renderizarEspacios(espacios) {
    console.log("--- Iniciando renderizado de espacios ---");
    console.log("Datos recibidos de la API:", espacios);

    const grid = document.getElementById('espacios-grid');
    if (!grid) {
        console.error("Error: El contenedor #espacios-grid no fue encontrado.");
        return;
    }
    
    grid.innerHTML = '';

    if (espacios.length === 0) {
        console.log("No se encontraron espacios, mostrando mensaje de lista vacía.");
        grid.innerHTML = '<p>No hay espacios disponibles en este momento.</p>';
        return;
    }

    console.log(`Renderizando ${espacios.length} tarjetas.`);
    espacios.forEach(espacio => {
        const estadoClase = espacio.estado_actual === 'Libre' ? 'espacio-libre' : 'espacio-ocupado';
        const card = document.createElement('div');
        card.className = `espacio-card ${estadoClase}`;
        card.innerHTML = `
            <div class="card-header">
                <h3>${espacio.nombre}</h3>
                <span class="status-indicator">${espacio.estado_actual}</span>
            </div>
            <p><strong>Tipo:</strong> ${espacio.tipo}</p>
            <p><strong>Capacidad:</strong> ${espacio.capacidad} personas</p>
            <p><strong>Ubicación:</strong> ${espacio.ubicacion}</p>
            <div class="card-actions">
                <button class="btn-reservar" data-id="${espacio.id}">Reservar</button>
                <button class="btn-disponibilidad" data-id="${espacio.id}" data-nombre="${espacio.nombre}">Ver Disponibilidad</button>
            </div>
        `;
        grid.appendChild(card);
    });
}


// --- FUNCIÓN MODIFICADA ---

function setupEventListeners(token) {
    const reservaModal = document.getElementById('reserva-modal');
    const disponibilidadModal = document.getElementById('disponibilidad-modal');
    const grid = document.getElementById('espacios-grid');

    grid.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-reservar')) {
            const espacioId = e.target.getAttribute('data-id');
            document.getElementById('espacio-id-input').value = espacioId;
            reservaModal.style.display = 'flex';
        }
        if (e.target.classList.contains('btn-disponibilidad')) {
            const espacioId = e.target.getAttribute('data-id');
            const espacioNombre = e.target.getAttribute('data-nombre');
            disponibilidadModal.setAttribute('data-espacio-id', espacioId);
            document.getElementById('disponibilidad-titulo').textContent = `Disponibilidad para ${espacioNombre}`;
            const fechaInput = document.getElementById('fecha-disponibilidad');
            fechaInput.valueAsDate = new Date();
            cargarHorario(espacioId, fechaInput.value, token);
            disponibilidadModal.style.display = 'flex';
        }
    });

    const reservaForm = document.getElementById('reserva-form');
    reservaModal.querySelector('.close-modal').addEventListener('click', () => {
        reservaModal.style.display = 'none';
    });
    reservaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const reserva = {
            id_espacio: document.getElementById('espacio-id-input').value,
            fecha_inicio: document.getElementById('fecha-inicio').value,
            fecha_fin: document.getElementById('fecha-fin').value,
        };
        if (!reserva.fecha_inicio || !reserva.fecha_fin) {
            return alert('Por favor, selecciona fecha de inicio y fin.');
        }
        try {
            const response = await fetch(`${API_BASE_URL}/reservas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(reserva)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            alert('¡Reserva creada con éxito!');
            reservaModal.style.display = 'none';
            const fechaReservada = reserva.fecha_inicio.split('T')[0];
            const idEspacioReservado = reserva.id_espacio;
            const idEspacioVisible = disponibilidadModal.getAttribute('data-espacio-id');
            const fechaVisible = document.getElementById('fecha-disponibilidad').value;
            if (disponibilidadModal.style.display === 'flex' && idEspacioReservado === idEspacioVisible && fechaReservada === fechaVisible) {
                cargarHorario(idEspacioReservado, fechaReservada, token);
            }
        } catch (error) {
            alert(`Error al crear la reserva: ${error.message}`);
        }
    });

    const fechaInput = document.getElementById('fecha-disponibilidad');
    disponibilidadModal.querySelector('.close-modal').addEventListener('click', () => {
        disponibilidadModal.style.display = 'none';
    });
    fechaInput.addEventListener('change', () => {
        const espacioId = disponibilidadModal.getAttribute('data-espacio-id');
        cargarHorario(espacioId, fechaInput.value, token);
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === reservaModal) reservaModal.style.display = 'none';
        if (e.target === disponibilidadModal) disponibilidadModal.style.display = 'none';
    });
}

// --- FUNCIÓN MODIFICADA ---
// Ahora le pasamos la fecha seleccionada a renderizarHorario
async function cargarHorario(espacioId, fecha, token) {
    const horarioContainer = document.getElementById('horario-container');
    horarioContainer.innerHTML = '<p>Cargando horario...</p>';
    try {
        const response = await fetch(`${API_BASE_URL}/espacios/${espacioId}/disponibilidad?fecha=${fecha}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('No se pudo cargar la disponibilidad.');
        const reservasDelDia = await response.json();
        renderizarHorario(reservasDelDia, fecha); // <--- Le pasamos la fecha
    } catch (error) {
        horarioContainer.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}

// --- FUNCIÓN MODIFICADA ---
// Ahora usa la fecha seleccionada para crear los slots de tiempo
function renderizarHorario(reservas, fechaSeleccionada) {
    const horarioContainer = document.getElementById('horario-container');
    horarioContainer.innerHTML = '';
    
    // Obtenemos el año, mes y día de la fecha que el usuario seleccionó
    const [year, month, day] = fechaSeleccionada.split('-').map(Number);

    for (let hora = 8; hora < 20; hora++) {
        for (let minuto = 0; minuto < 60; minuto += 30) {
            // Creamos la fecha del slot usando el año, mes y día correctos
            // El mes en JavaScript es 0-indexado (Enero=0), por eso restamos 1
            const slotInicio = new Date(year, month - 1, day, hora, minuto);
            
            let ocupado = false;
            for (const reserva of reservas) {
                const reservaInicio = new Date(reserva.fecha_inicio).getTime();
                const reservaFin = new Date(reserva.fecha_fin).getTime();
                if (slotInicio.getTime() >= reservaInicio && slotInicio.getTime() < reservaFin) {
                    ocupado = true;
                    break;
                }
            }
            const slotDiv = document.createElement('div');
            slotDiv.className = 'horario-slot';
            const horaFormato = String(hora).padStart(2, '0');
            const minutoFormato = String(minuto).padStart(2, '0');
            slotDiv.innerHTML = `
                <span class="time">${horaFormato}:${minutoFormato}</span>
                <span class="status ${ocupado ? 'slot-ocupado' : 'slot-libre'}">
                    ${ocupado ? 'Ocupado' : 'Libre'}
                </span>
            `;
            horarioContainer.appendChild(slotDiv);
        }
    }
}