// Shared behavior across every page of the site.

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

  // Respect reduced-motion: don't autoplay the cover video, let the user press play
  const coverVideo = document.querySelector('.cover-video');
  if (coverVideo && prefersReducedMotion) {
    coverVideo.removeAttribute('autoplay');
    coverVideo.pause();
  }

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const tabs = document.getElementById('tabs');
  if (navToggle && tabs) {
    navToggle.addEventListener('click', () => {
      const isOpen = tabs.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });
  }

  // Sticky masthead gains a shadow once the page scrolls
  const masthead = document.querySelector('.masthead');
  if (masthead) {
    const setScrolled = () => masthead.classList.toggle('is-scrolled', window.scrollY > 12);
    setScrolled();
    window.addEventListener('scroll', setScrolled, { passive: true });
  }

  // Animated stat counters — counts up from 0 when scrolled into view
  const counters = document.querySelectorAll('[data-count-to]');
  if (counters.length) {
    const animateCounter = (el) => {
      const target = parseFloat(el.dataset.countTo);
      const suffix = el.dataset.suffix || '';
      const decimals = el.dataset.countTo.includes('.') ? 1 : 0;
      const duration = 1100;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach((el) => io.observe(el));
    } else {
      counters.forEach((el) => {
        el.textContent = el.dataset.countTo + (el.dataset.suffix || '');
      });
    }
  }

  // Scroll-triggered reveal for content blocks (cards, timeline entries, ledger rows, section heads)
  const revealEls = document.querySelectorAll(
    '.case-card, .adventure-card, .timeline__entry, .ledger__row, .testimonial, .section__head'
  );
  if (revealEls.length) {
    revealEls.forEach((el) => el.classList.add('reveal-io'));
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
      const io2 = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io2.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      revealEls.forEach((el) => io2.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    }
  }

  // 3D tilt-on-hover for cards (fine pointers only, respects reduced-motion)
  if (hasFinePointer && !prefersReducedMotion) {
    const tiltEls = document.querySelectorAll('.case-card, .stats__item');
    tiltEls.forEach((el) => {
      el.classList.add('tilt');
      el.addEventListener('pointermove', (e) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `perspective(800px) rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 10).toFixed(2)}deg) translateY(-4px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transform = '';
      });
    });
  }

  // Cursor-tracking spotlight glow behind hero headers
  if (hasFinePointer && !prefersReducedMotion) {
    document.querySelectorAll('.cover, .page-cover').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        el.style.setProperty('--my', `${e.clientY - rect.top}px`);
      });
    });
  }

  // Subtle parallax on the hero mountain silhouette
  const mountainScene = document.querySelector('.mountain-scene');
  if (mountainScene && !prefersReducedMotion) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        mountainScene.style.transform = `translateY(${window.scrollY * 0.15}px)`;
        ticking = false;
      });
    }, { passive: true });
  }

  // Back-to-top button (injected so every page gets it automatically)
  const toTop = document.createElement('button');
  toTop.className = 'to-top';
  toTop.type = 'button';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.innerHTML = '<i class="bi bi-arrow-up"></i>';
  document.body.appendChild(toTop);
  const toggleToTop = () => toTop.classList.toggle('is-visible', window.scrollY > 480);
  toggleToTop();
  window.addEventListener('scroll', toggleToTop, { passive: true });
  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

});
