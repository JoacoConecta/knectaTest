// js/components/renderLista.js
import { productCardHTML } from "./productCard.js";

/** Renderiza la lista y agrega navegación por delegación (click en la card → detalle) */
export function renderLista(productos, container) {
  if (!container) return;

  container.innerHTML = productos.map(productCardHTML).join("");

  container.addEventListener(
    "click",
    (e) => {
      const card = e.target.closest("[data-product-id]");
      if (!card) return;
      const id = card.getAttribute("data-product-id");
      if (id) window.location.href = `/paginas/producto.html?id=${id}`;
    },
    { once: true } // igual que tu versión
  );
}
