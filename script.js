/**
 * Swell Animation Engine
 *
 * A professional GSAP-powered animation system for Hebrew RTL single-page website
 * Handles page load sequences, scroll reveals, parallax, sticky scenes, and smooth scrolling
 *
 * Tech: GSAP 3 + ScrollTrigger + Lenis smooth scroll
 */

// ============================================================================
// CONSTANTS & FEATURE DETECTION
// ============================================================================

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isDesktop = window.innerWidth > 760;

// ============================================================================
// LENIS SMOOTH SCROLL INITIALIZATION
// ============================================================================

let lenis;

if (!reducedMotion) {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2
  });

  // Connect Lenis to GSAP ticker
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}

// ============================================================================
// GSAP + SCROLLTRIGGER REGISTRATION
// ============================================================================

gsap.registerPlugin(ScrollTrigger);

// ============================================================================
// PAGE LOAD SEQUENCE
// ============================================================================

const introElement = document.querySelector('[data-intro]');
const sponsorText = document.querySelector('[data-sponsor-text]');
const sponsorLogo = document.querySelector('[data-sponsor-logo]');
const sponsorWrap = document.querySelector('.intro-sponsor');

function typeText(element, text, speed, callback) {
  let i = 0;
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else if (callback) {
      callback();
    }
  }
  type();
}

function runIntroSequence() {
  if (reducedMotion) {
    if (introElement) introElement.classList.add('is-done');
    setTimeout(runHeroEntrance, 50);
    return;
  }

  // Phase 1: Swell logo animates in (CSS handles this, ~1.2s)
  // Phase 2: After Swell logo settles, show sponsor area and start typing
  setTimeout(() => {
    if (sponsorWrap) sponsorWrap.classList.add('is-visible');

    // Start typing "sponsored by"
    if (sponsorText) {
      typeText(sponsorText, 'sponsored by', 65, () => {
        // After typing finishes, pause then add the "."
        setTimeout(() => {
          sponsorText.textContent += '.';

          // After the dot, slide in Speedo logo from right
          setTimeout(() => {
            if (sponsorLogo) sponsorLogo.classList.add('is-visible');

            // Hold for a beat, then dismiss intro
            setTimeout(() => {
              if (introElement) introElement.classList.add('is-done');
              setTimeout(runHeroEntrance, 500);
            }, 1200);
          }, 400);
        }, 600);
      });
    }
  }, 1500);
}

function runHeroEntrance() {
  if (reducedMotion) {
    // Just show everything immediately
    gsap.set('[data-hero-title] span, [data-hero-meta], [data-hero-note], [data-scroll-cue]', {
      opacity: 1,
      y: 0
    });
    return;
  }

  const titleLines = document.querySelectorAll('[data-hero-title] span');
  const heroMeta = document.querySelector('[data-hero-meta]');
  const heroNote = document.querySelector('[data-hero-note]');
  const scrollCue = document.querySelector('[data-scroll-cue]');

  // Hero title lines: stagger fade in from below
  if (titleLines.length) {
    gsap.from(titleLines, {
      opacity: 0,
      y: 40,
      duration: 1.2,
      stagger: 0.15,
      ease: 'power3.out'
    });
  }

  // Hero meta: fade in after title
  if (heroMeta) {
    gsap.from(heroMeta, {
      opacity: 0,
      duration: 0.8,
      delay: 0.6,
      ease: 'power2.out'
    });
  }

  // Hero note + scroll cue: fade in after meta
  const lateElements = [heroNote, scrollCue].filter(Boolean);
  if (lateElements.length) {
    gsap.from(lateElements, {
      opacity: 0,
      duration: 0.8,
      delay: 1,
      stagger: 0.1,
      ease: 'power2.out'
    });
  }
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runIntroSequence);
} else {
  runIntroSequence();
}

// ============================================================================
// HERO PARALLAX ANIMATIONS
// ============================================================================

if (!reducedMotion) {
  const heroSection = document.querySelector('[data-hero]');
  const heroTitle = document.querySelector('[data-hero-title]');
  const heroWave = document.querySelector('[data-hero-wave]');

  // Hero title parallax: subtle downward movement and fade
  if (heroSection && heroTitle) {
    gsap.to(heroTitle, {
      y: '8vh',
      opacity: 0.2,
      ease: 'none',
      scrollTrigger: {
        trigger: heroSection,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.8
      }
    });
  }

  // Wave subtle parallax
  if (heroSection && heroWave) {
    gsap.to(heroWave, {
      y: '15%',
      x: '-3%',
      ease: 'none',
      scrollTrigger: {
        trigger: heroSection,
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });
  }

  // Wave floating animation (target paths, not container, to avoid conflict with scroll parallax)
  const wavePaths = document.querySelectorAll('[data-hero-wave] path');
  if (wavePaths.length) {
    gsap.to(wavePaths, {
      x: '-3%',
      duration: 7,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: 0.5
    });
  }
}

// ============================================================================
// MANIFESTO REVEAL SYSTEM
// ============================================================================

if (!reducedMotion) {
  // Set initial state for all reveal elements
  gsap.set('[data-reveal]', {
    opacity: 0,
    y: 35
  });

  // Special case: story lines have larger movement
  gsap.set('.story-line', {
    opacity: 0,
    y: 50
  });

  // Batch reveal for standard elements
  ScrollTrigger.batch('[data-reveal]:not(.story-line)', {
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    },
    start: 'top 78%'
  });

  // Batch reveal for story lines
  ScrollTrigger.batch('.story-line', {
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    },
    start: 'top 75%'
  });
} else {
  // Reduced motion: show everything immediately
  gsap.set('[data-reveal], .story-line', {
    opacity: 1,
    y: 0
  });
}

// ============================================================================
// QUIET SECTION HEADING REVEAL
// ============================================================================

if (!reducedMotion) {
  const quietHeadingLines = document.querySelectorAll('#quiet h2 span');

  if (quietHeadingLines.length) {
    gsap.from(quietHeadingLines, {
      opacity: 0,
      y: 60,
      duration: 1.2,
      stagger: 0.2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#quiet',
        start: 'top 60%'
      }
    });
  }
}

// ============================================================================
// MORNING SECTION (no sticky — handled by general reveal system)
// ============================================================================

// ============================================================================
// HEADER BEHAVIOR
// ============================================================================

const header = document.querySelector('[data-header]');

if (header) {
  // Dark mode: toggle based on overlapping dark sections
  const darkSections = document.querySelectorAll('[data-dark-section]');

  darkSections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 5%',
      end: 'bottom 5%',
      onEnter: () => header.classList.add('is-dark'),
      onLeave: () => header.classList.remove('is-dark'),
      onEnterBack: () => header.classList.add('is-dark'),
      onLeaveBack: () => header.classList.remove('is-dark')
    });
  });

  // Hide/show header on scroll direction
  if (!reducedMotion) {
    let lastScrollY = 0;

    ScrollTrigger.create({
      start: 'top top',
      end: 99999,
      onUpdate: (self) => {
        const scrollY = self.scroll();

        // Don't hide if at the very top
        if (scrollY < window.innerHeight * 0.7) {
          header.classList.remove('is-hidden');
          lastScrollY = scrollY;
          return;
        }

        // Hide when scrolling down, show when scrolling up
        if (scrollY > lastScrollY) {
          header.classList.add('is-hidden');
        } else {
          header.classList.remove('is-hidden');
        }

        lastScrollY = scrollY;
      }
    });
  }
}

// ============================================================================
// FORM HANDLER
// ============================================================================

const joinForm = document.querySelector('#joinForm');

if (joinForm) {
  joinForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const button = e.currentTarget.querySelector('button');
    const buttonText = button?.querySelector('span:first-child');
    const note = document.querySelector('#formNote');

    if (buttonText) {
      buttonText.textContent = 'נרשמתם לגל הבא';
    }

    if (button) {
      button.disabled = true;
    }

    if (note) {
      note.textContent = 'קיבלנו. נשלח עדכון לפני המפגש הבא.';
    }
  });
}

// ============================================================================
// REFRESH SCROLLTRIGGER ON RESIZE
// ============================================================================

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    ScrollTrigger.refresh();
  }, 250);
});
