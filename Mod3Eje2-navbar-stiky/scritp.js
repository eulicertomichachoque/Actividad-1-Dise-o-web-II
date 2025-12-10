/* ===============================================
   NAVBAR STICKY + BLOBS TOGGLE + RESIZE DEBOUNCE
   - sticky detection (rAF throttled)
   - mobile menu toggle + disable body scroll when open
   - close menu with ESC / click outside
   - highlight active section
   - back-to-top visibility
   - blobs auto-disable on small screens + manual toggle button
   - resize handler debounced
   - respects prefers-reduced-motion
   =============================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ---------- Config ----------
  const BLOBS_AUTO_DISABLE_WIDTH = 768; // px - below this width blobs are auto-disabled
  const RESIZE_DEBOUNCE_MS = 150;      // ms debounce for resize events

  // ---------- Elements ----------
  const navbar = document.getElementById('navbar');
  const btnTop = document.getElementById('btnTop');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const decorBlobs = document.querySelector('.decor-blobs');

  // ---------- Safety checks ----------
  // If some elements are missing, continue gracefully
  if (!btnTop) console.warn('btnTop no encontrado (id="btnTop"). El botón "volver arriba" no funcionará.');
  if (!navToggle) console.warn('navToggle no encontrado (id="navToggle"). El menú móvil no funcionará.');
  if (!navMenu) console.warn('navMenu no encontrado (id="navMenu"). El menú podría no abrirse correctamente.');
  if (!navbar) console.warn('navbar no encontrado (id="navbar"). Algunas funcionalidades de sticky no estarán habilitadas.');

  // ---------- Preferences ----------
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- State ----------
  let lastKnownScrollY = window.scrollY;
  let ticking = false;
  const stickyOffset = navbar ? navbar.offsetTop : 0;
  let blobsEnabled = true; // runtime flag (can be toggled)

  // ---------- Utility helpers ----------
  function debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function setBodyScrollDisabled(disabled) {
    // prevent scroll behind opened mobile menu
    if (disabled) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
  }

  // ---------- Blobs control ----------
  // show/hide decorative blobs container (if exists)
  function enableBlobs(enable) {
    if (!decorBlobs) return;
    blobsEnabled = Boolean(enable);
    if (blobsEnabled) {
      decorBlobs.style.display = ''; // default from CSS
      decorBlobs.setAttribute('aria-hidden', 'true');
    } else {
      decorBlobs.style.display = 'none';
      decorBlobs.setAttribute('aria-hidden', 'true');
    }
    // store preference in localStorage so it persists across loads
    try {
      window.localStorage.setItem('decorBlobsEnabled', blobsEnabled ? '1' : '0');
    } catch (e) { /* ignore storage errors */ }
    // update toggle UI if present
    const btn = document.getElementById('blobsToggleBtn');
    if (btn) {
      btn.setAttribute('aria-pressed', blobsEnabled ? 'true' : 'false');
      btn.title = blobsEnabled ? 'Desactivar efectos decorativos' : 'Activar efectos decorativos';
      btn.classList.toggle('active', blobsEnabled);
    }
  }

  // auto-disable on small screens
  function autoHandleBlobsOnResize() {
    if (!decorBlobs) return;
    const w = window.innerWidth;
    // let user's manual choice override auto-disable if stored in localStorage
    let saved = null;
    try {
      saved = window.localStorage.getItem('decorBlobsEnabled');
    } catch (e) { saved = null; }

    if (saved === '0') {
      // user explicitly disabled -> keep disabled
      enableBlobs(false);
      return;
    } else if (saved === '1') {
      // user explicitly enabled -> keep enabled (unless extremely small screen)
      if (w < 420) enableBlobs(false); else enableBlobs(true);
      return;
    }

    // no explicit choice -> auto behavior
    if (w <= BLOBS_AUTO_DISABLE_WIDTH) enableBlobs(false);
    else enableBlobs(true);
  }

  // Create a small toggle button in the UI for blobs (if not present in DOM)
  function ensureBlobsToggleButton() {
    if (!decorBlobs) return null; // no blobs, no toggle needed
    if (document.getElementById('blobsToggleBtn')) return document.getElementById('blobsToggleBtn');

    const btn = document.createElement('button');
    btn.id = 'blobsToggleBtn';
    btn.type = 'button';
    btn.className = 'blobs-toggle';
    btn.innerHTML = '✨'; // simple sun/star icon
    btn.title = 'Activar/Desactivar efectos decorativos';
    btn.setAttribute('aria-pressed', 'true');
    btn.style.position = 'fixed';
    btn.style.left = '16px';
    btn.style.bottom = '16px';
    btn.style.zIndex = 9999;
    btn.style.width = '44px';
    btn.style.height = '44px';
    btn.style.borderRadius = '10px';
    btn.style.border = 'none';
    btn.style.cursor = 'pointer';
    btn.style.display = 'inline-flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.background = 'linear-gradient(90deg, #6ec3f4, #a78bfa)';
    btn.style.boxShadow = '0 10px 30px rgba(2,6,23,0.18)';
    btn.style.color = '#021025';
    btn.style.fontSize = '1.05rem';
    btn.style.userSelect = 'none';
    btn.setAttribute('aria-label', 'Activar o desactivar efectos decorativos de fondo');

    // click handler toggles blobs
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      enableBlobs(!blobsEnabled);
    });

    // keyboard accessibility
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        enableBlobs(!blobsEnabled);
      }
    });

    document.body.appendChild(btn);
    return btn;
  }

  // ---------- Scroll handling (rAF throttled) ----------
  function handleScroll(scrollY) {
    // navbar scrolled toggle
    if (navbar) {
      if (scrollY > (stickyOffset + 8)) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    }

    // back-to-top button
    if (btnTop) {
      if (scrollY > 300) btnTop.classList.add('visible');
      else btnTop.classList.remove('visible');
    }

    // highlight active section
    if (sections.length) {
      let current = '';
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const topDistance = rect.top + window.scrollY;
        if (window.pageYOffset >= (topDistance - 200)) current = section.id;
      });
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
      });
    }
  }

  function onScroll() {
    lastKnownScrollY = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll(lastKnownScrollY);
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // run once on load
  handleScroll(window.scrollY);

  // ---------- Back to top ----------
  if (btnTop) {
    btnTop.addEventListener('click', () => {
      if (!reduceMotion) window.scrollTo({ top: 0, behavior: 'smooth' });
      else window.scrollTo(0, 0);
    });
  }

  // ---------- Mobile menu toggle (with body scroll lock) ----------
  function openNavMenu() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.add('active');
    navToggle.classList.add('active');
    navToggle.setAttribute('aria-expanded', 'true');

    // disable body scroll when menu open (mobile)
    setBodyScrollDisabled(true);
  }

  function closeNavMenu(returnFocus = true) {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');

    // restore body scroll
    setBodyScrollDisabled(false);

    if (returnFocus) navToggle.focus();
  }

  if (navToggle) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (navMenu && navMenu.classList.contains('active')) closeNavMenu();
      else openNavMenu();
    });
  }

  // close on link click
  navLinks.forEach(link => link.addEventListener('click', () => {
    if (navMenu && navMenu.classList.contains('active')) closeNavMenu();
  }));

  // close on outside click (only if open)
  document.addEventListener('click', (e) => {
    if (!navMenu || !navToggle) return;
    if (!navMenu.classList.contains('active')) return;
    if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) closeNavMenu();
  });

  // close with ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (navMenu && navMenu.classList.contains('active')) closeNavMenu();
    }
  });

  // close menu on resize to desktop
  const onResizeDebounced = debounce(() => {
    // auto-manage blobs on resize (enable/disable)
    autoHandleBlobsOnResize();

    if (window.innerWidth > 768 && navMenu && navMenu.classList.contains('active')) {
      // if we're expanding to desktop, close mobile menu and keep body scroll
      closeNavMenu(false);
    }
  }, RESIZE_DEBOUNCE_MS);

  window.addEventListener('resize', onResizeDebounced);

  // ---------- Smooth scroll for anchor links (respect reduced motion) ----------
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href') || '';
      if (!href.startsWith('#')) return;
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();

      const navHeight = navbar ? navbar.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;
      if (!reduceMotion && 'scrollBehavior' in document.documentElement.style) {
        window.scrollTo({ top, behavior: 'smooth' });
      } else {
        window.scrollTo(0, top);
      }
    });
  });

  // ---------- Blobs initial state + UI toggle ----------
  // Ensure toggle button exists only if blobs container exists
  if (decorBlobs) {
    // create UI toggle
    ensureBlobsToggleButton();

    // apply saved preference or auto behavior
    try {
      const saved = window.localStorage.getItem('decorBlobsEnabled');
      if (saved === '0') enableBlobs(false);
      else if (saved === '1') enableBlobs(true);
      else autoHandleBlobsOnResize(); // no saved pref -> auto
    } catch (e) {
      // if localStorage fails, fallback to auto behavior
      autoHandleBlobsOnResize();
    }
  }

  // ---------- Optional: expose some debug helpers on window (non-critical) ----------
  try {
    window.__uiHelpers = window.__uiHelpers || {};
    window.__uiHelpers.enableBlobs = enableBlobs;
    window.__uiHelpers.closeNavMenu = closeNavMenu;
    window.__uiHelpers.openNavMenu = openNavMenu;
  } catch (e) { /* ignore */ }

  // ---------- Final log ----------
  console.log('🎯 Navbar Sticky + Enhancements cargado');
  console.log('  • Blobs (decor) detected:', Boolean(decorBlobs));
  console.log('  • Blobs auto-disable width:', BLOBS_AUTO_DISABLE_WIDTH, 'px');
  console.log('  • Resize debounce:', RESIZE_DEBOUNCE_MS, 'ms');
});
