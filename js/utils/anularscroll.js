const container = document.querySelector('.slide');
const sensitivity = 1.9;
const THRESH = 6; // px para considerar "arrastre real"

let isDown = false;
let moved = false;
let startX = 0;
let scrollStart = 0;

function swallowOnce(e) {
  e.preventDefault();
  e.stopImmediatePropagation();
}

// mousedown: NO activamos .dragging aún
container.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return; // solo botón izquierdo
  isDown = true;
  moved = false;
  startX = e.pageX;
  scrollStart = container.scrollLeft;
});

// mousemove: si supera umbral -> ahora sí activamos .dragging y scrolleamos
document.addEventListener('mousemove', (e) => {
  if (!isDown) return;
  const dx = (e.pageX - startX) * sensitivity;

  if (!moved && Math.abs(dx) > THRESH) {
    moved = true;
    container.classList.add('dragging');
  }

  if (moved) {
    container.scrollLeft = scrollStart - dx;
  }
});

// mouseup: si hubo drag real, anulamos SOLO el siguiente click; siempre reseteamos
document.addEventListener('mouseup', () => {
  if (!isDown) return;

  if (moved) {
    // anula 1 click inmediatamente posterior al drag
    container.addEventListener('click', swallowOnce, true);
    setTimeout(() => {
      container.removeEventListener('click', swallowOnce, true);
    }, 0);
  }

  isDown = false;
  moved = false;
  container.classList.remove('dragging');
});

// ------------------------------------------------------------
// 🎯 Navegación con botones del carrusel
// ------------------------------------------------------------

// Distancia a desplazar por clic (en px)
const SCROLL_STEP = container.clientWidth * 0.8; // 80% del ancho visible

// Referencias a los botones
const btnPrev = document.querySelector('.boton-carrusel.prev');
const btnNext = document.querySelector('.boton-carrusel.next');

// Función genérica de desplazamiento
function scrollByAmount(amount) {
  container.scrollBy({
    left: amount,
    behavior: 'smooth',
  });
}

// Event listeners
if (btnPrev) {
  btnPrev.addEventListener('click', () => {
    scrollByAmount(-SCROLL_STEP);
  });
}

if (btnNext) {
  btnNext.addEventListener('click', () => {
    scrollByAmount(SCROLL_STEP);
  });
}
