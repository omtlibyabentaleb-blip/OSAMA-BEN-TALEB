const progress = document.querySelector('.scroll-progress span');
const updateProgress = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
};
addEventListener('scroll', updateProgress, { passive: true });
addEventListener('resize', updateProgress);
updateProgress();
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const navLinks = [...document.querySelectorAll('.side-nav a')];
const sections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach(link => {
      const active = link.getAttribute('href') === `#${visible.target.id}`;
      link.classList.toggle('active', active);
      if (active) { link.setAttribute('aria-current', 'location'); setActiveSection(visible.target.id); }
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-20% 0px -60% 0px', threshold: [0, .15, .35, .6] });
  sections.forEach(section => sectionObserver.observe(section));
}

const quickTrigger = document.querySelector('.quick-trigger');
const quickMenu = document.querySelector('.quick-links');
const quickCurrent = document.querySelector('.quick-current');
function setQuickMenu(open) {
  if (!quickMenu || !quickTrigger) return;
  quickTrigger.setAttribute('aria-expanded', String(open));
  if (open) {
    quickMenu.hidden = false;
    requestAnimationFrame(() => quickMenu.classList.add('open'));
  } else {
    quickMenu.classList.remove('open');
    setTimeout(() => { if (!quickMenu.classList.contains('open')) quickMenu.hidden = true; }, 220);
  }
}
quickTrigger?.addEventListener('click', () => setQuickMenu(quickTrigger.getAttribute('aria-expanded') !== 'true'));
quickMenu?.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (link) setQuickMenu(false);
});
document.addEventListener('pointerdown', event => {
  if (!event.target.closest('.quick-sections')) setQuickMenu(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && quickTrigger?.getAttribute('aria-expanded') === 'true') {
    setQuickMenu(false);
    quickTrigger.focus();
  }
});
function setActiveSection(id) {
  const link = quickMenu?.querySelector(`a[href="#${id}"]`);
  if (quickCurrent && link) quickCurrent.textContent = link.textContent.replace(/^\s*\d+\s*/, '').trim();
  quickMenu?.querySelectorAll('a').forEach(item => {
    const active = item.getAttribute('href') === `#${id}`;
    item.classList.toggle('active', active);
    if (active) item.setAttribute('aria-current', 'location');
    else item.removeAttribute('aria-current');
  });
}
navLinks.forEach(link => {
  link.addEventListener('pointermove', event => {
    const rect = link.getBoundingClientRect();
    link.style.setProperty('--nav-x', `${event.clientX - rect.left}px`);
    link.style.setProperty('--nav-y', `${event.clientY - rect.top}px`);
  }, { passive: true });
  link.addEventListener('click', event => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = link.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'nav-ripple';
    ripple.style.left = `${event.clientX ? event.clientX - rect.left : rect.width / 2}px`;
    ripple.style.top = `${event.clientY ? event.clientY - rect.top : rect.height / 2}px`;
    link.append(ripple);
    link.classList.remove('nav-clicked');
    requestAnimationFrame(() => link.classList.add('nav-clicked'));
    setTimeout(() => { ripple.remove(); link.classList.remove('nav-clicked'); }, 600);
  });
});
const archiveItems = window.portfolioItems || [];
const archiveGrid = document.querySelector('#archive-grid');
const archiveFilters = document.querySelector('.archive-filters');
const archiveMore = document.querySelector('#archive-more');
const archiveSearch = document.querySelector('#archive-search');
const archiveEmpty = document.querySelector('.archive-empty');
let activeCategory = 'all';
let visibleCount = 12;
let searchTerm = '';
let imageItems = [];
const categoryList = [...new Map(archiveItems.map(item => [item.category, { slug: item.category, label: item.label }])).values()];
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function matchingArchiveItems() {
  return archiveItems.filter(item => (activeCategory === 'all' || item.category === activeCategory) && (!searchTerm || `${item.title} ${item.label} ${item.src.split('/').pop()}`.toLocaleLowerCase('ar').includes(searchTerm.toLocaleLowerCase('ar'))));
}
function bindLightboxItems() { imageItems = [...document.querySelectorAll('[data-lightbox]')]; }
function renderArchive() {
  if (!archiveGrid) return;
  const matches = matchingArchiveItems();
  const total = document.querySelector('#archive-total');
  if (total) total.textContent = archiveItems.length.toLocaleString('ar');
  if (archiveFilters) archiveFilters.innerHTML = `<button class="filter-chip ${activeCategory === 'all' ? 'active' : ''}" type="button" data-filter="all">كل المجالات</button>` + categoryList.map(category => `<button class="filter-chip ${activeCategory === category.slug ? 'active' : ''}" type="button" data-filter="${escapeHtml(category.slug)}">${escapeHtml(category.label)}</button>`).join('');
  const shown = matches.slice(0, visibleCount);
  archiveGrid.innerHTML = shown.map(item => `<a class="archive-card" href="${escapeHtml(item.src)}" data-lightbox data-caption="${escapeHtml(item.title)} — ${escapeHtml(item.label)}"><div class="archive-card-image archive-media-${escapeHtml(item.category)}"><img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt)}" loading="lazy"></div><div class="archive-card-info"><span class="archive-card-category">${escapeHtml(item.label)}</span><h4 class="archive-card-title">${escapeHtml(item.title)}</h4></div></a>`).join('');
  if (archiveEmpty) archiveEmpty.hidden = matches.length !== 0;
  if (archiveMore) archiveMore.hidden = shown.length >= matches.length;
  bindLightboxItems();
}

const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
  }), { threshold: .12 });
  revealElements.forEach((el, index) => { el.style.transitionDelay = `${Math.min(index % 4, 3) * 55}ms`; revealObserver.observe(el); });
} else revealElements.forEach(el => el.classList.add('is-visible'));

const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox?.querySelector('img');
const caption = lightbox?.querySelector('figcaption');
let currentIndex = 0;
function showImage(index) {
  if (!imageItems.length || !lightboxImage) return;
  currentIndex = (index + imageItems.length) % imageItems.length;
  const item = imageItems[currentIndex];
  lightboxImage.src = item.dataset.src || item.href;
  lightboxImage.alt = item.querySelector('img')?.alt || item.dataset.caption || '';
  caption.textContent = item.dataset.caption || item.querySelector('img')?.alt || '';
}
function openLightbox(index) {
  showImage(index);
  lightbox?.classList.add('open');
  lightbox?.setAttribute('aria-hidden', 'false');
  document.body.classList.add('locked');
  lightbox?.querySelector('.lightbox-close')?.focus();
}
function closeLightbox() {
  lightbox?.classList.remove('open');
  lightbox?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('locked');
}
document.addEventListener('click', event => {
  const item = event.target.closest('[data-lightbox]');
  if (!item) return;
  const index = imageItems.indexOf(item);
  if (index < 0) return;
  event.preventDefault();
  openLightbox(index);
});
lightbox?.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
lightbox?.querySelector('.lightbox-prev')?.addEventListener('click', () => showImage(currentIndex + 1));
lightbox?.querySelector('.lightbox-next')?.addEventListener('click', () => showImage(currentIndex - 1));
lightbox?.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
addEventListener('keydown', event => {
  if (!lightbox?.classList.contains('open')) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') showImage(currentIndex - 1);
  if (event.key === 'ArrowRight') showImage(currentIndex + 1);
});
renderArchive();
archiveFilters?.addEventListener('click', event => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  activeCategory = button.dataset.filter;
  visibleCount = 12;
  renderArchive();
});
archiveMore?.addEventListener('click', () => { visibleCount += 12; renderArchive(); });
archiveSearch?.addEventListener('input', () => { searchTerm = archiveSearch.value.trim(); visibleCount = 12; renderArchive(); });

const slideshow = document.querySelector('#work-slideshow');
if (slideshow) {
  const slides = [...slideshow.querySelectorAll('.work-card')];
  const controls = slideshow.parentElement.querySelector('.slideshow-controls');
  const dots = controls.querySelector('.slide-dots');
  const counter = controls.querySelector('.slide-counter');
  const pauseButton = controls.querySelector('.slide-pause');
  let slideIndex = 0;
  let slideTimer;
  let paused = false;
  let slideProgressAnimation;
  dots.innerHTML = slides.map((_, index) => `<button type="button" class="slide-dot" aria-label="عرض العمل ${index + 1}" aria-current="${index === 0 ? 'true' : 'false'}"></button>`).join('');
  const dotButtons = [...dots.querySelectorAll('.slide-dot')];
  function showSlide(index) {
    slideIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active-slide', i === slideIndex);
      slide.classList.add('is-visible');
      slide.setAttribute('aria-hidden', String(i !== slideIndex));
      slide.querySelectorAll('a').forEach(link => { link.tabIndex = i === slideIndex ? 0 : -1; });
    });
    dotButtons.forEach((dot, i) => {
      dot.classList.toggle('active', i === slideIndex);
      dot.setAttribute('aria-current', String(i === slideIndex));
    });
    counter.textContent = `${String(slideIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  }
  function stopTimer() {
    clearInterval(slideTimer);
    slideProgressAnimation?.cancel();
  }
  function startTimer() {
    stopTimer();
    if (!paused && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const progressFill = controls.querySelector('.slide-progress i');
      if (progressFill) slideProgressAnimation = progressFill.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 2750, easing: 'linear', fill: 'forwards' });
      slideTimer = setInterval(() => { showSlide(slideIndex + 1); startTimer(); }, 2750);
    }
  }
  controls.querySelector('.slide-prev').addEventListener('click', () => { showSlide(slideIndex - 1); startTimer(); });
  controls.querySelector('.slide-next').addEventListener('click', () => { showSlide(slideIndex + 1); startTimer(); });
  dots.addEventListener('click', event => {
    const index = dotButtons.indexOf(event.target.closest('.slide-dot'));
    if (index >= 0) { showSlide(index); startTimer(); }
  });
  pauseButton.addEventListener('click', () => {
    paused = !paused;
    pauseButton.textContent = paused ? '▶' : 'Ⅱ';
    pauseButton.setAttribute('aria-label', paused ? 'استئناف العرض التلقائي' : 'إيقاف العرض التلقائي');
    paused ? stopTimer() : startTimer();
  });
  slideshow.parentElement.addEventListener('mouseenter', stopTimer);
  slideshow.parentElement.addEventListener('mouseleave', startTimer);
  slideshow.parentElement.addEventListener('focusin', stopTimer);
  slideshow.parentElement.addEventListener('focusout', event => { if (!event.currentTarget.contains(event.relatedTarget)) startTimer(); });
  showSlide(0);
  startTimer();
}


// Motion language: cursor light, architectural parallax, and tactile controls.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
if (!reducedMotion.matches) {
  if (finePointer.matches) {
    const aura = document.createElement('div');
    aura.className = 'cursor-aura';
    aura.setAttribute('aria-hidden', 'true');
    document.body.append(aura);
    let pointerFrame;
    document.addEventListener('pointermove', event => {
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      pointerFrame = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`);
        document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`);
      });
    }, { passive: true });

    const portrait = document.querySelector('.portrait-wrap');
    portrait?.addEventListener('pointermove', event => {
      const rect = portrait.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      portrait.style.setProperty('--tilt-x', `${x * 5}deg`);
      portrait.style.setProperty('--tilt-y', `${y * -5}deg`);
      portrait.style.setProperty('--shine-x', `${(x + .5) * 100}%`);
      portrait.style.setProperty('--shine-y', `${(y + .5) * 100}%`);
    });
    portrait?.addEventListener('pointerleave', () => {
      portrait.style.setProperty('--tilt-x', '0deg');
      portrait.style.setProperty('--tilt-y', '0deg');
    });

    document.querySelectorAll('.work-card, .archive-card, .book-card, .skill-panel, .award-card, .software-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--card-x', `${event.clientX - rect.left}px`);
        card.style.setProperty('--card-y', `${event.clientY - rect.top}px`);
      }, { passive: true });
    });

    document.querySelectorAll('.button').forEach(button => {
      button.addEventListener('pointermove', event => {
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * .08;
        const y = (event.clientY - rect.top - rect.height / 2) * .1;
        button.style.setProperty('--magnet-x', `${x}px`);
        button.style.setProperty('--magnet-y', `${y}px`);
      });
      button.addEventListener('pointerleave', () => {
        button.style.setProperty('--magnet-x', '0px');
        button.style.setProperty('--magnet-y', '0px');
      });
    });
  }

  document.querySelectorAll('.reveal').forEach((element, index) => {
    if (element.closest('.hero')) return;
    element.classList.add(index % 4 === 1 ? 'reveal--drift' : index % 4 === 3 ? 'reveal--focus' : 'reveal--rise');
  });
}






