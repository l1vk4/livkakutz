// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de Livka Kutz cargada correctamente');
    
    // Cargar datos desde el archivo JSON
    cargarDatos();
});

// Función para cargar los datos desde datos.json
function cargarDatos() {
    fetch('datos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo datos.json');
            }
            return response.json();
        })
        .then(data => {
            cargarGaleria(data.proyectos);
        })
        .catch(error => {
            console.error('Error al cargar los datos:', error);
            // Si falla, cargar imágenes por defecto
            cargarGaleriaDefault();
        });
}

// Función para cargar la galería con las imágenes del JSON
function cargarGaleria(proyectos) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Limpiar galería
    
    proyectos.forEach(proyecto => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        
        galleryItem.innerHTML = `
            <img src="${proyecto.imagen}" alt="${proyecto.titulo}" loading="lazy">
            <div class="gallery-overlay">
                <p class="gallery-text">${proyecto.textoOverlay}</p>
            </div>
        `;
        
        // Añadir evento click para navegar a la página del proyecto
        galleryItem.addEventListener('click', function() {
            console.log('Proyecto seleccionado:', proyecto.titulo);
            window.location.href = proyecto.paginaUrl;
        });
        
        gallery.appendChild(galleryItem);
    });
}

// Función de respaldo si no se puede cargar el JSON
function cargarGaleriaDefault() {
    const gallery = document.getElementById('gallery');
    const imagenesDefault = [
        { url: 'fotos/bioglow.webp', alt: 'Bioglow', texto: 'Bioglow: textil iridiscente', pagina: 'proyecto-bioglow.html' },
        { url: 'fotos/brandbook.webp', alt: 'Brand Book', texto: 'Brandbook Client Metrica', pagina: 'proyecto-brandbook.html' },
        { url: 'fotos/ultika.webp', alt: 'Ultika', texto: 'Ultika: biomaterial aislante', pagina: 'proyecto-ultika.html' },
        { url: 'fotos/Kaiko.webp', alt: 'Kaiko', texto: 'Kaiko: diseño textil sostenible', pagina: 'proyecto-kaiko.html' },
        { url: 'fotos/afiche.webp', alt: 'Afiche', texto: 'Afiche tipográfico', pagina: 'proyecto-afiche.html' },
        { url: 'fotos/shelly.webp', alt: 'Seacure', texto: 'Seacure: packaging secundario', pagina: 'proyecto-seacure.html' },
        { url: 'fotos/flip.webp', alt: 'Modelado 3D', texto: 'Nokia: modelado 3D', pagina: 'proyecto-nokia.html' },
        { url: 'fotos/lanyard.webp', alt: 'Lanyard', texto: 'Lanyard corporativo para Cumplo', pagina: 'proyecto-lanyard.html' }
    ];
    
    imagenesDefault.forEach(imagen => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `
            <img src="${imagen.url}" alt="${imagen.alt}" loading="lazy">
            <div class="gallery-overlay">
                <p class="gallery-text">${imagen.texto}</p>
            </div>
        `;
        
        galleryItem.addEventListener('click', function() {
            window.location.href = imagen.pagina;
        });
        
        gallery.appendChild(galleryItem);
    });
}
