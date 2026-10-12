// ==========================================================
// Datos y render de la nueva versión.
// El contenido sale de datos.json (sin cambios); aquí solo se
// agregan datos de diseño: color de cada tarjeta, imagen del
// recuadro y enlaces extra.
// ==========================================================

// Ruta hacia la raíz del sitio. En nueva-version/ es "../";
// al publicar la versión final en la raíz pasa a ser "".
const BASE = document.documentElement.dataset.base || '';
const DATOS = document.documentElement.dataset.datos || 'datos.json';
const LANG = document.documentElement.lang === 'en' ? 'en' : 'es';

const TEXTOS = {
    es: { volver: '← Todo el trabajo', overview: 'Overview.', hice: 'Lo que hice.', memoria: 'Ver memoria completa →',
          siguiente: 'Siguiente proyecto', siguienteDe: 'Siguiente proyecto: ', fig: 'Fig.', proyecto: 'Ver proyecto',
          xai: 'Inteligencia Artificial Explicable (XAI)' },
    en: { volver: '← All work', overview: 'Overview.', hice: 'What I did.', memoria: 'Read the full thesis →',
          siguiente: 'Next project', siguienteDe: 'Next project: ', fig: 'Fig.', proyecto: 'View project',
          xai: 'Explainable Artificial Intelligence (XAI)' }
};
const T = TEXTOS[LANG];

const DISENO = {
    1: { color: '#2B2BD9', recuadro: 'fotos/orbita-poster.png', fondo: 'fotos/orbita.jpg',
         logo: 'fotos/orbita-logo.jpg',
         // descripción del índice del Home
         indice: {
             es: 'Instalación museográfica interactiva que traduce con el cuerpo cómo funcionan los sistemas de recomendación musical',
             en: 'Interactive museographic installation that translates, through the body, how music recommendation systems work'
         },
         titular: {
             es: 'Instalación museográfica interactiva sobre sistemas de recomendación musical, con Inteligencia Artificial Explicable (XAI)',
             en: 'Interactive museographic installation on music recommendation systems, with Explainable Artificial Intelligence (XAI)'
         },
         memoria: 'https://drive.google.com/drive/folders/1S9eoYTrULOWLnxuaN559XYsyuXB-ksEt?usp=drive_link' },
    2: { color: '#0F6B5C', recuadro: 'fotos/muestrario.webp' },
    3: { color: '#C21E62', recuadro: 'fotos/colores.webp' },
    4: { color: '#A3440F', recuadro: 'fotos/explicacion.webp' },
    5: { color: '#5B3A8C', recuadro: 'fotos/total1.webp' },
    6: { color: '#0E5A8A', recuadro: 'fotos/mockup.webp' },
    7: { color: '#2E2C29', recuadro: 'fotos/vistas.webp' },
    8: { color: '#6E5300', recuadro: 'fotos/tarjetas.webp' }
};

// Proporción (ancho / alto) de cada imagen, para diagramar sin recortar nada.
const PROPORCION = {
    'fotos/orbita-poster.png': 0.562, 'fotos/orbita.jpg': 0.75, 'fotos/orbita-museografia.png': 1.288,
    'fotos/orbita-mapa-1.jpg': 2.099, 'fotos/orbita-mapa-2.jpg': 2.15,
    'fotos/kaiko.webp': 0.73, 'fotos/total1.webp': 0.73, 'fotos/total2.webp': 0.73,
    'fotos/detalle1.webp': 0.73, 'fotos/detalle2.webp': 0.75
};
const PROPORCION_POR_DEFECTO = 1.948;

const indiceDe = (p) => (p.diseno.indice && p.diseno.indice[LANG]) || p.descripcion;
const titularDe = (p) => (p.diseno.titular && p.diseno.titular[LANG]) || p.descripcion;

const ruta = (src) => BASE + src;
const dosDigitos = (n) => String(n).padStart(2, '0');
const conPunto = (texto) => /[.!?]$/.test(texto) ? texto : texto + '.';
const urlProyecto = (p) => 'proyecto.html?id=' + p.id;

function escapar(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

async function cargarProyectos() {
    const respuesta = await fetch(ruta(DATOS));
    if (!respuesta.ok) throw new Error('No se pudo cargar ' + DATOS);
    const datos = await respuesta.json();
    // en/datos.json trae las rutas como "../fotos/…": se normalizan a "fotos/…"
    const limpia = (src) => src.replace(/^\.\.\//, '');
    return datos.proyectos.map((p) => ({
        ...p,
        imagen: limpia(p.imagen),
        detalles: { ...p.detalles, media: p.detalles.media.map((m) => ({ ...m, src: limpia(m.src) })) },
        diseno: DISENO[p.id] || { color: '#2E2C29' }
    }));
}

// ---------- Home: índice tipográfico ----------
function renderIndice(proyectos) {
    const lista = document.getElementById('indice-lista');
    if (!lista) return;
    lista.innerHTML = proyectos.map((p, i) => `
        <li>
            <a class="fila" href="${urlProyecto(p)}" data-preview="${ruta(p.imagen)}">
                <span class="fila__num">(${dosDigitos(i + 1)})</span>
                <span class="fila__titulo">${escapar(p.titulo)}</span>
                <span class="fila__desc">${escapar(indiceDe(p))}</span>
                <span class="fila__flecha" aria-hidden="true">↗</span>
            </a>
        </li>`).join('');
}

// ---------- Página de proyecto ----------
// Collage inspirado en Studio Nari: mosaico apretado (12 px entre piezas) hecho con
// filas de una o dos piezas. En cada fila, las piezas comparten la misma altura y su
// ancho es proporcional a su forma, así que NADA se recorta. Las filas alternan
// entre alinearse a la izquierda y a la derecha, y las que tienen piezas verticales
// no ocupan todo el ancho (quedan aire y ritmo).
function armarFilas(piezas) {
    const filas = [];
    let i = 0;
    while (i < piezas.length) {
        const actual = piezas[i];
        if (actual.proporcion >= 1.5 && filas.length % 2 === 0) { filas.push([actual]); i += 1; }
        else if (i + 1 < piezas.length) { filas.push([actual, piezas[i + 1]]); i += 2; }
        else { filas.push([actual]); i += 1; }
    }
    return filas;
}

function htmlPieza(m, n, proporcion) {
    const esVideo = m.tipo === 'video';
    const medio = esVideo
        ? `<video src="${ruta(m.src)}" muted loop playsinline autoplay controls aria-label="${escapar(m.alt)}" style="aspect-ratio:${proporcion}"></video>`
        : `<img src="${ruta(m.src)}" alt="${escapar(m.alt)}" style="aspect-ratio:${proporcion}" loading="lazy">`;
    return `
        <figure style="flex:${proporcion} 1 0">
            <div class="pieza" data-reveal="desenfoque">${medio}</div>
            <figcaption>${T.fig} ${dosDigitos(n)} — ${escapar(m.alt)}</figcaption>
        </figure>`;
}

function htmlGaleria(medios) {
    const piezas = medios.map((m) => ({
        m, proporcion: m.tipo === 'video' ? 1.778 : (PROPORCION[m.src] || PROPORCION_POR_DEFECTO)
    }));
    let n = 0;
    return armarFilas(piezas).map((fila, r) => {
        const suma = fila.reduce((t, p) => t + p.proporcion, 0);
        // una sola pieza horizontal ocupa todo el ancho; el resto se limita en altura
        const sola = fila.length === 1;
        const ancho = sola && fila[0].proporcion >= 1.5 ? '100%' : `min(100%, calc(${suma} * 74vh))`;
        const lado = r % 2 === 0 ? '' : 'margin-left:auto;';
        return `<div class="galeria__fila" style="width:${ancho};${lado}">${fila.map((p) => htmlPieza(p.m, ++n, p.proporcion)).join('')}</div>`;
    }).join('');
}

function resaltarXAI(texto) {
    return escapar(texto).replace(T.xai, `<strong class="xai">${T.xai}</strong>`);
}

function renderProyecto(proyectos) {
    const raiz = document.getElementById('caso');
    if (!raiz) return;

    const id = Number(new URLSearchParams(location.search).get('id')) || 1;
    const indice = Math.max(0, proyectos.findIndex((p) => p.id === id));
    const p = proyectos[indice];
    const d = p.diseno;
    const siguiente = proyectos[(indice + 1) % proyectos.length];

    document.title = p.titulo + ' — Livka Kutz';
    const pastilla = document.querySelector('.pill');
    if (pastilla) pastilla.href += location.search;

    const galeria = htmlGaleria(p.detalles.media.filter((m) => m.src !== d.logo));   // el logo va junto al título

    const logo = d.logo ? `<img class="caso__logo" src="${ruta(d.logo)}" alt="Logo ${escapar(p.titulo)}">` : '';

    raiz.innerHTML = `
        <div class="caso__barra">
            <a class="caso__volver" href="index.html#indice">${T.volver}</a>
        </div>

        <h1 class="titulo-brillo caso__titulo"><span class="linea"><span>${escapar(conPunto(p.titulo))}</span></span>${logo}</h1>

        <div class="caso__hero" data-reveal="mascara">
            <span class="tarjeta__fondo"><img src="${ruta(d.fondo || p.imagen)}" alt="${escapar(p.titulo)}"></span>
            <p class="caso__titular">${escapar(conPunto(titularDe(p)))}</p>
        </div>

        <section class="caso__bloque" data-reveal="fade">
            <h2>${T.overview}</h2>
            <p class="caso__overview">${resaltarXAI(p.detalles.overview)}</p>
        </section>

        <section class="caso__bloque" data-reveal="fade">
            <h2>${T.hice}</h2>
            <ul class="caso__specs">${p.detalles.especificaciones.map((e) => `<li>${escapar(e)}</li>`).join('')}</ul>
        </section>

        <section class="galeria">${galeria}</section>

        ${d.memoria ? `<a class="caso__memoria" href="${d.memoria}" target="_blank" rel="noopener noreferrer">${T.memoria}</a>` : ''}

        <section class="siguiente">
            <a class="siguiente__boton" href="${urlProyecto(siguiente)}" aria-label="${T.siguienteDe}${escapar(siguiente.titulo)}">${T.siguiente} <span aria-hidden="true">→</span></a>
        </section>`;
}

// ---------- Arranque ----------
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const proyectos = await cargarProyectos();
        renderIndice(proyectos);
        renderProyecto(proyectos);
    } catch (error) {
        console.error('Error al cargar los datos:', error);
    }
    // motion.js escucha este evento para animar también lo que se generó con JS
    document.dispatchEvent(new CustomEvent('contenido:listo'));
});
