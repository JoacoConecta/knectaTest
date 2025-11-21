function enviarCarritoPorWhatsApp(numeroTelefono) {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    if (carrito.length === 0) {
        alert('Tu carrito está vacío. ¡Añade productos para continuar!');
        return;
    }

    let mensaje = '¡Hola! Me gustaría hacer el siguiente pedido:\n\n';
    let totalGeneral = 0;

    carrito.forEach(item => {
        mensaje += `Producto: ${item.nombre}\n`;
        mensaje += `Talle: ${item.talle}\n`;
        mensaje += `Cantidad: ${item.cantidad}\n`;
        mensaje += `Subtotal: $${item.subtotal.toFixed(2)}\n\n`;
        totalGeneral += item.subtotal;
    });

    mensaje += `*TOTAL DEL PEDIDO: $${totalGeneral.toFixed(2)}*`;
    const mensajeCodificado = encodeURIComponent(mensaje);
    const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${mensajeCodificado}`;
    window.open(urlWhatsApp, '_blank');
}

// Escucha cuando el DOM o los componentes estén listos
function inicializarBotonWhatsApp() {
    const btn = document.getElementById('mandar_wpp');
    if (!btn) {
        console.warn('⚠️ Botón WhatsApp no encontrado todavía. Reintentando...');
        return setTimeout(inicializarBotonWhatsApp, 300);
    }

    // Evita listeners duplicados
    if (btn.dataset.listenerAttached === 'true') return;
    btn.dataset.listenerAttached = 'true';

    btn.addEventListener('click', () => {
        enviarCarritoPorWhatsApp('5492235931153');
    });
}

document.addEventListener('DOMContentLoaded', inicializarBotonWhatsApp);
document.addEventListener('components:ready', inicializarBotonWhatsApp);
