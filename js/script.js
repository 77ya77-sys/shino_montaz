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
    resultEl.textContent = total != null ? formatPrice(total) : '—';
    updateServiceList(form);
  };

  const handleFixPriceClick = (evt) => {
    evt.preventDefault();
    document.dispatchEvent(new CustomEvent('open-booking-modal', { detail: { opener: evt.currentTarget } }));
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

    const handleNavLinkClick = (evt) => {
      const link = evt.currentTarget;
      const href = link.getAttribute('href');
      if (!href || href.charAt(0) !== '#') {
        handleClose();
        return;
      }
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) {
        handleClose();
        return;
      }
      evt.preventDefault();
      handleClose();
      setTimeout(() => {
        const headerH = header.offsetHeight || 56;
        const targetTop = target.getBoundingClientRect().top + window.scrollY;
        const scrollTop = targetTop - headerH;
        window.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
      }, 350);
    };

    const handleKeyDown = (evt) => {
      if (evt.key !== 'Escape') return;
      handleClose();
    };

    burger.addEventListener('click', handleBurgerClick);
    nav.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', handleNavLinkClick);
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
  let focusReturnEl = null;

  const getModal = () => document.getElementById(MODAL_ID);
  const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const getFocusables = (root) =>
    Array.prototype.slice.call(root.querySelectorAll(FOCUSABLE_SELECTOR)).filter((el) => el.offsetParent !== null);

  const SUCCESS_CLASS = 'modal--success';

  const openModal = (openerEl) => {
    const modal = getModal();
    if (!modal) return;
    focusReturnEl = openerEl || null;
    modal.classList.remove(SUCCESS_CLASS);
    modal.classList.add(MODAL_OPEN_CLASS);
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const first = getFocusables(modal)[0];
    if (first) setTimeout(() => first.focus(), 50);
    /* Снять жёлтую заливку автозаполнения: при открытии и через 300 мс (на случай уже подставленных данных) */
    const nameInp = modal.querySelector('#booking-name');
    const phoneInp = modal.querySelector('#booking-phone');
    const clearHighlights = () => {
      if (nameInp && nameInp.value) {
        const v = nameInp.value;
        nameInp.value = '';
        requestAnimationFrame(() => { nameInp.value = v; });
      }
      if (phoneInp && phoneInp.value) {
        const v = phoneInp.value;
        phoneInp.value = '';
        requestAnimationFrame(() => { phoneInp.value = v; });
      }
    };
    requestAnimationFrame(clearHighlights);
    setTimeout(clearHighlights, 300);
  };

  const isInViewport = (el) => {
    if (!el || !el.getBoundingClientRect) return false;
    const rect = el.getBoundingClientRect();
    return rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
  };

  const closeModal = () => {
    const modal = getModal();
    if (!modal) return;
    modal.classList.remove(MODAL_OPEN_CLASS);
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (focusReturnEl && typeof focusReturnEl.focus === 'function') {
      if (isInViewport(focusReturnEl)) {
        focusReturnEl.focus();
      } else {
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) skipLink.focus();
      }
    }
    focusReturnEl = null;
    /* Сброс успеха после полного скрытия модалки, чтобы не мелькала форма */
    setTimeout(() => {
      modal.classList.remove(SUCCESS_CLASS);
      modal.setAttribute('aria-labelledby', 'booking-modal-title');
      modal.removeAttribute('aria-label');
      const successEl = document.getElementById('booking-success');
      if (successEl) successEl.setAttribute('hidden', '');
    }, 350);
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

  const initBookingForm = (modal) => {
    const form = document.getElementById('booking-form');
    const nameInput = document.getElementById('booking-name');
    const phoneInput = document.getElementById('booking-phone');
    const privacyCheckbox = document.getElementById('booking-privacy');
    if (!form || !nameInput || !phoneInput || !privacyCheckbox) return;

    const INVALID_CLASS = 'modal__field--invalid';
    const nameField = nameInput.closest('.modal__field');
    const phoneField = phoneInput.closest('.modal__field');
    const privacyField = privacyCheckbox.closest('.modal__field');

    const clearInvalid = (field) => {
      if (field) {
        field.classList.remove(INVALID_CLASS);
        const input = field.querySelector('input');
        if (input) input.removeAttribute('aria-invalid');
      }
    };

    const getPhoneDigits = (value) => {
      let val = (value || '').replace(/\D/g, '');
      if (val.length === 11 && (val[0] === '7' || val[0] === '8')) val = val.slice(1);
      return val.slice(0, 10);
    };

    const formatPhoneDisplay = (digits) => {
      const d = (digits || '').replace(/\D/g, '').slice(0, 10);
      if (d.length === 0) return '';
      if (d.length <= 3) return '(' + d;
      if (d.length <= 6) return '(' + d.slice(0, 3) + ') ' + d.slice(3);
      if (d.length <= 8) return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
      return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6, 8) + '-' + d.slice(8, 10);
    };

    const applyPhoneMask = () => {
      const digits = getPhoneDigits(phoneInput.value);
      phoneInput.value = formatPhoneDisplay(digits);
      phoneInput.setAttribute('data-phone-digits', digits);
      clearInvalid(phoneField);
    };

    /* Сброс жёлтой заливки автозаполнения: очищаем значение и восстанавливаем — браузер снимает подсветку */
    const clearAutofillHighlight = (inputEl, afterRestore) => {
      const saved = inputEl.value;
      if (!saved) return;
      inputEl.value = '';
      requestAnimationFrame(() => {
        inputEl.value = saved;
        if (afterRestore) afterRestore();
      });
    };
    phoneInput.addEventListener('input', applyPhoneMask);
    phoneInput.addEventListener('paste', () => setTimeout(applyPhoneMask, 0));
    phoneInput.addEventListener('change', applyPhoneMask);
    phoneInput.addEventListener('change', () => clearAutofillHighlight(phoneInput, applyPhoneMask));
    nameInput.addEventListener('input', () => clearInvalid(nameField));
    nameInput.addEventListener('change', () => {
      clearInvalid(nameField);
      clearAutofillHighlight(nameInput);
    });
    privacyCheckbox.addEventListener('change', () => clearInvalid(privacyField));

    form.addEventListener('submit', (evt) => {
      evt.preventDefault();
      const nameOk = (nameInput.value || '').trim().length >= 1;
      const phoneOk = getPhoneDigits(phoneInput.value).length === 10;
      const privacyOk = privacyCheckbox.checked;

      [nameField, phoneField, privacyField].forEach((f) => f && f.classList.remove(INVALID_CLASS));
      if (nameOk && phoneOk && privacyOk) {
        const modal = getModal();
        const successEl = document.getElementById('booking-success');
        if (modal && successEl) {
          modal.classList.add(SUCCESS_CLASS);
          modal.setAttribute('aria-labelledby', 'booking-success-text');
          modal.setAttribute('aria-label', 'Заявка отправлена');
          successEl.removeAttribute('hidden');
          const successCloseBtn = modal.querySelector('.modal__success-close');
          if (successCloseBtn) setTimeout(() => successCloseBtn.focus(), 50);
        }
        return;
      }
      if (!nameOk && nameField) {
        nameField.classList.add(INVALID_CLASS);
        nameInput.setAttribute('aria-invalid', 'true');
      }
      if (!phoneOk && phoneField) {
        phoneField.classList.add(INVALID_CLASS);
        phoneInput.setAttribute('aria-invalid', 'true');
      }
      if (!privacyOk && privacyField) {
        privacyField.classList.add(INVALID_CLASS);
        privacyCheckbox.setAttribute('aria-invalid', 'true');
      }
    });
  };

  const initModal = () => {
    const modal = getModal();
    if (!modal) return;

    const backdrop = modal.querySelector('.modal__backdrop');
    const closeBtn = modal.querySelector('.modal__close-btn');
    const successCloseBtn = modal.querySelector('.modal__success-close');

    if (successCloseBtn) successCloseBtn.addEventListener('click', closeModal);

    document.addEventListener('open-booking-modal', (evt) => {
      const priceEl = document.getElementById('booking-modal-price');
      const totalBlock = document.querySelector('.total-price-block');
      if (priceEl && totalBlock) priceEl.textContent = (totalBlock.textContent || '').trim() || '—';
      const opener = evt.detail && evt.detail.opener;
      openModal(opener || null);
    });

    initBookingForm(modal);

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
  /* Только секции, на которые есть ссылки в мобильном меню (нет #services) */
  const SECTION_IDS = ['calculator', 'prices', 'reviews', 'contacts'];

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
      const activeId = activeSection ? activeSection.id : null;
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

/**
 * Reviews carousel — prev/next arrows (desktop only, CSS hides on mobile)
 */
(function () {
  'use strict';

  const initReviewsArrows = () => {
    const carousel = document.getElementById('reviews-carousel');
    const prevBtn = document.querySelector('.reviews__arrow--prev');
    const nextBtn = document.querySelector('.reviews__arrow--next');
    if (!carousel || !prevBtn || !nextBtn) return;

    const CAROUSEL_GAP = 24;
    const getStep = () => {
      const card = carousel.querySelector('.reviews__card');
      return card ? card.offsetWidth + CAROUSEL_GAP : carousel.clientWidth * 0.5;
    };

    prevBtn.addEventListener('click', () => {
      carousel.scrollBy({ left: -getStep(), behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', () => {
      carousel.scrollBy({ left: getStep(), behavior: 'smooth' });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReviewsArrows);
  } else {
    initReviewsArrows();
  }
})();

/**
 * Shared utils: header height (used by calc check bar and desktop nav).
 * Calculator check bar + Desktop nav — одна IIFE с общей getHeaderHeight.
 */
(function () {
  'use strict';

  const DEFAULT_HEADER_HEIGHT = 80;

  const getHeaderHeight = () => {
    const header = document.querySelector('.header');
    return header ? header.getBoundingClientRect().height : DEFAULT_HEADER_HEIGHT;
  };

  /* ----- Calculator check bar ----- */
  const calcSection = document.getElementById('calculator');
  if (calcSection) {
    let mobileVisible = false;
    let mobileStickbarEverShown = false; /* раз показали (калькулятор ≥55%) — не скрываем при скролле вниз; скрываем только когда доверху (калькулятор снова <55%) */
    let desktopStripVisible = false;

    const setMobileVisible = (value) => {
      if (mobileVisible === value) return;
      mobileVisible = value;
      document.body.classList.toggle('calc-check-visible', value);
    };

    const setDesktopStripVisible = (value) => {
      if (desktopStripVisible === value) return;
      desktopStripVisible = value;
      document.body.classList.toggle('calc-check-strip-desktop', value);
    };

    const updateCalcBar = () => {
      const calcRect = calcSection.getBoundingClientRect();
      const headerH = getHeaderHeight();

      const CALC_VISIBLE_RATIO = 0.55; /* мобильная: стикбар появляется при 55% калькулятора, ниже крутит — виден всегда; доверху (калькулятор <55%) — исчезает */
      if (window.matchMedia('(max-width: 768px)').matches) {
        setDesktopStripVisible(false);
        const h = calcRect.height;
        if (h <= 0) {
          if (calcRect.top > 0) setMobileVisible(false);
          else if (mobileStickbarEverShown) setMobileVisible(true);
        } else {
          const visibleTop = Math.max(calcRect.top, 0);
          const visibleBottom = Math.min(calcRect.bottom, window.innerHeight);
          const visibleHeight = Math.max(0, visibleBottom - visibleTop);
          const ratio = visibleHeight / h;
          if (ratio >= CALC_VISIBLE_RATIO) {
            mobileStickbarEverShown = true;
            setMobileVisible(true);
          } else if (calcRect.top > 0) {
            setMobileVisible(false);
          } else if (mobileStickbarEverShown) {
            setMobileVisible(true);
          }
        }
        return;
      }
      mobileStickbarEverShown = false;
      setMobileVisible(false);
      const DESKTOP_STRIP_HIDE_RATIO = 0.45; /* чек в сайдбаре виден, пока калькулятор виден >45%; при видимости ≤45% чек исчезает и появляется стикбар */
      const h = calcRect.height;
      let stripShow = false;
      const pastMainBlock = window.scrollY >= calcSection.offsetTop; /* прокрутили до калькулятора — не на главном блоке; на главном блоке стикбара нет */
      if (pastMainBlock && h > 0) {
        const visibleTop = Math.max(calcRect.top, 0);
        const visibleBottom = Math.min(calcRect.bottom, window.innerHeight);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const ratio = visibleHeight / h;
        stripShow = ratio < DESKTOP_STRIP_HIDE_RATIO;
      }
      setDesktopStripVisible(stripShow);
    };

    window.addEventListener('scroll', updateCalcBar, { passive: true });
    window.addEventListener('resize', updateCalcBar);
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', updateCalcBar);
    } else {
      updateCalcBar();
    }
  }

  /* ----- Desktop nav ----- */
  const SECTION_IDS = ['calculator', 'prices', 'reviews', 'contacts'];
  const VISIBLE_RATIO = 0.7;

  const updateActiveNav = () => {
    if (!window.matchMedia('(min-width: 769px)').matches) return;
    const nav = document.querySelector('.desktop-nav');
    if (!nav) return;
    const headerH = getHeaderHeight();
    const viewportTop = headerH;
    const viewportBottom = window.innerHeight;
    const viewportHeight = viewportBottom - viewportTop;

    let bestId = SECTION_IDS[0];
    let bestRatio = 0;

    for (let i = 0; i < SECTION_IDS.length; i++) {
      const section = document.getElementById(SECTION_IDS[i]);
      if (!section) continue;
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionBottom = rect.bottom;
      const sectionHeight = rect.height;
      if (sectionHeight <= 0) continue;
      const visibleTop = Math.max(sectionTop, viewportTop);
      const visibleBottom = Math.min(sectionBottom, viewportBottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const ratio = visibleHeight / sectionHeight;
      if (ratio >= VISIBLE_RATIO && ratio > bestRatio) {
        bestRatio = ratio;
        bestId = SECTION_IDS[i];
      }
    }

    if (bestRatio < VISIBLE_RATIO) {
      const firstSection = document.getElementById(SECTION_IDS[0]);
      const heroFullyOpen = firstSection && firstSection.getBoundingClientRect().top > viewportBottom * 0.5;
      if (heroFullyOpen) {
        bestId = null;
      } else {
        const scrollY = window.scrollY || window.pageYOffset;
        for (let i = SECTION_IDS.length - 1; i >= 0; i--) {
          const section = document.getElementById(SECTION_IDS[i]);
          if (!section) continue;
          const top = section.getBoundingClientRect().top + scrollY - headerH;
          if (top <= scrollY) {
            bestId = SECTION_IDS[i];
            break;
          }
        }
      }
    }

    nav.querySelectorAll('.desktop-nav__link').forEach((link) => {
      const href = link.getAttribute('href') || '';
      const isActive = bestId !== null && href === '#' + bestId;
      link.classList.toggle('active', isActive);
    });
  };

  const initNavClick = () => {
    if (!window.matchMedia('(min-width: 769px)').matches) return;
    const nav = document.querySelector('.desktop-nav');
    if (!nav) return;
    nav.querySelectorAll('.desktop-nav__link').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href === '#' || href.length < 2) return;
        const id = href.slice(1);
        const section = document.getElementById(id);
        if (!section) return;
        e.preventDefault();
        const headerH = getHeaderHeight();
        const top = section.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) - headerH;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      });
    });
  };

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  window.addEventListener('resize', updateActiveNav);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      updateActiveNav();
      initNavClick();
    });
  } else {
    updateActiveNav();
    initNavClick();
  }
})();

/**
 * Phone Modal — показ номера телефона на десктопе
 * На мобильных устройствах работает обычный tel: протокол
 */
(function () {
  'use strict';

  const phoneModal = document.getElementById('phone-modal');
  if (!phoneModal) return;

  const backdrop = phoneModal.querySelector('.modal__backdrop');
  const closeBtn = phoneModal.querySelector('.modal__close-btn');
  const phoneLinks = document.querySelectorAll('a[href^="tel:"]');

  let lastFocusedElement = null;

  // Определяем, мобильное устройство или десктоп
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
      || window.matchMedia('(max-width: 768px)').matches;
  };

  // Открыть модальное окно
  const openPhoneModal = () => {
    phoneModal.classList.add('modal--open');
    phoneModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Фокус на номер телефона
    const phoneNumber = phoneModal.querySelector('.modal__phone-number');
    if (phoneNumber) {
      setTimeout(() => phoneNumber.focus(), 100);
    }
  };

  // Закрыть модальное окно
  const closePhoneModal = () => {
    phoneModal.classList.remove('modal--open');
    phoneModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // Вернуть фокус на элемент, который открыл модальное окно
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
    lastFocusedElement = null;
  };

  // Обработчик клика на телефонные ссылки
  phoneLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      // На мобильных устройствах оставляем стандартное поведение (tel:)
      if (isMobileDevice()) {
        return; // Позволяем браузеру открыть набор номера
      }
      
      // На десктопе показываем модальное окно
      e.preventDefault();
      lastFocusedElement = link;
      openPhoneModal();
    });
  });

  // Закрытие по клику на backdrop
  if (backdrop) {
    backdrop.addEventListener('click', closePhoneModal);
  }

  // Закрытие по клику на кнопку закрытия
  if (closeBtn) {
    closeBtn.addEventListener('click', closePhoneModal);
  }

  // Закрытие по ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && phoneModal.classList.contains('modal--open')) {
      closePhoneModal();
    }
  });

  // Копирование номера при клике (опционально)
  const phoneNumber = phoneModal.querySelector('.modal__phone-number');
  if (phoneNumber) {
    phoneNumber.addEventListener('click', (e) => {
      e.preventDefault();
      const phoneText = phoneNumber.textContent || phoneNumber.innerText;
      const cleanPhone = phoneText.replace(/\D/g, ''); // Убираем все нецифровые символы
      
      // Копируем в буфер обмена
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('+' + cleanPhone).then(() => {
          // Показываем уведомление
          const hint = phoneModal.querySelector('.modal__phone-hint');
          if (hint) {
            const originalText = hint.textContent;
            hint.textContent = '✓ Номер скопирован!';
            hint.style.color = 'var(--color-accent)';
            setTimeout(() => {
              hint.textContent = originalText;
              hint.style.color = '';
            }, 2000);
          }
        }).catch(() => {
          // Если копирование не удалось, показываем уведомление
          const hint = phoneModal.querySelector('.modal__phone-hint');
          if (hint) {
            hint.textContent = 'Выделите и скопируйте номер вручную';
          }
        });
      }
    });
  }
})();
