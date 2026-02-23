document.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById("mainHeader");
    const hero = document.querySelector(".hero");

    // Año footer
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();

    // Header aparece después del hero
    function onScroll() {
        const heroHeight = hero ? hero.offsetHeight : 0;
        if (window.scrollY > heroHeight - 120) header.classList.add("show");
        else header.classList.remove("show");
    }
    window.addEventListener("scroll", onScroll);
    onScroll();

    // WhatsApp flotante (pon número real cuando te lo den)
    const waFloat = document.getElementById("waFloat");
    if (waFloat) {
        const number = "57XXXXXXXXXX";
        const msg = encodeURIComponent("Hola, quiero información sobre cursos en CEA FORMAMOS.");
        waFloat.href = `https://wa.me/${number}?text=${msg}`;
        waFloat.target = "_blank";
        waFloat.rel = "noopener";
    }

    // Reemplaza cuando tengas la ubicación exacta:
    const LAT = 0; // <-- pon latitud real (ej: 5.047xxx)
    const LNG = 0; // <-- pon longitud real (ej: -75.50xxx)

    // Si aún no tienes coords, usa dirección completa:
    const ADDRESS = "CEA FORMAMOS, Entrada de Villamaría, Villamaría, Caldas, Colombia";

    const hasCoords = (LAT !== 0 && LNG !== 0);

    const mapsSearchUrl = hasCoords
        ? `https://www.google.com/maps?q=${LAT},${LNG}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`;

    const mapsEmbedUrl = hasCoords
        ? `https://www.google.com/maps?q=${LAT},${LNG}&z=17&output=embed`
        : `https://www.google.com/maps?q=${encodeURIComponent(ADDRESS)}&z=17&output=embed`;

    const mapsBtn = document.getElementById("mapsBtn");
    const toggleMapBtn = document.getElementById("toggleMapBtn");
    const mapContainer = document.getElementById("mapContainer");
    const mapFrame = document.getElementById("mapFrame");

    if (mapsBtn) {
        mapsBtn.href = mapsSearchUrl;
        mapsBtn.target = "_blank";
        mapsBtn.rel = "noopener";
    }

    if (toggleMapBtn && mapContainer && mapFrame) {
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
});
