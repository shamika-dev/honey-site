import './style.css'
import Lenis from 'lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

// ==========================================
// Mobile Menu Toggle Logic
// ==========================================
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileMenu.classList.toggle('hidden');
    });

    // මෙනුවේ ඇති ඕනෑම link එකක් ක්ලික් කළ විට මෙනුව වැසී යාමට
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });

    // මෙනුවෙන් පිටත ක්ලික් කළොත් මෙනුව වැසී යාමට
    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
            mobileMenu.classList.add('hidden');
        }
    });
}

// ==========================================
// GSAP Plugins register කරගැනීම සහ ඉතිරි කේත
// ==========================================
gsap.registerPlugin(ScrollTrigger)

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  lerp: 0.1,
})

lenis.on('raf', ScrollTrigger.update)

gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})

gsap.ticker.lagSmoothing(0)

document.querySelectorAll('nav a[href^="#"], #mobile-menu a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
      }

      lenis.scrollTo(targetElement, {
        offset: 0,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });
    }
  });
});

// ==========================================
// Scroll choreography and parallax system
// ==========================================
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const motionSections = document.querySelectorAll('section:not(.hero-section), footer');
const interactiveButtons = document.querySelectorAll('button, .product-card, section a');

if (!reduceMotion) {
  const motionContext = gsap.context(() => {
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
    intro
      .from('.hero-section header', { y: -30, opacity: 0, duration: 0.8 })
      .from('.hero-section .text-center > *', { y: 45, opacity: 0, stagger: 0.12, duration: 0.85 }, '-=0.45')
      .from('.hero-section .relative.z-10 > img', { scale: 0.82, y: 35, opacity: 0, duration: 1.15 }, '-=0.75')
      .from('.floating-item', { scale: 0.7, opacity: 0, stagger: 0.08, duration: 0.7 }, '-=0.9');

    // Every decorative element travels at a different depth as the page scrolls.
    gsap.utils.toArray('.floating-item').forEach((element) => {
      const speed = Number(element.dataset.speed || 0.12);
      gsap.to(element, {
        y: () => window.innerHeight * speed * -1.5,
        rotation: () => (Math.random() > 0.5 ? 4 : -4),
        ease: 'none',
        scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: 1.2 }
      });
    });

    gsap.utils.toArray('section:not(.hero-section) > *, footer > *').forEach((element) => {
      gsap.from(element, {
        y: 55,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: element, start: 'top 88%', once: true }
      });
    });

    gsap.utils.toArray('#product .grid > div, #gallery img, #about-us > div').forEach((element, index) => {
      gsap.from(element, {
        y: 35,
        opacity: 0,
        scale: 0.96,
        duration: 0.75,
        delay: (index % 3) * 0.08,
        ease: 'back.out(1.4)',
        scrollTrigger: { trigger: element, start: 'top 92%', once: true }
      });
    });

    gsap.to('#contact img', {
      yPercent: -12,
      ease: 'none',
      scrollTrigger: { trigger: '#contact', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  interactiveButtons.forEach((element) => {
    element.addEventListener('mouseenter', () => gsap.to(element, { y: -6, scale: 1.02, duration: 0.35, ease: 'power2.out', overwrite: true }));
    element.addEventListener('mouseleave', () => gsap.to(element, { y: 0, scale: 1, duration: 0.45, ease: 'elastic.out(1, 0.5)', overwrite: true }));
  });

  window.addEventListener('resize', () => ScrollTrigger.refresh(), { passive: true });

  // Avoid retaining animations if this entry is hot-reloaded by Vite.
  if (import.meta.hot) import.meta.hot.dispose(() => motionContext.revert());
} else {
  // Keep content visible when the user requests reduced motion.
  gsap.set([...motionSections, ...document.querySelectorAll('.floating-item')], { clearProps: 'all' });
}
