// notifications.js
class Notificacion {
    static mostrar(mensaje, tipo = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${tipo}`;
        toast.innerHTML = mensaje;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 5000);
    }
}

// Uso:
Notificacion.mostrar('Reserva creada con éxito', 'success');


// public/js/notifications.js
class NotificationSystem {
    static init() {
        this.notifications = [];
        this.setupWebSocket();
        this.renderContainer();
    }

    static setupWebSocket() {
        this.socket = new WebSocket(`ws://${window.location.hostname}:3001`);
        
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.addNotification(data.message, data.type);
        };
    }

    static addNotification(message, type = 'info') {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date()
        };
        
        this.notifications.unshift(notification);
        this.renderNotifications();
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, 5000);
    }

    static renderContainer() {
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
    }

    static renderNotifications() {
        const container = document.getElementById('notification-container');
        container.innerHTML = this.notifications.map(notif => `
            <div class="notification ${notif.type}">
                <p>${notif.message}</p>
                <small>${notif.timestamp.toLocaleTimeString()}</small>
            </div>
        `).join('');
    }
}

// Inicializar en todas las páginas
document.addEventListener('DOMContentLoaded', () => NotificationSystem.init());