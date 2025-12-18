document.addEventListener('DOMContentLoaded', () => {
  // Detectar si estamos en móvil
  const isMobile = window.innerWidth <= 430;
  
  // Elementos del contenedor y controles para las habilidades
  const container = document.querySelector('#skills .logos');
  const items = Array.from(container?.querySelectorAll('.carousel-item') || []);
  const controls = Array.from(document.querySelectorAll('#skills .logos-filters [data-filter]'));
  const skillsSection = document.querySelector('#skills');

  // Función para aplicar el filtro
  function applyFilter(key) {
    items.forEach(item => {
      const cat = item.getAttribute('data-category');
      const show = key === 'all' || key === cat;
      item.style.display = show ? '' : 'none';
    });
  }

  // SOLO en desktop mantener la corrección de scroll
  function maintainSectionScroll() {
    if (!skillsSection || isMobile) return; // No hacer nada en móvil
    
    const vh = window.innerHeight;
    const sectionIndex = Array.from(document.querySelectorAll('section:not(#header)')).indexOf(skillsSection);
    const targetScroll = sectionIndex * vh;
    const currentScroll = window.pageYOffset || window.scrollY;
    
    if (Math.abs(currentScroll - targetScroll) > 50) {
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
  }

  // Prevenir scroll automático SOLO en desktop
  controls.forEach(btn => {
    btn.addEventListener('focus', () => {
      if (!isMobile) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            maintainSectionScroll();
          });
        });
      }
    });

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

  // default
  applyFilter('all');
});



