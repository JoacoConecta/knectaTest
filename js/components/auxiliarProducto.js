// ---------------------------------------------------------------
// Este módulo se encarga de RENDERIZAR un conjunto de productos
// dentro de un carrusel o contenedor principal.
// 🚫 NO filtra datos ni hace fetch al backend: eso se hace antes.
// ===============================================================

// --------------------------------------------------------------
// 🧩 IMPORTS
// --------------------------------------------------------------
// generarEtiquetaPromo → genera el pequeño cartel visual de descuento (ej: “20% OFF”)
import { generarEtiquetaPromo } from "../utils/promo.js";

// --------------------------------------------------------------
// 🧱 FUNCIÓN PRINCIPAL: generarCarrusel()
// --------------------------------------------------------------
// Recibe un array de productos (ya filtrados y normalizados)
// y los renderiza en el contenedor con id="carrusel".
export function generarCarrusel(productos) {
  const carrusel = document.getElementById('carrusel');
  // Limpiamos el contenedor antes de insertar nuevos productos
  carrusel.innerHTML = '';

  // Cada elemento del array “productos” representa un producto individual
  // que ya fue filtrado y procesado previamente en otra parte del código.
  productos.forEach(producto => {
    // Creamos el contenedor raíz para este producto
    const contenedor = document.createElement('div');
    contenedor.className = 'contenedor_producto';
    contenedor.dataset.categoria = producto.categoria; // útil si luego se quiere filtrar por categoría

    // ----------------------------------------------------------
    // 🖼️ ESTRUCTURA HTML DEL PRODUCTO
    // ----------------------------------------------------------
    // Se genera con template literals (string interpolado)
    // Incluye dos imágenes (una normal y otra al hacer hover)
    // más la etiqueta de promoción si corresponde.
    contenedor.innerHTML = `
      <div class="contenedor_producto_foto">
        <img src="${producto.foto}" class="sin_hover" />
        <img src="${producto.foto2}" class="hovered" />
        ${generarEtiquetaPromo(producto)} <!-- etiqueta “20% OFF”, si aplica -->
      </div>

      <div class="descrippcion_producto">
        <h1 class="nombre_producto">${producto["nombre producto"]}</h1>

        ${
          // Si el producto tiene promoción activa, mostramos el precio original tachado
          producto.promo != 0
            ? `<h2 class="precio_original">${formatearPrecio(producto.precio)}</h2>`
            : ""
        }

        <!-- Precio actual (con promo o precio base) -->
        <h2 class="precio_producto">${formatearPrecio(producto["precio final"])}</h2>

        <!-- Precio por transferencia (si aplica) -->
        <h3 class="precio_transferencia">
          ${formatearPrecio(producto["precio transferencia"])} con transferencia
        </h3>

        <!-- Precio en cuotas -->
        <h3>
          3 cuotas de ${formatearPrecio(producto["precio cuotas"])}
        </h3>
      </div>
    `;

    // ----------------------------------------------------------
    // 🖱️ EVENTO DE CLICK
    // ----------------------------------------------------------
    // Al hacer clic en cualquier producto, redirige al detalle individual.
    // Ejemplo: producto.html?id=3
    contenedor.addEventListener('click', () => {
      window.location.href = `producto.html?id=${producto.id}`;
    });

    // Finalmente, añadimos el producto al carrusel principal
    carrusel.appendChild(contenedor);
  });
}

// --------------------------------------------------------------
// 💰 FUNCIÓN AUXILIAR: formatearPrecio()
// --------------------------------------------------------------
// Convierte un número en formato de moneda ARS (pesos argentinos).
// Ejemplo: 70000 → "$70.000,00"
function formatearPrecio(valor) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
  }).format(valor);
}
