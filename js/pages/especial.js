// Este script carga y muestra los productos filtrados por
// categoría y/o sexo, según los parámetros de la URL.
// Ejemplo: productos.html?categoria=remeras&sexo=hombre
// ===============================================================

// --------------------------------------------------------------
// 📦 IMPORTACIÓN DE UTILIDADES
// --------------------------------------------------------------
// limpiarPath → corrige rutas de imágenes (elimina espacios, barras mal puestas, etc.)
// boolStr → convierte texto "TRUE"/"FALSE" a boolean (true/false)
// renderLista → función que imprime en pantalla una lista de productos (cards, carrusel, etc.)
import { limpiarPath, boolStr } from "../utils/format.js";
import { renderLista } from "../components/renderLista.js";

// --------------------------------------------------------------
// 🌐 CONFIGURACIÓN DE API BASE
// --------------------------------------------------------------
// Dirección del backend Express (servidor Node que conecta con Google Sheets)
import { API_BASE_URL, CLIENTE } from '../main.js';

// --------------------------------------------------------------
// 🧩 FUNCIÓN AUXILIAR: obtener un elemento del DOM
// --------------------------------------------------------------
// Devuelve el elemento según el selector CSS. Si no existe, muestra una advertencia.
function getEl(selector) {
    const el = document.querySelector(selector);
    if (!el) console.warn(`No se encontró ${selector}`);
    return el;
}

// --------------------------------------------------------------
// ⚙️ FUNCIÓN AUXILIAR: obtener el loader de la página
// --------------------------------------------------------------
// El loader es el indicador de carga que se muestra mientras se consultan los productos.
function getLoader() {
    return document.getElementById("loader");
}

// --------------------------------------------------------------
// 🧠 FUNCIÓN: normalizar datos de un producto
// --------------------------------------------------------------
// Google Sheets devuelve todo como texto. Esta función:
// - Convierte strings a números.
// - Asegura que existan las propiedades.
// - Limpia rutas de imágenes.
// - Estandariza nombres y valores booleanos.
// Así mantenemos un formato consistente para todo el frontend.
function normalizeProducto(p) {
  return {
    id: p.id, // ID único del producto
    nombre: p["nombre producto"] ?? p.nombre ?? "",
    categoria: String(p.categoria ?? "").toLowerCase().trim(), // Ej: "remera"
    sexo: String(p.sexo ?? "").toLowerCase().trim(), // Ej: "hombre" o "mujer"
    stock: Number(p.stock) || 0, // convierte a número (si no, 0)
    foto: limpiarPath(p.foto || ""), // limpia la ruta de la imagen principal
    foto2: limpiarPath(p.foto2 || ""), // limpia la ruta secundaria
    promo: (p.promo ?? '').toString().trim(), // promo como string limpio (ej: “20%”)
    precio: Number(p.precio) || 0,
    precioFinal: Number(p["precio final"] ?? p.precioFinal) || 0,
    precioTransferencia: Number(p["precio transferencia"] ?? p.precioTransferencia) || 0,
    precioCuotas: Number(p["precio cuotas"] ?? p.precioCuotas) || 0,
    especial: boolStr(p.especial),
    XXS: Number(p.XXS) || 0,
    XS: Number(p.XS) || 0,
    S: Number(p.S) || 0,
    M: Number(p.M) || 0,
    L: Number(p.L) || 0,
    XL: Number(p.XL) || 0,
    XXL: Number(p.XXL) || 0,
  };
}

// --------------------------------------------------------------
// 🚀 FUNCIÓN PRINCIPAL: obtener y renderizar productos
// --------------------------------------------------------------
async function conseguirFetchStock() {
    const loader = getLoader(); // obtenemos el loader para mostrar/ocultar durante la carga

    try {
        // Mostramos el loader
        loader?.classList.remove("hidden");

        // Solicitamos TODOS los productos desde la API (Google Sheets)
        const res = await fetch(`${API_BASE_URL}/hoja2/especial`);
        const { ok, data } = await res.json();

        if (!ok) throw new Error("Error en la respuesta del servidor");

        // ----------------------------------------------------------
        // 🔍 FILTRADO POR PARÁMETROS DE URL
        // ----------------------------------------------------------
        // Ejemplo de URL: productos.html?categoria=remera&sexo=hombre
        const params = new URLSearchParams(window.location.search);


        // Normalizamos todos los productos para poder filtrarlos correctamente
        const normalizados = data.map(normalizeProducto);

        let destacadosPrincipales = normalizados ;
        // ----------------------------------------------------------
        // 🎨 RENDERIZAR EN EL CARRUSEL
        // ----------------------------------------------------------
// RENDERIZAR INICIAL
const carruselPrincipal = getEl(".carrusel");
renderLista(destacadosPrincipales, carruselPrincipal);

// ----------------------------------------------
// 🧩 ORDENADOR DE PRECIO
// ----------------------------------------------
const selectOrden = document.getElementById("orden-precio");
if (selectOrden) {
  selectOrden.addEventListener("change", () => {
    const orden = selectOrden.value;

    // copiamos el array para no mutar el original
    const productosOrdenados = [...destacadosPrincipales];

    if (orden === "asc") {
      productosOrdenados.sort((a, b) => a.precioFinal - b.precioFinal);
    } else if (orden === "desc") {
      productosOrdenados.sort((a, b) => b.precioFinal - a.precioFinal);
    }

    renderLista(productosOrdenados, carruselPrincipal);
  });
}    //
    //FILTRO TALLE
    //
    const selectTalle = document.getElementById("filtro-talle-select");
    if (selectTalle) {
      selectTalle.addEventListener("change", () => {
        const talleSeleccionado = selectTalle.value; // ahora mayúscula, coincide con las claves
        console.log("Talle seleccionado:", talleSeleccionado);

        let productosFiltrados = [...destacadosPrincipales];

        if (talleSeleccionado) {
          productosFiltrados = productosFiltrados.filter(p => {
            const cantidad = Number(p[talleSeleccionado]);
            console.log(p.nombre, talleSeleccionado, cantidad); // debug
            return cantidad > 0;
          });
        }

        renderLista(productosFiltrados, carruselPrincipal);
      });
    }

    } catch (err) {
        // Si algo falla, lo mostramos en consola (por ejemplo, servidor caído)
        console.error("Error al obtener datos:", err);

    } finally {
        // ----------------------------------------------------------
        // 🧹 FINALIZACIÓN: ocultar el loader y limpiar logs
        // ----------------------------------------------------------
        console.log(" Ejecutando el bloque FINALLY.");
        console.log(" El elemento que voy a ocultar es:", loader);

        loader?.classList.add("hidden");

        console.log(" Clase 'hidden' añadida. Clases actuales del elemento:", loader?.className);
    }
}

// --------------------------------------------------------------
// 🧩 ARRANQUE AUTOMÁTICO SEGÚN EL EVENTO CUSTOM “components:ready”
// --------------------------------------------------------------
// Este evento indica que los componentes (header, footer, etc.)
// ya se inyectaron en el DOM, por lo tanto podemos renderizar productos.
window.addEventListener(
    "components:ready",
    () => {
        if (document.getElementById("loader")) {
            conseguirFetchStock();
        }
    },
    { once: true } // solo una vez
);

// Si el loader ya existe antes de dispararse el evento,
// ejecutamos igual la función (fallback para evitar retrasos).
if (document.getElementById("loader")) {
    conseguirFetchStock();
}
