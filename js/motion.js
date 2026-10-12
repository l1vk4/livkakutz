// ==========================================================
// F2 · Motor de movimiento
// Lenis (scroll con inercia) + GSAP/ScrollTrigger.
// - Cortina rosa entre páginas
// - Líneas que suben desde su línea base (.linea > span)
// - Revelado por máscara clip-path + escala interna  [data-reveal="mascara"]
// - Paralaje interno de imágenes                      [data-parallax]
// - Aparición suave                                   [data-reveal="fade"]
// - Preview que sigue al cursor en el índice          [data-preview]
// - Tarjetas apiladas que se hunden al ser cubiertas  .tarjeta
// ==========================================================

const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const raiz = document.documentElement;
const EASE_OUT = 'expo.out';
const EASE_IO = 'power4.inOut';

function mostrarTodoSinAnimar() {
    raiz.classList.remove('js');
}

if (reducido || !window.gsap) {
    mostrarTodoSinAnimar();
} else {
    gsap.registerPlugin(ScrollTrigger);

    // ---------- Scroll con inercia ----------
    let lenis = null;
    if (window.Lenis) {
        lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
    }

    // ---------- Cortina: entrada a la página ----------
    const cortina = document.querySelector('.cortina');
    const salidaCortina = gsap.timeline();
    if (cortina) {
        salidaCortina.fromTo(cortina, { scaleY: 1, transformOrigin: 'top' }, { scaleY: 0, duration: 1, ease: EASE_IO, delay: 0.1 });
    }

    // ---------- Cortina: salida hacia otra página ----------
    document.addEventListener('click', (e) => {
        const enlace = e.target.closest('a[href]');
        if (!enlace || !cortina) return;
        const url = new URL(enlace.href, location.href);
        const mismaPagina = url.pathname === location.pathname && url.search === location.search;
        if (url.origin !== location.origin || enlace.target === '_blank' || mismaPagina
            || e.metaKey || e.ctrlKey || e.shiftKey || url.protocol === 'mailto:') return;
        e.preventDefault();
        gsap.fromTo(cortina, { scaleY: 0, transformOrigin: 'bottom' }, {
            scaleY: 1, duration: 0.7, ease: EASE_IO,
            onComplete: () => { location.href = url.href; }
        });
    });
    // Volver con el botón "atrás" (bfcache): esconder la cortina
    window.addEventListener('pageshow', (e) => { if (e.persisted && cortina) gsap.set(cortina, { scaleY: 0 }); });

    // ---------- Animaciones (se llaman cuando el contenido existe) ----------
    const hechos = new WeakSet();

    function animarLineas() {
        // Títulos de la parte superior: suben al cargar
        document.querySelectorAll('[data-lineas-entrada]').forEach((titulo) => {
            const spans = [...titulo.querySelectorAll('.linea > span')].filter((s) => !hechos.has(s));
            if (!spans.length) return;
            spans.forEach((s) => hechos.add(s));
            gsap.to(spans, { yPercent: 0, y: 0, duration: 1.3, ease: EASE_OUT, stagger: 0.12, delay: 0.55 });
        });
        // Resto de líneas: suben al entrar en pantalla
        document.querySelectorAll('.linea > span').forEach((span) => {
            if (hechos.has(span) || span.closest('[data-lineas-entrada]')) return; hechos.add(span);
            gsap.to(span, { y: 0, duration: 1.2, ease: EASE_OUT, scrollTrigger: { trigger: span.parentElement, start: 'top 90%' } });
        });
    }

    function animarMascaras() {
        document.querySelectorAll('[data-reveal="mascara"]').forEach((el) => {
            if (hechos.has(el)) return; hechos.add(el);
            const media = el.querySelector('img, video');
            const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 88%' } });
            tl.to(el, { clipPath: 'inset(0% 0 0 0)', duration: 1.3, ease: EASE_IO });
            if (media) tl.fromTo(media, { scale: 1.25 }, { scale: 1, duration: 1.8, ease: EASE_OUT }, 0);
        });
    }

    // Estilo Studio Nari: la pieza emerge desde el desenfoque hasta quedar nítida.
    function animarDesenfoque() {
        document.querySelectorAll('[data-reveal="desenfoque"]').forEach((el) => {
            if (hechos.has(el)) return; hechos.add(el);
            const media = el.querySelector('img, video');
            const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 90%' } });
            tl.to(el, { opacity: 1, filter: 'blur(0px)', duration: 1.6, ease: EASE_OUT });
            if (media) tl.fromTo(media, { scale: 1.12 }, { scale: 1, duration: 1.8, ease: EASE_OUT }, 0);
        });
    }

    function animarParalaje() {
        document.querySelectorAll('[data-parallax]').forEach((el) => {
            if (hechos.has(el)) return; hechos.add(el);
            const media = el.querySelector('img, video');
            if (!media) return;
            // envolvemos para no pelear con la escala del revelado
            gsap.fromTo(media, { yPercent: -6 }, {
                yPercent: 6, ease: 'none',
                scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
            });
        });
    }

    function animarFades() {
        document.querySelectorAll('[data-reveal="fade"]').forEach((el) => {
            if (hechos.has(el)) return; hechos.add(el);
            gsap.to(el, { opacity: 1, y: 0, duration: 1.2, ease: EASE_OUT, scrollTrigger: { trigger: el, start: 'top 85%' } });
        });
    }

    function previewCursor() {
        const filas = document.querySelectorAll('.fila[data-preview]');
        if (!filas.length || document.querySelector('.preview-cursor')) return;
        const caja = document.createElement('div');
        caja.className = 'preview-cursor';
        caja.innerHTML = '<img alt="">';
        document.body.appendChild(caja);
        const img = caja.querySelector('img');
        // precarga: así la caja ya conoce el tamaño real de cada imagen al pasar el cursor
        filas.forEach((fila) => { new Image().src = fila.dataset.preview; });
        const xTo = gsap.quickTo(caja, 'x', { duration: 0.8, ease: 'power3' });
        const yTo = gsap.quickTo(caja, 'y', { duration: 0.8, ease: 'power3' });
        const rTo = gsap.quickTo(caja, 'rotation', { duration: 0.8, ease: 'power3' });
        let ultimoX = 0;
        window.addEventListener('mousemove', (e) => {
            xTo(e.clientX + 24);
            yTo(e.clientY - caja.offsetHeight / 2);
            rTo(gsap.utils.clamp(-8, 8, (e.clientX - ultimoX) * 0.4));
            ultimoX = e.clientX;
        });
        filas.forEach((fila) => {
            fila.addEventListener('mouseenter', () => {
                if (img.getAttribute('src') !== fila.dataset.preview) img.src = fila.dataset.preview;
                const marcar = () => caja.classList.toggle('horizontal', img.naturalWidth > img.naturalHeight);
                if (img.complete && img.naturalWidth) marcar(); else img.addEventListener('load', marcar, { once: true });
                caja.classList.add('activo');
            });
            fila.addEventListener('mouseleave', () => caja.classList.remove('activo'));
        });
    }

    function iniciar() {
        animarLineas();
        animarMascaras();
        animarDesenfoque();
        animarParalaje();
        animarFades();
        previewCursor();
        ScrollTrigger.refresh();
    }

    iniciar();                                               // contenido estático del HTML
    document.addEventListener('contenido:listo', iniciar);  // contenido generado desde datos.json
    window.addEventListener('load', () => ScrollTrigger.refresh());
}
