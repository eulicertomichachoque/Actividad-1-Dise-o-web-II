/* ===== CSS MODERNO CON VARIABLES Y NESTING ===== */

/* ===== VARIABLES CSS ===== */
:root {
    /* Colores principales */
    --color-primary: #4f46e5;
    --color-primary-dark: #4338ca;
    --color-secondary: #7c3aed;
    --color-accent: #10b981;
    --color-danger: #ef4444;
    --color-warning: #f59e0b;
    
    /* Colores neutrales */
    --color-light: #ffffff;
    --color-dark: #1f2937;
    --color-gray-50: #f9fafb;
    --color-gray-100: #f3f4f6;
    --color-gray-200: #e5e7eb;
    --color-gray-300: #d1d5db;
    --color-gray-400: #9ca3af;
    --color-gray-500: #6b7280;
    --color-gray-600: #4b5563;
    --color-gray-700: #374151;
    --color-gray-800: #1f2937;
    --color-gray-900: #111827;
    
    /* Gradientes */
    --gradient-primary: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    --gradient-dark: linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.3));
    --gradient-light: linear-gradient(135deg, var(--color-light) 0%, var(--color-gray-100) 100%);
    
    /* Sombras */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
    --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
    --shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25);
    --shadow-inner: inset 0 2px 4px rgba(0, 0, 0, 0.06);
    
    /* Bordes */
    --radius-sm: 0.375rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
    --radius-2xl: 1.5rem;
    --radius-full: 9999px;
    
    /* Transiciones */
    --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-normal: 300ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-bounce: 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
    
    /* Espaciado */
    --space-xs: 0.5rem;
    --space-sm: 0.75rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;
    --space-2xl: 3rem;
    --space-3xl: 4rem;
    
    /* Tipografía */
    --font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;
    --font-size-3xl: 1.875rem;
    --font-size-4xl: 2.25rem;
    --font-size-5xl: 3rem;
    
    /* Layout */
    --header-height: 4rem;
    --container-max: 1400px;
    --gallery-gap: 1.5rem;
    --image-height: 250px;
}

/* ===== DARK MODE SUPPORT ===== */
@media (prefers-color-scheme: dark) {
    :root {
        --color-light: #111827;
        --color-dark: #f9fafb;
        --color-gray-50: #1f2937;
        --color-gray-100: #374151;
        --color-gray-200: #4b5563;
        --color-gray-300: #6b7280;
        --color-gray-400: #9ca3af;
        --color-gray-500: #d1d5db;
        --color-gray-600: #e5e7eb;
        --color-gray-700: #f3f4f6;
        --color-gray-800: #f9fafb;
        --color-gray-900: #ffffff;
        
        --gradient-dark: linear-gradient(to top, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.5));
    }
}

/* ===== HIGH CONTRAST MODE ===== */
@media (prefers-contrast: high) {
    :root {
        --color-primary: #0000ff;
        --color-secondary: #800080;
        --gradient-dark: linear-gradient(to top, #000000, #333333);
    }
}

/* ===== RESET MEJORADO ===== */
*, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

body {
    font-family: var(--font-family);
    font-size: var(--font-size-base);
    line-height: 1.6;
    color: var(--color-gray-800);
    background: var(--gradient-primary);
    min-height: 100vh;
    padding: var(--space-md);
    position: relative;
}

body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
        radial-gradient(circle at 20% 80%, rgba(79, 70, 229, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(124, 58, 237, 0.15) 0%, transparent 50%);
    z-index: -1;
    pointer-events: none;
}

/* ===== UTILITY CLASSES ===== */
.visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

.skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--color-primary);
    color: var(--color-light);
    padding: var(--space-sm) var(--space-lg);
    border-radius: var(--radius-md);
    text-decoration: none;
    font-weight: 600;
    z-index: 10000;
    transition: top var(--transition-fast);
}

.skip-link:focus {
    top: var(--space-sm);
}

/* ===== CONTAINER ===== */
.container {
    width: 100%;
    max-width: var(--container-max);
    margin: 0 auto;
    background: var(--color-light);
    border-radius: var(--radius-2xl);
    overflow: hidden;
    box-shadow: var(--shadow-2xl);
    position: relative;
    animation: containerSlideUp var(--transition-slow) ease;
}

@keyframes containerSlideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* ===== HEADER MEJORADO ===== */
.header {
    padding: var(--space-3xl) var(--space-xl) var(--space-2xl);
    text-align: center;
    background: var(--gradient-light);
    border-bottom: 1px solid var(--color-gray-200);
    position: relative;
    overflow: hidden;
}

.header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--gradient-primary);
}

.header-content {
    max-width: 800px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
}

.header-icon {
    font-size: 4rem;
    margin-bottom: var(--space-lg);
    animation: float 3s ease-in-out infinite;
    display: inline-block;
}

@keyframes float {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-10px);
    }
}

.header-text {
    margin-bottom: var(--space-xl);
}

.header-title {
    color: var(--color-gray-900);
    font-size: clamp(var(--font-size-4xl), 5vw, var(--font-size-5xl));
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: var(--space-sm);
    background: var(--gradient-primary);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: textReveal 0.8s ease-out;
}

@keyframes textReveal {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.header-subtitle {
    color: var(--color-gray-600);
    font-size: clamp(var(--font-size-lg), 2vw, var(--font-size-xl));
    max-width: 600px;
    margin: 0 auto;
    animation: textReveal 0.8s ease-out 0.2s both;
}

/* ===== IMAGE COUNTER ===== */
.image-counter {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    background: var(--color-primary);
    color: var(--color-light);
    padding: var(--space-xs) var(--space-lg);
    border-radius: var(--radius-full);
    font-weight: 600;
    margin-top: var(--space-md);
    animation: counterPopIn 0.6s var(--transition-bounce) 0.4s both;
}

@keyframes counterPopIn {
    0% {
        opacity: 0;
        transform: scale(0.8);
    }
    70% {
        transform: scale(1.1);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}

.counter-number {
    font-size: var(--font-size-xl);
    font-weight: 700;
}

.counter-text {
    font-size: var(--font-size-sm);
    opacity: 0.9;
}

/* ===== FILTER NAVIGATION ===== */
.filter-nav {
    display: flex;
    justify-content: center;
    gap: var(--space-sm);
    padding: var(--space-lg);
    background: var(--color-gray-50);
    border-bottom: 1px solid var(--color-gray-200);
    flex-wrap: wrap;
}

.filter-btn {
    padding: var(--space-sm) var(--space-lg);
    background: var(--color-light);
    color: var(--color-gray-700);
    border: 2px solid var(--color-gray-300);
    border-radius: var(--radius-full);
    font-weight: 600;
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
    position: relative;
    overflow: hidden;
    min-width: 100px;
}

.filter-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--gradient-primary);
    opacity: 0;
    transition: opacity var(--transition-fast);
    z-index: 1;
}

.filter-btn span {
    position: relative;
    z-index: 2;
}

.filter-btn:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.filter-btn.active {
    background: var(--gradient-primary);
    color: var(--color-light);
    border-color: transparent;
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.filter-btn.active::before {
    opacity: 1;
}

.filter-btn:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
}

/* ===== MAIN CONTENT ===== */
.main-content {
    padding: var(--space-xl);
}

/* ===== GALLERY GRID MEJORADO ===== */
.gallery {
    container-type: inline-size;
    container-name: gallery;
}

.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: var(--gallery-gap);
    animation: gridFadeIn 0.6s ease-out 0.6s both;
}

@keyframes gridFadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

/* ===== GALLERY ITEM MEJORADO ===== */
.gallery-item {
    position: relative;
    background: var(--color-light);
    border-radius: var(--radius-xl);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    transition: all var(--transition-normal) var(--transition-bounce);
    will-change: transform, box-shadow;
    aspect-ratio: 4/3;
    animation: itemSlideUp 0.5s ease-out;
    animation-fill-mode: both;
}

/* Animación escalonada para los items */
.gallery-item:nth-child(1) { animation-delay: 0.7s; }
.gallery-item:nth-child(2) { animation-delay: 0.8s; }
.gallery-item:nth-child(3) { animation-delay: 0.9s; }
.gallery-item:nth-child(4) { animation-delay: 1.0s; }
.gallery-item:nth-child(5) { animation-delay: 1.1s; }
.gallery-item:nth-child(6) { animation-delay: 1.2s; }
.gallery-item:nth-child(7) { animation-delay: 1.3s; }
.gallery-item:nth-child(8) { animation-delay: 1.4s; }
.gallery-item:nth-child(9) { animation-delay: 1.5s; }
.gallery-item:nth-child(10) { animation-delay: 1.6s; }
.gallery-item:nth-child(11) { animation-delay: 1.7s; }
.gallery-item:nth-child(12) { animation-delay: 1.8s; }

@keyframes itemSlideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.gallery-item:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow: var(--shadow-2xl);
    z-index: 10;
}

.gallery-item:focus-within {
    outline: 3px solid var(--color-primary);
    outline-offset: 2px;
}

/* ===== IMAGE CONTAINER ===== */
.image-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: var(--color-gray-100);
}

.gallery-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform var(--transition-slow) cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
    opacity: 0;
    animation: imageFadeIn 0.5s ease-out 0.3s forwards;
}

@keyframes imageFadeIn {
    to {
        opacity: 1;
    }
}

.gallery-image.loaded {
    opacity: 1;
}

.gallery-item:hover .gallery-image {
    transform: scale(1.15);
}

/* ===== LOADING OVERLAY ===== */
.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--color-gray-100);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity var(--transition-normal);
    z-index: 2;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--color-gray-300);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* ===== OVERLAY MEJORADO ===== */
.overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--gradient-dark);
    color: var(--color-light);
    padding: var(--space-xl);
    transform: translateY(100%);
    transition: transform var(--transition-normal) cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 3;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 50%;
    backdrop-filter: blur(10px);
}

.gallery-item:hover .overlay {
    transform: translateY(0);
}

.overlay-content {
    flex: 1;
}

.image-title {
    font-size: var(--font-size-lg);
    font-weight: 700;
    margin-bottom: var(--space-xs);
    line-height: 1.3;
}

.image-desc {
    font-size: var(--font-size-sm);
    opacity: 0.9;
    margin-bottom: var(--space-md);
    line-height: 1.4;
}

/* ===== IMAGE META ===== */
.image-meta {
    display: flex;
    gap: var(--space-sm);
    flex-wrap: wrap;
    margin-bottom: var(--space-lg);
}

.meta-item {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    background: rgba(255, 255, 255, 0.15);
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-full);
    font-size: var(--font-size-xs);
    font-weight: 500;
    backdrop-filter: blur(5px);
}

/* ===== VIEW BUTTON ===== */
.view-btn {
    align-self: flex-start;
    background: var(--color-light);
    color: var(--color-primary);
    border: none;
    padding: var(--space-sm) var(--space-lg);
    border-radius: var(--radius-full);
    font-weight: 600;
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    margin-top: auto;
}

.view-btn:hover {
    background: var(--color-primary);
    color: var(--color-light);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.view-btn:focus {
    outline: 2px solid var(--color-light);
    outline-offset: 2px;
}

/* ===== LOADING INDICATOR ===== */
.loading-indicator {
    text-align: center;
    padding: var(--space-2xl);
    background: var(--color-gray-50);
    border-radius: var(--radius-xl);
    margin-top: var(--space-xl);
    border: 2px dashed var(--color-gray-300);
}

.spinner {
    width: 50px;
    height: 50px;
    border: 3px solid var(--color-gray-300);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto var(--space-md);
}

/* ===== GALLERY STATS ===== */
.gallery-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--space-lg);
    margin-top: var(--space-2xl);
    padding: var(--space-xl);
    background: var(--color-gray-50);
    border-radius: var(--radius-xl);
}

.stat-item {
    text-align: center;
    padding: var(--space-lg);
    background: var(--color-light);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    transition: transform var(--transition-fast);
}

.stat-item:hover {
    transform: translateY(-4px);
}

.stat-number {
    display: block;
    font-size: var(--font-size-3xl);
    font-weight: 800;
    color: var(--color-primary);
    margin-bottom: var(--space-xs);
}

.stat-label {
    font-size: var(--font-size-sm);
    color: var(--color-gray-600);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

/* ===== IMAGE MODAL ===== */
.image-modal {
    border: none;
    background: transparent;
    padding: 0;
    max-width: 90vw;
    max-height: 90vh;
    width: auto;
    height: auto;
    border-radius: var(--radius-2xl);
    overflow: hidden;
}

.image-modal::backdrop {
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
}

.modal-content {
    position: relative;
    background: var(--color-light);
    border-radius: var(--radius-2xl);
    overflow: hidden;
    max-width: 1200px;
    width: 100%;
    animation: modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: scale(0.9) translateY(20px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.modal-header {
    padding: var(--space-lg) var(--space-xl);
    background: var(--gradient-primary);
    color: var(--color-light);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-title {
    font-size: var(--font-size-xl);
    font-weight: 700;
}

.modal-close {
    background: none;
    border: none;
    color: var(--color-light);
    font-size: var(--font-size-2xl);
    cursor: pointer;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color var(--transition-fast);
}

.modal-close:hover {
    background: rgba(255, 255, 255, 0.2);
}

.modal-body {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: var(--space-xl);
    padding: var(--space-xl);
}

@media (max-width: 768px) {
    .modal-body {
        grid-template-columns: 1fr;
    }
}

.modal-image-container {
    position: relative;
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--color-gray-100);
    aspect-ratio: 16/9;
}

.modal-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
}

.image-loader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50px;
    height: 50px;
    border: 3px solid var(--color-gray-300);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.modal-info {
    padding: var(--space-lg);
    background: var(--color-gray-50);
    border-radius: var(--radius-lg);
}

.modal-info h3 {
    font-size: var(--font-size-lg);
    font-weight: 700;
    margin-bottom: var(--space-sm);
    color: var(--color-gray-900);
}

.modal-info p {
    color: var(--color-gray-600);
    margin-bottom: var(--space-lg);
    line-height: 1.6;
}

.modal-meta {
    display: flex;
    gap: var(--space-md);
    flex-wrap: wrap;
}

.modal-meta span {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    background: var(--color-light);
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--color-gray-700);
}

.modal-footer {
    padding: var(--space-lg) var(--space-xl);
    background: var(--color-gray-50);
    border-top: 1px solid var(--color-gray-200);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-nav {
    padding: var(--space-sm) var(--space-lg);
    background: var(--color-light);
    color: var(--color-primary);
    border: 2px solid var(--color-primary);
    border-radius: var(--radius-full);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
    display: flex;
    align-items: center;
    gap: var(--space-xs);
}

.modal-nav:hover {
    background: var(--color-primary);
    color: var(--color-light);
    transform: translateY(-2px);
}

.modal-nav:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

.modal-counter {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--color-gray-700);
}

/* ===== FOOTER MEJORADO ===== */
.footer {
    padding: var(--space-2xl) var(--space-xl);
    background: var(--color-gray-900);
    color: var(--color-light);
    border-top: 1px solid var(--color-gray-800);
}

.footer-content {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
}

.footer-text {
    font-size: var(--font-size-lg);
    margin-bottom: var(--space-lg);
    opacity: 0.9;
}

.footer-text a {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 600;
    transition: color var(--transition-fast);
}

.footer-text a:hover {
    color: var(--color-accent);
    text-decoration: underline;
}

.footer-tech {
    display: flex;
    justify-content: center;
    gap: var(--space-sm);
    flex-wrap: wrap;
}

.tech-tag {
    background: rgba(255, 255, 255, 0.1);
    padding: var(--space-xs) var(--space-md);
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    font-weight: 500;
    backdrop-filter: blur(10px);
    transition: all var(--transition-fast);
}

.tech-tag:hover {
    background: var(--color-primary);
    transform: translateY(-2px);
}

/* ========================================
   CONTAINER QUERIES RESPONSIVE
   Usando container queries en lugar de media queries
   ======================================== */

/* Container query para galería */
@container gallery (max-width: 480px) {
    .gallery-grid {
        grid-template-columns: 1fr;
        gap: var(--space-md);
    }
    
    .gallery-item {
        aspect-ratio: 3/2;
    }
}

@container gallery (min-width: 768px) {
    .gallery-grid {
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--space-xl);
    }
}

@container gallery (min-width: 1024px) {
    .gallery-grid {
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    }
}

@container gallery (min-width: 1400px) {
    .gallery-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

/* ========================================
   MEDIA QUERIES FALLBACK
   Para navegadores que no soportan container queries
   ======================================== */

/* Móvil pequeño */
@media (max-width: 480px) {
    body {
        padding: var(--space-xs);
    }
    
    .container {
        border-radius: var(--radius-lg);
    }
    
    .header {
        padding: var(--space-2xl) var(--space-lg);
    }
    
    .filter-nav {
        padding: var(--space-md);
    }
    
    .filter-btn {
        min-width: auto;
        padding: var(--space-xs) var(--space-md);
        font-size: var(--font-size-xs);
    }
    
    .main-content {
        padding: var(--space-lg);
    }
    
    .gallery-stats {
        grid-template-columns: 1fr;
        gap: var(--space-md);
        padding: var(--space-lg);
    }
}

/* Tablet */
@media (min-width: 768px) {
    .header {
        padding: var(--space-3xl) var(--space-2xl);
    }
    
    .gallery-grid {
        gap: var(--space-xl);
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .header-title {
        font-size: var(--font-size-5xl);
    }
    
    .header-subtitle {
        font-size: var(--font-size-xl);
    }
    
    .gallery-grid {
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    }
}

/* Desktop grande */
@media (min-width: 1400px) {
    .gallery-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

/* ========================================
   PREFERS-REDUCED-MOTION
   Respetar preferencias de movimiento
   ======================================== */
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
    
    .gallery-item:hover {
        transform: translateY(-4px);
    }
    
    .gallery-item:hover .gallery-image {
        transform: scale(1.05);
    }
}

/* ========================================
   PRINT STYLES
   Optimización para impresión
   ======================================== */
@media print {
    body {
        background: white !important;
        color: black !important;
        padding: 0 !important;
    }
    
    .container {
        box-shadow: none !important;
        border-radius: 0 !important;
        max-width: 100% !important;
    }
    
    .header,
    .filter-nav,
    .view-btn,
    .loading-indicator,
    .footer,
    .modal-content {
        display: none !important;
    }
    
    .gallery-grid {
        display: block !important;
    }
    
    .gallery-item {
        break-inside: avoid;
        page-break-inside: avoid;
        margin-bottom: 1cm;
        box-shadow: none !important;
        border: 1px solid #ccc !important;
    }
    
    .gallery-image {
        height: auto !important;
        max-height: 10cm !important;
    }
    
    .overlay {
        position: static !important;
        transform: none !important;
        background: white !important;
        color: black !important;
        padding: 0.5cm !important;
    }
}

/* ========================================
   DARK MODE OVERRIDES
   Ajustes específicos para dark mode
   ======================================== */
@media (prefers-color-scheme: dark) {
    .gallery-item {
        border: 1px solid var(--color-gray-800);
    }
    
    .stat-item {
        background: var(--color-gray-800);
    }
    
    .modal-content {
        background: var(--color-gray-900);
        color: var(--color-light);
    }
    
    .modal-info {
        background: var(--color-gray-800);
    }
    
    .modal-nav {
        background: var(--color-gray-800);
        color: var(--color-light);
        border-color: var(--color-primary);
    }
}
