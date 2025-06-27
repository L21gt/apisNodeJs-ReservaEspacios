// dashboard.js
class Dashboard {
    static async inicializar() {
        if (!document.getElementById('reservasChart')) return; // ** Asegurarse de que el elemento existe
        
        try {
            // 1. Cargar datos estadísticos
            const datos = await this.cargarDatos();
            
            // 2. Inicializar gráficos
            this.inicializarGraficoReservas(datos.reservas);
            this.inicializarGraficoEspacios(datos.espacios);
            
            // 3. Actualizar métricas
            this.actualizarMetricas(datos.metricas);
        } catch (error) {
            console.error('Error al cargar dashboard:', error);
            Notificacion.mostrar('Error al cargar datos del dashboard', 'error');
        }
    }

    static async cargarDatos() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/estadisticas`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error en la respuesta del servidor');
        return await response.json();
    }

    static inicializarGraficoReservas(datos) {
        const ctx = document.getElementById('reservasChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: datos.labels,
                datasets: [{
                    label: 'Reservas por día',
                    data: datos.valores,
                    borderColor: '#4CAF50',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true }
                }
            }
        });
    }

    static inicializarGraficoEspacios(datos) {
        const ctx = document.getElementById('usoEspaciosChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: datos.labels,
                datasets: [{
                    data: datos.valores,
                    backgroundColor: [
                        '#4CAF50',
                        '#2196F3',
                        '#FFC107',
                        '#FF5722'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'right' }
                }
            }
        });
    }

    static actualizarMetricas(metricas) {
        document.getElementById('total-reservas').textContent = metricas.totalReservas;
        document.getElementById('reservas-hoy').textContent = metricas.reservasHoy;
        document.getElementById('ocupacion-promedio').textContent = `${metricas.ocupacionPromedio}%`;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => Dashboard.inicializar());