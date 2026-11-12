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
    2: { color: '#0A2A6B', recuadro: 'fotos/clientmetrica-marca.jpeg', fondo: 'fotos/clientmetrica-hero.jpg' },
    3: { color: '#6A2FD0' },
    4: { color: '#0F6B5C', recuadro: 'fotos/muestrario.webp' },
    5: { color: '#21403F', recuadro: 'fotos/dactilar-web-1.webp' },
    6: { color: '#9E1B1B', recuadro: 'fotos/procine-logo-oscuro.jpg' },
    7: { color: '#1F8A4C', recuadro: 'fotos/cumplo-fotos.webp' },
    8: { color: '#A3440F', recuadro: 'fotos/explicacion.webp' },
    9: { color: '#5B3A8C', recuadro: 'fotos/total1.webp' },
    10: { color: '#0E5A8A', recuadro: 'fotos/vistas.webp' }
};

// Proporción (ancho / alto) de cada imagen, para diagramar sin recortar nada.
const PROPORCION = {
    'fotos/orbita-poster.png': 0.562,
    'fotos/orbita.jpg': 0.75,
    'fotos/orbita-museografia.png': 1.288,
    'fotos/orbita-mapa-1.jpg': 2.099,
    'fotos/orbita-mapa-2.jpg': 2.15,
    'fotos/kaiko.webp': 0.73,
    'fotos/total1.webp': 0.73,
    'fotos/total2.webp': 0.73,
    'fotos/detalle1.webp': 0.73,
    'fotos/detalle2.webp': 0.75,
    'fotos/clientmetrica-marca.jpeg': 1.778,
    'fotos/dactilar-logo.png': 0.989,
    'fotos/dactilar-web-1.webp': 2.123,
    'fotos/dactilar-web-2.webp': 2.121,
    'fotos/procine-logo-claro.jpg': 1.417,
    'fotos/procine-logo-oscuro.jpg': 1.417,
    'fotos/cumplo-fotos.webp': 4.076
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
        detalles: { ...p.detalles, media: p.detalles.media.map((m) => ({ ...m, src: limpia(m.src), ...(m.poster ? { poster: limpia(m.poster) } : {}) })) },
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
                <span class="fila__flecha" aria-hidden="true">↗\uFE0E</span>
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
        ? `<video src="${ruta(m.src)}" ${m.poster ? `poster="${ruta(m.poster)}"` : ''} muted loop playsinline preload="metadata" controls aria-label="${escapar(m.alt)}" style="aspect-ratio:${proporcion}"></video>`
        : `<img src="${ruta(m.src)}" alt="${escapar(m.alt)}" style="aspect-ratio:${proporcion}" loading="lazy">`;
    return `
        <figure style="flex:${proporcion} 1 0">
            <div class="pieza" data-reveal="desenfoque">${medio}</div>
            <figcaption>${T.fig} ${dosDigitos(n)} — ${escapar(m.alt)}</figcaption>
        </figure>`;
}

// Mosaico estilo Studio Feixen: las piezas se acomodan una tras otra en columnas, cada una con su
// propia proporción (nada se recorta, esquinas rectas). De vez en cuando se reserva un hueco con la
// forma de una pieza y se deja vacío. Las piezas horizontales ocupan dos columnas.
function htmlMosaico(medios, plan, opciones, fijo) {
    const piezas = medios.map((m, i) => {
        const w = m.w || (m.tipo === 'video' ? 16 : 1000), h = m.h || (m.tipo === 'video' ? 9 : 1000 / (PROPORCION[m.src] || PROPORCION_POR_DEFECTO));
        const medio = m.tipo === 'video'
            ? `<video src="${ruta(m.src)}" ${m.poster ? `poster="${ruta(m.poster)}"` : ''} muted loop playsinline preload="metadata" controls aria-label="${escapar(m.alt)}"></video>`
            : `<img src="${ruta(m.src)}" alt="${escapar(m.alt)}" width="${w}" height="${h}" loading="lazy">`;
        return `<figure class="mosaico__item" data-w="${w}" data-h="${h}" data-reveal="desenfoque">${medio}</figure>`;
    });
    const o = opciones || {};
    return `<div class="mosaico"${plan ? ` data-plan='${JSON.stringify(plan)}'` : ''}${o.columnas ? ` data-columnas="${o.columnas}"` : ''}${o.sinAncho ? ' data-sin-ancho' : ''}${o.semilla ? ` data-semilla="${o.semilla}"` : ''}${fijo ? ` data-fijo='${JSON.stringify(fijo)}'` : ''}>${piezas.join('')}</div>`;
}

function maquetarMosaico(contenedor) {
    const ancho = contenedor.clientWidth;
    if (!ancho) return;
    const fija = Number(contenedor.dataset.columnas) || 0;
    const columnas = fija ? (ancho > 640 ? fija : 2) : (ancho > 1000 ? 4 : ancho > 640 ? 3 : 2);
    const sinAncho = 'sinAncho' in contenedor.dataset;
    const hueco = Math.round(Math.min(14, Math.max(8, window.innerWidth * 0.01)));
    if (contenedor.dataset.plan && ancho > 1000) { maquetarPlan(contenedor, ancho, hueco); return; }
    if (contenedor.dataset.fijo && maquetarFijo(contenedor, ancho, hueco)) return;
    const col = (ancho - (columnas - 1) * hueco) / columnas;
    const alto = new Array(columnas).fill(0);
    const cola = [...contenedor.children].map((el) => {
        const w = Number(el.dataset.w), h = Number(el.dataset.h);
        return { el, ratio: w / h, ancha: !sinAncho && w / h >= 1.5 && columnas > 1 };
    });
    const colocar = (it, desde, tramo, y) => {
        const wpx = col * tramo + hueco * (tramo - 1), hpx = wpx / it.ratio;
        Object.assign(it.el.style, { left: desde * (col + hueco) + 'px', top: y + 'px', width: wpx + 'px', height: hpx + 'px' });
        for (let c = desde; c < desde + tramo; c++) alto[c] = y + hpx + hueco;
    };
    const masBaja = () => alto.indexOf(Math.min(...alto));
    let normales = 0, ultimoHueco = 0;
    const recientes = [];
    // azar con semilla: siempre se ve igual en cada visita, pero sin patrón repetido
    let estado = (Number(contenedor.dataset.semilla) || 1) * 2654435761 >>> 0;
    const azar = () => { estado = (estado + 0x6D2B79F5) >>> 0; let t = estado; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const conHuecos = columnas >= 3 || (fija && ancho > 640);
    while (cola.length) {
        const it = cola.shift();
        if (it.ancha) {
            // mejor par de columnas contiguas; si queda un desnivel grande, se rellena antes con una pieza vertical
            let mejor = 0, costo = Infinity;
            for (let c = 0; c + 1 < columnas; c++) { const k = Math.max(alto[c], alto[c + 1]) + Math.abs(alto[c] - alto[c + 1]) * 0.5; if (k < costo) { costo = k; mejor = c; } }
            let guardia = 4;
            while (guardia-- > 0 && Math.abs(alto[mejor] - alto[mejor + 1]) > col * 0.3) {
                const k = cola.findIndex((x) => !x.ancha);
                if (k < 0 || k > 3) break;
                const rellena = cola.splice(k, 1)[0];
                const c = alto[mejor] < alto[mejor + 1] ? mejor : mejor + 1;
                colocar(rellena, c, 1, alto[c]);
            }
            colocar(it, mejor, 2, Math.max(alto[mejor], alto[mejor + 1]));
            continue;
        }
        normales += 1;
        // hueco vacío: en una columna al azar (que no sea de las dos últimas con hueco) y de altura variable
        if (conHuecos && normales >= 4 && normales - ultimoHueco >= 2 && azar() < 0.34) {
            const libres = [...alto.keys()].filter((k) => !recientes.includes(k));
            const c = libres[Math.floor(azar() * libres.length)];
            alto[c] += (col / it.ratio) * (0.6 + azar() * 0.9) + hueco;
            recientes.push(c); if (recientes.length > 2) recientes.shift();
            ultimoHueco = normales;
        }
        const c = masBaja();
        colocar(it, c, 1, alto[c]);
    }
    contenedor.style.height = Math.max(...alto) - hueco + 'px';
}

// Composición dibujada a mano para pantallas grandes: 6 columnas. Cada entrada es
// [pieza, columna, columnas que ocupa, desplazamiento vertical] o ["v", columna, columnas, proporción]
// para dejar un hueco vacío. Las piezas bajan hasta apoyarse en lo que tienen arriba.
function maquetarPlan(contenedor, ancho, hueco) {
    const N = 6, col = (ancho - (N - 1) * hueco) / N;
    const alto = new Array(N).fill(0);
    const piezas = [...contenedor.children];
    piezas.forEach((el) => { el.style.display = 'none'; });
    JSON.parse(contenedor.dataset.plan).forEach(([pieza, c, tramo, extra]) => {
        const wpx = col * tramo + hueco * (tramo - 1);
        let y = Math.max(...alto.slice(c, c + tramo));
        let hpx;
        if (pieza === 'v') {
            hpx = wpx / extra;
        } else {
            const el = piezas[pieza];
            hpx = wpx / (Number(el.dataset.w) / Number(el.dataset.h));
            y += (extra || 0) * col;
            el.style.display = '';
            Object.assign(el.style, { left: c * (col + hueco) + 'px', top: y + 'px', width: wpx + 'px', height: hpx + 'px' });
        }
        for (let k = c; k < c + tramo; k++) alto[k] = y + hpx + hueco;
    });
    contenedor.style.height = Math.max(...alto) - hueco + 'px';
}

// Posiciones fijas por pieza: [pieza, columna, columnas que ocupa, posición vertical en anchos de columna].
// Lo que no aparece en la lista queda en blanco. Solo en pantallas anchas; en pantallas chicas se acomoda solo.
function maquetarFijo(contenedor, ancho, hueco) {
    const { n, items } = JSON.parse(contenedor.dataset.fijo);
    if (ancho <= (n >= 4 ? 1000 : 640)) return false;
    const col = (ancho - (n - 1) * hueco) / n;
    const piezas = [...contenedor.children];
    piezas.forEach((el) => { el.style.display = 'none'; });
    let fondo = 0;
    items.forEach(([i, c, tramo, y]) => {
        const el = piezas[i];
        const wpx = col * tramo + hueco * (tramo - 1);
        const hpx = wpx / (Number(el.dataset.w) / Number(el.dataset.h));
        el.style.display = '';
        Object.assign(el.style, { left: c * (col + hueco) + 'px', top: y * col + 'px', width: wpx + 'px', height: hpx + 'px' });
        fondo = Math.max(fondo, y * col + hpx);
    });
    contenedor.style.height = fondo + 'px';
    return true;
}

let mosaicoPendiente = 0;
function activarMosaicos() {
    const todos = document.querySelectorAll('.mosaico');
    if (!todos.length) return;
    const hacer = () => todos.forEach(maquetarMosaico);
    hacer();
    window.addEventListener('resize', () => {
        cancelAnimationFrame(mosaicoPendiente);
        mosaicoPendiente = requestAnimationFrame(() => { hacer(); if (window.ScrollTrigger) ScrollTrigger.refresh(); });
    });
}

function htmlGaleria(medios) {
    const piezas = medios.map((m) => ({
        m, proporcion: m.w && m.h ? m.w / m.h : (m.tipo === 'video' ? 1.778 : (PROPORCION[m.src] || PROPORCION_POR_DEFECTO))
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

// ---------- Secciones con aire (Microcine, Pro Cine, Cumplo) ----------
// Cada grupo de piezas es una sección con título, texto breve y mucho espacio en blanco.
// "columnas": piezas en columnas con altura escalonada. "riel": carrusel horizontal con scroll.
function htmlItem(it, n) {
    return `
        <figure class="post">
            <div class="pieza" data-reveal="desenfoque"><img src="${ruta(it.src)}" alt="${escapar(it.alt)}" width="${it.w}" height="${it.h}" loading="lazy"></div>
            <figcaption><span>${dosDigitos(n)}</span> ${escapar(it.alt)}</figcaption>
        </figure>`;
}

function htmlSecciones(secciones) {
    return secciones.map((s, i) => {
        const piezas = s.items.map((it, k) => htmlItem(it, k + 1)).join('');
        const cuerpo = s.layout === 'riel'
            ? `<div class="riel" data-reveal="fade">
                   <div class="riel__pista" tabindex="0" aria-label="${escapar(s.titulo)}">${piezas}</div>
                   <div class="riel__ctrl meta">
                       <span>${dosDigitos(s.items.length)} ${LANG === 'en' ? 'slides' : 'láminas'} · ${LANG === 'en' ? 'scroll' : 'desliza'} →</span>
                       <span class="riel__botones"><button type="button" data-riel="-1" aria-label="${LANG === 'en' ? 'Previous' : 'Anterior'}">←</button><button type="button" data-riel="1" aria-label="${LANG === 'en' ? 'Next' : 'Siguiente'}">→</button></span>
                   </div>
               </div>`
            : `<div class="cols" style="--cols:${s.cols || 3}">${piezas}</div>`;
        return `
        <section class="seccion">
            <header class="seccion__cab" data-reveal="fade">
                <span class="seccion__num meta">${dosDigitos(i + 1)}</span>
                <h3 class="seccion__titulo">${escapar(s.titulo)}</h3>
                <p class="seccion__texto">${escapar(s.texto)}</p>
            </header>
            ${cuerpo}
        </section>`;
    }).join('');
}

function activarRieles() {
    document.querySelectorAll('.riel').forEach((riel) => {
        const pista = riel.querySelector('.riel__pista');
        riel.querySelectorAll('[data-riel]').forEach((b) => b.addEventListener('click', () => {
            pista.scrollBy({ left: Number(b.dataset.riel) * pista.clientWidth * 0.7, behavior: 'smooth' });
        }));
    });
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

    const galeria = p.detalles.secciones
        ? htmlSecciones(p.detalles.secciones)
        : p.galeria === 'mosaico'
            ? `<section class="galeria galeria--mosaico">${htmlMosaico(p.detalles.media, p.composicion, { ...(p.mosaico || {}), semilla: p.id }, p.fijo)}</section>`
            : `<section class="galeria${p.galeria === 'aire' ? ' galeria--aire' : ''}${p.esquinas === 'rectas' ? ' galeria--recta' : ''}">${htmlGaleria(p.detalles.media.filter((m) => m.src !== d.logo))}</section>`;   // el logo va junto al título

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

        ${galeria}

        ${d.memoria ? `<a class="caso__memoria" href="${d.memoria}" target="_blank" rel="noopener noreferrer">${T.memoria}</a>` : ''}

        <section class="siguiente">
            <a class="siguiente__volver" href="index.html#indice">${T.volver}</a>
            <a class="siguiente__boton" href="${urlProyecto(siguiente)}" aria-label="${T.siguienteDe}${escapar(siguiente.titulo)}">${T.siguiente} <span aria-hidden="true">→</span></a>
        </section>`;
    activarRieles();
    activarMosaicos();
    activarVideos();
}

// Los videos se reproducen solo mientras están a la vista (hay varios en una misma página)
function activarVideos() {
    const videos = document.querySelectorAll('.galeria video');
    if (!videos.length || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver((entradas) => {
        entradas.forEach((e) => { if (e.isIntersecting) e.target.play().catch(() => {}); else e.target.pause(); });
    }, { threshold: 0.45 });
    videos.forEach((v) => obs.observe(v));
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
    // el ancla #indice se calcula antes de que exista el contenido: se re-aplica al terminar de renderizar
    if (location.hash === '#indice') {
        const destino = document.getElementById('indice');
        if (destino) requestAnimationFrame(() => destino.scrollIntoView());
    }
    // motion.js escucha este evento para animar también lo que se generó con JS
    document.dispatchEvent(new CustomEvent('contenido:listo'));
});
