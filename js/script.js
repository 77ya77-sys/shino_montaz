/**
 * Tire Service — calculator logic
 * Vehicle type (radio), radius (select), service type (checkboxes) → total price
 */

(function () {
  'use strict';

  // Base prices: vehicle -> radius range -> { complex, repair, balance }
  const PRICE_MAP = {
    car: {
      'r13-15': { complex: 2500, repair: 500, balance: 800 },
      'r16-18': { complex: 3500, repair: 700, balance: 1000 },
      'r19-22': { complex: 4500, repair: 900, balance: 1200 },
    },
    jeep: {
      'r13-15': { complex: 3000, repair: 600, balance: 1000 },
      'r16-18': { complex: 4000, repair: 800, balance: 1200 },
      'r19-22': { complex: 5500, repair: 1100, balance: 1500 },
    },
    minibus: {
      'r13-15': { complex: 3500, repair: 700, balance: 1200 },
      'r16-18': { complex: 4500, repair: 900, balance: 1500 },
      'r19-22': { complex: 6000, repair: 1200, balance: 1800 },
    },
  };

  const getVehicle = (form) => {
    const radio = form.querySelector('input[name="vehicle"]:checked');
    return radio ? radio.value : null;
  };

  const getRadius = (form) => {
    const radio = form.querySelector('input[name="radius"]:checked');
    return radio ? radio.value : null;
  };

  const getSelectedServices = (form) => {
    const checkboxes = form.querySelectorAll('input[name="service"]:checked');
    return Array.from(checkboxes).map((cb) => cb.value);
  };

  const calculateTotal = (vehicle, radius, serviceKeys) => {
    const byVehicle = PRICE_MAP[vehicle];
    if (!byVehicle || !radius || serviceKeys.length === 0) return null;
    const byRadius = byVehicle[radius];
    if (!byRadius) return null;
    let total = 0;
    for (const key of serviceKeys) {
      const price = byRadius[key];
      if (price != null) total += price;
    }
    return total > 0 ? total : null;
  };

  const formatPrice = (value) => {
    if (value == null) return '—';
    return new Intl.NumberFormat('ru-RU', { style: 'decimal' }).format(value) + ' ₽';
  };

  const handleCalculatorChange = (form, resultEl) => {
    const vehicle = getVehicle(form);
    const radius = getRadius(form);
    const services = getSelectedServices(form);
    const total = calculateTotal(vehicle, radius, services);
    resultEl.textContent = formatPrice(total);
  };

  const handleFixPriceClick = (evt) => {
    evt.preventDefault();
    const resultEl = document.querySelector('[data-calc="result"]');
    const price = resultEl && resultEl.textContent !== '—' ? resultEl.textContent : null;
    if (price) {
      const link = document.querySelector('.header__phone');
      const href = link ? link.getAttribute('href') : 'tel:+78001234567';
      window.location.href = href;
    }
  };

  const initCalculator = () => {
    const form = document.querySelector('.calculator__form');
    const resultEl = document.querySelector('[data-calc="result"]');
    const ctaBtn = document.querySelector('.calculator__cta');

    if (!form || !resultEl) return;

    const inputs = form.querySelectorAll('input[data-calc]');
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
