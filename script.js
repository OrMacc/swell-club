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

function runBlocksReveal(callback) {
  const blocks = document.querySelectorAll('.intro-block');
  if (!blocks.length) {
    if (callback) callback();
    return;
  }

  gsap.to(blocks, {
    yPercent: -100,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.inOut',
    onComplete: () => {
      if (introElement) introElement.classList.add('is-done');
      if (callback) callback();
    }
  });
}

function runIntroSequence() {
  const hasSeenIntro = localStorage.getItem('swell-intro-seen');

  if (reducedMotion) {
    if (introElement) introElement.classList.add('is-done');
    localStorage.setItem('swell-intro-seen', '1');
    setTimeout(runHeroEntrance, 50);
    return;
  }

  // Returning visitor: just blocks transition
  if (hasSeenIntro) {
    if (introElement) introElement.classList.add('is-blocks-only');
    setTimeout(() => {
      runBlocksReveal(() => setTimeout(runHeroEntrance, 200));
    }, 300);
    return;
  }

  // First visit: full intro sequence
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

            // Hold for a beat, then dismiss with blocks
            setTimeout(() => {
              localStorage.setItem('swell-intro-seen', '1');
              runBlocksReveal(() => setTimeout(runHeroEntrance, 200));
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
// iOS VIDEO AUTOPLAY FIX
// ============================================================================

const heroVideo = document.querySelector('.hero-video');

if (heroVideo) {
  // Force play attempt on load
  const tryPlay = () => {
    heroVideo.muted = true;
    const p = heroVideo.play();
    if (p && p.catch) {
      p.catch(() => {
        // Autoplay blocked — try again on first user interaction
        const playOnInteraction = () => {
          heroVideo.play();
          document.removeEventListener('touchstart', playOnInteraction);
          document.removeEventListener('scroll', playOnInteraction);
        };
        document.addEventListener('touchstart', playOnInteraction, { once: true });
        document.addEventListener('scroll', playOnInteraction, { once: true });
      });
    }
  };

  if (heroVideo.readyState >= 2) {
    tryPlay();
  } else {
    heroVideo.addEventListener('loadeddata', tryPlay, { once: true });
  }
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
  // Standard data-reveal elements: clip from bottom
  document.querySelectorAll('[data-reveal]:not(.story-line):not(.story-image):not(.story-full-image)').forEach((el) => {
    gsap.set(el, {
      clipPath: 'inset(100% 0 0 0)',
      y: 40,
      opacity: 0
    });

    gsap.to(el, {
      clipPath: 'inset(0% 0 0 0)',
      y: 0,
      opacity: 1,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    });
  });

  // Story lines: clip from top, larger movement
  document.querySelectorAll('.story-line').forEach((line) => {
    gsap.set(line, {
      clipPath: 'inset(0 0 100% 0)',
      y: 50,
      opacity: 0
    });

    gsap.to(line, {
      clipPath: 'inset(0 0 0% 0)',
      y: 0,
      opacity: 1,
      duration: 1.3,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: line,
        start: 'top 75%',
        toggleActions: 'play none none none'
      }
    });
  });

  // Story images: cinematic inset reveal with scale
  document.querySelectorAll('.story-image, .story-full-image').forEach((fig) => {
    const img = fig.querySelector('img');

    gsap.set(fig, {
      clipPath: 'inset(8% 8% 8% 8%)',
      opacity: 0
    });

    if (img) {
      gsap.set(img, { scale: 1.15 });
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: fig,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });

    tl.to(fig, {
      clipPath: 'inset(0% 0% 0% 0%)',
      opacity: 1,
      duration: 1.4,
      ease: 'power3.out'
    });

    if (img) {
      tl.to(img, {
        scale: 1.0,
        duration: 1.8,
        ease: 'power2.out'
      }, 0);
    }
  });
} else {
  // Reduced motion: show everything immediately
  gsap.set('[data-reveal], .story-line', {
    opacity: 1,
    y: 0,
    clipPath: 'none'
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

// Google Apps Script endpoint — replace with your deployed URL
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbw8DTspSVcByBiIb8-_PHgRlqQpc93AFb35dHBX4SueUOquha6nuzcYrlsQZHTIhc5wHw/exec';

const joinForm = document.querySelector('#joinForm');
const joinPanel = document.querySelector('.join-panel');
const newsletterModal = document.querySelector('#newsletterModal');
let lastSubmittedName = '';
let lastSubmittedPhone = '';

function showSuccessState() {
  if (!joinPanel) return;
  joinPanel.classList.add('is-success');

  const successEl = document.createElement('div');
  successEl.className = 'join-success';
  successEl.innerHTML = `
    <div class="join-success-check">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 12 10 16 18 8"/>
      </svg>
    </div>
    <p class="join-success-text">נרשמתם לגל הבא.<br>נשלח עדכון לפני המפגש.</p>
  `;
  joinPanel.appendChild(successEl);

  // Show newsletter modal after 2.5s
  setTimeout(openNewsletter, 2500);
}

function openNewsletter() {
  if (!newsletterModal) return;
  newsletterModal.classList.add('is-open');
  newsletterModal.setAttribute('aria-hidden', 'false');
}

function closeNewsletter() {
  if (!newsletterModal) return;
  newsletterModal.classList.remove('is-open');
  newsletterModal.setAttribute('aria-hidden', 'true');
}

// Close modal on backdrop click or X button
if (newsletterModal) {
  newsletterModal.querySelector('.newsletter-backdrop')?.addEventListener('click', closeNewsletter);
  newsletterModal.querySelector('.newsletter-close')?.addEventListener('click', closeNewsletter);
}

// Newsletter form submission
const newsletterForm = document.querySelector('#newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = document.querySelector('#newsletterEmail');
    const email = emailInput.value.trim();
    const btn = newsletterForm.querySelector('button');
    const note = document.querySelector('#newsletterNote');

    if (!email) return;

    if (btn) btn.disabled = true;
    if (btn) btn.textContent = 'שולח...';

    try {
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: lastSubmittedName, phone: lastSubmittedPhone, email })
      });
    } catch (err) {}

    if (btn) btn.textContent = 'נרשמתם!';
    if (note) note.textContent = 'תודה. ניפגש בתיבה.';
    setTimeout(closeNewsletter, 1500);
  });
}

// Main join form
if (joinForm) {
  joinForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const button = e.currentTarget.querySelector('button');
    const buttonText = button?.querySelector('span:first-child');
    const name = document.querySelector('#name').value.trim();
    const phone = document.querySelector('#phone').value.trim();

    if (!name || !phone) return;

    if (button) button.disabled = true;
    if (buttonText) buttonText.textContent = 'שולח...';

    lastSubmittedName = name;
    lastSubmittedPhone = phone;

    try {
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone })
      });
    } catch (err) {}

    showSuccessState();
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
