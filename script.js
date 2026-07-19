const heroLogo = document.querySelector('.hero-logo');
const heroCopy = document.querySelector('.hero-copy');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reducedMotion) {
  let ticking = false;
  const updateHero = () => {
    const progress = Math.min(window.scrollY / window.innerHeight, 1);
    heroLogo.style.transform = `translate3d(0, ${progress * -80}px, 0) rotate(${progress * 8}deg)`;
    heroCopy.style.transform = `translate3d(0, ${progress * 38}px, 0)`;
    heroCopy.style.opacity = String(1 - progress * .7);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) requestAnimationFrame(updateHero);
    ticking = true;
  }, { passive: true });
}

document.querySelector('#joinForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button');
  const note = document.querySelector('#formNote');
  button.textContent = 'נרשמתם';
  button.disabled = true;
  note.textContent = 'קיבלנו. בפרוטוטייפ הזה הפרטים עדיין לא נשלחים לשום מקום.';
});
