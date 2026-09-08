// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Livka Kutz page loaded successfully');

    // Load data from the JSON file
    cargarDatos();
});

// Function to load data from datos.json
function cargarDatos() {
    fetch('datos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Could not load datos.json');
            }
            return response.json();
        })
        .then(data => {
            cargarGaleria(data.proyectos);
        })
        .catch(error => {
            console.error('Error loading data:', error);
            // Fallback to default images if it fails
            cargarGaleriaDefault();
        });
}

// Function to build the gallery from the JSON data
function cargarGaleria(proyectos) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Clear gallery

    proyectos.forEach(proyecto => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';

        galleryItem.innerHTML = `
            <img src="${proyecto.imagen}" alt="${proyecto.titulo}" loading="lazy">
            <div class="gallery-overlay">
                <p class="gallery-text">${proyecto.textoOverlay}</p>
            </div>
        `;

        // Navigate to the project page on click
        galleryItem.addEventListener('click', function() {
            console.log('Project selected:', proyecto.titulo);
            window.location.href = proyecto.paginaUrl;
        });

        gallery.appendChild(galleryItem);
    });
}

// Fallback function if the JSON can't be loaded
function cargarGaleriaDefault() {
    const gallery = document.getElementById('gallery');
    const imagenesDefault = [
        { url: '../fotos/orbita-poster.png', alt: 'Órbita', texto: 'Órbita: algorithmic literacy', pagina: 'proyecto-orbita.html' },
        { url: '../fotos/bioglow.webp', alt: 'Bioglow', texto: 'Bioglow: iridescent textile', pagina: 'proyecto-bioglow.html' },
        { url: '../fotos/brandbook.webp', alt: 'Brand Book', texto: 'Client Metrica Brandbook', pagina: 'proyecto-brandbook.html' },
        { url: '../fotos/ultika.webp', alt: 'Ultika', texto: 'Ultika: insulating biomaterial', pagina: 'proyecto-ultika.html' },
        { url: '../fotos/kaiko.webp', alt: 'Kaiko', texto: 'Kaiko: sustainable textile design', pagina: 'proyecto-kaiko.html' },
        { url: '../fotos/shelly.webp', alt: 'Seacure', texto: 'Seacure: secondary packaging', pagina: 'proyecto-seacure.html' },
        { url: '../fotos/flip.webp', alt: '3D Modeling', texto: 'Nokia: 3D modeling', pagina: 'proyecto-nokia.html' },
        { url: '../fotos/lanyard.webp', alt: 'Lanyard', texto: 'Corporate lanyard for Cumplo', pagina: 'proyecto-lanyard.html' }
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
