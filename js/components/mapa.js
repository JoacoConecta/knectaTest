document.addEventListener('DOMContentLoaded', function() {
    const tarjetas = document.querySelectorAll('.tarjeta-tienda');
    const iframeMapa = document.getElementById('google-maps-iframe');

    // Función para actualizar la URL del iframe del mapa
    function actualizarMapa(lat, lng) {
        // La URL base de Google Maps Embed. El "q" es la coordenada y "z" es el zoom.
        const nuevaSrc = `https://maps.google.com/maps?q=${lat},${lng}&hl=es&z=16&output=embed`;
        if (iframeMapa) {
            iframeMapa.src = nuevaSrc;
        }
    }

    tarjetas.forEach(tarjeta => {
        tarjeta.addEventListener('click', function() {
            // Quitar la clase 'active' de todas las tarjetas
            tarjetas.forEach(t => t.classList.remove('active'));
            
            // Añadir 'active' solo a la tarjeta clickeada
            this.classList.add('active');
            
            // Obtener las coordenadas desde los atributos data-*
            const lat = this.dataset.lat;
            const lng = this.dataset.lng;
            
            // Actualizar el mapa con las nuevas coordenadas
            actualizarMapa(lat, lng);
        });
    });

    // Opcional: Cargar el mapa de la primera tienda al iniciar la página
    const primeraTiendaActiva = document.querySelector('.tarjeta-tienda.active');
    if (primeraTiendaActiva) {
        const latInicial = primeraTiendaActiva.dataset.lat;
        const lngInicial = primeraTiendaActiva.dataset.lng;
        actualizarMapa(latInicial, lngInicial);
    }
});
