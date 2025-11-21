
// Esperamos a que todo el contenido del HTML esté cargado antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', () => {

    // --- Lógica para el Menú Móvil ---
    const mobileMenuTrigger = document.getElementById('mobile-menu-trigger');
    const mobileMenu = document.getElementById('barra_menu');
    const exitMenuButton = document.getElementById('exit-menu');
    const overlay = document.getElementById('overlay');
    const body = document.body;

    // Función para abrir el menú
    const openMenu = () => {
        mobileMenu.classList.add('visible');
        overlay.classList.add('visible');
        body.classList.add('no-scroll'); // Evita el scroll del fondo
    };

    // Función para cerrar el menú
    const closeMenu = () => {
        mobileMenu.classList.remove('visible');
        overlay.classList.remove('visible');
        body.classList.remove('no-scroll');
    };

    // Asignamos los eventos
    mobileMenuTrigger.addEventListener('click', openMenu);
    exitMenuButton.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu); // También cierra el menú si se hace clic en el overlay


    // --- Lógica para el Menú de Escritorio (Dropdown) ---
    // Nota: El comportamiento de hover para el menú de escritorio ya se maneja 
    // completamente con CSS (:hover). No se necesita JavaScript para la funcionalidad básica,
    // lo que hace el código más rápido y eficiente. Si necesitaras una lógica más compleja,
    // como un pequeño retraso antes de que el menú desaparezca, se podría añadir aquí.
    
    console.log("Header interactivo listo. ✨");

});
    // Desactiva el drag en todos los elementos
    document.addEventListener('dragstart', function(e) {
      e.preventDefault();
    });

    // También aseguramos que los elementos no sean arrastrables
    document.querySelectorAll('*').forEach(el => {
      el.setAttribute('draggable', 'false');
    });

  // Activar submenú en móviles con click
const dropdownToggle = document.querySelector('.dropdown-toggle');
const dropdownMenu = document.querySelector('.dropdown-menu');

dropdownToggle.addEventListener('click', (e) => {
    e.preventDefault(); // Evita que el enlace recargue la página

    // Alternar visibilidad del submenú
    dropdownMenu.classList.toggle('visible');
});
document.addEventListener('click', (e) => {
    if (!dropdownMenu.contains(e.target) && !dropdownToggle.contains(e.target)) {
        dropdownMenu.classList.remove('visible');
    }
});
