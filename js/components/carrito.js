// =========================================================
// 🛒 MÓDULO CARRITO (versión refactorizada y limpia)
// =========================================================

// ----- ALERTAS Y TOASTS -----

/**
 * Muestra una alerta de error con SweetAlert2.
 * @param {string} titulo - El título de la alerta.
 * @param {string} texto - El mensaje de error.
 */
export function mostrarAlertaError(titulo, texto) {
  Swal.fire({
    icon: 'error',
    title: titulo,
    text: texto,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Entendido',
  });
}

import { API_BASE_URL,} from '../main.js';

/**
 * Muestra una notificación de éxito tipo "toast".
 * @param {string} titulo - Mensaje principal del toast.
 */
function mostrarToastExito(titulo) {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  Toast.fire({
    icon: 'success',
    title: titulo,
  });
}

// ----- VARIABLES GLOBALES -----
let cantidadActual = 0;
let isLoading = false;
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
const cacheProductos = {};

// =========================================================
// =============== FUNCIÓN PRINCIPAL DE INICIO =============
// =========================================================

/**
 * Inicializa toda la lógica del carrito una vez que el HTML está montado.
 * Se ejecuta tanto en `DOMContentLoaded` como en `components:ready`.
 */
let carritoInicializado = false;

function inicializarCarrito() {
  if (carritoInicializado) return; // 👈 evita múltiples inicializaciones

  const modalCarrito = document.getElementById('modal-carrito');
  const iconoCarrito = document.getElementById('carrito-selector');

  if (!iconoCarrito || !modalCarrito) {
    console.warn('⚠️ Elementos del carrito aún no están en el DOM. Reintentando...');
    return setTimeout(inicializarCarrito, 300);
  }
  // Elementos del DOM
  const cerrarCarritoBtn = document.getElementById('cerrar-carrito-btn');
  const modalOverlay = document.getElementById('modal-carrito-overlay');
  const vaciarCarritoBtn = document.getElementById('vaciar-carrito-btn');
  const listaTalles = document.getElementById('cuarados_talles');
  const masBtn = document.getElementById('mas');
  const menosBtn = document.getElementById('menos');
  const cantidadDiv = document.getElementById('cantidad');
  const agregarBtn = document.getElementById('agregar-al-carrito-btn');


  carritoInicializado = true;
  // Si los elementos aún no existen, esperamos y reintentamos
  if (!iconoCarrito || !modalCarrito) {
    console.warn('⚠️ Elementos del carrito aún no están en el DOM. Reintentando...');
    return setTimeout(inicializarCarrito, 300); // Reintenta cada 300ms
  }

  actualizarContadorCarrito();

  // ----- MODAL -----
  const abrirModal = () => {
    renderizarCarrito();
    modalCarrito.classList.remove('modal-carrito-oculto');
    modalCarrito.classList.add('modal-carrito-visible');
    modalCarrito.addEventListener('click', (e) => e.stopPropagation());
  };

  const cerrarModal = () => {
    modalCarrito.classList.remove('modal-carrito-visible');
    modalCarrito.classList.add('modal-carrito-oculto');
  };

  iconoCarrito.addEventListener('click', abrirModal);
  cerrarCarritoBtn?.addEventListener('click', cerrarModal);
  modalOverlay?.addEventListener('click', cerrarModal);
  vaciarCarritoBtn?.addEventListener('click', vaciarCarritoCompleto);

  // ----- TALLE SELECCIÓN -----
  if (listaTalles) {
    listaTalles.addEventListener('click', (e) => {
      const item = e.target.closest('.talle');
      if (!item) return;

      listaTalles.querySelectorAll('.talle').forEach((t) => t.classList.remove('seleccionado'));
      item.classList.add('seleccionado');

      cantidadActual = 0;
      cantidadDiv.textContent = cantidadActual;
      masBtn.disabled = false;
    });
  }

  // ----- BOTONES + / - -----
  masBtn?.addEventListener('click', async () => {
    if (isLoading) return;

    const talleActual = document.querySelector('#cuarados_talles .talle.seleccionado p')?.textContent.trim();
    if (!talleActual) return mostrarAlertaError('Talle no seleccionado', 'Por favor, elige un talle para continuar.');

    isLoading = true;
    masBtn.disabled = true;
    cantidadDiv.classList.add('loading');
    cantidadDiv.textContent = '';

    try {
      const esValido = await validar(cantidadActual, talleActual);
      if (esValido) cantidadActual++;
      else mostrarAlertaError('Stock no disponible', 'No hay suficiente stock para la cantidad y talle seleccionados.');
    } catch (error) {
      mostrarAlertaError('Error de conexión', error.message);
    } finally {
      isLoading = false;
      masBtn.disabled = false;
      cantidadDiv.classList.remove('loading');
      cantidadDiv.textContent = cantidadActual;
    }
  });

  menosBtn?.addEventListener('click', () => {
    if (cantidadActual > 0 && !isLoading) {
      cantidadActual--;
      cantidadDiv.textContent = cantidadActual;
    }
  });

  // ----- AGREGAR AL CARRITO -----
  agregarBtn?.addEventListener('click', agregarAlCarrito);
}

// =========================================================
// ================= FUNCIONES AUXILIARES ==================
// =========================================================

function obtenerIdProducto() {
  return new URLSearchParams(window.location.search).get('id');
}

async function obtenerProductoPorId(id) {
  if (cacheProductos[id]) return cacheProductos[id];

  try {
    const res = await fetch(`${API_BASE_URL}/hoja2/${id}`);
    if (!res.ok) throw new Error(`El servidor respondió con estado ${res.status}`);

    const json = await res.json();
    if (json.ok && json.data) {
      cacheProductos[id] = json.data;
      return json.data;
    } else {
      throw new Error(json.message || 'Producto no encontrado en el backend.');
    }
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return null;
  }
}

async function validar(cantidadDeseada, talle) {
  const id = obtenerIdProducto();
  if (!id) return false;

  const producto = await obtenerProductoPorId(id);
  if (!producto) throw new Error('No se pudo cargar la información del producto.');

  const stock = producto[talle];
  if (stock === undefined || isNaN(parseInt(stock))) {
    console.error(`El talle "${talle}" no existe en la hoja para este producto.`);
    return false;
  }

  return cantidadDeseada < parseInt(stock);
}

async function agregarAlCarrito() {
  const talle = document.querySelector('#cuarados_talles .talle.seleccionado p')?.textContent.trim();
  const id = obtenerIdProducto();

  if (!talle) return mostrarAlertaError('Talle no seleccionado', 'Por favor, elige un talle.');
  if (cantidadActual === 0) return mostrarAlertaError('Cantidad no válida', 'Debes seleccionar al menos una unidad.');
  if (!id) return mostrarAlertaError('Error del sistema', 'No se pudo identificar el producto.');

  const producto = await obtenerProductoPorId(id);
  if (!producto) return mostrarAlertaError('Error de carga', 'No se pudo obtener la información del producto.');

  const nombre = producto['nombre producto'] || producto.producto || 'Producto sin nombre';
  const precio = parseFloat(producto['precio final']) || 0;

  const existente = carrito.findIndex((i) => i.id === id && i.talle === talle);
  if (existente !== -1) {
    const item = carrito[existente];
    item.cantidad += cantidadActual;
    item.subtotal = item.precio * item.cantidad;
  } else {
    carrito.push({
      id,
      nombre,
      precio,
      talle,
      cantidad: cantidadActual,
      subtotal: precio * cantidadActual,
      timestamp: Date.now(),
    });
  }

  cantidadActual = 0;
  document.getElementById('cantidad').textContent = cantidadActual;
  actualizarContadorCarrito();
  renderizarCarrito();
  localStorage.setItem('carrito', JSON.stringify(carrito));
  mostrarToastExito('¡Agregado al carrito!');
}

// =========================================================
// ========== FUNCIONES DE INTERFAZ Y LOCALSTORAGE ==========
// =========================================================

function actualizarContadorCarrito() {
  const el = document.getElementById('carrito-contador');
  if (!el) return;
  const total = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  el.textContent = total;
  el.style.display = total > 0 ? 'block' : 'none';
}

function renderizarCarrito() {
  const carritoActual = JSON.parse(localStorage.getItem('carrito')) || [];
  const container = document.getElementById('carrito-items-container');
  const totalPrecioEl = document.getElementById('carrito-total-precio');
  const msgVacio = document.getElementById('carrito-vacio-msg');
  const footer = document.querySelector('.modal-carrito-footer');

  if (!container) return;

  container.innerHTML = '';
  if (carritoActual.length === 0) {
    msgVacio.style.display = 'block';
    footer.style.display = 'none';
    totalPrecioEl.textContent = '$0.00';
    return;
  }

  msgVacio.style.display = 'none';
  footer.style.display = 'block';

  let total = 0;
  carritoActual.forEach((item) => {
    total += item.subtotal;
    container.innerHTML += `
      <div class="carrito-item">
        <div class="carrito-item-info">
          <p class="item-nombre">${item.nombre}</p>
          <p class="item-detalle">Talle: ${item.talle} | Cantidad: ${item.cantidad}</p>
          <p class="item-precio">$${item.subtotal.toFixed(2)}</p>
        </div>
        <button class="remover-item-btn" data-timestamp="${item.timestamp}">Quitar</button>
      </div>`;
  });

  totalPrecioEl.textContent = `$${total.toFixed(2)}`;
  container.querySelectorAll('.remover-item-btn').forEach((btn) =>
    btn.addEventListener('click', (e) => removerItemDelCarrito(+e.target.dataset.timestamp))
  );
}

function removerItemDelCarrito(timestamp) {
  carrito = carrito.filter((item) => item.timestamp !== timestamp);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarContadorCarrito();
  renderizarCarrito();
}

function vaciarCarritoCompleto() {
  carrito = [];
  localStorage.removeItem('carrito');
  actualizarContadorCarrito();
  renderizarCarrito();
}

// =========================================================
// =============== EVENTOS DE INICIALIZACIÓN ================
// =========================================================

document.addEventListener('DOMContentLoaded', inicializarCarrito);
document.addEventListener('components:ready', inicializarCarrito);
