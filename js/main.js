// Importas el objeto CONFIG desde el archivo generado
import { CONFIG } from './config.js';

// Bloque de configuración global (IIFE) para la inicialización del sitio.
export const CLIENTE = CONFIG.cliente; // ID del cliente (tenant) actual 
export const API_BASE_URL = CONFIG.apiBase;// URL base del backend
(() => {
  // ----------------------------------------------------------
  // ⚙️ CONFIGURACIÓN INICIAL
  // ----------------------------------------------------------

  // 1. OBTENER TOKEN ANTI-BOT (TRUST TOKEN)
  // ----------------------------------------------------------
  // Llama al endpoint de inicialización del backend al cargar la página.
  // Esto permite al backend establecer la cookie de confianza 'httpOnly'.
  // Se usa 'window.fetch' original, antes de que sea interceptado.
  window.fetch(`${API_BASE_URL}/api/init-session?cliente=${CLIENTE}`, {
    method: "GET",
    credentials: "include", // Permite al navegador recibir y guardar la cookie
    headers: { "x-cliente": CLIENTE },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.ok) console.log("🛡️ Sesión de confianza anti-bot iniciada.");
    })
    .catch((err) => console.error("Error al iniciar sesión anti-bot:", err));

  // ----------------------------------------------------------
  // 2. NORMALIZAR URL VISIBLE
  // ----------------------------------------------------------
  // Asegura que la URL en la barra de direcciones siempre contenga el query param '?cliente='.
  const currentUrl = new URL(window.location.href);
  if (!currentUrl.searchParams.has("cliente")) {
    currentUrl.searchParams.set("cliente", CLIENTE);
    // Actualiza la URL visible sin recargar la página
    window.history.replaceState({}, "", currentUrl.toString());
  }

  // ----------------------------------------------------------
  // 3. INTERCEPTOR GLOBAL DE PETICIONES (fetch)
  // ----------------------------------------------------------
  // Sobreescribe 'window.fetch' para inyectar automáticamente los
  // datos del cliente (query param y header) en CADA petición.
  const originalFetch = window.fetch;
  window.fetch = (url, options = {}) => {
    const u = new URL(url, window.location.origin);

    // Inyecta '?cliente=' en la URL de la petición
    if (!u.searchParams.has("cliente")) {
      u.searchParams.set("cliente", CLIENTE);
    }

    // Inyecta 'x-cliente' en los encabezados de la petición
    const headers = {
      "x-cliente": CLIENTE,
      ...(options.headers || {}),
    };

    // Ejecuta el fetch original con la URL y encabezados modificados
    return originalFetch(u, { ...options, headers });
  };
})();

// ===============================================================
// ⚙️ ARCHIVO PRINCIPAL: js/main.js
// ---------------------------------------------------------------
// Este script actúa como “mini framework” para tu sitio:
// - Carga componentes HTML dinámicamente en puntos del DOM.
// - Carga los estilos CSS asociados sin duplicarlos.
// - Permite que los módulos sean intercambiables y reutilizables.
// - Emite un evento global (“components:ready”) al terminar.
// ===============================================================

// --------------------------------------------------------------
// 🧠 CACHE Y CONTROL DE RECURSOS
// --------------------------------------------------------------
// htmlCache → evita volver a hacer fetch del mismo fragmento HTML.
// cssLoaded → evita volver a insertar el mismo CSS en <head>.
const htmlCache = new Map();
const cssLoaded = new Set();


// --------------------------------------------------------------
// 🎨 FUNCIÓN: loadStyles()
// --------------------------------------------------------------
// Recibe una lista de rutas CSS y las inyecta en el documento <head>.
// Verifica antes si ya se cargaron para evitar duplicaciones.
function loadStyles(files = []) {
  files.forEach((href) => {
    // Si ya se cargó este archivo, lo ignora
    if (cssLoaded.has(href)) return;

    // Crea un elemento <link> dinámicamente
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;

    // Lo agrega al <head> del documento
    document.head.appendChild(link);

    // Marca el archivo como cargado
    cssLoaded.add(href);
  });
}

// 🎨 MOTOR DE TEMAS: Sobrescribe las variables CSS
(() => {
  // Si no hay configuración de tema, no hacemos nada (se usa tokens.css)
  if (!CONFIG.theme || Object.keys(CONFIG.theme).length === 0) return;

  const root = document.documentElement; // Esto es el selector :root

  // Recorremos cada clave del JSON y la aplicamos al navegador
  Object.entries(CONFIG.theme).forEach(([variable, valor]) => {
    // Ejemplo: variable = "--brand-primary", valor = "#ff0000"
    root.style.setProperty(variable, valor);
  });
  
  console.log("🎨 Tema personalizado aplicado:", CONFIG.cliente);
})();
// --------------------------------------------------------------
// 🧩 FUNCIÓN PRINCIPAL: loadComponent()
// --------------------------------------------------------------
// Inserta un fragmento HTML dentro de un elemento del DOM.
// Opcionalmente carga también los CSS asociados.
// --------------------------------------------------------------
// @param {string} mountSelector → selector donde montar el HTML
// @param {string} file → archivo HTML del componente (ruta relativa a /frontend/js/modulos/)
// @param {string[]} styles → lista de rutas CSS que acompañan al componente
// --------------------------------------------------------------
export async function loadComponent(mountSelector, file, styles = []) {
  const mount = document.querySelector(mountSelector);
  if (!mount) return false; // Si no existe el punto de montaje, no hace nada

  // Carga estilos (con deduplicación)
  loadStyles(styles);

  // Si el HTML ya está en cache, lo reutiliza
  if (htmlCache.has(file)) {
    mount.innerHTML = htmlCache.get(file);
    return true;
  }

  // ----------------------------------------------------------
  // 🔄 CARGA DEL FRAGMENTO HTML DESDE EL SERVIDOR
  // ----------------------------------------------------------
  // Esta llamada a 'fetch' será interceptada por el IIFE de arriba
  const res = await fetch(`/js/modulos/${file}`);

  // Si hubo un error de red o el archivo no existe
  if (!res.ok) {
    mount.innerHTML = `<p style="color:red">Error cargando ${file}</p>`;
    return false;
  }

  // Lee el contenido del archivo como texto
  const html = await res.text();

  // Guarda en cache para futuros usos
  htmlCache.set(file, html);

  // Inyecta el contenido en el punto de montaje
  mount.innerHTML = html;

  // ----------------------------------------------------------
  // 🧨 REACTIVA SCRIPTS INLINE (si los hubiera)
  // ----------------------------------------------------------
  // Si el fragmento HTML contiene <script> internos, estos no se ejecutan
  // automáticamente al inyectarse. Este bloque los recrea dinámicamente.
  mount.querySelectorAll("script").forEach((oldScript) => {
    const s = document.createElement("script");

    // Copia el contenido o el src, según corresponda
    if (oldScript.src) {
      s.src = oldScript.src;
      s.defer = true;
    } else {
      s.textContent = oldScript.textContent;
    }

    // Inserta el nuevo script en el documento para que se ejecute
    document.body.appendChild(s);

    // Elimina el script original del fragmento
    oldScript.remove();
  });

  return true;
}

// --------------------------------------------------------------
// 🚀 EVENTO PRINCIPAL DE ARRANQUE
// --------------------------------------------------------------
// Cuando se carga el DOM, se montan los componentes base del sitio.
// Esto crea una estructura escalable donde cada HTML es modular.
document.addEventListener("DOMContentLoaded", async () => {
  // ----------------------------------------------------------
  // 🧱 1️⃣ Carga los estilos CORE (globales del sitio)
  // ----------------------------------------------------------
  // Se cargan una sola vez, ya que aplican a toda la web.
  loadStyles([
    "/styles/core/token.css", // variables CSS globales
    "/styles/core/base.css", // estilos base (body, tipografía)
    "/styles/core/utilities.css", // clases utilitarias comunes
    "/styles/components/ribbon.css", // banner superior (ofertas, etc.)
    "/styles/components/carousel.css", // estructura de carruseles
  ]);

  // ----------------------------------------------------------
  // 🧩 2️⃣ Carga componentes modulares (HTML + CSS)
  // ----------------------------------------------------------
  // Cada componente se monta en un “mount point” del HTML principal.
  // Si alguno no existe en una página, simplemente no se monta.

  // Loader (pantalla de carga)
  await Promise.all([ loadComponent("#loader-mount", "loader.html", [
    "/styles/components/loader.css",
  ]),
  // Header (barra superior con logo, menú, carrito)
   loadComponent("#header-mount", "header.html", [
    "/styles/components/header.css",
    "/styles/components/buttons.css",
  ]),
  // Footer (pie de página con formulario y enlaces)
   loadComponent("#footer-mount", "footer.html", [
    "/styles/components/footer.css",
    "/styles/components/formulario.css",
  ]),
]);
  const splashScreen = document.querySelector("#splash-screen");
  const dataLoader = document.querySelector("#loader"); // El loader transparente

  if (splashScreen) {
    splashScreen.classList.add("hidden"); // Oculta Loader #1
  }
  if (dataLoader) {
    // MUESTRA EL LOADER #2 (el transparente)
    dataLoader.classList.add("visible"); 
    // O quita la clase "hidden" si lo manejas al revés
  }
  // ----------------------------------------------------------
  // 📣 3️⃣ DISPARA EVENTO GLOBAL “components:ready”
  // ----------------------------------------------------------
  // Notifica al resto de los scripts que todos los componentes
  // dinámicos ya fueron montados y sus CSS están listos.
  // Permite a otros módulos (ej: producto.js, carrito.js)
  // ejecutar su lógica sabiendo que el DOM ya tiene todo montado.
  document.dispatchEvent(new CustomEvent("components:ready"));
  window.dispatchEvent(new Event("components:ready"));
});
