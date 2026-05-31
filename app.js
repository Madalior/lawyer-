/**
 * Scroll-driven animations — clean, no crashes.
 */

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }
function progress(scroll, start, end) {
  return clamp((scroll - start) / (end - start), 0, 1);
}

document.addEventListener('DOMContentLoaded', () => {

  const vh = () => window.innerHeight;

  // ── Grab all elements (safely) ─────────────────────────────────
  const heroCharWrap     = document.getElementById('hero-char-wrap');
  const heroTitleWrap    = document.getElementById('hero-title-wrap');
  const heroCircle       = document.getElementById('hero-circle');
  const heroRibbon       = document.getElementById('hero-ribbon');
  const detailsHl        = document.getElementById('details-hl');
  const charPeekWrap     = document.getElementById('char-peek-wrap');
  const closingCharWrap  = document.getElementById('closing-char-wrap-animate');
  const closingTopText   = document.querySelector('.closing-top-text');
  const closingSection   = document.getElementById('section-closing');
  const detailsSection   = document.getElementById('section-details');
  const gallerySection   = document.getElementById('section-gallery');

  // ── Smooth virtual scroll ──────────────────────────────────────
  let currentScroll = window.scrollY;
  let targetScroll  = window.scrollY;
  let isRunning     = false;

  window.addEventListener('scroll', () => {
    targetScroll = window.scrollY;
    if (!isRunning) {
      isRunning = true;
      tick();
    }
  }, { passive: true });

  function tick() {
    currentScroll = lerp(currentScroll, targetScroll, 0.09);
    if (Math.abs(currentScroll - targetScroll) < 0.3) {
      currentScroll = targetScroll;
      isRunning = false;
      applyTransforms(currentScroll);
      return;
    }
    applyTransforms(currentScroll);
    requestAnimationFrame(tick);
  }

  // ── Core animation logic ───────────────────────────────────────
  function applyTransforms(scroll) {
    const H = vh();
    const detailsTop = detailsSection ? detailsSection.offsetTop : H;
    const galleryTop = gallerySection ? gallerySection.offsetTop : H * 2;

    // ── HERO section (0 → detailsTop) ──────────────────────────
    const p1 = progress(scroll, 0, detailsTop);

    if (heroCharWrap) {
      const scale = 1 + p1 * 1.3;
      const ty    = -p1 * H * 0.52;
      const op    = p1 < 0.8 ? 1 : clamp(1 - (p1 - 0.8) / 0.2, 0, 1);
      heroCharWrap.style.transform = `scale(${scale}) translateY(${ty / scale}px)`;
      heroCharWrap.style.opacity   = op;
      heroCharWrap.style.zIndex    = p1 > 0.4 ? 20 : 4;
    }

    if (heroTitleWrap) {
      const scale = 1 + p1 * 0.75;
      const ty    = -p1 * H * 0.22;
      const op    = clamp(1 - p1 * 1.9, 0, 1);
      heroTitleWrap.style.transform = `scale(${scale}) translateY(${ty / scale}px)`;
      heroTitleWrap.style.opacity   = op;
    }

    if (heroCircle) {
      const scale = 1 + p1 * 2.2;
      heroCircle.style.transform = `translateX(-50%) scale(${scale})`;
      heroCircle.style.opacity   = clamp(1 - p1 * 2.2, 0, 1);
    }

    if (heroRibbon) {
      heroRibbon.style.transform = `translateY(${p1 * 70}px)`;
      heroRibbon.style.opacity   = clamp(1 - p1 * 4, 0, 1);
    }

    // ── DETAILS section (detailsTop → galleryTop) ──────────────
    const p2 = progress(scroll, detailsTop, galleryTop);

    if (charPeekWrap) {
      const ty = -p2 * 60;
      const op = p2 < 0.5 ? 1 : clamp(1 - (p2 - 0.5) / 0.45, 0, 1);
      charPeekWrap.style.transform = `translateY(${ty}px)`;
      charPeekWrap.style.opacity   = op;
    }

    if (detailsHl) {
      detailsHl.style.transform = `translateY(${-p2 * 110}px)`;
    }

    // ── CLOSING section ─────────────────────────────────────
    if (closingSection) {
      const closingTop = closingSection.offsetTop;

      // p3: 0 when closing section enters viewport bottom → 1 when fully visible
      const p3 = progress(scroll, closingTop - H, closingTop);

      // ── Closing character slide up and fade in (visible viewport range) ───
      if (closingCharWrap) {
        // Starts animating when the character enters the viewport, and completes at page bottom
        const pChar = progress(scroll, closingTop - H * 0.45, closingTop);
        const ty = (1 - pChar) * 180;        // slide up from 180px for a very visible slide effect
        closingCharWrap.style.transform = `translateY(${ty}px)`;
        closingCharWrap.style.opacity   = pChar;
      }

      if (closingTopText) {
        const textTy = (1 - p3) * 60;
        closingTopText.style.transform = `translateY(${textTy}px)`;
        closingTopText.style.opacity   = clamp(p3 * 2, 0, 1);
      }
    }
  }

  // Initial render
  applyTransforms(window.scrollY);
  window.addEventListener('resize', () => applyTransforms(window.scrollY));

  // ── Mouse parallax on hero ───────────────────────────────────
  const heroSection = document.getElementById('section-hero');
  if (heroSection && heroCharWrap) {
    heroSection.addEventListener('mousemove', (e) => {
      if (window.scrollY > vh() * 0.25) return;
      const rect = heroSection.getBoundingClientRect();
      const nx = (e.clientX - rect.width  / 2) / (rect.width  / 2);
      const ny = (e.clientY - rect.height / 2) / (rect.height / 2);
      heroCharWrap.style.transform = `translate(${nx * 12}px, ${ny * 8}px)`;
      if (heroCircle) heroCircle.style.transform = `translateX(calc(-50% + ${-nx * 5}px)) translateY(${-ny * 3}px)`;
    });
    heroSection.addEventListener('mouseleave', () => {
      if (window.scrollY > vh() * 0.25) return;
      heroCharWrap.style.transform = 'translate(0,0)';
      if (heroCircle) heroCircle.style.transform = 'translateX(-50%)';
    });
  }

  // ── Testimonials ─────────────────────────────────────────────
  const tData = [
    { text: '"Aakash Kumar represents a rare breed of advocates. His mastery over court procedures and brilliant defense strategies turned a corporate liability of millions into an absolute dismissal."', name: 'Vikram Malhotra', co: 'CEO, Nexa Industries', av: 'V' },
    { text: '"Relentless and sharp. He kept us informed at every step and delivered a summary judgment that secured our core intellectual property assets across multiple jurisdictions."', name: 'Meera Sen', co: 'General Counsel, Innovate Inc.', av: 'M' },
    { text: '"His counsel in the international arbitration tribunal was impeccable. An extraordinary capability to simplify complex cross-border trade disputes and present them with impact."', name: 'Rajesh Singhal', co: 'Director, Singhal Ventures', av: 'R' }
  ];

  const testText   = document.getElementById('test-text');
  const testName   = document.getElementById('test-name');
  const testCo     = document.getElementById('test-co');
  const testAvatar = document.getElementById('test-avatar');
  const testDots   = document.querySelectorAll('.test-dot');
  let   currentT   = 0;

  function showTest(i) {
    if (!testText) return;
    testText.style.opacity = '0';
    setTimeout(() => {
      const d = tData[i];
      testText.textContent   = d.text;
      if (testName)   testName.textContent   = d.name;
      if (testCo)     testCo.textContent     = d.co;
      if (testAvatar) testAvatar.textContent = d.av;
      testText.style.opacity = '1';
    }, 260);
    testDots.forEach((dot, idx) => dot.classList.toggle('active', idx === i));
  }

  testDots.forEach(dot => {
    dot.addEventListener('click', () => {
      currentT = parseInt(dot.dataset.idx);
      showTest(currentT);
    });
  });

  setInterval(() => {
    currentT = (currentT + 1) % tData.length;
    showTest(currentT);
  }, 6500);

  // ── Gallery nav ──────────────────────────────────────────────
  document.querySelectorAll('.gnum').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.gnum').forEach(g => g.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // ── Mobile Menu Toggle ─────────────────────────────────────────
  const navMenuBtn = document.querySelector('.nav-menu-btn');
  const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
  const mobileNavClose = document.getElementById('mobile-nav-close');

  if (navMenuBtn && mobileNavOverlay) {
    navMenuBtn.addEventListener('click', () => {
      mobileNavOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  function closeMobileMenu() {
    if (mobileNavOverlay) {
      mobileNavOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (mobileNavClose) {
    mobileNavClose.addEventListener('click', closeMobileMenu);
  }

  document.querySelectorAll('.mobile-nav-links a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // ── Nav smooth scroll ────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const el = document.querySelector(id);
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

});
