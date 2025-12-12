document.addEventListener('DOMContentLoaded', () => {
  let isScrolling = false;
  let currentSection = 0;
  let pendingScroll = null;
  const sections = document.querySelectorAll('section:not(#header)');
  let vh = window.innerHeight;

  // Función para obtener el índice de sección actual basado en el scroll
  const getCurrentSectionIndex = () => {
    const currentScroll = window.pageYOffset || window.scrollY;
    return Math.round(currentScroll / vh);
  };

  // Función para desplazar a una sección específica
  const scrollToSection = (index, force = false) => {
    // Limitar el índice dentro del rango válido
    index = Math.max(0, Math.min(index, sections.length - 1));
    
    // Si ya estamos en esa sección y no es forzado, no hacer nada
    if (!force && index === currentSection && !isScrolling) return;
    
    // Si ya hay un scroll en progreso, guardar esta petición
    if (isScrolling && !force) {
      pendingScroll = index;
      return;
    }
    
    isScrolling = true;
    currentSection = index;
    const targetScroll = index * vh;
    const startScroll = window.pageYOffset || window.scrollY;
    const distance = targetScroll - startScroll;
    const duration = 500; // 0.3s como --transition-speed  
    const startTime = performance.now();
    
    // Función de animación usando requestAnimationFrame
    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Función de easing (ease-in-out)
      const easeInOut = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      const currentScrollPos = startScroll + distance * easeInOut;
      window.scrollTo(0, currentScrollPos);
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        // Asegurar que termine exactamente en la posición correcta
        window.scrollTo(0, targetScroll);
        
        // Permitir el siguiente scroll después de que termine la animación
        setTimeout(() => {
          isScrolling = false;
          
          // Si hay un scroll pendiente, ejecutarlo
          if (pendingScroll !== null) {
            const nextIndex = pendingScroll;
            pendingScroll = null;
            scrollToSection(nextIndex);
          }
        }, 50);
      }
    };
    
    // Iniciar la animación
    requestAnimationFrame(animateScroll);
  };

  // Detectar scroll con la rueda del mouse
  let scrollTimeout;
  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    // Limpiar timeout anterior
    clearTimeout(scrollTimeout);
    
    // Esperar un poco para agrupar eventos de scroll rápidos
    scrollTimeout = setTimeout(() => {
      if (isScrolling) return;
      
      const delta = e.deltaY;
      const currentScroll = window.pageYOffset || window.scrollY;
      const currentIndex = Math.round(currentScroll / vh);
      
      if (delta > 0) {
        // Scroll hacia abajo
        scrollToSection(currentIndex + 1);
      } else {
        // Scroll hacia arriba
        scrollToSection(currentIndex - 1);
      }
    }, 50);
  }, { passive: false });

  // Detectar teclas de flecha
  window.addEventListener('keydown', (e) => {
    // Solo procesar si no estamos en un input o textarea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }
    
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      const currentIndex = getCurrentSectionIndex();
      scrollToSection(currentIndex + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      const currentIndex = getCurrentSectionIndex();
      scrollToSection(currentIndex - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      scrollToSection(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      scrollToSection(sections.length - 1);
    }
  });

  // Ajustar posición inicial si es necesario
  window.addEventListener('load', () => {
    const currentScroll = window.pageYOffset || window.scrollY;
    const currentIndex = Math.round(currentScroll / vh);
    if (currentIndex > 0) {
      scrollToSection(currentIndex);
    }
  });

  // Manejar redimensionamiento de ventana
  window.addEventListener('resize', () => {
    vh = window.innerHeight; // Actualizar el valor de vh
    const currentIndex = getCurrentSectionIndex();
    scrollToSection(currentIndex, true); // Forzar el scroll para realinear
  });

  // Detectar scroll automático del navegador (por ejemplo, al hacer Tab) y corregirlo
  let scrollCorrectionTimeout;
  let programmaticScrollTime = 0;
  
  // Interceptar scrollTo para marcar cuando es programático
  const originalScrollTo = window.scrollTo;
  window.scrollTo = function(...args) {
    programmaticScrollTime = Date.now();
    return originalScrollTo.apply(this, args);
  };
  
  window.addEventListener('scroll', () => {
    const now = Date.now();
    
    // Si estamos haciendo scroll programático, ignorar
    if (isScrolling) return;
    
    // Si el scroll fue muy reciente (menos de 200ms), probablemente es programático
    if (now - programmaticScrollTime < 200) return;
    
    clearTimeout(scrollCorrectionTimeout);
    scrollCorrectionTimeout = setTimeout(() => {
      // Solo corregir si no hay scroll en progreso
      if (isScrolling) return;
      
      const currentScroll = window.pageYOffset || window.scrollY;
      const currentIndex = getCurrentSectionIndex();
      const expectedScroll = currentIndex * vh;
      const difference = Math.abs(currentScroll - expectedScroll);
      
      // Si el scroll está desalineado (más de 20px de diferencia), corregirlo
      if (difference > 20) {
        scrollToSection(currentIndex, true); // Forzar corrección
      }
    }, 200);
  }, { passive: true });
});

