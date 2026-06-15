/* ==========================================================================
   AURA VANCE - EDITORIAL FASHION STYLIST INTERACTIVE SCRIPT ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  gsap.registerPlugin(ScrollTrigger);

  const navItems = document.querySelectorAll('.nav-item');
  const shootSections = document.querySelectorAll('.shoot-section');
  const shootTargetsCache = new WeakMap();
  const prefersFinePointer = window.matchMedia('(pointer: fine)').matches;

  /* ==========================================================================
     0. HEADER ENTRANCE ANIMATION
     ========================================================================== */
  gsap.fromTo('.header',
    { opacity: 0, x: -30 },
    { opacity: 1, x: 0, duration: 1.5, ease: 'power4.out', delay: 0.5 }
  );

  /* ==========================================================================
     1. SMOOTH INERTIAL SCROLLING (LENIS)
     ========================================================================== */
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smoothWheel: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  lenis.on('scroll', ScrollTrigger.update);

  const cursorRing = document.getElementById('cursor-ring');
  const ambientGlow = document.getElementById('ambient-glow');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  const glowToX = ambientGlow
    ? gsap.quickTo(ambientGlow, 'x', { duration: 1.2, ease: 'power3.out' })
    : null;
  const glowToY = ambientGlow
    ? gsap.quickTo(ambientGlow, 'y', { duration: 1.2, ease: 'power3.out' })
    : null;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (prefersFinePointer && glowToX && glowToY) {
      glowToX(mouseX);
      glowToY(mouseY);
    }
  }, { passive: true });

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);

    if (prefersFinePointer && cursorRing) {
      ringX += (mouseX - ringX) * 0.28;
      ringY += (mouseY - ringY) * 0.28;
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    }
  });

  gsap.ticker.lagSmoothing(0);
  window.lenisInstance = lenis;

  document.addEventListener('mouseleave', () => {
    gsap.to(cursorRing, { opacity: 0, duration: 0.3 });
  });
  document.addEventListener('mouseenter', () => {
    gsap.to(cursorRing, { opacity: 1, duration: 0.3 });
  });

  const setupCursorHovers = () => {
    document.querySelectorAll('.card, .hero-thumb').forEach(card => {
      card.addEventListener('mouseenter', () => document.body.classList.add('hovering-card'));
      card.addEventListener('mouseleave', () => document.body.classList.remove('hovering-card'));
    });

    document.querySelectorAll('a, button, input, textarea, .nav-item').forEach(btn => {
      btn.addEventListener('mouseenter', () => document.body.classList.add('hovering-button'));
      btn.addEventListener('mouseleave', () => document.body.classList.remove('hovering-button'));
    });
  };
  setupCursorHovers();

  /* ==========================================================================
     2.1 CARD EXPANSION
     ========================================================================== */
  const setupCardExpansion = () => {
    const cards = document.querySelectorAll('.shoot-section .card');
    const overlay = document.getElementById('modal-overlay');
    let expandedCard = null;
    let expandedClone = null;

    const closeExpandedCard = () => {
      if (!expandedCard) return;

      if (expandedClone) {
        gsap.to(expandedClone, {
          opacity: 0,
          scale: 0.92,
          duration: 0.35,
          ease: 'power3.in',
          onComplete: () => {
            expandedClone.remove();
            expandedClone = null;
          }
        });
      }

      expandedCard.classList.remove('is-expanded-source');
      expandedCard = null;
      document.body.classList.remove('card-expanded-active');
      lenis.start();
    };

    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();

        if (expandedCard === card) {
          closeExpandedCard();
          return;
        }

        if (expandedCard) closeExpandedCard();

        expandedCard = card;
        card.classList.add('is-expanded-source');

        const rect = card.getBoundingClientRect();
        expandedClone = card.cloneNode(true);
        expandedClone.classList.add('card-expanded-clone');
        expandedClone.classList.remove('card-tilt');
        expandedClone.querySelectorAll('.card-num').forEach((el) => {
          el.style.display = 'none';
        });
        expandedClone.style.cssText = `
          position: fixed;
          top: ${rect.top}px;
          left: ${rect.left}px;
          width: ${rect.width}px;
          height: ${rect.height}px;
          margin: 0;
          z-index: 10001;
          pointer-events: none;
        `;
        document.body.appendChild(expandedClone);

        document.body.classList.add('card-expanded-active');
        lenis.stop();

        gsap.to(expandedClone, {
          top: '50%',
          left: '50%',
          x: '-50%',
          y: '-50%',
          width: Math.min(window.innerWidth * 0.72, 900),
          height: Math.min(window.innerHeight * 0.72, 680),
          borderRadius: 16,
          duration: 0.55,
          ease: 'power3.out',
          onComplete: () => {
            expandedClone.style.pointerEvents = 'auto';
          }
        });
      });
    });

    if (overlay) {
      overlay.addEventListener('click', closeExpandedCard);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && expandedCard) closeExpandedCard();
    });
  };
  setupCardExpansion();

  /* ==========================================================================
     3. MAGNETIC ELEMENTS
     ========================================================================== */
  document.querySelectorAll('.text-magnetic, .btn-magnetic').forEach((el) => {
    const magToX = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    const magToY = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      magToX(x * 0.35);
      magToY(y * 0.35);
    }, { passive: true });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    });
  });

  /* ==========================================================================
     4. 3D CARD TILT ON CURSOR
     ========================================================================== */
  document.querySelectorAll('.card-tilt').forEach((card) => {
    const inner = card.querySelector('.card-inner') || card;
    const tiltToX = gsap.quickTo(card, 'rotateX', { duration: 0.4, ease: 'power2.out' });
    const tiltToY = gsap.quickTo(card, 'rotateY', { duration: 0.4, ease: 'power2.out' });
    const tiltToScale = gsap.quickTo(card, 'scale', { duration: 0.4, ease: 'power2.out' });
    const innerToZ = gsap.quickTo(inner, 'z', { duration: 0.4, ease: 'power2.out' });

    card.addEventListener('mousemove', (e) => {
      if (document.body.classList.contains('card-expanded-active')) return;
      if (card.closest('.hero-gallery')) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      const speed = parseFloat(card.getAttribute('data-tilt-speed')) || 1;
      const angleX = ((yc - y) / yc) * 12 * speed;
      const angleY = ((x - xc) / xc) * -12 * speed;

      gsap.set(card, { transformPerspective: 1200 });
      tiltToX(angleX);
      tiltToY(angleY);
      tiltToScale(1.04);
      innerToZ(30);
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.7,
        ease: 'power3.out'
      });
      gsap.to(inner, { z: 0, duration: 0.7, ease: 'power3.out' });
    });
  });

  /* ==========================================================================
     4.1 HERO SHOOT GRID
     ========================================================================== */
  const setupHeroGrid = () => {
    const gallery = document.getElementById('hero-gallery');
    const grid = document.getElementById('hero-thumb-grid');
    if (!gallery || !grid) return;

    const thumbs = [...grid.querySelectorAll('.hero-thumb')];
    if (!thumbs.length) return;

    let activeThumb = null;

    const getCenterOffset = (thumb) => {
      const gridRect = grid.getBoundingClientRect();
      const thumbRect = thumb.getBoundingClientRect();
      const gridCenterX = gridRect.left + gridRect.width / 2;
      const gridCenterY = gridRect.top + gridRect.height / 2;
      const thumbCenterX = thumbRect.left + thumbRect.width / 2;
      const thumbCenterY = thumbRect.top + thumbRect.height / 2;
      const pull = window.innerWidth <= 520 ? 0.22 : 0.32;
      return {
        x: (gridCenterX - thumbCenterX) * pull,
        y: (gridCenterY - thumbCenterY) * pull - 6
      };
    };

    const resetThumbTransforms = () => {
      thumbs.forEach((thumb) => {
        gsap.to(thumb, {
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      });
    };

    const focusThumb = (thumb) => {
      activeThumb = thumb;
      thumbs.forEach((item) => item.classList.toggle('is-active', item === thumb));

      thumbs.forEach((item) => {
        const isActive = item === thumb;
        const offset = isActive ? getCenterOffset(item) : { x: 0, y: 0 };
        const scale = isActive ? (window.innerWidth <= 520 ? 1.05 : 1.07) : 1;

        gsap.to(item, {
          x: offset.x,
          y: offset.y,
          scale,
          duration: 0.55,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      });
    };

    thumbs.forEach((thumb) => {
      thumb.addEventListener('mouseenter', () => {
        gallery.classList.add('is-interacting');
        grid.classList.add('is-hovering');
        focusThumb(thumb);
      });
    });

    grid.addEventListener('mouseleave', () => {
      gallery.classList.remove('is-interacting');
      grid.classList.remove('is-hovering');
      activeThumb = null;
      thumbs.forEach((item) => item.classList.remove('is-active'));
      resetThumbTransforms();
    });

    window.addEventListener('resize', () => {
      if (grid.classList.contains('is-hovering') && activeThumb) {
        focusThumb(activeThumb);
      }
    });
  };

  setupHeroGrid();

  /* ==========================================================================
     5. THEME + NAV HELPERS
     ========================================================================== */
  function hexToRgb(hex) {
    const shorthand = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthand, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  function applySectionColors(section) {
    const bgColor = section.style.getPropertyValue('--shoot-bg').trim().toLowerCase();
    const isDarkBg = bgColor === '#0a0a0a';
    const isPinkBg = bgColor === '#f5e3e7';

    section.style.setProperty('--section-text-primary', isDarkBg ? '#FFFFFF' : '#0A0A0A');
    section.style.setProperty('--section-text-secondary', isDarkBg ? 'rgba(255, 255, 255, 0.7)' : 'rgba(10, 10, 10, 0.7)');
    section.style.setProperty('--section-text-muted', isDarkBg ? 'rgba(255, 255, 255, 0.45)' : 'rgba(10, 10, 10, 0.45)');
    section.style.setProperty('--section-border', isDarkBg ? 'rgba(255, 255, 255, 0.08)' : 'rgba(10, 10, 10, 0.08)');
    section.style.setProperty('--section-caption-start', isDarkBg ? '#0A0A0A' : '#FFFFFF');
    section.style.setProperty('--section-caption-mid', isDarkBg ? 'rgba(10, 10, 10, 0.8)' : 'rgba(255, 255, 255, 0.8)');
    section.style.setProperty('--section-caption-border', isDarkBg ? 'rgba(255, 255, 255, 0.05)' : 'rgba(10, 10, 10, 0.05)');
    section.style.setProperty('--section-card-bg', isPinkBg ? '#FDCBDD' : (isDarkBg ? 'rgba(255, 255, 255, 0.03)' : 'rgba(10, 10, 10, 0.03)'));
  }

  function applyShootTheme(section) {
    const themeColor = section.style.getPropertyValue('--shoot-theme');
    const bgColor = section.style.getPropertyValue('--shoot-bg');

    document.documentElement.style.setProperty('--shoot-theme', themeColor);
    document.documentElement.style.setProperty('--shoot-bg', bgColor);

    const rgb = hexToRgb(themeColor.trim());
    if (rgb) {
      document.documentElement.style.setProperty('--shoot-theme-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    }

    applySectionColors(section);

    const isDarkBg = bgColor.trim().toLowerCase() === '#0a0a0a';
    const isPinkBg = bgColor.trim().toLowerCase() === '#f5e3e7';
    document.documentElement.style.setProperty('--clr-bg', bgColor.trim());
    document.body.classList.remove('is-hero-view');
    document.documentElement.style.setProperty('--shoot-text-primary-dynamic', isDarkBg ? '#FFFFFF' : '#0A0A0A');
    document.documentElement.style.setProperty('--shoot-text-secondary-dynamic', isDarkBg ? 'rgba(255, 255, 255, 0.7)' : 'rgba(10, 10, 10, 0.7)');
    document.documentElement.style.setProperty('--shoot-text-muted-dynamic', isDarkBg ? 'rgba(255, 255, 255, 0.45)' : 'rgba(10, 10, 10, 0.45)');
    document.documentElement.style.setProperty('--shoot-border-dynamic', isDarkBg ? 'rgba(255, 255, 255, 0.08)' : 'rgba(10, 10, 10, 0.08)');
    document.documentElement.style.setProperty('--shoot-card-caption-gradient-start', isDarkBg ? '#0A0A0A' : '#FFFFFF');
    document.documentElement.style.setProperty('--shoot-card-caption-gradient-mid', isDarkBg ? 'rgba(10, 10, 10, 0.8)' : 'rgba(255, 255, 255, 0.8)');
    document.documentElement.style.setProperty('--shoot-card-caption-border', isDarkBg ? 'rgba(255, 255, 255, 0.05)' : 'rgba(10, 10, 10, 0.05)');
    document.documentElement.style.setProperty('--shoot-card-intro-bg', isPinkBg ? '#FDCBDD' : (isDarkBg ? 'rgba(255, 255, 255, 0.03)' : 'rgba(10, 10, 10, 0.03)'));
  }

  shootSections.forEach(applySectionColors);

  let navScrollLock = null;
  let isPageTransitioning = false;

  const pageTransitionOverlay = document.getElementById('page-transition-overlay');
  const FADE_OUT_DURATION = 0.48;
  const FADE_IN_DURATION = 0.58;

  function syncTransitionOverlayColor() {
    if (!pageTransitionOverlay) return;
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--shoot-bg').trim();
    pageTransitionOverlay.style.backgroundColor = bg || '#0A0A0A';
  }

  function setActiveNav(shootNum, force = false) {
    if (!force && navScrollLock !== null && navScrollLock !== shootNum) return;

    navItems.forEach(item => {
      const isShootMatch = item.getAttribute('data-shoot') === shootNum;
      const isWork = item.classList.contains('nav-work');
      item.classList.toggle('active', isShootMatch || isWork);
    });
    shootSections.forEach(section => {
      section.classList.toggle('is-active-shoot', section.id === `shoot-${shootNum}`);
    });
  }

  function getShootScrollPosition(section) {
    const shootNum = section.id.split('-')[1];
    const pinTrigger = ScrollTrigger.getById(`shoot-pin-${shootNum}`) || section._shootPinST;
    if (pinTrigger && window.innerWidth >= 769) {
      return pinTrigger.start + 2;
    }
    return section;
  }

  function instantScrollTo(target, offset = 0) {
    lenis.scrollTo(target, {
      offset,
      immediate: true,
      force: true
    });
    ScrollTrigger.update();
  }

  function jumpToTarget(targetId) {
    if (!targetId || targetId === '#') {
      navScrollLock = null;
      resetHeroTheme(true);
      instantScrollTo(0);
      syncTransitionOverlayColor();
      return;
    }

    const targetElement = document.querySelector(targetId);
    if (!targetElement) return;

    if (targetElement.classList.contains('shoot-section')) {
      const shootNum = targetElement.id.split('-')[1];
      navScrollLock = shootNum;
      setActiveNav(shootNum, true);
      applyShootTheme(targetElement);
      setShootContentState(targetElement, 1, 0);

      const track = targetElement.querySelector('.shoot-track');
      if (track) gsap.set(track, { x: 0 });

      instantScrollTo(getShootScrollPosition(targetElement));
      syncTransitionOverlayColor();
      return;
    }

    navScrollLock = null;

    if (targetId === '#hero') {
      resetHeroTheme(true);
      instantScrollTo(targetElement);
      syncTransitionOverlayColor();
      return;
    }

    if (targetId === '#contact') {
      instantScrollTo(targetElement);
      navItems.forEach(item => {
        item.classList.toggle('active', item.classList.contains('nav-about'));
      });
      syncTransitionOverlayColor();
      return;
    }

    instantScrollTo(targetElement);
    syncTransitionOverlayColor();
  }

  function navigateToTarget(targetId) {
    if (isPageTransitioning) return;

    if (!pageTransitionOverlay) {
      jumpToTarget(targetId);
      ScrollTrigger.refresh();
      return;
    }

    isPageTransitioning = true;
    navScrollLock = 'transition';
    syncTransitionOverlayColor();
    lenis.stop();
    document.body.classList.add('is-page-transitioning');

    gsap.to(pageTransitionOverlay, {
      opacity: 1,
      duration: FADE_OUT_DURATION,
      ease: 'power2.inOut',
      onComplete: () => {
        ScrollTrigger.refresh(true);
        jumpToTarget(targetId);
        ScrollTrigger.update();
        syncTransitionOverlayColor();

        gsap.to(pageTransitionOverlay, {
          opacity: 0,
          duration: FADE_IN_DURATION,
          ease: 'power2.inOut',
          onComplete: () => {
            if (targetId === '#hero' || targetId === '#') {
              resetHeroTheme(true);
              syncTransitionOverlayColor();
            }
            document.body.classList.remove('is-page-transitioning');
            lenis.start();
            isPageTransitioning = false;
            navScrollLock = null;
          }
        });
      }
    });
  }

  function resetHeroTheme(force = false) {
    if (!force && navScrollLock !== null) return;

    document.body.classList.add('is-hero-view');
    navItems.forEach(item => {
      item.classList.toggle('active', item.classList.contains('nav-work'));
    });
    document.querySelectorAll('.shoot-section').forEach(s => s.classList.remove('is-active-shoot'));
    document.documentElement.style.setProperty('--shoot-theme', '#FFFFFF');
    document.documentElement.style.setProperty('--shoot-theme-rgb', '255, 255, 255');
    document.documentElement.style.setProperty('--shoot-bg', '#0A0A0A');
    document.documentElement.style.setProperty('--clr-bg', '#0A0A0A');
    document.documentElement.style.setProperty('--shoot-text-primary-dynamic', '#FFFFFF');
    document.documentElement.style.setProperty('--shoot-text-secondary-dynamic', 'rgba(255, 255, 255, 0.7)');
    document.documentElement.style.setProperty('--shoot-text-muted-dynamic', 'rgba(255, 255, 255, 0.45)');
    document.documentElement.style.setProperty('--shoot-border-dynamic', 'rgba(255, 255, 255, 0.08)');
    document.documentElement.style.setProperty('--shoot-card-intro-bg', '#0A0A0A');
  }

  function getShootTargets(section) {
    if (!shootTargetsCache.has(section)) {
      const intro = section.querySelector('.shoot-intro-card');
      const cards = section.querySelectorAll('.card');
      shootTargetsCache.set(section, intro ? [intro, ...cards] : [...cards]);
    }
    return shootTargetsCache.get(section);
  }

  function setShootContentState(section, opacity, y = 0) {
    if (!section) return;
    gsap.set(getShootTargets(section), { opacity, y });
  }

  /* ==========================================================================
     6. HORIZONTAL SCROLL ON VERTICAL SCROLL (LANDO-STYLE)
     ========================================================================== */
  const mm = gsap.matchMedia();

  mm.add('(min-width: 769px)', () => {
    shootSections.forEach((section) => {
      const track = section.querySelector('.shoot-track');
      const stickyWrapper = section.querySelector('.shoot-sticky-wrapper');
      const panel = section.querySelector('.shoot-panel');
      if (!track || !stickyWrapper) return;

      const shootNum = section.id.split('-')[1];
      const prevShoot = section.previousElementSibling?.classList.contains('shoot-section')
        ? section.previousElementSibling
        : null;
      const nextShoot = section.nextElementSibling?.classList.contains('shoot-section')
        ? section.nextElementSibling
        : null;

      setShootContentState(section, 0, 45);

      const getScrollDistance = () => {
        const containerWidth = panel?.clientWidth || window.innerWidth;
        return Math.max(track.scrollWidth - containerWidth, 0);
      };

      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'top top',
        onEnter: () => applyShootTheme(section),
        onEnterBack: () => applyShootTheme(section)
      });

      if (prevShoot) {
        ScrollTrigger.create({
          trigger: section,
          start: 'top bottom',
          end: 'top 25%',
          onEnter: () => {
            setShootContentState(prevShoot, 1, 0);
            setShootContentState(section, 0, 45);
          }
        });

        ScrollTrigger.create({
          trigger: section,
          start: 'top 25%',
          end: 'top top',
          scrub: 0.35,
          onUpdate: (self) => {
            if (self.direction < 0) return;
            const p = self.progress;
            setShootContentState(section, p, 45 * (1 - p));
            setShootContentState(prevShoot, 1 - p, -35 * p);
          },
          onLeave: () => {
            setShootContentState(section, 1, 0);
            setShootContentState(prevShoot, 0, -35);
          }
        });
      } else {
        ScrollTrigger.create({
          trigger: section,
          start: 'top bottom',
          end: 'top 25%',
          onEnter: () => setShootContentState(section, 0, 45)
        });

        ScrollTrigger.create({
          trigger: section,
          start: 'top 25%',
          end: 'top top',
          scrub: 0.35,
          onUpdate: (self) => {
            if (self.direction < 0) return;
            const p = self.progress;
            setShootContentState(section, p, 45 * (1 - p));
          },
          onLeave: () => setShootContentState(section, 1, 0)
        });
      }

      if (nextShoot) {
        ScrollTrigger.create({
          trigger: section,
          start: 'top bottom',
          end: 'top 25%',
          onEnterBack: () => {
            setShootContentState(nextShoot, 1, 0);
            setShootContentState(section, 0, 45);
          },
          onLeaveBack: () => {
            setShootContentState(nextShoot, 1, 0);
            setShootContentState(section, 0, 45);
          }
        });

        ScrollTrigger.create({
          trigger: section,
          start: 'top 25%',
          end: 'top top',
          scrub: 0.35,
          onUpdate: (self) => {
            if (self.direction > 0) return;
            const p = self.progress;
            setShootContentState(section, p, 45 * (1 - p));
            setShootContentState(nextShoot, 1 - p, -35 * p);
          },
          onEnterBack: () => {
            setShootContentState(section, 1, 0);
            setShootContentState(nextShoot, 0, -35);
          },
          onLeaveBack: () => {
            setShootContentState(nextShoot, 1, 0);
            setShootContentState(section, 0, 45);
          }
        });
      }

      gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: 'none',
        scrollTrigger: {
          id: `shoot-pin-${shootNum}`,
          trigger: section,
          start: 'top top',
          end: () => `+=${getScrollDistance()}`,
          pin: stickyWrapper,
          scrub: true,
          anticipatePin: 1,
          onToggle: (self) => {
            if (self.isActive) {
              setShootContentState(section, 1, 0);
            }
          },
          onEnter: () => {
            applyShootTheme(section);
            setActiveNav(shootNum);
            setShootContentState(section, 1, 0);
          },
          onEnterBack: () => {
            applyShootTheme(section);
            setActiveNav(shootNum);
            setShootContentState(section, 1, 0);
          },
          onLeave: () => {
            if (navScrollLock !== null) return;
            if (section.nextElementSibling?.classList.contains('shoot-section')) {
              setActiveNav(section.nextElementSibling.id.split('-')[1]);
            }
          },
          onLeaveBack: () => {
            if (navScrollLock !== null) return;
            const prev = section.previousElementSibling;
            if (prev?.classList.contains('shoot-section')) {
              setActiveNav(prev.id.split('-')[1]);
            } else if (prev?.id === 'hero') {
              resetHeroTheme();
            }
          }
        }
      });

      section._shootPinST = ScrollTrigger.getById(`shoot-pin-${shootNum}`);
    });

    return () => {};
  });

  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: 'bottom center',
    onEnter: resetHeroTheme,
    onEnterBack: resetHeroTheme
  });

  ScrollTrigger.create({
    trigger: '#contact',
    start: 'top center',
    onEnter: () => {
      navItems.forEach(item => {
        item.classList.toggle('active', item.classList.contains('nav-about'));
      });
    },
    onLeaveBack: resetHeroTheme
  });

  /* ==========================================================================
     7. ANCHOR NAVIGATION
     ========================================================================== */
  document.querySelectorAll('.nav-item, .logo, .btn-contact, .hero-thumb').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToTarget(link.getAttribute('href'));
    });
  });

  window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
  });

  ScrollTrigger.refresh();
  syncTransitionOverlayColor();
  resetHeroTheme(true);

});
