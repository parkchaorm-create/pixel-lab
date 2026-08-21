/* ============================================================
   Pixel Lab — interactions
   No dependencies. Everything degrades if JS/animation is off.
   ============================================================ */
(() => {
'use strict';

const D = window.PL;
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const TOUCH = matchMedia('(hover:none), (pointer:coarse)').matches;

/* A url() living in a custom property is resolved against the stylesheet that
   *uses* it (assets/css/), not the document — so hand CSS an absolute URL. */
const ABS   = p => new URL(p, location.href).href;
const IMG   = id => `assets/img/thumb/${id}.webp`;
const IMGF  = id => `assets/img/full/${id}.webp`;
const VID   = id => `assets/video/${id}.mp4`;
const POST  = id => `assets/poster/${id}.jpg`;

/* ── brand lookup ─────────────────────────────────────────── */
const BRAND = Object.fromEntries(D.brands.map(b => [b.key, b]));

/* ══ 1. BOOT ═══════════════════════════════════════════════ */
function boot () {
  const el = $('#boot'), bar = $('#bootBar');
  let p = 0;
  const tick = setInterval(() => {
    p = Math.min(100, p + Math.random() * 26);
    bar.style.width = p + '%';
    if (p >= 100) clearInterval(tick);
  }, 110);

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    bar.style.width = '100%';
    setTimeout(() => {
      el.classList.add('is-done');
      $('#hero').classList.add('is-live');
      $$('.hero .reveal').forEach((n, i) =>
        setTimeout(() => n.classList.add('is-in'), 220 + i * 110));
    }, 300);
  };
  /* Waiting on window.load would mean waiting on every lazy image; the hero's
     first decoded frame is the real "ready" signal. 1.8s is the hard ceiling. */
  $('#heroA').addEventListener('loadeddata', finish);
  setTimeout(finish, 1800);
}

/* ══ 2. CURSOR ═════════════════════════════════════════════ */
function cursor () {
  if (TOUCH || RM) return;
  const c = $('#cursor'), dot = $('.cursor__dot', c), ring = $('.cursor__ring', c), lab = $('#cursorLabel');
  let mx = 0, my = 0, rx = 0, ry = 0;

  addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    c.classList.add('is-on');
  }, { passive: true });

  (function loop () {                                   // ring lags → weight
    rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%) scale(${c.classList.contains('is-hot') ? 1 : .6})`;
    requestAnimationFrame(loop);
  })();

  const HOT = 'a,button,.vcard,.bcard,.acell,.chip,[data-cursor]';
  addEventListener('mouseover', e => {
    const t = e.target.closest(HOT);
    if (!t) return;
    c.classList.add('is-hot');
    const l = t.dataset.cursor;
    if (l) { lab.textContent = l; c.classList.add('is-label'); }
  });
  addEventListener('mouseout', e => {
    if (!e.target.closest(HOT)) return;
    c.classList.remove('is-hot', 'is-label');
  });
}

/* ══ 3. NAV + SCROLL PROGRESS ══════════════════════════════ */
function chrome () {
  const nav = $('#nav'), bar = $('#scrollBar');
  let last = 0;
  const on = () => {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    nav.classList.toggle('is-solid', y > 40);
    nav.classList.toggle('is-hidden', y > last && y > 320 && !$('#drawer').classList.contains('is-open'));
    last = y;
  };
  addEventListener('scroll', on, { passive: true });
  on();

  const dr = $('#drawer'), bg = $('#burger');
  const toggle = force => {
    const open = force ?? !dr.classList.contains('is-open');
    dr.classList.toggle('is-open', open);
    bg.classList.toggle('is-x', open);
    document.body.classList.toggle('is-locked', open);
  };
  bg.addEventListener('click', () => toggle());
  $$('#drawer a').forEach(a => a.addEventListener('click', () => toggle(false)));

  $$('[data-scroll]').forEach(a => a.addEventListener('click', e => {
    const t = $(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    scrollTo({ top: t.getBoundingClientRect().top + scrollY - 64, behavior: RM ? 'auto' : 'smooth' });
  }));

  $('#yr').textContent = new Date().getFullYear();
}

/* ══ 3b. LIVE COUNTS ═══════════════════════════════════════
   Every number on the page is derived from data.js, so adding or
   removing work can never leave a stale figure in the copy.        */
function counts () {
  const nB = D.brands.length;
  const nS = D.all.length;
  const nF = D.videos.length + 1;            // + the GAMFF award film
  const set = (sel, v) => { const n = $(sel); if (n) n.textContent = v; };
  set('#brandCount', nB);
  set('#heroFilmCount', nF);
  $('#statBrands').dataset.count = nB;
  $('#statShots').dataset.count  = nS;
  $('#statFilms').dataset.count  = nF;
}

/* ══ 4. REVEAL + COUNTERS ══════════════════════════════════ */
function reveal () {
  const io = new IntersectionObserver((ents, obs) => {
    ents.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      obs.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('.reveal').forEach(n => io.observe(n));

  const cio = new IntersectionObserver((ents, obs) => {
    ents.forEach(e => {
      if (!e.isIntersecting) return;
      obs.unobserve(e.target);
      const to = +e.target.dataset.count, t0 = performance.now(), dur = 1500;
      if (RM) { e.target.textContent = to; return; }
      const step = now => {
        const k = Math.min(1, (now - t0) / dur);
        e.target.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });
  $$('[data-count]').forEach(n => cio.observe(n));
}

/* ══ 5. HERO VIDEO ROTATION ════════════════════════════════ */
function heroFilm () {
  const A = $('#heroA'), B = $('#heroB'), now = $('#heroNow');
  const q = [
    /* a silent 22s cut, not the 79s master — the hero must not cost a visitor
       the whole film before the page has moved */
    { src: 'assets/film/gamff-hero.mp4', label: 'GOYO — intus KOREA · GAMFF 수상작' },
    { src: VID('w18'), label: 'RESONA — 핸드팬 필름' },
    { src: VID('w01'), label: 'AURÉLIE — 퍼퓸 필름' },
    { src: VID('w22'), label: 'KUROBA — 나이프 필름' },
    { src: VID('w15'), label: 'LUMIÈRE NOIR — 캔들 필름' },
  ];
  let i = 0, cur = A, nxt = B;

  /* Opacity is driven inline, not by a class: the swap must never reveal an
     element that has no decoded frame yet, so we always load-then-show.       */
  const load = (v, src) => new Promise(res => {
    v.pause();
    v.src = src;
    v.load();
    const ok = () => { v.removeEventListener('loadeddata', ok); res(); };
    v.addEventListener('loadeddata', ok);
    setTimeout(res, 4000);                    // never stall the rotation
  });
  const wait = ms => new Promise(r => setTimeout(r, ms));

  (async () => {
    A.style.opacity = 0; B.style.opacity = 0;
    await load(A, q[0].src);
    A.play().catch(() => {});
    A.style.opacity = 1;
    now.textContent = q[0].label;
    if (RM) return;

    for (;;) {
      await wait(8000);
      i = (i + 1) % q.length;
      await load(nxt, q[i].src);
      nxt.play().catch(() => {});
      nxt.style.opacity = 1;
      cur.style.opacity = 0;
      now.textContent = q[i].label;
      [cur, nxt] = [nxt, cur];
    }
  })();
}

/* ══ 6. TICKER ═════════════════════════════════════════════ */
function ticker () {
  const row = $('#tickerRow');
  const names = D.brands.map(b => b.name);
  const html = names.map(n => `<span>${n}</span>`).join('');
  row.innerHTML = html + html;                 // duplicated for a seamless -50% loop
}

/* ══ 7. AWARD FILM PLAYER ══════════════════════════════════ */
function awardFilm () {
  const wrap = $('#filmPlayer'), v = $('#filmVideo'), btn = $('#filmPlay');
  const start = () => {
    wrap.classList.add('is-playing');
    v.controls = true;
    v.play().catch(() => {});
  };
  btn.addEventListener('click', start);
  v.addEventListener('pause', () => { if (v.currentTime === 0) wrap.classList.remove('is-playing'); });
  v.addEventListener('ended', () => { wrap.classList.remove('is-playing'); v.controls = false; });
}

/* ══ 8. REEL ═══════════════════════════════════════════════ */
const PLAY_SVG = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';

function reel () {
  const grid = $('#reelGrid'), chips = $('#reelChips');
  const cats = ['전체', ...new Set(D.videos.map(v => v.cat))];

  grid.innerHTML = D.videos.map(v => `
    <article class="vcard${v.ratio === '9:16' ? ' vcard--v' : ''}" data-vid="${v.id}" data-cat="${v.cat}" data-cursor="재생"
             style="--poster:url('${ABS(POST(v.id))}')">
      <div class="vcard__media">
        <img src="${POST(v.id)}" alt="${v.brand} ${v.title}" loading="lazy" decoding="async">
        <video muted loop playsinline preload="none" data-src="${VID(v.id)}"></video>
      </div>
      <div class="vcard__grad"></div>
      <div class="vcard__ind">${PLAY_SVG}</div>
      <div class="vcard__tags"><span class="vcard__tag">${v.ratio}</span><span class="vcard__tag">${v.dur}</span></div>
      <div class="vcard__body">
        <span class="vcard__brand">${v.brand}</span>
        <span class="vcard__title">${v.title}</span>
      </div>
    </article>`).join('');

  chips.innerHTML = cats.map((c, i) =>
    `<button class="chip${i === 0 ? ' is-on' : ''}" data-f="${c}">${c}</button>`).join('');

  chips.addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    $$('.chip', chips).forEach(c => c.classList.toggle('is-on', c === b));
    const f = b.dataset.f;
    $$('.vcard', grid).forEach(card =>
      card.classList.toggle('is-hidden', f !== '전체' && card.dataset.cat !== f));
  });

  /* hover-to-play — load the file only on first hover */
  if (!TOUCH) {
    grid.addEventListener('mouseenter', e => {
      const card = e.target.closest?.('.vcard'); if (!card) return;
      const v = $('video', card);
      if (!v.src) v.src = v.dataset.src;
      v.play().then(() => card.classList.add('is-playing')).catch(() => {});
    }, true);
    grid.addEventListener('mouseleave', e => {
      const card = e.target.closest?.('.vcard'); if (!card) return;
      const v = $('video', card);
      v.pause(); card.classList.remove('is-playing');
    }, true);
  }

  grid.addEventListener('click', e => {
    const card = e.target.closest('.vcard'); if (!card) return;
    const visible = $$('.vcard:not(.is-hidden)', grid);
    openLB(visible.map(c => {
      const v = D.videos.find(x => x.id === c.dataset.vid);
      return { type: 'video', id: v.id, title: v.brand, sub: `${v.title} · ${v.ratio} · ${v.dur}` };
    }), visible.indexOf(card));
  });
}

/* ══ 9. WORK / BRAND CASES ═════════════════════════════════ */
function work () {
  const grid = $('#workGrid'), chips = $('#workChips');

  grid.innerHTML = D.brands.map(b => `
    <button class="bcard" data-b="${b.key}" data-cat="${b.cat}" data-cursor="열기">
      <img src="${IMG(b.cover)}" alt="${b.name} ${b.product}" loading="lazy" decoding="async">
      <span class="bcard__grad"></span>
      <span class="bcard__n">${b.shots.length}컷</span>
      <span class="bcard__body">
        <span class="bcard__cat">${b.cat}</span>
        <span class="bcard__name">${b.name}</span>
        <span class="bcard__prod">${b.product}</span>
      </span>
    </button>`).join('');

  chips.innerHTML = D.cats.map((c, i) =>
    `<button class="chip${i === 0 ? ' is-on' : ''}" data-f="${c}">${c}</button>`).join('');

  chips.addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    $$('.chip', chips).forEach(c => c.classList.toggle('is-on', c === b));
    const f = b.dataset.f;
    $$('.bcard', grid).forEach(card =>
      card.classList.toggle('is-hidden', f !== '전체' && card.dataset.cat !== f));
  });

  grid.addEventListener('click', e => {
    const card = e.target.closest('.bcard'); if (!card) return;
    openCase(BRAND[card.dataset.b]);
  });
}

/* ══ 10. CASE PANEL ════════════════════════════════════════ */
const caseEl = $('#case');
let caseShots = [];

function openCase (b) {
  $('#caseCat').textContent  = b.cat;
  $('#caseName').textContent = b.name;
  $('#caseProd').textContent = b.product;
  $('#caseNote').textContent = b.note;
  $('#caseN').textContent    = `${b.shots.length} SHOTS`;
  caseShots = b.shots.map(id => ({ type: 'image', id, title: b.name, sub: b.product }));
  $('#caseGrid').innerHTML = b.shots.map((id, i) => `
    <button class="acell" data-i="${i}" data-cursor="확대">
      <img src="${IMG(id)}" alt="${b.name} 컷 ${i + 1}" loading="lazy" decoding="async">
    </button>`).join('');
  caseEl.classList.add('is-open');
  document.body.classList.add('is-locked');
  caseEl.querySelector('.case__panel').scrollTop = 0;
}
function closeCase () {
  caseEl.classList.remove('is-open');
  if (!$('#lb').classList.contains('is-open')) document.body.classList.remove('is-locked');
}
$('#caseX').addEventListener('click', closeCase);
$('#caseScrim').addEventListener('click', closeCase);
$('#caseGrid').addEventListener('click', e => {
  const c = e.target.closest('.acell'); if (!c) return;
  openLB(caseShots, +c.dataset.i);
});

/* ══ 11. ARCHIVE ═══════════════════════════════════════════ */
function archive () {
  const grid = $('#archGrid'), more = $('#archMore');
  const all = D.all;
  $('#archCount').textContent = all.length;
  let n = 0;
  const STEP = 72;

  const render = () => {
    const slice = all.slice(n, n + STEP);
    if (!slice.length) { more.style.display = 'none'; return; }
    grid.insertAdjacentHTML('beforeend', slice.map((m, k) => `
      <button class="acell" data-i="${n + k}" data-cursor="확대">
        <img src="${IMG(m.id)}" alt="${BRAND[m.b]?.name || m.b} 커머스 컷" loading="lazy" decoding="async"
             width="${m.w}" height="${m.h}">
        <span class="acell__b">${BRAND[m.b]?.name || m.b}</span>
      </button>`).join(''));
    n += slice.length;
    if (n >= all.length) more.style.display = 'none';
  };
  render(); render();

  more.addEventListener('click', render);

  /* auto-load as the sentinel button nears the viewport */
  new IntersectionObserver(es => { if (es[0].isIntersecting) render(); },
    { rootMargin: '600px' }).observe(more);

  grid.addEventListener('click', e => {
    const c = e.target.closest('.acell'); if (!c) return;
    openLB(all.map(m => ({
      type: 'image', id: m.id,
      title: BRAND[m.b]?.name || m.b,
      sub: BRAND[m.b]?.product || '커머스 비주얼'
    })), +c.dataset.i);
  });
}

/* ══ 12. LIGHTBOX ══════════════════════════════════════════ */
const lb = $('#lb'), lbStage = $('#lbStage');
let items = [], idx = 0;

function paint () {
  const it = items[idx];
  lbStage.innerHTML = it.type === 'video'
    ? `<video src="${VID(it.id)}" poster="${POST(it.id)}" controls autoplay playsinline></video>`
    : `<img src="${IMGF(it.id)}" alt="${it.title} ${it.sub}">`;
  $('#lbTitle').textContent = it.title;
  $('#lbSub').textContent   = it.sub;
  $('#lbIdx').textContent   = idx + 1;
  $('#lbTot').textContent   = items.length;
  const one = items.length < 2;
  $('#lbPrev').style.display = $('#lbNext').style.display = one ? 'none' : '';
}
function openLB (list, i) {
  items = list; idx = i;
  lb.classList.add('is-open');
  document.body.classList.add('is-locked');
  paint();
}
function closeLB () {
  lb.classList.remove('is-open');
  lbStage.innerHTML = '';
  if (!caseEl.classList.contains('is-open')) document.body.classList.remove('is-locked');
}
const step = d => { idx = (idx + d + items.length) % items.length; paint(); };

$('#lbX').addEventListener('click', closeLB);
$('#lbPrev').addEventListener('click', () => step(-1));
$('#lbNext').addEventListener('click', () => step(1));
lb.addEventListener('click', e => { if (e.target === lb || e.target === lbStage) closeLB(); });

addEventListener('keydown', e => {
  if (lb.classList.contains('is-open')) {
    if (e.key === 'Escape')     closeLB();
    if (e.key === 'ArrowLeft')  step(-1);
    if (e.key === 'ArrowRight') step(1);
    return;
  }
  if (e.key === 'Escape' && caseEl.classList.contains('is-open')) closeCase();
});

/* swipe on touch */
let tx = 0;
lbStage.addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; }, { passive: true });
lbStage.addEventListener('touchend',  e => {
  const dx = e.changedTouches[0].clientX - tx;
  if (Math.abs(dx) > 55) step(dx > 0 ? -1 : 1);
}, { passive: true });

/* ══ DEEP LINK ═════════════════════════════════════════════ */
/* index.html#work / ?at=work both land on the section.
   Runs after the grids exist so offsets are already correct. */
function deepLink () {
  const id = (location.hash || '').slice(1) ||
             new URLSearchParams(location.search).get('at');
  if (!id) return;
  const t = document.getElementById(id);
  if (!t) return;
  requestAnimationFrame(() =>
    scrollTo({ top: t.getBoundingClientRect().top + scrollY - 56, behavior: 'instant' }));
}

/* ══ GO ════════════════════════════════════════════════════ */
boot(); cursor(); chrome(); counts(); reveal(); heroFilm(); ticker();
awardFilm(); reel(); work(); archive(); deepLink();

})();
