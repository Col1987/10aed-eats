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
  const FRESH_MS = 30 * 60 * 1000;

  const state = {
    coords: restoreCoords(),
    status: 'idle',
    q: '',
    cuisine: 'All',
    sort: 'featured',
  };

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

  /* The one and only deep-link: forces Google Maps to open centred exactly on
     the user's GPS coordinates, zoomed in closely (14z). Google then drops
     pins for the restaurant's branches right around them; the user taps the
     closest pin for directions. (True auto-nearest routing requires the paid
     Places API — a known, accepted limitation of the free stack.) */
  function nearestHref(r) {
    if (isPinned(r)) {
      return `https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}`;
    }
    if (state.coords) {
      return `https://www.google.com/maps/search/${encodeURIComponent(r.name)}/@${state.coords.lat},${state.coords.lng},14z`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.name} restaurant, ${CITY_HINT}`)}`;
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
        renderList();
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
        text = `Ready · map centres on you · ${state.coords.lat.toFixed(3)}, ${state.coords.lng.toFixed(3)}`;
        break;
      case 'locating':    dot = 'dot-busy';  text = 'Finding you...'; break;
      case 'denied':      text = 'Location blocked — showing city-wide results'; btn = 'Retry'; break;
      case 'failed':      text = "Couldn't get a fix — showing city-wide results"; btn = 'Retry'; break;
      case 'insecure':    text = 'Location needs HTTPS — showing city-wide results'; break;
      case 'unsupported': text = 'No location support — showing city-wide results'; break;
      default:            dot = 'dot-idle'; text = 'Location off — enable to see branches around you'; btn = 'Enable location';
    }
    els.pill.innerHTML =
      `<span class="dot ${dot}"></span><span>${text}</span>` +
      (btn ? `<button type="button">${btn}</button>` : '');
  }

  els.pill.addEventListener('click', e => {
    if (e.target.closest('button')) locate();
  });

  els.list.addEventListener('click', () => {
    if (['idle', 'denied', 'failed'].includes(state.status)) locate();
  });

  function cuisines() {
    const m = new Map();
    RESTAURANTS.forEach(r => {
      const c = r.cuisine || 'Other';
      m.set(c, (m.get(c) || 0) + 1);
    });
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }

  function filtered() {
    const q = state.q.trim().toLowerCase();
    let rows = RESTAURANTS
      .map((r, i) => [r, i])
      .filter(([r]) => {
        if (state.cuisine !== 'All' && (r.cuisine || 'Other') !== state.cuisine) return false;
        if (!q) return true;
        return [r.name, r.cuisine, r.area]
          .filter(Boolean).join(' ').toLowerCase().includes(q);
      });
    if (state.sort === 'nearest' && state.coords) {
      rows.sort((a, b) => (distOf(a[0]) ?? Infinity) - (distOf(b[0]) ?? Infinity));
    }
    return rows;
  }

  function cardHTML(r, i) {
    const dist = distOf(r);
    const pinned = isPinned(r);
    const cta = pinned ? 'Directions to this branch' : 'Show nearby branches';
    const distTag = dist != null
      ? `<span class="tag tag-dist">📍 ${dist < 1 ? Math.round(dist * 1000) + ' m' : dist.toFixed(1) + ' km'}</span>`
      : '';
    return `
    <li class="reveal">
      <article class="card">
        <span class="card-head">
          <span class="num">${String(i + 1).padStart(2, '0')}</span>
          <span class="cuisine">${esc(r.cuisine || 'Other')}</span>
        </span>
        <span class="name">${esc(r.name)}</span>
        ${r.area ? `<span class="area">📍 ${esc(r.area)}</span>` : ''}
        <span class="card-foot">
          <a class="cta" href="${nearestHref(r)}" target="_blank" rel="noopener noreferrer">${cta}<span class="arrow">↗</span></a>
          ${distTag}
        </span>
      </article>
    </li>`;
  }

  let io;
  function observeReveals() {
    if (io) io.disconnect();
    const items = [...document.querySelectorAll('.reveal')];
    if (!('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('in'));
      return;
    }
    io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    items.forEach((el, idx) => {
      el.style.transitionDelay = `${Math.min(idx, 8) * 45}ms`;
      io.observe(el);
    });
  }

  function renderList() {
    const rows = filtered();
    els.count.textContent = `${rows.length} ${rows.length === 1 ? 'spot' : 'spots'}`;
    els.empty.hidden = rows.length > 0;

    if (rows.length === 0) {
      els.emptyMsg.innerHTML = (state.q || state.cuisine !== 'All')
        ? `Nothing on the list for "${esc(state.q || state.cuisine)}" — try another search.`
        : 'Your list is empty — add restaurants to <code>restaurants.js</code>.';
    }

    els.list.innerHTML = rows.map(([r, i]) => cardHTML(r, i)).join('');
    observeReveals();
  }

  function renderChips() {
    const chip = (c, n) =>
      `<button type="button" class="chip${state.cuisine === c ? ' active' : ''}" data-cuisine="${esc(c)}">${esc(c)}<small>${n}</small></button>`;
    els.chips.innerHTML =
      chip('All', RESTAURANTS.length) + cuisines().map(([c, n]) => chip(c, n)).join('');
  }

  // Search and cuisine filter are standalone modes:
  // using one resets the other, so results always match what you touched last.
  els.chips.addEventListener('click', e => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    state.cuisine = btn.dataset.cuisine;
    state.q = '';
    els.search.value = '';
    renderChips();
    renderList();
  });

  let deb;
  els.search.addEventListener('input', () => {
    clearTimeout(deb);
    deb = setTimeout(() => {
      state.q = els.search.value;
      if (state.q && state.cuisine !== 'All') {
        state.cuisine = 'All';   // search looks across ALL cuisines
        renderChips();
      }
      renderList();
    }, 120);
  });

  els.clearBtn.addEventListener('click', () => {
    state.q = ''; state.cuisine = 'All';
    els.search.value = '';
    renderChips(); renderList();
    els.search.focus();
  });

  function renderSortBtn() {
    const anyPinned = RESTAURANTS.some(isPinned);
    els.sortBtn.hidden = !(state.coords && anyPinned);
    els.sortBtn.textContent = state.sort === 'nearest' ? '★ Sorting: nearest first' : 'Sort: nearest first';
  }
  els.sortBtn.addEventListener('click', () => {
    state.sort = state.sort === 'nearest' ? 'featured' : 'nearest';
    renderSortBtn(); renderList();
  });

  els.statRest.textContent = RESTAURANTS.length;
  els.statCuis.textContent = cuisines().length;
  els.year.textContent = new Date().getFullYear();

  if (state.coords) state.status = 'ready';
  renderPill();
  renderChips();
  renderSortBtn();
  renderList();
})();