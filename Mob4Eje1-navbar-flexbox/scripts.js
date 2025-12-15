/* ==========================================
   Navbar + UI interactions (mejorado)
   ==========================================
   Requisitos: elementos en el DOM:
   - #navbarToggle  (botón hamburguesa)
   - #navbarMenu    (ul de links)
   - .navbar-actions
   - #navbar
   - .nav-link (enlaces)
   - .section (secciones con id)
-------------------------------------------*/

(function () {
  // ===== utilidades =====
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== nodos principales =====
  const navbarToggle = document.getElementById('navbarToggle');
  const navbarMenu = document.getElementById('navbarMenu');
  const navbarActions = document.querySelector('.navbar-actions');
  const navLinks = $$('.nav-link');
  const navbar = document.getElementById('navbar');

  // Si faltan nodos, salimos silenciosamente (evita errores en páginas sin nav)
  if (!navbarToggle || !navbarMenu || !navbar) return;

  // ===== crear overlay móvil (para cerrar al click fuera) =====
  let mobileOverlay = $('.mobile-overlay');
  if (!mobileOverlay) {
    mobileOverlay = document.createElement('div');
    mobileOverlay.className = 'mobile-overlay';
    document.body.appendChild(mobileOverlay);
  }

  // Optional: crear un mobile-panel wrapper si prefieres (tu CSS puede usar .mobile-panel)
  // En este script mantenemos el comportamiento activando .active en navbarMenu + navbarActions

  // ===== helpers para abrir/cerrar menú =====
  function openMenu() {
    navbarToggle.classList.add('active');
    navbarMenu.classList.add('active');
    if (navbarActions) navbarActions.classList.add('active');

    // aria
    navbarToggle.setAttribute('aria-expanded', 'true');

    // mostrar overlay
    mobileOverlay.classList.add('open');

    // bloquear scroll añadiendo clase (CSS debe manejar body.menu-open { overflow:hidden })
    document.body.classList.add('menu-open');

    // opcional: mover foco al primer link (mejora accesibilidad)
    if (!prefersReducedMotion) {
      const firstLink = navLinks[0];
      if (firstLink) firstLink.focus();
    }
  }

  function closeMenu() {
    navbarToggle.classList.remove('active');
    navbarMenu.classList.remove('active');
    if (navbarActions) navbarActions.classList.remove('active');

    navbarToggle.setAttribute('aria-expanded', 'false');

    mobileOverlay.classList.remove('open');
    document.body.classList.remove('menu-open');

    // devolver foco al toggle (buena práctica A11Y)
    navbarToggle.focus();
  }

  // ===== toggle (click hamburguesa) =====
  navbarToggle.addEventListener('click', (e) => {
    const isOpen = navbarMenu.classList.contains('active');
    if (isOpen) closeMenu();
    else openMenu();
  });

  // ===== cerrar menú al hacer click en overlay =====
  mobileOverlay.addEventListener('click', () => {
    if (navbarMenu.classList.contains('active')) closeMenu();
  });

  // ===== cerrar al hacer click en un enlace (modo móvil) + marcar active =====
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      // marcar active visual
      navLinks.forEach((l) => l.classList.remove('active'));
      link.classList.add('active');

      // si el menú está abierto en móvil, cerrarlo
      if (navbarMenu.classList.contains('active')) closeMenu();

      // Si es un hash interno, hacer smooth scroll compensando la altura del navbar
      const href = link.getAttribute('href') || '';
      if (href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const navHeight = navbar.offsetHeight || 0;
          const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 8;
          window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }
      }
    });
  });

  // ===== cerrar al hacer click fuera (desktop) =====
  document.addEventListener('click', (e) => {
    // si el clic NO está dentro de navbar y el menú está abierto, cerramos
    const isInside = navbar.contains(e.target);
    if (!isInside && navbarMenu.classList.contains('active')) closeMenu();
  });

  // ===== cerrar con Escape =====
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navbarMenu.classList.contains('active')) {
      closeMenu();
    }
  });

  // ===== cambiar estilo navbar al hacer scroll (debounced) =====
  let scrollTimeout = null;
  let lastScroll = window.pageYOffset || 0;

  function onScrollHandler() {
    const currentScroll = window.pageYOffset || 0;

    // Ejemplo: cambiar fondo cuando scrolleas hacia abajo
    if (currentScroll > 100) {
      navbar.classList.add('scrolled');   // puedes usar .scrolled en CSS para estilos
      navbar.classList.add('compact');    // opcional: efecto compacto
    } else {
      navbar.classList.remove('scrolled');
      navbar.classList.remove('compact');
    }

    lastScroll = currentScroll;
  }

  window.addEventListener('scroll', () => {
    // debounce básico para no ejecutar todo el tiempo
    if (scrollTimeout) window.clearTimeout(scrollTimeout);
    scrollTimeout = window.setTimeout(onScrollHandler, 12); // muy pequeño, efecto suave
  }, { passive: true });

  // ===== Scroll spy con IntersectionObserver (marca link activo según sección) =====
  const sections = $$('.section[id]');
  if (sections.length) {
    const observerOptions = {
      root: null,
      rootMargin: `-40% 0px -40% 0px`, // centro de la pantalla
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => link.classList.remove('active'));
          const targetLink = document.querySelector(`.nav-link[href="#${id}"]`);
          if (targetLink) targetLink.classList.add('active');
        }
      });
    }, observerOptions);

    sections.forEach(s => sectionObserver.observe(s));
  }

  // ===== animaciones de aparición (fade-in) con IntersectionObserver =====
  const animateTargets = $$('.service-card, .portfolio-item, .testimonial, .feature, .card, .product-card');
  if (animateTargets.length) {
    const animObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          // staggered delay para efecto ordenado
          const delay = prefersReducedMotion ? 0 : Math.min(300, idx * 80);
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, delay);
          animObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    animateTargets.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      animObserver.observe(el);
    });
  }

  // ===== mejora: marcar link activo según el hash al cargar la página =====
  (function setActiveFromHash() {
    const hash = window.location.hash;
    if (!hash) return;
    const link = document.querySelector(`.nav-link[href="${hash}"]`);
    if (link) {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  })();

  // ===== información en consola (opcional) =====
  console.log('Navbar JS inicializado — mobile menu, scroll-spy y animaciones activas.');
})();

