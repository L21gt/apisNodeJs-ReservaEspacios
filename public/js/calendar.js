// public/js/calendar.js
class ReservaCalendar {
    static init() {
        if (!document.getElementById('calendar')) return;
        
        this.calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            events: this.fetchEvents.bind(this),
            eventClick: this.handleEventClick.bind(this),
            dateClick: this.handleDateClick.bind(this),
            locale: 'es'
        });
        
        this.calendar.render();
    }

    static async fetchEvents(fetchInfo, successCallback) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/reservas/calendario?start=${fetchInfo.startStr}&end=${fetchInfo.endStr}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const events = await response.json();
            successCallback(events);
        } catch (error) {
            console.error('Error al cargar eventos:', error);
            NotificationSystem.addNotification('Error al cargar el calendario', 'error');
        }
    }

    static handleEventClick(info) {
        const event = info.event;
        const modalContent = `
            <h3>${event.title}</h3>
            <p><strong>Inicio:</strong> ${event.start.toLocaleString()}</p>
            <p><strong>Fin:</strong> ${event.end?.toLocaleString() || 'N/A'}</p>
            <p><strong>Estado:</strong> ${event.extendedProps.estado}</p>
        `;
        
        ModalSystem.showModal('Detalles de Reserva', modalContent);
    }

    static handleDateClick(info) {
        abrirModalReserva(null, info.dateStr);
    }
}

// Inicializar en páginas que tengan el calendario
document.addEventListener('DOMContentLoaded', () => ReservaCalendar.init());