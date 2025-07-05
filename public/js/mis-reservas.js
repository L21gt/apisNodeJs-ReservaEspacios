document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    cargarMisReservas(token);
});

const API_BASE_URL = 'http://localhost:3000/api';

async function cargarMisReservas(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/reservas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Error al cargar tus reservas.');
        }

        const reservas = await response.json();
        renderizarReservas(reservas);
    } catch (error) {
        alert(error.message);
    }
}

function renderizarReservas(reservas) {
    const container = document.getElementById('mis-reservas-container');
    container.innerHTML = '';

    if (reservas.length === 0) {
        container.innerHTML = '<p>Aún no has realizado ninguna reserva.</p>';
        return;
    }

    reservas.forEach(reserva => {
        const card = document.createElement('div');
        card.className = 'reserva-user-card';
        card.setAttribute('data-estado', reserva.estado);
        card.setAttribute('id', `reserva-${reserva.id}`);

        const fechaInicio = new Date(reserva.fecha_inicio).toLocaleString('es-ES');
        const fechaFin = new Date(reserva.fecha_fin).toLocaleString('es-ES');

        // --- LÍNEA AÑADIDA PARA DETERMINAR LA CLASE DEL ESTADO ---
        const estadoClase = reserva.estado === 'confirmada' ? 'estado-confirmada' : 'estado-cancelada';

        card.innerHTML = `
            <div class="info">
                <h3>${reserva.espacio_nombre}</h3>
                <p><strong>Desde:</strong> ${fechaInicio}</p>
                <p><strong>Hasta:</strong> ${fechaFin}</p>
                <p><strong>Estado:</strong> <span class="${estadoClase}">${reserva.estado}</span></p>
            </div>
            <div class="actions">
                ${reserva.estado === 'confirmada' ? `<button class="btn-cancelar" data-id="${reserva.id}">Cancelar</button>` : ''}
            </div>
        `;
        container.appendChild(card);
    });

    document.querySelectorAll('.btn-cancelar').forEach(button => {
        button.addEventListener('click', handleCancelarReserva);
    });
}

async function handleCancelarReserva(event) {
    const reservaId = event.target.getAttribute('data-id');
    const token = localStorage.getItem('token');

    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/reservas/${reservaId}/cancelar`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'No se pudo cancelar la reserva.');
        }

        alert('Reserva cancelada con éxito.');
        const card = document.getElementById(`reserva-${reservaId}`);
        card.setAttribute('data-estado', 'cancelada');
        
        const estadoSpan = card.querySelector('.info p:last-child span');
        estadoSpan.textContent = 'cancelada';
        estadoSpan.className = 'estado-cancelada'; // Cambiamos la clase para el color

        card.querySelector('.actions').innerHTML = '';

    } catch (error) {
        alert(error.message);
    }
}