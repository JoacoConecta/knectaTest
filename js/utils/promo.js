export function generarEtiquetaPromo(producto) {
  if (producto.promo === "50%") {
    return `<div class="etiqueta-promo descuento-50">50% OFF</div>`;
  } else if (producto.promo === "25%") {
    return `<div class="etiqueta-promo descuento-25">25% OFF</div>`;
  }else if (producto.promo === "20%") {
    return `<div class="etiqueta-promo descuento-20">20% OFF</div>`;
  }else if (producto.promo === "10%") {
    return `<div class="etiqueta-promo descuento-10">10% OFF</div>`;
  }
  return ''; // No hay promo
}
export function obtenerPrecioConPromo(producto) {
  const descuento = producto.promo || 0; // Si no hay promo, se asume 0
  return producto.precio * (1 - descuento);
}

