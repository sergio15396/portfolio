document.addEventListener('DOMContentLoaded', () => {
  // Detectar si estamos en móvil
  const isMobile = window.innerWidth <= 430;

  // Elementos del contenedor y controles para los proyectos
  const container = document.querySelector('#projects .projects-track');
  const items = Array.from(container?.querySelectorAll('.project-card') || []);
  const controls = Array.from(document.querySelectorAll('#projects .projects-filters [data-filter]'));
  const prevBtn = document.querySelector('#projects .projects-arrow.left');
  const nextBtn = document.querySelector('#projects .projects-arrow.right');
  let currentIndex = 0;

  // Función para aplicar el filtro (compartida móvil/desktop)
  function applyFilter(key) {
    items.forEach(item => {
      const tags = (item.getAttribute('data-tags') || '').split(',');
      const show = key === 'all' || tags.includes(key);
      item.style.display = show ? '' : 'none';
    });
    currentIndex = 0;
  }

  // Evento de clic para los botones de filtro (móvil y desktop)
  controls.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-filter') || 'all';
      applyFilter(key);
      controls.forEach(b => {
        const isActive = b === btn;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    });
  });

  // Marcar por defecto el botón "all" en su color al cargar la página
  const defaultBtn = controls.find(b => b.getAttribute('data-filter') === 'all');
  if (defaultBtn) {
    defaultBtn.classList.add('active');
    defaultBtn.setAttribute('aria-pressed', 'true');
  }

  // Aplicar filtro por defecto
  applyFilter('all');

  // En móvil solo queremos filtros, sin lógica de carrusel
  if (isMobile) {
    // Opcionalmente ocultar flechas en móvil si se desea
    prevBtn?.classList.add('hidden');
    nextBtn?.classList.add('hidden');
    return;
  }

  const getVisibleItems = () => items.filter(item => item.style.display !== 'none');

  const getStepWidth = () => {
    const reference = getVisibleItems()[0] || items[0];
    if (!reference) {
      return 0;
    }
    const cardWidth = reference.getBoundingClientRect().width;
    const styles = container ? getComputedStyle(container) : null;
    const gap = styles ? parseFloat(styles.gap) || 0 : 0;
    return cardWidth + gap;
  };

  const updateArrows = visibleCount => {
    const maxIndex = Math.max(0, visibleCount - 3);
    prevBtn?.classList.toggle('disabled', currentIndex === 0);
    // Deshabilitar la flecha derecha cuando hay 3 o menos proyectos o cuando estamos al final
    const shouldDisableNext = currentIndex >= maxIndex || visibleCount <= 3;
    nextBtn?.classList.toggle('disabled', shouldDisableNext);
    // Ajustar atributos accesibles/tabindex para las flechas
    if (prevBtn) {
      const disabledPrev = currentIndex === 0;
      prevBtn.setAttribute('aria-disabled', disabledPrev ? 'true' : 'false');
      prevBtn.setAttribute('tabindex', disabledPrev ? '-1' : '0');
    }
    if (nextBtn) {
      nextBtn.setAttribute('aria-disabled', shouldDisableNext ? 'true' : 'false');
      nextBtn.setAttribute('tabindex', shouldDisableNext ? '-1' : '0');
    }
  };

  const updateFocusable = () => {
    // Asegurarnos de que las flechas siempre sean focuseables
    if (prevBtn) prevBtn.setAttribute('tabindex', '0');
    if (nextBtn) nextBtn.setAttribute('tabindex', '0');

    const visible = getVisibleItems();
    // Marcamos sólo los elementos visibles en la ventana actual (currentIndex..currentIndex+2)
    visible.forEach(item => {
      const globalIndex = items.indexOf(item);
      const link = item.querySelector('a');
      if (!link) return;
      const inWindow = globalIndex >= currentIndex && globalIndex < currentIndex + 3;
      link.setAttribute('tabindex', inWindow ? '0' : '-1');
    });
  };

  const updateCarousel = () => {
    if (!container) {
      return;
    }
    const visibleItems = getVisibleItems();
    const visibleCount = visibleItems.length;
    if (!visibleCount) {
      container.style.transform = '';
      updateArrows(0);
      updateFocusable();
      return;
    }
    const maxIndex = Math.max(0, visibleCount - 3);
    currentIndex = Math.min(currentIndex, maxIndex);
    const offset = -currentIndex * getStepWidth();
    container.style.transform = `translateX(${offset}px)`;
    updateArrows(visibleCount);
    // Ajustar qué enlaces son focuseables (roving tabindex)
    updateFocusable();
  };

  // Función para mover el carrusel (flechas)
  prevBtn?.addEventListener('click', () => {
    currentIndex = Math.max(0, currentIndex - 1);
    updateCarousel();
  });

  nextBtn?.addEventListener('click', () => {
    const visibleCount = getVisibleItems().length;
    const maxIndex = Math.max(0, visibleCount - 3);
    currentIndex = Math.min(maxIndex, currentIndex + 1);
    updateCarousel();
  });

  // Navegación por teclado cuando el foco está dentro de la sección proyectos
  document.addEventListener('keydown', (e) => {
    const active = document.activeElement;
    if (!active) return;
    if (active.closest && active.closest('#projects')) {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextBtn?.click();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevBtn?.click();
      }
    }
  });

  window.addEventListener('resize', () => {
    updateCarousel();
  });

  // Inicializar carrusel y focos en desktop
  updateCarousel();
  updateFocusable();
});



