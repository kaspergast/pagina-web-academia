document.addEventListener("DOMContentLoaded", () => {
    setFooterYear();
    setupHeaderAfterHero();
    setupMaps();
    setupCorreoLinks();

    // Slider tipo Edge (1 grande, botones/dots, loop suave sin salto)
    setupGallerySlider({ interval: 5200 });

    // Rotación interna por tarjeta (robusta: no se queda en blanco, crea <img> si falta)
    setupGalleryRotatorsPro();
});

/* ====== util ====== */

function setFooterYear() {
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
}

function setupHeaderAfterHero() {
    const header = document.getElementById("mainHeader");
    const hero = document.querySelector(".hero");
    if (!header || !hero) return;

    function onScroll() {
        const heroHeight = hero.offsetHeight || 0;
        if (window.scrollY > heroHeight - 120) header.classList.add("show");
        else header.classList.remove("show");
    }

    window.addEventListener("scroll", onScroll);
    onScroll();
}

function setupMaps() {
    const mapsBtn = document.getElementById("mapsBtn");
    const toggleMapBtn = document.getElementById("toggleMapBtn");
    const mapContainer = document.getElementById("mapContainer");
    const mapFrame = document.getElementById("mapFrame");
    if (!mapsBtn || !toggleMapBtn || !mapContainer || !mapFrame) return;

    // Si no tienes coordenadas exactas, deja 0 y usa dirección
    const LAT = 0;
    const LNG = 0;

    const ADDRESS = "CEA FORMAMOS, Entrada de Villamaría, Villamaría, Caldas, Colombia";
    const hasCoords = (LAT !== 0 && LNG !== 0);

    const mapsSearchUrl = hasCoords
        ? `https://www.google.com/maps?q=${LAT},${LNG}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`;

    const mapsEmbedUrl = hasCoords
        ? `https://www.google.com/maps?q=${LAT},${LNG}&z=17&output=embed`
        : `https://www.google.com/maps?q=${encodeURIComponent(ADDRESS)}&z=17&output=embed`;

    mapsBtn.href = mapsSearchUrl;
    mapsBtn.target = "_blank";
    mapsBtn.rel = "noopener";

    toggleMapBtn.addEventListener("click", () => {
        const isOpen = mapContainer.classList.contains("open");
        if (isOpen) {
            mapContainer.classList.remove("open");
            mapContainer.setAttribute("aria-hidden", "true");
            mapFrame.src = "";
        } else {
            mapContainer.classList.add("open");
            mapContainer.setAttribute("aria-hidden", "false");
            mapFrame.src = mapsEmbedUrl;
        }
    });
}

function setupCorreoLinks() {
    const links = document.querySelectorAll(".correo-link[data-gmail-to]");
    links.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();

            const to = link.getAttribute("data-gmail-to");
            const subject = "Información sobre cursos";
            const gmailURL =
                `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}`;
            const mailtoURL =
                `mailto:${to}?subject=${encodeURIComponent(subject)}`;

            const w = window.open(gmailURL, "_blank");

            setTimeout(() => {
                if (!w || w.closed || typeof w.closed === "undefined") {
                    window.location.href = mailtoURL;
                }
            }, 500);
        });
    });
}

/* ==============================
   Slider tipo Edge (loop suave)
============================== */

function setupGallerySlider({ interval = 5200 } = {}) {
    const slider = document.getElementById("gallerySlider");
    if (!slider) return;

    const track = slider.querySelector(".gs-track");
    const viewport = slider.querySelector(".gs-viewport");
    const btnPrev = slider.querySelector(".gs-btn.prev");
    const btnNext = slider.querySelector(".gs-btn.next");
    const dotsWrap = slider.querySelector(".gs-dots");
    const realSlides = Array.from(slider.querySelectorAll(".gs-slide"));

    if (!track || !viewport || realSlides.length < 2) return;

    // clones para loop sin salto
    const firstClone = realSlides[0].cloneNode(true);
    const lastClone = realSlides[realSlides.length - 1].cloneNode(true);
    firstClone.classList.add("is-clone");
    lastClone.classList.add("is-clone");

    track.insertBefore(lastClone, realSlides[0]);
    track.appendChild(firstClone);

    const realCount = realSlides.length;
    let index = 1;       // arranca en el primer real (0 es clone)
    let timer = null;
    let moving = false;

    // dots
    const dots = [];
    if (dotsWrap) {
        dotsWrap.innerHTML = "";
        for (let i = 0; i < realCount; i++) {
            const b = document.createElement("button");
            b.type = "button";
            b.className = "gs-dot";
            b.addEventListener("click", () => goTo(i + 1, true));
            dotsWrap.appendChild(b);
            dots.push(b);
        }
    }

    function setActiveDot() {
        if (!dots.length) return;
        const realIndex = ((index - 1) % realCount + realCount) % realCount;
        dots.forEach((d, i) => d.classList.toggle("active", i === realIndex));
    }

    function vw() {
        return viewport.getBoundingClientRect().width;
    }

    function apply(animate = true) {
        track.style.transition = animate ? "transform .55s ease" : "none";
        track.style.transform = `translateX(${-index * vw()}px)`;
        setActiveDot();
    }

    function goTo(newIndex, userAction = false) {
        if (moving) return;
        moving = true;
        index = newIndex;
        apply(true);
        if (userAction) restart();
    }

    function next(userAction = false) { goTo(index + 1, userAction); }
    function prev(userAction = false) { goTo(index - 1, userAction); }

    function start() {
        stop();
        timer = setInterval(() => next(false), interval);
    }

    function stop() {
        if (timer) clearInterval(timer);
        timer = null;
    }

    function restart() {
        start();
    }

    if (btnNext) btnNext.addEventListener("click", () => next(true));
    if (btnPrev) btnPrev.addEventListener("click", () => prev(true));

    track.addEventListener("transitionend", () => {
        if (index === 0) {
            index = realCount;
            apply(false);
        } else if (index === realCount + 1) {
            index = 1;
            apply(false);
        }
        moving = false;
    });

    window.addEventListener("resize", () => apply(false));
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);

    apply(false);
    start();
}

/* ==============================
   Rotación interna (a prueba de fallos)
   - si falta <img>, lo crea
   - si una ruta no existe, la salta sin dejar blanco
   - "cargando" se quita al cargar
   - pausa si cambian de pestaña
============================== */

function setupGalleryRotatorsPro() {
    const rotators = document.querySelectorAll(".gallery-rotator");
    if (!rotators.length) return;

    rotators.forEach((rotator) => {
        // --- fit por cajón (cover / contain / cover-top / cover-bottom) ---
        const fit = (rotator.dataset.fit || "").toLowerCase();

        rotator.classList.remove("fit-contain", "fit-cover-top", "fit-cover-bottom");

        if (fit === "contain") rotator.classList.add("fit-contain");
        if (fit === "cover-top") rotator.classList.add("fit-cover-top");
        if (fit === "cover-bottom") rotator.classList.add("fit-cover-bottom");
        // si es "cover" o vacío -> default (cover + center)

        // --- asegura que exista <img class="rotator-img"> ---
        let imgEl = rotator.querySelector(".rotator-img");
        if (!imgEl) {
            imgEl = document.createElement("img");
            imgEl.className = "rotator-img";
            imgEl.alt = "Galería";
            rotator.appendChild(imgEl);
        }

        // --- quita "cargando" cuando cargue ---
        const slot = rotator.closest(".img-slot");
        imgEl.addEventListener("load", () => {
            if (slot) slot.classList.add("loaded");
        });

        // --- lee imágenes ---
        const interval = parseInt(rotator.dataset.interval || "4200", 10);
        const list = (rotator.dataset.images || "")
            .split(",")
            .map(s => s.trim())
            .filter(Boolean);

        if (!list.length) return;

        let idx = 0;
        let lastGood = null;
        let timer = null;
        let switching = false;

        // arranca buscando la primera imagen válida
        loadFirstAvailable(list, (okSrc, okIndex) => {
            idx = okIndex;
            lastGood = okSrc;
            imgEl.src = okSrc;
            start();
        }, () => {
            // si no hay ninguna imagen válida, dejamos el placeholder y ya
        });

        function start() {
            stop();
            timer = setInterval(next, interval);
        }

        function stop() {
            if (timer) clearInterval(timer);
            timer = null;
        }

        function next() {
            if (switching) return;
            switching = true;

            let tries = 0;

            function tryLoad() {
                if (tries >= list.length) {
                    // ninguna carga: no dejamos el cajón en blanco
                    if (lastGood) imgEl.src = lastGood;
                    switching = false;
                    return;
                }

                const nextIdx = (idx + 1) % list.length;
                const candidate = list[nextIdx];

                loadOk(candidate, (okSrc) => {
                    imgEl.style.opacity = "0.25";

                    setTimeout(() => {
                        imgEl.src = okSrc;
                        imgEl.style.opacity = "1";
                        idx = nextIdx;
                        lastGood = okSrc;
                        switching = false;
                    }, 160);
                }, () => {
                    idx = nextIdx;
                    tries++;
                    tryLoad();
                });
            }

            tryLoad();
        }

        // si cambias de pestaña, pausa/reanuda (evita bugs raros)
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) stop();
            else start();
        });
    });
}

/* ===== helpers ===== */

function loadOk(src, onOk, onFail) {
    const probe = new Image();
    probe.onload = () => onOk(src);
    probe.onerror = () => onFail && onFail();
    probe.src = src;
}

function loadFirstAvailable(list, onOk, onFail) {
    let i = 0;

    function tryNext() {
        if (i >= list.length) {
            onFail && onFail();
            return;
        }

        const candidate = list[i];
        loadOk(candidate, (okSrc) => onOk(okSrc, i), () => {
            i++;
            tryNext();
        });
    }

    tryNext();
}
