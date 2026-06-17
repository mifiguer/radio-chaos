/* ============================================================
   RADIO CHAOS — MAIN.JS
   ============================================================ */

'use strict';

/* ── Footer year ── */
const yearEl = document.getElementById('footerYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── Mobile nav toggle ── */
const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  /* Close menu on nav link click */
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
    });
  });

  /* Close on Escape */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
      navToggle.focus();
    }
  });
}

/* ── Sticky header shadow on scroll ── */
const siteHeader = document.querySelector('.site-header');
const onScroll = () => {
  if (!siteHeader) return;
  siteHeader.style.boxShadow = window.scrollY > 20
    ? '0 2px 24px rgba(0,0,0,0.5)'
    : 'none';
};
window.addEventListener('scroll', onScroll, { passive: true });

/* ── Active nav link on scroll (IntersectionObserver) ── */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.style.color = href === '#' + entry.target.id
          ? 'var(--gold)'
          : '';
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

/* ── Hero noise canvas ── */
(function initNoise() {
  const canvas = document.getElementById('noiseCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let animFrame;
  let w, h;

  function resize() {
    w = canvas.width  = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function drawNoise() {
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255;
      data[i]     = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  let then = 0;
  const FPS = 12; // low fps = vintage feel, low CPU
  const interval = 1000 / FPS;

  function loop(now) {
    animFrame = requestAnimationFrame(loop);
    const delta = now - then;
    if (delta > interval) {
      then = now - (delta % interval);
      drawNoise();
    }
  }

  function start() {
    resize();
    loop(0);
  }

  // Only run noise when hero is visible
  const heroSection = document.querySelector('.hero');
  const visibilityObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        start();
      } else {
        cancelAnimationFrame(animFrame);
      }
    });
  });
  if (heroSection) visibilityObserver.observe(heroSection);

  window.addEventListener('resize', resize, { passive: true });
})();

/* ── Scroll reveal ── */
(function initReveal() {
  const revealEls = document.querySelectorAll(
    '.tour-card, .photo-item, .contact-left, .contact-right, .video-block'
  );

  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('revealed'));
    return;
  }

  revealEls.forEach(el => el.classList.add('will-reveal'));

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));
})();

/* ── Contact form (client-side feedback; wire up a backend as needed) ── */
const contactForm  = document.getElementById('contactForm');
const formStatus   = document.getElementById('formStatus');

if (contactForm && formStatus) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();

    const name    = contactForm.name.value.trim();
    const email   = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();

    if (!name || !email || !message) {
      formStatus.textContent = 'Please fill in name, email, and message.';
      formStatus.style.color = '#e07060';
      return;
    }

    /* Basic email sanity check */
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      formStatus.textContent = 'Please enter a valid email address.';
      formStatus.style.color = '#e07060';
      return;
    }

    /*
     * TODO: Replace this block with a real submission (fetch to your backend,
     * Netlify Forms, Formspree, EmailJS, etc.).
     *
     * Example with Formspree:
     *   contactForm.setAttribute('action', 'https://formspree.io/f/YOUR_ID');
     *   contactForm.setAttribute('method', 'POST');
     *   contactForm.submit();
     */

    /* Placeholder success feedback */
    formStatus.textContent = '✓ Message sent! We\'ll be in touch soon.';
    formStatus.style.color = 'var(--gold)';
    contactForm.reset();

    setTimeout(() => { formStatus.textContent = ''; }, 6000);
  });
}

/* Add reveal CSS inline so it works without a second stylesheet */
(function addRevealStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .will-reveal {
      opacity: 0;
      transform: translateY(18px);
      transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
                  transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .will-reveal.revealed {
      opacity: 1;
      transform: none;
    }
  `;
  document.head.appendChild(style);
})();

/* ── Song catalog filter ── */
(function initCatalogFilter() {
  const filters = document.querySelectorAll('.catalog-filter');
  const rows    = document.querySelectorAll('#catalogBody tr');
  if (!filters.length) return;

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      rows.forEach(row => {
        const type = row.dataset.type;
        const show = filter === 'all' || type === filter;
        row.classList.toggle('hidden', !show);
      });

      /* Re-number visible rows */
      let count = 0;
      rows.forEach(row => {
        if (!row.classList.contains('hidden')) {
          count++;
          const numCell = row.querySelector('.col-num');
          if (numCell) numCell.textContent = count;
        }
      });
    });
  });
})();
