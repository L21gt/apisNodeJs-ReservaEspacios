// search.js
class Buscador {
    static async buscarEspacios(filtros) {
        const response = await fetch(`${API_BASE_URL}/espacios/buscar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(filtros)
        });
        return await response.json();
    }
}


// search.js
class BuscadorEspacios {
    static init() {
        document.getElementById('btnBuscar')?.addEventListener('click', this.buscar);
        document.getElementById('busquedaInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.buscar();
        });
    }

    static async buscar() {
        const query = document.getElementById('busquedaInput').value;
        mostrarLoader();
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/espacios/buscar?q=${encodeURIComponent(query)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const espacios = await response.json();
            this.mostrarResultados(espacios);
        } catch (error) {
            Notificacion.mostrar('Error al buscar espacios', 'error');
            console.error(error);
        } finally {
            ocultarLoader();
        }
    }

    static mostrarResultados(espacios) {
        const container = document.getElementById('espaciosList');
        let html = "";
        
        if (espacios.length === 0) {
            html = '<p class="no-results">No se encontraron espacios</p>';
        } else {
            espacios.forEach(espacio => {
                html += `
                <div class="espacio-card">
                    <h3>${espacio.nombre}</h3>
                    <p>Tipo: ${espacio.tipo}</p>
                    <p>Capacidad: ${espacio.capacidad}</p>
                    <p>Ubicación: ${espacio.ubicacion}</p>
                    <button onclick="abrirModalReserva(${espacio.id})">Reservar</button>
                </div>
                `;
            });
        }
        
        container.innerHTML = html;
    }
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => BuscadorEspacios.init());