// js/components/productCard.js
import { generarEtiquetaPromo } from "../utils/promo.js";
import { formatearPrecio } from "../utils/format.js";

/** Corrige URLs locales o externas automáticamente */
function normalizarURL(url) {
  if (!url) return "";

  // Si ya es absoluta (http:// o https://), la dejamos igual
  if (/^https?:\/\//i.test(url)) return url.trim();

  // Si empieza con "../" o "./", limpiamos y forzamos a ruta interna
  if (url.startsWith("../")) return url.replace(/^\.\.\//, "/");
  if (url.startsWith("./")) return url.replace(/^\.\//, "/");

  // Si ya empieza con "/frontend/", la dejamos igual
  if (url.startsWith("/frontend/")) return url;

  // Por defecto, lo tratamos como imagen local en /frontend/
  return `/frontend/${url}`;
}

/** Devuelve el HTML string de una tarjeta de producto (espera un producto ya normalizado) */
export function productCardHTML(prod) {
  const etiqueta = generarEtiquetaPromo({ promo: prod.promo }) || "";

  // ✅ URLs absolutas (imgbb, Drive, etc.) o locales
  const foto1 = normalizarURL(prod.foto);
  const foto2 = normalizarURL(prod.foto2);

  const img2 = foto2
    ? `<img src="${foto2}" class="hovered" alt="" draggable="false" />`
    : "";

  const precioOriginal = prod.promo !== "0"
    ? `<h2 class="precio_original">${formatearPrecio(prod.precio)}</h2>`
    : "";

  return `
    <div class="contenedor_producto" data-product-id="${prod.id}">
      <div class="contenedor_producto_foto">
        <img src="${foto1}" class="sin_hover" alt="${prod.nombre}" draggable="false" />
        ${img2}
        ${etiqueta}
      </div>
      <div class="descrippcion_producto">
        <h1 class="nombre_producto">${prod.nombre}</h1>
        ${precioOriginal}
        <h2 class="precio_producto">${formatearPrecio(prod.precioFinal)}</h2>
        <h3 class="precio_transferencia">${formatearPrecio(prod.precioTransferencia)} con transferencia</h3>
        <h3>3 cuotas de ${formatearPrecio(prod.precioCuotas)}</h3>
      </div>
    </div>
  `;
}
