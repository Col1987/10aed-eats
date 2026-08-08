/* 10 AED Eats — Dubai Summer Surprises finder */
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);

  const els = {
    pill:      $('#locPill'),
    search:    $('#search'),
    chips:     $('#chips'),
    count:     $('#count'),
    list:      $('#list'),
    empty:     $('#empty'),
    emptyMsg:  $('#emptyMsg'),
    clearBtn:  $('#clearFilters'),
    sortBtn:   $('#sortBtn'),
    statRest:  $('#statRestaurants'),
    statCuis:  $('#statCuisines'),
    year:      $('#year'),
  };

  const STORAGE_KEY = 'dss10.coords';
  const FRESH_MS = 30 * 60 * 1000; // reuse a session fix for 30 minutes

  const state = {
    coords: restoreCoords(),
    status: 'idle',   // idle | locating | ready | denied | failed | insecure | unsupported
    q: '',
    cuisine: 'All',
    sort: 'featured', // featured | nearest
  };

  /* ---------------- helpers ---------------- */

  const esc = (s = '') => String(s).replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const isPinned = r => typeof r.lat === 'number' && typeof r.lng === 'number';

  function haversineKm(aLat, aLng, bLat, bLng) {
    const R = 6371, rad = Math.PI / 180;
    const dLat = (bLat - aLat) * rad, dLng = (bLng - aLng) * rad;
    const h = Math.sin(dLat / 2) ** 2 +
      Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  const distOf = r => (state.coords && isPinned(r))
    ? haversineKm(state.coords.lat, state.coords.lng, r.lat, r.lng)
    : null;

  /* PRIMARY deep-link: the DIRECTIONS endpoint. Given an origin (the user's
     coordinates), Google resolves a chain name to the single branch that
     makes sense from that point — i.e. the nearest one — and draws the route.
     Without coordinates we omit origin and let Google estimate the user's
     position, which still biases to the nearest branch. */
  function nearestHref(r) {
    if (isPinned(r)) {
      return `https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}`;
    }
    if (state.coords) {
      return `https://www.google.com/maps/dir/?api=1&origin=${state.coords.lat},${state.coords.lng}` +
             `&destination=${encodeURIComponent(r.name)}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${r.name} restaurant, ${CITY_HINT}`)}`;
  }

  /* SECONDARY deep-link: the SEARCH endpoint — the full list of branches,
     for users who want to choose manually. */
  function allHref(r) {
    const q = state.coords
      ? `${r.name} near ${state.coords.lat},${state.coords.lng}`
      : `${r.name} restaurant, ${CITY_HINT}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  }

  function restoreCoords() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const c = JSON.parse(raw);
      if (typeof c.lat === 'number' && typeof c.lng === 'number' && Date.now() - c.t < FRESH_MS) return c;
    } catch (_) {}
    return null;
  }
  function saveCoords(c) { try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch (_) {} }

  /* ---------------- geolocation ---------------- */

  function locate() {
    if (!('geolocation' in navigator)) return setStatus('unsupported');
    if (!window.isSecureContext)       return setStatus('insecure');
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      pos => {
        state.coords = {
          lat: +pos.coords.latitude.toFixed(5),
          lng: +pos.coords.longitude.toFixed(5),
          t: Date.now(),
        };
        saveCoords(state.coords);
        setStatus('ready');
        renderSortBtn();
        renderList(); // refresh hrefs so they now carry coordinates
      },
      err => setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'failed'),
      { enableHighAccuracy: false, timeout: 9000, maximumAge: 120000 }
    );
  }

  function setStatus(s) { state.status = s; renderPill(); }

  function renderPill() {
    let text, btn = null, dot = 'dot-warn';
    switch (state.status) {
      case 'ready':
        dot = 'dot-ok';
        text = `Ready · nearest-first is on · ${state.coords.lat.toFixed(3)}, ${state.coords.lng.toFixed(3)}`;
        break;
      case 'locating':    dot = 'dot-busy';  text = 'Finding you…'; break;
      case 'denied':      text = 'Location blocked — Maps will estimate instead'; btn = 'Retry'; break;
      case 'failed':      text = "Couldn't get a fix — Maps will estimate instead"; btn = 'Retry'; break;
      case 'insecure':    text = 'Location needs HTTPS — Maps will estimate instead'; break;
      case 'unsupported': text = 'This browser has no location — Maps will estimate instead'; break;
      default:            dot = 'dot-idle'; text = 'Location off — enable it for nearest branches'; btn = 'Enable location';
    }
    els.pill.innerHTML =
      `<span class="dot ${dot}"></span><span>${text}</span>` +
      (btn ? `<button type="button">${btn}</button>` : '');
  }

  els.pill.addEventListener('click', e => {
    if (e.target.closest('button')) locate();
  });

  // If someone taps a card before granting location, request it in the
  // background — the link still opens immediately with the fallback query.
  els.list.addEventListener('click', () => {
    if (['idle', 'denied', 'failed'].includes(state.status)) locate();