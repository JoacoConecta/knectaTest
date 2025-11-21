
// --------------------------------------------------------------
// 📦 IMPORTACIÓN DE MÓDULOS AUXILIARES
// --------------------------------------------------------------
// Importamos la función que genera el carrusel de productos recomendados
import { generarCarrusel } from "../components/auxiliarProducto.js";
// Importamos la función que genera las etiquetas de promoción (ej: “20% OFF”)
import { generarEtiquetaPromo } from "../utils/promo.js";


import { API_BASE_URL } from "../main.js";

// --------------------------------------------------------------
// ⚙️ FUNCIÓN AUXILIAR: obtener el loader (animación de carga)
// --------------------------------------------------------------
function getLoader() {
  return document.getElementById("loader");
}

// --------------------------------------------------------------
// 🚀 FUNCIÓN PRINCIPAL: carga y renderiza la información del producto individual
// --------------------------------------------------------------
async function cargarProductoIndividual() {
  // Leemos el parámetro “id” desde la URL (ej: producto.html?id=5)
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");
  const loader = getLoader();
  let precioHTML = ''; // Esta variable contendrá el HTML del precio final

  // Si no hay un ID en la URL, detenemos todo
  if (!productId) {
    console.error('No se encontró un ID de producto en la URL.');
    return;
  }

  try {
    // Solicitamos al backend el producto con ese ID
    const res = await fetch(`${API_BASE_URL}/hoja2/${productId}`);
    const { ok, data: producto } = await res.json();

    // Mostramos el loader mientras se cargan los datos
    loader?.classList.remove("hidden");

    if (!ok) throw new Error("Error en la respuesta del servidor");

    // Seleccionamos el contenedor donde se muestra el precio
    const precioContainer = document.querySelector('.precio').parentNode;

    // Guardamos valores importantes del producto
    const precioConPromo = producto["precio final"];
    const promoActiva = producto.promo != 0;

    // ----------------------------------------------------------
    // 🧩 CARGAR DATOS DEL PRODUCTO EN EL HTML
    // ----------------------------------------------------------
    if (producto) {
      // 1️⃣ Cargar texto principal (nombre, precios, descripción, etc.)
      document.querySelector('.titulo').textContent = producto['nombre producto'];
      document.title = `${producto['nombre producto']} | Mi Tienda`;
      // Si el pago por transferencia está permitido, mostramos su precio
      if (producto.desactivarTransferencia === "FALSE") {
        document.querySelector('.precio_transferencia').textContent =
          ` ${formatearPrecio(producto["precio transferencia"])} por transferencia`;
      }

      // Precio en cuotas
      document.querySelector('h5').textContent =
        `3 cuotas sin interés de ${formatearPrecio(producto["precio cuotas"])}`;

      // Descripción del producto
      document.getElementById('descripcion_contenido').textContent = `${producto.descripcion}`;
      // Abre/cierra la pestaña de políticas
      const politicas = document.getElementById('politicas');
      politicas?.addEventListener('click', () => {
        politicas.classList.toggle('active');
      });


      // ----------------------------------------------------------
      // 🖼️ CARGAR IMÁGENES PRINCIPALES Y AUXILIARES
      // ----------------------------------------------------------
      // Filtramos las fotos vacías o nulas
      const fotos = [producto.foto, producto.foto2, producto.foto3].filter(Boolean);

      // Imagen principal
      const fotoPrincipalContainer = document.querySelector('.placeholder_foto.principal');
      fotoPrincipalContainer.innerHTML = `
        <div class="contenedor_producto_foto" id="distinto">
          <img src="${fotos[0]}" alt="${producto['nombre producto']}"
               style="width:100%; height:100%; object-fit:cover;">
          ${generarEtiquetaPromo(producto)}
        </div>`;

      // Imágenes auxiliares (miniaturas)
      const fotosAuxiliaresContainers = document.querySelectorAll('.placeholder_foto.auxiliar');
      fotosAuxiliaresContainers.forEach((placeholder, index) => {
        if (fotos[index + 1]) {
          placeholder.innerHTML = `
            <img src="${fotos[index + 1]}" alt="Foto auxiliar ${index + 1}"
                 style="width:100%; height:100%; object-fit:cover; cursor:pointer;">`;
        } else {
          placeholder.style.display = 'none'; // Ocultamos los espacios vacíos
        }
      });

      // ----------------------------------------------------------
      // 🔁 FUNCIÓN: Cambiar imagen principal al hacer clic en una auxiliar
      // ----------------------------------------------------------
      const contenedorFotosAuxiliares = document.getElementById('contenedor_producto_auxiliar');
      contenedorFotosAuxiliares.addEventListener('click', (event) => {
        const clickedImg = event.target.closest('img');
        if (!clickedImg || !event.target.closest('.placeholder_foto.auxiliar')) return;

        const imgPrincipal = fotoPrincipalContainer.querySelector('img');
        const srcPrincipalActual = imgPrincipal.src;
        const srcAuxiliarClickeada = clickedImg.src;

        // Intercambiamos las imágenes (efecto swap)
        imgPrincipal.src = srcAuxiliarClickeada;
        clickedImg.src = srcPrincipalActual;
      });
      // --- después de crear `fotoPrincipalContainer` y de poblar las auxiliares ---
      const imgPrincipal = fotoPrincipalContainer.querySelector('img');
      const auxImgs = [...document.querySelectorAll('.placeholder_foto.auxiliar img')]
        .filter(Boolean); // solo las que existen/visibles

      // transición suave al cambiar
      imgPrincipal.style.transition = 'opacity .25s ease';

      // 1) Click en MINIs: ya tenés el swap, lo mantenemos tal cual
      // (tu listener de contenedor_producto_auxiliar ya hace el intercambio)

      // 2) Click en PRINCIPAL: intercambia con una secundaria y rota
      let siguienteIdx = 0;
      imgPrincipal.addEventListener('click', () => {
        if (!auxImgs.length) return;

        const target = auxImgs[siguienteIdx];
        if (!target || !target.src) return;

        // fade-out breve
        imgPrincipal.style.opacity = 0;

        setTimeout(() => {
          // swap de src entre principal y la auxiliar elegida
          const temp = imgPrincipal.src;
          imgPrincipal.src = target.src;
          target.src = temp;

          // fade-in
          imgPrincipal.style.opacity = 1;

          // avanza el puntero (rota por las auxiliares)
          siguienteIdx = (siguienteIdx + 1) % auxImgs.length;
        }, 150);
      });


      // ----------------------------------------------------------
      // 📏 LISTA DE TALLES DISPONIBLES
      // ----------------------------------------------------------
      const listaTalles = document.getElementById('cuarados_talles');
      const tallesPosibles = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

      // Solo mostramos los talles que tengan stock > 0
      const tallesDisponiblesHTML = tallesPosibles
        .filter(talle => producto[talle] && Number(producto[talle]) > 0)
        .map(talle => `<li class="talle"><p>${talle}</p></li>`)
        .join('');

      listaTalles.innerHTML = tallesDisponiblesHTML;

      // ----------------------------------------------------------
      // 🧠 FUNCIÓN: cargar productos recomendados por categoría
      // ----------------------------------------------------------
      async function cargarRecomendados(categoria) {
        try {
          const response = await fetch(`${API_BASE_URL}/hoja2/categoria/${categoria}`);
          const { ok, data } = await response.json();

          if (ok && data.length > 0) {
            generarCarrusel(data); // Llenamos el carrusel con los productos de la categoría
          } else {
            console.log('No se encontraron productos para esta categoría.');
          }
        } catch (error) {
          console.error('Error al cargar productos recomendados:', error);
        }
      }

      // Ejecutamos la carga de recomendados
      cargarRecomendados(producto["categoria"]);
    } else {
      console.error('Producto no encontrado con el ID proporcionado.');
    }

    // ----------------------------------------------------------
    // 💲 GENERAR PRECIO FINAL CON O SIN PROMO
    // ----------------------------------------------------------
    if (promoActiva) {
      // Si hay promoción activa, mostramos ambos precios
      const precioOriginalHTML = `<span class="precio-original-tachado">${formatearPrecio(producto.precio)}</span>`;
      const precioPromoHTML = `
        <div class="precio-promo-wrapper">
          <h1 class="precio" id="precio-final">${formatearPrecio(0)}</h1>
          <span class="etiqueta-descuento">${producto.promo} OFF</span>
        </div>`;
      precioHTML = `<div class="precio-contenedor-moderno">${precioOriginalHTML}${precioPromoHTML}</div>`;
    } else {
      // Sin promo: solo el precio normal
      precioHTML = `<h1 class="precio">${formatearPrecio(producto.precio)}</h1>`;
    }

    // Insertamos el precio generado en el DOM
    precioContainer.innerHTML = precioHTML;

    // Si hay promo, animamos el número (efecto “máquina tragamonedas”)
    if (promoActiva) {
      const elementoPrecioFinal = document.getElementById('precio-final');
      setTimeout(() => {
        animarPrecio(elementoPrecioFinal, precioConPromo);
      }, 50);
    }
    // 🔹 Comentario editorial / reseña
    if (producto.reseña && producto.reseña.trim() !== "") {
      const comentarioDiv = document.getElementById('comentario_editorial');
      comentarioDiv.innerHTML = `<p class="product-quote">“${producto.reseña.trim()}”</p>`;
    } else {
      document.getElementById('comentario_editorial').style.display = "none";
    }


  } catch (error) {
    console.error('Error al cargar datos:', error);
  } finally {
    // Siempre ocultamos el loader al terminar
    loader?.classList.add("hidden");
  }
}

// --------------------------------------------------------------
// 🎰 ANIMACIÓN DE PRECIO (efecto máquina tragamonedas)
// --------------------------------------------------------------
function animarPrecio(elemento, precioFinal, duracion = 800) {
  let contador = 0;
  const intervalo = 40; // Velocidad de los “frames”
  const formateador = (valor) => formatearPrecio(valor);

  const animacion = setInterval(() => {
    contador += intervalo;

    // Genera un número aleatorio mientras “rueda”
    const valorAleatorio = Math.random() * precioFinal * 1.5;
    elemento.textContent = formateador(valorAleatorio);

    // Cuando termina la duración, fijamos el precio real
    if (contador >= duracion) {
      clearInterval(animacion);
      elemento.textContent = formateador(precioFinal);
    }
  }, intervalo);
}

// --------------------------------------------------------------
// 💰 FORMATEADOR DE PRECIOS EN PESOS ARGENTINOS
// --------------------------------------------------------------
function formatearPrecio(valor) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
  }).format(valor);
}

// --------------------------------------------------------------
// 🧩 INICIALIZACIÓN AUTOMÁTICA AL CARGAR COMPONENTES
// --------------------------------------------------------------
// Se ejecuta cuando todos los componentes HTML se hayan cargado
window.addEventListener(
  "components:ready",
  () => {
    if (document.getElementById("loader")) {
      cargarProductoIndividual();
    }
  },
  { once: true }
);

// En caso de que los componentes ya estén cargados, lo ejecutamos igual
if (document.getElementById("loader")) {
  cargarProductoIndividual();
}
