const images = document.querySelectorAll('.bg-image');
const dots = document.querySelectorAll('.dot');
const overlay = document.querySelector('.fixed-overlay');
const zoomSlider = document.getElementById('zoom-slider');
const zoomValue = document.querySelector('.zoom-value');
const scrollContainer = document.querySelector('.scrollable-bg');
let current = 0;
let currentZoom = 100;

const schemes = [
    { 
        name: "Fontana di Santa María", 
        overallLrv: "66%", 
        colors: [
            {hex: "#E8D5C0", code: "SW 7023", name: "Travertine", lrv: 65}, 
            {hex: "#C9AB8E", code: "SW 6097", name: "Craftsman Brown", lrv: 45}, 
            {hex: "#FFFFFF", code: "SW 7757", name: "High Reflective White", lrv: 93}
        ] 
    },
    { 
        name: "Argento Romano", 
        overallLrv: "68%", 
        colors: [
            {hex: "#E5E1D8", code: "SW 7028", name: "Incredible White", lrv: 70}, 
            {hex: "#C5BFB3", code: "SW 6073", name: "Perfect Greige", lrv: 50}, 
            {hex: "#FFFFFF", code: "SW 7757", name: "High Reflective White", lrv: 93}
        ] 
    },
    { 
        name: "Pietra Grigia Romana", 
        overallLrv: "58%", 
        colors: [
            {hex: "#C8CDCF", code: "SW 7017", name: "Dorian Gray", lrv: 52}, 
            {hex: "#9EA7AA", code: "SW 7019", name: "Gauntlet Gray", lrv: 34}, 
            {hex: "#FFFFFF", code: "SW 7757", name: "High Reflective White", lrv: 93}
        ] 
    },
    { 
        name: "Rosa Aurora", 
        overallLrv: "80%", 
        colors: [
            {hex: "#E9E0DD", code: "SW 6322", name: "Intimate White", lrv: 79}, 
            {hex: "#F2DDDB", code: "SW 6568", name: "Lighthearted Pink", lrv: 77}, 
            {hex: "#FFFFFF", code: "SW 7757", name: "High Reflective White", lrv: 93}
        ] 
    },
    { 
        name: "Neve di Marmo", 
        overallLrv: "83%", 
        colors: [
            {hex: "#F0EEEB", code: "SW 7005", name: "Pure White", lrv: 87}, 
            {hex: "#E2DFDA", code: "SW 7014", name: "Eider White", lrv: 77}, 
            {hex: "#FFFFFF", code: "SW 7757", name: "High Reflective White", lrv: 93}
        ] 
    }
];

function updateImageDimensions() {
    const activeImage = images[current];
    const containerWidth = scrollContainer.clientWidth;
    const containerHeight = scrollContainer.clientHeight;
    
    // Load image to get natural dimensions
    const img = new Image();
    img.src = activeImage.src;
    
    img.onload = function() {
        const scale = currentZoom / 100;
        
        // Calculate dimensions that allow full scrolling
        // Add padding equal to viewport size on all sides
        const scaledWidth = img.naturalWidth * scale;
        const scaledHeight = img.naturalHeight * scale;
        
        // Position with padding to allow scrolling to all edges
        const paddingX = containerWidth;
        const paddingY = containerHeight;
        
        activeImage.style.width = scaledWidth + 'px';
        activeImage.style.height = scaledHeight + 'px';
        activeImage.style.left = paddingX + 'px';
        activeImage.style.top = paddingY + 'px';
        
        // Update scroll container size by setting a pseudo-element size
        scrollContainer.style.width = '100%';
        scrollContainer.style.height = '100%';
        
        // Center the scrollable area
        centerScrollPosition();
    };
}

function centerScrollPosition() {
    const activeImage = images[current];
    const containerWidth = scrollContainer.clientWidth;
    const containerHeight = scrollContainer.clientHeight;
    
    // Center on the image itself (not including padding)
    const scrollLeft = activeImage.offsetLeft + (activeImage.offsetWidth / 2) - (containerWidth / 2);
    const scrollTop = activeImage.offsetTop + (activeImage.offsetHeight / 2) - (containerHeight / 2);
    
    scrollContainer.scrollLeft = scrollLeft;
    scrollContainer.scrollTop = scrollTop;
}

function show(n) {
    images[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (n + images.length) % images.length;
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
    
    // Update dimensions and center for new image
    updateImageDimensions();
}

function applyZoom(zoomPercent) {
    currentZoom = zoomPercent;
    const scale = zoomPercent / 100;
    
    // Store current scroll position relative to center
    const scrollLeft = scrollContainer.scrollLeft;
    const scrollTop = scrollContainer.scrollTop;
    const containerWidth = scrollContainer.clientWidth;
    const containerHeight = scrollContainer.clientHeight;
    
    // Get center point of current view
    const viewCenterX = scrollLeft + containerWidth / 2;
    const viewCenterY = scrollTop + containerHeight / 2;
    
    // Update image dimensions
    updateImageDimensions();
    
    // After dimensions update, adjust scroll to maintain center point
    requestAnimationFrame(() => {
        const activeImage = images[current];
        const newCenterX = viewCenterX;
        const newCenterY = viewCenterY;
        
        scrollContainer.scrollLeft = newCenterX - containerWidth / 2;
        scrollContainer.scrollTop = newCenterY - containerHeight / 2;
    });
    
    zoomValue.textContent = `${zoomPercent}%`;
}

// Navigation
document.querySelector('.prev').onclick = () => show(current - 1);
document.querySelector('.next').onclick = () => show(current + 1);
dots.forEach((dot, i) => dot.onclick = () => show(i));

// Zoom control
zoomSlider.addEventListener('input', (e) => {
    applyZoom(parseInt(e.target.value));
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
});

// Handle window resize
window.addEventListener('resize', () => {
    updateImageDimensions();
});

// Initialize
show(0);