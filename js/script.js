/**
 * Tire Service — calculator logic
 * Job type (full/wheels), vehicle, radius, options (RunFlat, Low Profile, Valves) → total price
 */

(function () {
  'use strict';

  // Base prices: vehicle -> radius -> complex (full re-mount)
  const PRICE_MAP = {
    car: {
      'r13-15': { complex: 2500 },
      'r16-18': { complex: 3500 },
      'r19-22': { complex: 4500 },
    },
    suv: {
      'r13-15': { complex: 3000 },
      'r16-18': { complex: 4000 },
      'r19-22': { complex: 5500 },
    },
    minibus: {
      'r13-15': { complex: 3500 },
      'r16-18': { complex: 4500 },
      'r19-22': { complex: 6000 },
    },
  };

  const VALVES_EXTRA = 500;
  const WHEELS_SWAP_FACTOR = 0.6;
  const RUNFLAT_MARKUP = 1.2;
  const LOWPROFILE_MARKUP = 1.15;

  const getJobType = (form) => {
    const radio = form.querySelector('input[name="jobtype"]:checked');
    return radio ? radio.value : 'full';
  };

  const getVehicle = (form) => {
    const radio = form.querySelector('input[name="vehicle"]:checked');
    return radio ? radio.value : null;
  };

  const getRadius = (form) => {
    const radio = form.querySelector('input[name="radius"]:checked');
    return radio ? radio.value : null;
  };

  const isRunflatChecked = (form) => {
    return Boolean(form.querySelector('input[name="runflat"]:checked'));
  };

  const isLowProfileChecked = (form) => {
    return Boolean(form.querySelector('input[name="lowprofile"]:checked'));
  };

  const isValvesChecked = (form) => {
    return Boolean(form.querySelector('input[name="valves"]:checked'));
  };

  const calculateTotal = (form) => {
    const vehicle = getVehicle(form);
    const radius = getRadius(form);
    const jobType = getJobType(form);
    const byVehicle = PRICE_MAP[vehicle];
    if (!byVehicle || !radius) return null;
    const byRadius = byVehicle[radius];
    if (!byRadius) return null;
    let total = byRadius.complex;
    if (jobType === 'wheels') {
      total = Math.round(total * WHEELS_SWAP_FACTOR);
    }
    if (isRunflatChecked(form)) {
      total = Math.round(total * RUNFLAT_MARKUP);
    }
    if (isLowProfileChecked(form)) {
      total = Math.round(total * LOWPROFILE_MARKUP);
    }
    if (isValvesChecked(form)) {
      total += VALVES_EXTRA;
    }
    return total;
  };

  const formatPrice = (value) => {
    if (value == null) return '—';
    return new Intl.NumberFormat('ru-RU', { style: 'decimal' }).format(value) + ' ₽';
  };

  const SERVICE_ITEMS_FULL = [
    'Снятие и установка',
    'Мойка',
    'Демонтаж и монтаж шин',
    'Балансировка',
  ];
  const SERVICE_ITEMS_SWAP = [
    'Снятие и установка',
    'Мойка',
    'Балансировка',
  ];

  const updateServiceList = (form) => {
    const listEl = document.getElementById('service-list');
    if (!listEl) return;
    const jobType = getJobType(form);
    const items = jobType === 'wheels' ? SERVICE_ITEMS_SWAP : SERVICE_ITEMS_FULL;
    listEl.innerHTML = items.map((text) => '<li>' + text + '</li>').join('');
  };

  const handleCalculatorChange = (form, resultEl) => {
    const total = calculateTotal(form);
    resultEl.textContent = total != null ? 'Итого: ' + formatPrice(total) : '—';
    updateServiceList(form);
  };

  const handleFixPriceClick = (evt) => {
    evt.preventDefault();
    const resultEl = document.querySelector('.total-price-block');
    const price = resultEl && resultEl.textContent !== '—' ? resultEl.textContent : null;
    if (price) {
      const link = document.querySelector('.header__phone');
      const href = link ? link.getAttribute('href') : 'tel:+78001234567';
      window.location.href = href;
    }
  };

  const initCalculator = () => {
    const form = document.querySelector('.calculator__form');
    const resultEl = document.querySelector('.total-price-block');
    const ctaBtn = document.querySelector('.calculator__cta');

    if (!form || !resultEl) return;

    const inputs = form.querySelectorAll(
      'input[data-calc="jobtype"], input[data-calc="vehicle"], input[data-calc="radius"], input[data-calc="runflat"], input[data-calc="lowprofile"], input[data-calc="valves"]'
    );
    inputs.forEach((el) => {
      el.addEventListener('change', () => handleCalculatorChange(form, resultEl));
    });

    if (ctaBtn) {
      ctaBtn.addEventListener('click', handleFixPriceClick);
    }

    handleCalculatorChange(form, resultEl);
    updateServiceList(form);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalculator);
  } else {
    initCalculator();
  }
})();

/**
 * Burger menu — toggle mobile nav, aria-expanded, close on link click / Escape
 */
(function () {
  'use strict';

  const BURGER_ID = 'header-burger';
  const HEADER_OPEN_CLASS = 'header--menu-open';
  const FOCUSABLE_IN_NAV = 'a[href], button';

  const initBurger = () => {
    const burger = document.getElementById(BURGER_ID);
    const header = burger ? burger.closest('.header') : null;
    const nav = document.getElementById('header-nav');
    if (!burger || !header || !nav) return;

    const setOpen = (open) => {
      header.classList.toggle(HEADER_OPEN_CLASS, open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    };

    const handleBurgerClick = () => {
      setOpen(!header.classList.contains(HEADER_OPEN_CLASS));
    };

    const handleClose = () => {
      setOpen(false);
    };

    const handleKeyDown = (evt) => {
      if (evt.key !== 'Escape') return;
      handleClose();
    };

    burger.addEventListener('click', handleBurgerClick);
    nav.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', handleClose);
    });
    document.addEventListener('keydown', (evt) => {
      if (evt.key !== 'Escape' || !header.classList.contains(HEADER_OPEN_CLASS)) return;
      const modal = document.getElementById('booking-modal');
      if (modal && modal.classList.contains('modal--open')) return;
      handleClose();
      burger.focus();
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBurger);
  } else {
    initBurger();
  }
})();

/**
 * Booking modal — open/close, backdrop click, Escape, focus trap and return
 */
(function () {
  'use strict';

  const MODAL_ID = 'booking-modal';
  const MODAL_OPEN_CLASS = 'modal--open';
  const HERO_CTA_ID = 'hero-booking-cta';

  let focusReturnEl = null;

  const getModal = () => document.getElementById(MODAL_ID);
  const getFocusables = (root) =>
    Array.prototype.slice.call(root.querySelectorAll('a[href], button:not([disabled])')).filter((el) => el.offsetParent !== null);

  const openModal = (openerEl) => {
    const modal = getModal();
    if (!modal) return;
    focusReturnEl = openerEl || null;
    modal.classList.add(MODAL_OPEN_CLASS);
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const first = getFocusables(modal)[0];
    if (first) setTimeout(() => first.focus(), 50);
  };

  const closeModal = () => {
    const modal = getModal();
    if (!modal) return;
    modal.classList.remove(MODAL_OPEN_CLASS);
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (focusReturnEl && typeof focusReturnEl.focus === 'function') focusReturnEl.focus();
    focusReturnEl = null;
  };

  const handleModalKeyDown = (evt) => {
    const modal = getModal();
    if (!modal || !modal.classList.contains(MODAL_OPEN_CLASS)) return;
    if (evt.key === 'Escape') {
      evt.preventDefault();
      closeModal();
      return;
    }
    if (evt.key !== 'Tab') return;
    const focusables = getFocusables(modal);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (evt.shiftKey) {
      if (document.activeElement === first) {
        evt.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        evt.preventDefault();
        first.focus();
      }
    }
  };

  const initModal = () => {
    const modal = getModal();
    const heroCta = document.getElementById(HERO_CTA_ID);
    if (!modal) return;

    const backdrop = modal.querySelector('.modal__backdrop');
    const closeBtn = modal.querySelector('.modal__close');

    if (heroCta) {
      heroCta.addEventListener('click', (evt) => {
        evt.preventDefault();
        openModal(heroCta);
      });
    }

    if (backdrop) backdrop.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', handleModalKeyDown);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModal);
  } else {
    initModal();
  }
})();

/**
 * ScrollSpy — active link highlighting for sticky nav
 */
(function () {
  'use strict';

  const HEADER_OFFSET = 100;
  const NAV_SELECTOR = '.header__nav';
  const SECTION_IDS = ['calculator', 'prices', 'services', 'reviews', 'contacts'];

  const initScrollSpy = () => {
    const nav = document.querySelector(NAV_SELECTOR);
    if (!nav) return;

    const links = nav.querySelectorAll('.nav-link');
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    if (links.length === 0 || sections.length === 0) return;

    const updateActiveLink = () => {
      const headerOffset = HEADER_OFFSET;
      let activeSection = null;
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= headerOffset && rect.bottom > headerOffset) {
          if (!activeSection || rect.top < activeSection.getBoundingClientRect().top) {
            activeSection = section;
          }
        }
      }
      if (!activeSection) {
        const firstSection = sections[0];
        const firstTop = firstSection ? firstSection.getBoundingClientRect().top : 0;
        if (firstTop > headerOffset) {
          activeSection = null;
        } else {
          activeSection = sections.find((s) => s.getBoundingClientRect().top >= headerOffset) || sections[0];
        }
      }
      let activeId = activeSection ? activeSection.id : null;
      if (activeId === 'services') activeId = 'prices';
      links.forEach((link) => {
        const href = link.getAttribute('href') || '';
        link.classList.toggle('active', href === '#' + activeId);
      });
    };

    const observer = new IntersectionObserver(
      () => updateActiveLink(),
      {
        root: null,
        rootMargin: `-${HEADER_OFFSET}px 0px 0px 0px`,
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    sections.forEach((section) => observer.observe(section));
    updateActiveLink();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollSpy);
  } else {
    initScrollSpy();
  }
})();
