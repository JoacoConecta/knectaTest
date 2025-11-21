// Este script carga los productos "destacados" y "muy destacados"
// desde el backend (Google Sheets vía Express) y los renderiza en
// dos carruseles diferentes en la página principal.
// ===============================================================

// --------------------------------------------------------------
// 📦 IMPORTACIÓN DE FUNCIONES AUXILIARES
// --------------------------------------------------------------
// limpiarPath → limpia rutas de imágenes mal formateadas (por ejemplo, elimina espacios)
// boolStr → convierte strings tipo "TRUE"/"FALSE" en valores booleanos reales (true/false)
// renderLista → renderiza un conjunto de productos dentro de un carrusel HTML
import { limpiarPath, boolStr } from "../utils/format.js";
import { renderLista } from "../components/renderLista.js";
import { fetchCliente } from "../utils/fetchClientes.js";

// --------------------------------------------------------------
// 🌐 CONFIGURACIÓN DE API
// --------------------------------------------------------------


// --------------------------------------------------------------
// 🧩 FUNCIÓN: obtener un elemento del DOM de forma segura
// --------------------------------------------------------------
// Recibe un selector CSS y devuelve el elemento correspondiente.
// Si no se encuentra, muestra una advertencia en consola (pero no rompe el código).
function getEl(selector) {
  const el = document.querySelector(selector);
  if (!el) console.warn(`No se encontró ${selector}`);
  return el;
}

// --------------------------------------------------------------
// ⚙️ FUNCIÓN: obtener el loader (el indicador de carga global)
// --------------------------------------------------------------
function getLoader() {
  return document.getElementById("loader");
}

// --------------------------------------------------------------
// 🧠 FUNCIÓN: normaliza un producto que viene en texto desde Google Sheets
// --------------------------------------------------------------
// Google Sheets devuelve todo como texto, así que esta función
// convierte tipos de datos y asigna nombres más consistentes.
function normalizeProducto(p) {
  return {
    id: p.id, // ID único del producto
    nombre: p["nombre producto"] ?? p.nombre ?? "", // nombre amigable
    categoria: p.categoria ?? "", // ej: remeras, pantalones...
    stock: Number(p.stock) || 0, // convierte el stock a número
    foto: limpiarPath(p.foto || ""), // imagen principal limpia
    foto2: limpiarPath(p.foto2 || ""), // imagen secundaria limpia
    promo: (p.promo ?? '').toString().trim(), // promo como string limpio (ej: "20%")
    precio: Number(p.precio) || 0, // precio base
    precioFinal: Number(p["precio final"] ?? p.precioFinal) || 0, // precio con descuento
    precioTransferencia: Number(p["precio transferencia"] ?? p.precioTransferencia) || 0, // si aplica
    precioCuotas: Number(p["precio cuotas"] ?? p.precioCuotas) || 0, // precio en cuotas
    destacado: boolStr(p.destacado), // convierte “TRUE” → true
    muyDestacado: boolStr(p.muyDestacado) // idem anterior
  };
}

// --------------------------------------------------------------
// 🚀 FUNCIÓN PRINCIPAL: obtener y renderizar productos destacados
// --------------------------------------------------------------
async function conseguirFetchStock() {
  const loader = getLoader(); // Obtenemos el loader (animación de carga)

  try {
    // Mostramos el loader al iniciar la carga
    loader?.classList.remove("hidden");

    // Solicitamos al backend los productos destacados
    // `/hoja2/destacados` devuelve un array con productos marcados como "destacado" o "muyDestacado"
    const res = await fetchCliente("/hoja2/destacados");
    const { ok, data } = await res.json();


    if (!ok) throw new Error("Error en la respuesta del servidor");

    // Normalizamos los productos (convertimos textos → números, strings → booleanos)
    const normalizados = data.map(normalizeProducto);

    // Dividimos los productos según su tipo de destaque
    const destacadosPrincipales = normalizados.filter(p => p.muyDestacado && p.stock > 0);
    const productosFiltrados   = normalizados.filter(p => p.destacado && !p.muyDestacado && p.stock > 0);

    // Seleccionamos los dos carruseles del HTML
    const carruselPrincipal = getEl(".carrusel");     // para muyDestacados
    const carruselSecundario = getEl(".carrusel.i");  // para destacados normales

    // Renderizamos cada grupo de productos en su respectivo carrusel
    renderLista(destacadosPrincipales, carruselPrincipal);
    renderLista(productosFiltrados, carruselSecundario);

  } catch (err) {
    // Si algo falla (API caída, JSON mal formado, etc.)
    console.error("Error al obtener datos:", err);
  } finally {
    // Este bloque se ejecuta SIEMPRE, ocurra o no un error
    console.log(" Ejecutando el bloque FINALLY.");
    console.log(" El elemento que voy a ocultar es:", loader);

    // Ocultamos el loader al terminar la operación
    loader?.classList.add("hidden");

    console.log(" Clase 'hidden' añadida. Clases actuales del elemento:", loader?.className);
  }
}

// --------------------------------------------------------------
// 🧩 INICIALIZACIÓN AUTOMÁTICA
// --------------------------------------------------------------
// El evento personalizado “components:ready” indica que ya se cargaron
// todos los componentes inyectados en el HTML (por ejemplo, header, footer...)
// Entonces recién ahí cargamos los productos destacados.
window.addEventListener(
  "components:ready",
  () => {
    if (document.getElementById("loader")) {
      conseguirFetchStock();
    }
  },
  { once: true } // solo se ejecuta una vez
);

// Si por algún motivo ya se cargaron los componentes antes del listener,
// ejecutamos igualmente la función.
if (document.getElementById("loader")) {
  conseguirFetchStock();
}
