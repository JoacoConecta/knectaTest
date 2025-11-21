// Define las constantes globales para este módulo
import { API_BASE_URL, CLIENTE } from '../main.js';

/**
 * Función 'helper' para realizar peticiones (fetch) a la API del backend.
 * Esta función es exportada para ser usada por otros módulos (ej. destacados.js).
 *
 * @param {string} ruta - La ruta de la API a la que se llamará (ej. /hoja2/destacados)
 * @param {object} options - Opciones estándar de fetch (ej. method, body, etc.)
 * @returns {Promise<Response>} La promesa de la respuesta de fetch.
 */
export async function fetchCliente(ruta, options = {}) {
  // Construye la URL completa de la API
  const url = new URL(`${API_BASE_URL}${ruta}`, window.location.origin);

  // Asegura que el ID del cliente esté presente en la URL (redundancia de seguridad)
  if (!url.searchParams.has("cliente")) {
    url.searchParams.set("cliente", CLIENTE);
  }

  // Prepara los encabezados, asegurando que 'x-cliente' esté presente
  const headers = {
    "x-cliente": CLIENTE,
    ...(options.headers || {}),
  };

  // Prepara las opciones finales para 'fetch'
  const newOptions = {
    ...options,
    headers,
    // ----------------------------------------------------------
    // 🛡️ BLINDAJE ANTI-BOT
    // ----------------------------------------------------------
    // Esta línea es crucial: le dice al navegador que envíe
    // las credenciales (incluida la cookie anti-bot) con esta petición.
    credentials: "include",
  };

  // Llama a 'fetch'.
  // Esta llamada será interceptada primero por 'main.js' (que añadirá
  // 'x-cliente' y '?cliente=' de nuevo), y luego se ejecutará
  // con las 'newOptions' (incluyendo 'credentials').
  return fetch(url, newOptions);
}