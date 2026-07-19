const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.querySelector('[data-header]');
const hero = document.querySelector('[data-hero]');
const heroTitle = document.querySelector('[data-hero-title]');
const heroWave = document.querySelector('[data-hero-wave]');
const morning = document.querySelector('[data-morning]');
const morningSteps = [...document.querySelectorAll('[data-step]')];
const stepDots = [...document.querySelectorAll('.step-dots i')];
const darkSections = [...document.querySelectorAll('[data-dark-section], [data-morning]')];
const intro = document.querySelector('[data-intro]');

if (intro) {
  window.setTimeout(() => intro.classList.add('is-done'), reducedMotion ? 50 : 1700);
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14, rootMargin: '0px 0px -7% 0px' });

document.querySelectorAll('[data-reveal]').forEach((element) => revealObserver.observe(element));

let previousScrollY = window.scrollY;
let ticking = false;

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

function updatePage() {
  const scrollY = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  document.documentElement.style.setProperty('--page-progress', maxScroll > 0 ? scrollY / maxScroll : 0);

  if (!reducedMotion && hero && scrollY < window.innerHeight * 1.15) {
    const heroProgress = clamp(scrollY / window.innerHeight);
    heroTitle.style.transform = `translate3d(0, ${heroProgress * 7}vh, 0)`;
    heroTitle.style.opacity = String(1 - heroProgress * 0.78);
    heroWave.style.transform = `translate3d(${heroProgress * -3}vw, calc(-50% + ${heroProgress * 4}vh), 0)`;
  }

  if (morning && window.innerWidth > 760 && !reducedMotion) {
    const morningRect = morning.getBoundingClientRect();
    const travel = morning.offsetHeight - window.innerHeight;
    const progress = clamp(-morningRect.top / Math.max(travel, 1));
    const activeStep = Math.min(2, Math.floor(progress * 3));
    morning.style.setProperty('--scene-progress', progress.toFixed(3));

    morningSteps.forEach((step, index) => step.classList.toggle('is-active', index === activeStep));
    stepDots.forEach((dot, index) => dot.classList.toggle('is-active', index === activeStep));
  }

  const headerLine = 42;
  const overDark = darkSections.some((section) => {
    const rect = section.getBoundingClientRect();
    return rect.top <= headerLine && rect.bottom > headerLine;
  });
  header?.classList.toggle('is-dark', overDark);

  const movingDown = scrollY > previousScrollY;
  header?.classList.toggle('is-hidden', movingDown && scrollY > window.innerHeight * 0.75);
  previousScrollY = scrollY;
  ticking = false;
}

function requestUpdate() {
  if (!ticking) requestAnimationFrame(updatePage);
  ticking = true;
}

window.addEventListener('scroll', requestUpdate, { passive: true });
window.addEventListener('resize', requestUpdate);
updatePage();

document.querySelector('#joinForm')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button');
  const note = document.querySelector('#formNote');
  button.querySelector('span:first-child').textContent = 'נרשמתם לגל הבא';
  button.disabled = true;
  note.textContent = 'קיבלנו. בגרסה הזאת הפרטים עדיין לא נשלחים לשום מקום.';
});
