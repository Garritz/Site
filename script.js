const images = document.querySelectorAll('.bg-image');
const dotsDesktop = document.querySelectorAll('.controls-wrapper .dot');
const dotsMobile = document.querySelectorAll('.controls-inline .dot');
const overlay = document.querySelector('.fixed-overlay');
const titleWrapper = overlay.querySelector('.title-wrapper');
const zoomSliderDesktop = document.getElementById('zoom-slider-desktop');
const zoomSliderMobile = document.getElementById('zoom-slider');
const zoomValues = document.querySelectorAll('.zoom-value');
const scrollContainer = document.querySelector('.scrollable-bg');

let current = 0;
let currentZoom = 100;
let previousCenter = null;
let isUpdating = false;
let baseWindowWidth = null;

const schemes = [
    { 
        name: "Fontana di Santa María", 
        overallLrv: "66%", 
        colors: [ 
            {hex: "#E8D5C0", code: "SW 7023", name: "Travertine", lrv: 65}, 
            {hex: "#C9AB8E", code: "SW 6097", name: "Craftsman Brown", lrv: 45}, 
            {hex: "#FFFFFF", code: "SW 7757", name: "High Reflective White", lrv: 93} 
        ],
        images: {
            desktop: "renders/a01_fontana.jpg",
            mobile: "renders/mobile/a01_fontana_m.jpg"
        }
    },
    { 
        name: "Argento Romano", 
        overallLrv: "68%", 
        colors: [ 
            {hex: "#E5E1D8", code: "SW 7028", name: "Incredible White", lrv: 70}, 
            {hex: "#C5BFB3", code: "SW 6073", name: "Perfect Greige", lrv: 50}, 
            {hex: "#FFFFFF", code: "SW 7757", name: "High Reflective White", lrv: 93} 
        ],
        images: {
            desktop: "renders/a02_argento.jpg",
            mobile: "renders/mobile/a02_argento_m.jpg"
        }
    },
    { 
        name: "Neve di Marmo", 
        overallLrv: "83%", 
        colors: [ 
            {hex: "#F0EEEB", code: "SW 7005", name: "Pure White", lrv: 87}, 
            {hex: "#E2DFDA", code: "SW 7014", name: "Eider White", lrv: 77}, 
            {hex: "#FFFFFF", code: "SW 7757", name: "High Reflective White", lrv: 93} 
        ],
        images: {
            desktop: "renders/a10_neve.jpg",
            mobile: "renders/mobile/a10_neve_m.jpg"
        }
    }
];

/* ------------------------------------------------------------------ */
function isMobile() {
    return window.innerWidth <= 768;
}

function isMobilePortrait() {
    return window.innerWidth <= 768 && window.matchMedia('(orientation: portrait)').matches;
}

function calculateResponsiveZoom() {
    // Mobile portrait starts at higher zoom to fill vertical space
    if (isMobilePortrait()) {
        return 65;
    }
    
    // Mobile landscape
    if (isMobile()) {
        return 55;
    }
    
    // Desktop responsive zoom
    if (!baseWindowWidth) {
        baseWindowWidth = window.innerWidth;
        return 50;
    }
    
    const widthRatio = window.innerWidth / baseWindowWidth;
    const newZoom = Math.round(50 * widthRatio);
    
    return Math.max(50, Math.min(120, newZoom));
}

function saveCurrentCenter() {
    if (isUpdating) return;
    const w = scrollContainer.clientWidth;
    const h = scrollContainer.clientHeight;
    const imgEl = images[current];
    
    // Calculate center point relative to the image dimensions, not container
    const imgRect = imgEl.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();
    
    previousCenter = {
        x: scrollContainer.scrollLeft + w / 2,
        y: scrollContainer.scrollTop + h / 2,
        zoom: currentZoom
    };
}

function restorePreviousCenter() {
    if (!previousCenter || isUpdating) return;
    const w = scrollContainer.clientWidth;
    const h = scrollContainer.clientHeight;
    
    // Restore scroll position
    scrollContainer.scrollLeft = previousCenter.x - w / 2;
    scrollContainer.scrollTop = previousCenter.y - h / 2;
}

/* ------------------------------------------------------------------ */
function updateImageDimensions() {
    if (isUpdating) return;
    
    saveCurrentCenter();
    applyImageDimensions(images[current], currentZoom);
}

function applyImageDimensions(imgEl, zoom, maintainScrollX, maintainScrollY) {
    if (isUpdating) return;
    isUpdating = true;

    const containerW = scrollContainer.clientWidth;
    const containerH = scrollContainer.clientHeight;

    const tempImg = new Image();
    tempImg.src = imgEl.src;

    const apply = () => {
        const scale = zoom / 100;
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
        
        // Restore scroll position if provided, otherwise use saved center
        if (maintainScrollX !== undefined && maintainScrollY !== undefined) {
            scrollContainer.scrollLeft = maintainScrollX;
            scrollContainer.scrollTop = maintainScrollY;
        } else {
            restorePreviousCenter();
        }
        
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

    // Save current view state BEFORE changing
    const previousZoom = currentZoom;
    const previousScrollX = scrollContainer.scrollLeft;
    const previousScrollY = scrollContainer.scrollTop;

    const newIndex = (n + images.length) % images.length;

    images[current].classList.remove('active');
    dotsDesktop[current].classList.remove('active');
    dotsMobile[current].classList.remove('active');

    current = newIndex;

    images[current].classList.add('active');
    dotsDesktop[current].classList.add('active');
    dotsMobile[current].classList.add('active');

    // Update image source based on viewport
    const s = schemes[current];
    const imageSrc = isMobile() ? s.images.mobile : s.images.desktop;
    
    // Check if image needs to be loaded
    const needsLoad = images[current].src.indexOf(imageSrc) === -1;
    
    if (needsLoad) {
    images[current].src = imageSrc;
    images[current].style.opacity = '0';
    images[current].onload = () => {
        images[current].style.transition = 'opacity 0.3s';
        images[current].style.opacity = '1';
    };
}

    overlay.querySelector('.scheme-name').textContent = s.name;
    overlay.querySelector('.overall-lrv').textContent = `Overall LRV: ${s.overallLrv}`;

    const swatches = overlay.querySelectorAll('.swatch');
    const infos = overlay.querySelectorAll('.info');
    s.colors.forEach((c, i) => {
        swatches[i].style.background = c.hex;
        infos[i].querySelector('.code').textContent = c.code;
        const nameEl = infos[i].querySelector('.name');
        const lrvEl = infos[i].querySelector('.lrv');
        if (nameEl) nameEl.textContent = c.name;
        if (lrvEl) lrvEl.textContent = `LRV ${c.lrv}`;
    });

    // Apply dimensions with the CURRENT zoom and scroll position
    applyImageDimensions(images[current], previousZoom, previousScrollX, previousScrollY);
}

/* ------------------------------------------------------------------ */
function applyZoom(value) {
    if (isUpdating || currentZoom === value) return;
    saveCurrentCenter();
    currentZoom = value;
    applyImageDimensions(images[current], value);
    
    // Update all zoom displays
    zoomValues.forEach(el => el.textContent = `${value}%`);
    if (zoomSliderDesktop) zoomSliderDesktop.value = value;
    if (zoomSliderMobile) zoomSliderMobile.value = value;
}

/* ------------------------------------------------------------------ */
// Toggle mobile card expansion
if (titleWrapper) {
    titleWrapper.addEventListener('click', (e) => {
        if (isMobile()) {
            e.stopPropagation();
            overlay.classList.toggle('expanded');
        }
    });
}

// Navigation
document.querySelector('.prev').onclick = () => show(current - 1);
document.querySelector('.next').onclick = () => show(current + 1);

// Dots for both desktop and mobile
dotsDesktop.forEach((dot, i) => dot.onclick = () => show(i));
dotsMobile.forEach((dot, i) => dot.onclick = () => show(i));

// Zoom for both sliders
if (zoomSliderDesktop) {
    zoomSliderDesktop.addEventListener('input', e => applyZoom(parseInt(e.target.value, 10)));
}
if (zoomSliderMobile) {
    zoomSliderMobile.addEventListener('input', e => applyZoom(parseInt(e.target.value, 10)));
}

// Keyboard
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
});

// Resize
window.addEventListener('resize', () => {
    saveCurrentCenter();
    
    // Update image source if device type changed
    const s = schemes[current];
    const imageSrc = isMobile() ? s.images.mobile : s.images.desktop;
    if (images[current].src.indexOf(imageSrc) === -1) {
        images[current].src = imageSrc;
    }
    
    // Update zoom based on window size
    const newZoom = calculateResponsiveZoom();
    if (newZoom !== currentZoom) {
        currentZoom = newZoom;
        if (zoomSliderDesktop) zoomSliderDesktop.value = newZoom;
        if (zoomSliderMobile) zoomSliderMobile.value = newZoom;
        zoomValues.forEach(el => el.textContent = `${newZoom}%`);
    }
    
    updateImageDimensions();
});

/* ------------------------------------------------------------------ */
// Start
const initialZoom = calculateResponsiveZoom();
currentZoom = initialZoom;
if (zoomSliderDesktop) zoomSliderDesktop.value = initialZoom;
if (zoomSliderMobile) zoomSliderMobile.value = initialZoom;
zoomValues.forEach(el => el.textContent = `${initialZoom}%`);

// Set initial image sources
images.forEach((img, i) => {
    const src = isMobile() ? schemes[i].images.mobile : schemes[i].images.desktop;
    img.src = src;
});

show(0);