const slides = document.querySelectorAll('.slide');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');
const dots = document.querySelectorAll('.dot');
let current = 0;
const total = slides.length;

function showSlide(n) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    
    current = (n + total) % total;
    
    slides[current].classList.add('active');
    dots[current].classList.add('active');
}

prevBtn.addEventListener('click', () => showSlide(current - 1));
nextBtn.addEventListener('click', () => showSlide(current + 1));

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => showSlide(index));
});

// Optional: auto-advance every 8 seconds
// setInterval(() => nextBtn.click(), 8000);