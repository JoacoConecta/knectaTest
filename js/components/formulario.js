// ===============================================================
// 🧾 MÓDULO FORMULARIO DE COMPRA
// ---------------------------------------------------------------
// Este script maneja:
// - La apertura/cierre del modal de compra
// - La validación y envío del formulario con datos del cliente
// - El envío del carrito al backend (Google Sheets + Mercado Pago)
// Compatible con carga dinámica de componentes (sistema modular)
// ===============================================================
//import de los carteles facheros
import { mostrarAlertaError } from "./carrito.js";
function mostrarToastExito(titulo, texto = '') {
  Swal.fire({
    icon: 'success',
    title: titulo,
    text: texto,
    confirmButtonColor: '#28a745', // verde positivo
    confirmButtonText: 'Genial',
    timer: 3000,
    timerProgressBar: true,
  });
}
import { API_BASE_URL } from '../main.js';

// --------------------------------------------------------------
// 💾 CARGA DE CARRITO DESDE LOCALSTORAGE
// --------------------------------------------------------------
// Recupera el carrito completo almacenado localmente.

// ✅ Cargar SIEMPRE el estado actual del carrito
function getCarrito() {
  return JSON.parse(localStorage.getItem('carrito')) || [];
}


// Bandera para evitar inicializar el formulario varias veces.
let formularioInicializado = false;

// --------------------------------------------------------------
// 🧩 FUNCIÓN PRINCIPAL: inicializarFormularioCompra()
// --------------------------------------------------------------
// Esta función configura los eventos del modal y del formulario
// para permitir al usuario finalizar su compra de manera segura.
function inicializarFormularioCompra() {
  // Evita inicializar el formulario más de una vez
  if (formularioInicializado) return;

  // Referencias a elementos clave del DOM
  const botonFinalizarCompra = document.getElementById('finalizar-compra-btn');
  const modal = document.getElementById('compra-modal');
  const formulario = document.getElementById('formulario-datos');
  const botonCerrar = document.querySelector('.cerrar-modal');

  // ⚠️ Si el formulario aún no está disponible (por carga asíncrona),
  // se reintenta cada 300ms hasta que exista en el DOM.
  if (!formulario || !botonFinalizarCompra || !modal) {
    console.warn('⚠️ Formulario o elementos del modal no disponibles aún. Reintentando...');
    return setTimeout(inicializarFormularioCompra, 300);
  }

  formularioInicializado = true;
  console.log('✅ Formulario de compra inicializado correctamente');

  // Botón de envío (submit) dentro del formulario
  const botonEnviarFormulario = formulario.querySelector('button[type="submit"]');

  // ----------------------------------------------------------
  // 🪟 CONTROL DE MODAL (abrir/cerrar)
  // ----------------------------------------------------------
  const mostrarModal = () => {
    modal.style.display = 'flex'; // muestra el fondo
    setTimeout(() => modal.classList.add('activo'), 10); // activa la animación
  };

  const ocultarModal = () => {
    modal.classList.remove('activo');
    setTimeout(() => (modal.style.display = 'none'), 400); // espera la animación antes de ocultar
  };

  // ----------------------------------------------------------
  // 🎛️ EVENT LISTENERS DEL MODAL
  // ----------------------------------------------------------
  botonFinalizarCompra.addEventListener('click', mostrarModal); // abre modal
  botonCerrar.addEventListener('click', ocultarModal); // cierra con botón
  modal.addEventListener('click', (evento) => {
    // Si se hace clic fuera del contenido (fondo oscuro), se cierra
    if (evento.target === modal) ocultarModal();
  });

  // ----------------------------------------------------------
  // 📨 EVENTO DE ENVÍO DEL FORMULARIO
  // ----------------------------------------------------------
  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault(); // evita recarga de página

    // 🛡️ Anti-bots (honeypot)
    // Si el campo oculto “website” tiene valor, se asume que es un bot.
    const honeypot = document.getElementById('contact_preference')?.value;
    if (honeypot) {
      console.warn('🚫 Honeypot activado. Envío bloqueado.');
      return;
    }

    // ✅ Validación de campos requeridos
    const nombre = formulario.nombre.value.trim();
    const telefono = formulario.telefono.value.trim();
    const direccion = formulario.direccion.value.trim();
    const codigoPostal = formulario.codigoPostal.value.trim();

    if (!nombre || !telefono || !direccion || !codigoPostal) {
      mostrarAlertaError('Por favor, completa todos los campos.');
      return;
    }

    //    - Nombre: Acepta letras, espacios, acentos, apóstrofes y guiones (min 3 chars)
    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]{3,50}$/;
    if (!regexNombre.test(nombre)) {
      mostrarAlertaError(
        'Por favor, ingresa un nombre válido (solo letras, min 3 caracteres).'
      );
      return;
    }
    //    - Teléfono: Acepta números, espacios, +, - (min 8 chars)
    const regexTelefono = /^[0-9\s+-]{8,20}$/;
    if (!regexTelefono.test(telefono)) {
      mostrarAlertaError(
        'Por favor, ingresa un teléfono válido (mín 8 números).'
      );
      return;
    }
    //    - Código Postal: Acepta solo números (de 4 a 8 dígitos)
    const regexCP = /^[0-9]{4,8}$/;
    if (!regexCP.test(codigoPostal)) {
      mostrarAlertaError(
        'Por favor, ingresa un código postal numérico (de 4 a 8 dígitos).'
      );
      return;
    }
    //    - Dirección: Un chequeo simple de longitud
    if (direccion.length < 5) {
      mostrarAlertaError(
        'Por favor, ingresa una dirección válida (mín 5 caracteres).'
      );
      return;
    }

    // 3. Anti-XSS simple (evitar que inyecten scripts)
    //    Buscamos si algún campo de texto libre contiene '<' o '>'
    const regexScript = /[<>]/;
    if (regexScript.test(nombre) || regexScript.test(direccion)) {
      mostrarAlertaError(
        'Los campos no pueden contener caracteres especiales como "<" o ">".'
      );
      return;
    }

    // Bloquea el botón para evitar doble envío
    botonEnviarFormulario.disabled = true;
    botonEnviarFormulario.textContent = 'Procesando...';

    // Extrae solo los datos relevantes del carrito
    const productos = getCarrito().map(({ id, cantidad, talle, precio }) => ({
      id, cantidad, talle, precio
    }));


    // Arma el objeto final que se enviará al backend
    const datos = { nombre, telefono, direccion, codigoPostal, productos };


    console.log('Datos capturados:', datos);

    // ------------------------------------------------------
    // 🚀 ENVÍO DE DATOS AL BACKEND (Google Sheets)
    // ------------------------------------------------------
    fetch(`${API_BASE_URL}/guardar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datos),
      credentials: 'include',
    })

      .then((response) => {
        // Si la respuesta no es 200, lanza un error manejable
        if (!response.ok) {
          return response.json().then((err) => {
            throw new Error(err.error || 'Algo salió mal');
          });
        }
        return response.json();
      })
      .then((data) => {
        ocultarModal();
        mostrarToastExito('¡Gracias por tu compra! En breve te contactarán por WhatsApp para coordinar el envío.');
        formulario.reset();

        // Enviamos carrito a MP
        enviarCarritoAlBackend().then(() => {
          // 🧹 Limpieza local una vez enviado correctamente
          localStorage.removeItem('carrito');
        });
      })
      .catch((error) => {
        // Manejo de errores: vuelve a habilitar el botón y muestra alerta
        console.error('Error al enviar datos:', error);
        mostrarAlertaError(`Error: ${error.message}. Por favor, intenta de nuevo.`);
        botonEnviarFormulario.disabled = false;
        botonEnviarFormulario.textContent = 'Confirmar Datos';
      });
  });
}

// --------------------------------------------------------------
// 🧠 INICIALIZACIÓN FLEXIBLE
// --------------------------------------------------------------
// Se ejecuta al cargarse el DOM, o cuando los componentes dinámicos
// terminan de montarse (evento “components:ready”).
document.addEventListener('DOMContentLoaded', inicializarFormularioCompra);
document.addEventListener('components:ready', inicializarFormularioCompra);

// ===============================================================
// 💳 FUNCIÓN: enviarCarritoAlBackend()
// ---------------------------------------------------------------
// Una vez que se guardan los datos del cliente en Google Sheets,
// esta función envía los productos a la ruta /create-preference
// del backend, para generar una preferencia de pago de Mercado Pago.
// ===============================================================
async function enviarCarritoAlBackend() {
  const carritoReducido = getCarrito().map(({ nombre, cantidad, precio }) => ({
    nombre, cantidad, precio
  }));


  try {
    const res = await fetch(`${API_BASE_URL}/create-preference`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ carrito: carritoReducido }),
      credentials: 'include',
    });

    const data = await res.json();
    if (res.ok && data.preference_url) {
      window.location.href = data.preference_url;
    } else {
      mostrarAlertaError(data.error || 'Hubo un problema al generar el link de pago.');
    }
  } catch (err) {
    console.error('Error al enviar el carrito:', err);
    mostrarAlertaError('Error de conexión con Mercado Pago.');
  }
}

