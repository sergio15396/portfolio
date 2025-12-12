document.addEventListener('DOMContentLoaded', function() {
    // Elementos del menú
    const menuToggle = document.getElementById('menu-toggle');
    const header = document.getElementById('header');

    // Función para alternar el menú
    function toggleMenu() {
        const isOpen = header.classList.toggle('header-open');
        menuToggle.classList.toggle('header-open');
        // Actualizar aria-expanded
        menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');

        // Cambiar tabindex: si abre, desactivar tab del fondo; si cierra, reactivar
        const allFocusable = document.querySelectorAll('a[href], button:not(#menu-toggle), input:not([type="hidden"]), textarea, select');
        allFocusable.forEach(el => {
            if (isOpen) {
                // Guardar el tabindex original en data-original-tabindex si no lo tiene
                if (!el.hasAttribute('data-original-tabindex')) {
                    el.setAttribute('data-original-tabindex', el.getAttribute('tabindex') || '0');
                }
                // Desactivar tab del fondo (excepto si está dentro del header)
                if (!header.contains(el)) {
                    el.setAttribute('tabindex', '-1');
                }
            } else {
                // Restaurar tabindex original
                if (el.hasAttribute('data-original-tabindex')) {
                    const original = el.getAttribute('data-original-tabindex');
                    if (original === '0') {
                        el.removeAttribute('tabindex');
                    } else {
                        el.setAttribute('tabindex', original);
                    }
                    el.removeAttribute('data-original-tabindex');
                }
            }
        });
    }

    // Evento de clic para el botón del menú
    menuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        toggleMenu();
    });

    // Cerrar el menú cuando se hace clic en un enlace
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', () => {
            toggleMenu();
        });
    });

    // Abrir y cerrar (toggle) el menú con la tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // No interferir si el usuario está escribiendo en un input/textarea o en contenido editable
            const active = document.activeElement;
            if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) {
                return;
            }
            toggleMenu();
        }
    });

    // Navegar por los enlaces del menú con Tab y Shift+Tab
    // solo navegar por los 'a' dentro del header cuando el menú está abierto
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab' && header.classList.contains('header-open')) {
            const focusableElements = Array.from(header.querySelectorAll('a'));
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else { // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    });
            

});