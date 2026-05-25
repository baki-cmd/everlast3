/* =====================================================
   Everlasting UPVC — interactions
   ===================================================== */

// ===== Reduced-motion guard =====
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== Scroll progress bar + sticky nav shadow =====
const nav = document.getElementById('nav');
const scrollProgress = document.getElementById('scrollProgress');
let scrollTicking = false;
function onScroll() {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 30);
  if (scrollProgress) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (y / max) * 100 : 0;
    scrollProgress.style.width = pct + '%';
  }
  scrollTicking = false;
}
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(onScroll);
    scrollTicking = true;
  }
}, { passive: true });

// ===== Mobile menu =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// ===== Active link on scroll =====
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav__links a');
window.addEventListener('scroll', () => {
  const y = window.scrollY + 120;
  let current = '';
  sections.forEach(s => {
    if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) {
      current = s.id;
    }
  });
  navAnchors.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
});

// ===== Reveal on scroll (with cascading stagger inside grids) =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Stagger delays for sibling cards inside grids
['.products__grid', '.features__grid', '.process__grid', '.testimonials__grid', '.gallery__grid', '.mv__grid'].forEach(sel => {
  document.querySelectorAll(`${sel} > .reveal`).forEach((el, i) => {
    el.style.setProperty('--reveal-delay', `${Math.min(i * 70, 600)}ms`);
  });
});

// ===== Counter animation =====
const counters = document.querySelectorAll('[data-count]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCount(e.target);
      counterObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => counterObserver.observe(c));

function animateCount(el) {
  const target = +el.dataset.count;
  const hasCustomSuffix = el.dataset.suffix !== undefined;
  const suffix = hasCustomSuffix ? el.dataset.suffix : '+';
  const useThousands = target >= 1000 && !hasCustomSuffix;
  const duration = 2000;
  const start = performance.now();
  function format(n) { return useThousands ? n.toLocaleString() + suffix : n + suffix; }
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = format(Math.floor(eased * target));
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = format(target);
  }
  requestAnimationFrame(tick);
}

// ===== 3D tilt effect on product / feature / mv cards (desktop only) =====
const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (fineHover && !reduceMotion) {
  document.querySelectorAll('.product').forEach(card => {
    let rafId = null;
    const max = 5;
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        card.style.setProperty('--tilt-x', `${(-y * max).toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${(x * max).toFixed(2)}deg`);
      });
    });
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  });
}

// Gentle parallax on hero floating shapes
if (!reduceMotion) {
  const shapes = document.querySelectorAll('.hero__shapes .shape');
  if (shapes.length) {
    document.querySelector('.hero')?.addEventListener('mousemove', e => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      shapes.forEach((s, i) => {
        const intensity = (i + 1) * 8;
        s.style.transform = `translate(${dx * intensity}px, ${dy * intensity}px)`;
      });
    }, { passive: true });
  }
}

// ===== Gallery lightbox =====
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
document.querySelectorAll('.gallery__item').forEach(item => {
  item.addEventListener('click', () => {
    lightboxImg.src = item.dataset.src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
});
function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// ===== FAQ accordion (close others when one opens) =====
const allDetails = document.querySelectorAll('.faq__list details');
allDetails.forEach(d => {
  d.addEventListener('toggle', () => {
    if (d.open) {
      allDetails.forEach(o => { if (o !== d) o.open = false; });
    }
  });
});

// ===== Contact form =====
const form = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = form.name.value.trim();
  const phone = form.phone.value.trim();
  const product = form.product.value;
  const city = form.city.value.trim();
  if (!name || !phone || !product || !city) return;

  // Phone validation - basic
  const phoneClean = phone.replace(/\D/g, '');
  if (phoneClean.length < 10) {
    alert('Please enter a valid phone number.');
    return;
  }

  formSuccess.classList.add('show');
  form.reset();
  setTimeout(() => formSuccess.classList.remove('show'), 8000);
  formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// ===== Year auto-update for footer (if needed in the future) =====
// (footer year is hard-coded currently)
