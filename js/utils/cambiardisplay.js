
// Clicks del switcher "como antes", pero con DELEGACIÓN y mapeo 3/4/6
document.addEventListener('click', (e) => {
  const opcion = e.target.closest('.selector-columnas .opcion');
  if (!opcion) return;

  // si algo por arriba llama preventDefault/stopPropagation, capturamos igual:
}, true);

document.addEventListener('click', (e) => {
  const opcion = e.target.closest('.selector-columnas .opcion');
  if (!opcion) return;
  e.preventDefault();

  console.log('sisis', opcion.dataset.cols);

  const cols = parseInt(opcion.dataset.cols, 10); // ahora 3,4,6
  const carrusel = document.querySelector('.carrusel');
  if (!carrusel) return console.warn('No se encontró .carrusel');

  // Mapeo de min-width (grid) por columnas
  const porcentajes = {
    3: '28%',
    4: '22%',
    6: '15%'
  };
  const porcentaje = porcentajes[cols] || '20%';
  // Misma idea que tu versión "de antes"
  carrusel.style.display = 'grid';
  carrusel.style.gridTemplateColumns = `repeat(auto-fit, minmax(${porcentaje}, 1fr))`;
}, false);
