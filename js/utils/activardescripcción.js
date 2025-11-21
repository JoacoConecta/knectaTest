document.addEventListener('DOMContentLoaded', function() {
    const descripcionToggle = document.getElementById('descripcion');
    if (descripcionToggle) {
        descripcionToggle.addEventListener('click', function() {
            // Alterna la clase 'active' en el contenedor principal
            this.classList.toggle('active');
        });
    }
});
