const images = document.querySelectorAll('.bg-image');
const dots = document.querySelectorAll('.dot');
const overlay = document.querySelector('.fixed-overlay');
const zoomSlider = document.getElementById('zoom-slider');
const zoomValue = document.querySelector('.zoom-value');
const scrollContainer = document.querySelector('.scrollable-bg');

let current = 0;
let currentZoom = 100;
let previousCenter = null;
let isUpdating = false;
let baseWindowWidth = null;

const schemes = [
    { name: "Fontana di Santa María", overallLrv: "66%", colors: [ {hex: "#E8D5C0", code: "SW 7023", name: "Travertine", lrv: 65}, {hex: "#C9AB8E", code: "SW 6097", name: "Craftsman Brown", lrv: 45}, {hex: "#FFFFFF", code: "SW 7757", name: "High Reflective White", lrv: 93} ] },
    { name: "Argento Romano", overallLrv: "68%", colors: [ {hex: "#E5E1D8", code: "SW 7028", name: "Incredible White", lrv: 70}, {hex: "#C5BFB3", code: "SW 6073", name: "Perfect Greige", lrv: 50}, {hex: "#FFFFFF", code: "SW 7757", name: "High Reflective White", lrv: 93} ] },
    { name: "Neve di Marmo", overallLrv: "83%", colors: [ {hex: "#F0EEEB", code: "SW 7005", name: "Pure White", lrv: 87}, {hex: "#E2DFDA", code: "SW 7014", name: "Eider White", lrv: 77}, {hex: "#FFFFFF", code: "SW 7757", name: "High Reflective White", lrv: 93} ] }
];

/* ------------------------------------------------------------------ */
function calculateResponsiveZoom() {
    // Only apply responsive zoom on desktop/landscape
    if (window.innerWidth <= 768 && window.matchMedia('(orientation: portrait)').matches) {
        return 100; // Keep 100% on mobile portrait
    }
    
    if (!baseWindowWidth) {
        baseWindowWidth = window.innerWidth;
        return 50; // Initial zoom for desktop
    }
    
    // Calculate proportional zoom based on window width change
    const widthRatio = window.innerWidth / baseWindowWidth;
    const newZoom = Math.round(50 * widthRatio);
    
    // Clamp between slider min/max values
    return Math.max(50, Math.min(120, newZoom));
}

function saveCurrentCenter() {
    if (isUpdating) return;
    const w = scrollContainer.clientWidth;
    const h = scrollContainer.clientHeight;
    previousCenter = {
        x: scrollContainer.scrollLeft + w / 2,
        y: scrollContainer.scrollTop + h / 2
    };
}

function restorePreviousCenter() {
    if (!previousCenter || isUpdating) return;
    const w = scrollContainer.clientWidth;
    const h = scrollContainer.clientHeight;
    scrollContainer.scrollLeft = previousCenter.x - w / 2;
    scrollContainer.scrollTop = previousCenter.y - h / 2;
}

/* ------------------------------------------------------------------ */
function updateImageDimensions() {
    if (isUpdating) return;
    isUpdating = true;

    const imgEl = images[current];
    const containerW = scrollContainer.clientWidth;
    const containerH = scrollContainer.clientHeight;

    const tempImg = new Image();
    tempImg.src = imgEl.src;

    const apply = () => {
        const scale = currentZoom / 100;
        const newW = tempImg.naturalWidth * scale;
        const newH = tempImg.naturalHeight * scale;

        imgEl.style.width = newW + 'px';
        imgEl.style.height = newH + 'px';

        const overflowX = newW > containerW;
        const overflowY = newH > containerH;

        imgEl.style.left = overflowX ? '0px' : (containerW - newW) / 2 + 'px';
        imgEl.style.top  = overflowY ? '0px' : (containerH - newH) / 2 + 'px';

        scrollContainer.style.overflowX = overflowX ? 'auto' : 'hidden';
        scrollContainer.style.overflowY = overflowY ? 'auto' : 'hidden';

        void imgEl.offsetHeight;
        restorePreviousCenter();
        isUpdating = false;
    };

    if (tempImg.complete && tempImg.naturalWidth) {
        apply();
    } else {
        tempImg.onload = apply;
    }
}

/* ------------------------------------------------------------------ */
function show(n) {
    if (isUpdating) return;

    saveCurrentCenter();

    const newIndex = (n + images.length) % images.length;

    images[current].classList.remove('active');
    dots[current].classList.remove('active');

    current = newIndex;

    images[current].classList.add('active');
    dots[current].classList.add('active');

    const s = schemes[current];
    overlay.querySelector('.scheme-name').textContent = s.name;
    overlay.querySelector('.overall-lrv').textContent = `Overall LRV: ${s.overallLrv}`;

    const swatches = overlay.querySelectorAll('.swatch');
    const infos = overlay.querySelectorAll('.info');
    s.colors.forEach((c, i) => {
        swatches[i].style.background = c.hex;
        infos[i].querySelector('.code').textContent = c.code;
        infos[i].querySelector('.name').textContent = c.name;
        infos[i].querySelector('.lrv').textContent = `LRV ${c.lrv}`;
    });

    updateImageDimensions();
}

/* ------------------------------------------------------------------ */
function applyZoom(value) {
    if (isUpdating || currentZoom === value) return;
    saveCurrentCenter();
    currentZoom = value;
    updateImageDimensions();
    zoomValue.textContent = `${value}%`;
}

/* ------------------------------------------------------------------ */
// Navigation
document.querySelector('.prev').onclick = () => show(current - 1);
document.querySelector('.next').onclick = () => show(current + 1);
dots.forEach((dot, i) => dot.onclick = () => show(i));

// Zoom
zoomSlider.addEventListener('input', e => applyZoom(parseInt(e.target.value, 10)));

// Keyboard
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
});

// Resize
window.addEventListener('resize', () => {
    saveCurrentCenter();
    
    // Update zoom based on window size for desktop
    const newZoom = calculateResponsiveZoom();
    if (newZoom !== currentZoom) {
        currentZoom = newZoom;
        zoomSlider.value = newZoom;
        zoomValue.textContent = `${newZoom}%`;
    }
    
    updateImageDimensions();
});

/* ------------------------------------------------------------------ */
// Start
const initialZoom = calculateResponsiveZoom();
currentZoom = initialZoom;
zoomSlider.value = initialZoom;
zoomValue.textContent = `${initialZoom}%`;
show(0);