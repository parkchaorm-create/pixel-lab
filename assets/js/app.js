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

/* The films that should stop a scroll: strongest craft, most complete story.
   Everything else reads at one column. */
const FLAGSHIP = new Set(['w01', 'w18']);

function reel () {
  const wrap = $('#reelGroups'), chips = $('#reelChips');

  /* One line of intent per category, so a group header carries meaning
     instead of just naming a bucket. */
  const BLURB = {
    '뷰티':      '질감과 흡수를 보여주는 것이 전부인 카테고리.',
    '푸드':      '식욕은 온도와 움직임에서 온다.',
    '리빙·주방':  '손이 닿는 순간을 찍는다.',
    '헬스·F&B':  '성분을 눈에 보이는 물리로 번역한다.',
    '테크·오디오': '보이지 않는 성능을 빛과 파형으로.',
    '펫':        '반려동물이 실제로 다가와야 믿는다.',
    '라이프스타일': '제품이 아니라 그 제품을 쓰는 시간을 판다.',
  };

  const cats = D.cats.filter(c => c !== '전체' && D.videos.some(v => v.cat === c));

  const card = v => `
    <article class="vcard" data-vid="${v.id}" data-cursor="재생">
      <div class="vcard__media">
        <img src="${POST(v.id)}" alt="${v.brand} ${v.title}" loading="lazy" decoding="async">
        <video muted loop playsinline preload="none" data-src="${VID(v.id)}"></video>
      </div>
      <div class="vcard__grad"></div>
      <div class="vcard__ind">${PLAY_SVG}</div>
      <div class="vcard__hint">← 좌우로 움직여 미리보기 →</div>
      <div class="vcard__scrub"><i></i></div>
      <div class="vcard__tags"><span class="vcard__tag">${v.ratio}</span><span class="vcard__tag">${v.dur}</span></div>
      <div class="vcard__body">
        <span class="vcard__brand">${v.brand}</span>
        <span class="vcard__title">${v.title}</span>
      </div>
    </article>`;

  wrap.innerHTML = cats.map(c => {
    const list = D.videos.filter(v => v.cat === c);
    return `
    <section class="rgroup" data-cat="${c}">
      <header class="rgroup__head">
        <h3>${c}</h3><span>${list.length}편</span>
        <em>${BLURB[c] || ''}</em>
      </header>
      <div class="rgroup__grid" style="--n:${Math.min(4, list.length)}">${list.map(card).join('')}</div>
    </section>`;
  }).join('');

  chips.innerHTML = ['전체', ...cats].map((c, i) =>
    `<button class="chip${i === 0 ? ' is-on' : ''}" data-f="${c}">${c}</button>`).join('');

  chips.addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    $$('.chip', chips).forEach(c => c.classList.toggle('is-on', c === b));
    const f = b.dataset.f;
    $$('.rgroup', wrap).forEach(g =>
      g.classList.toggle('is-hidden', f !== '전체' && g.dataset.cat !== f));
  });

  autoplayInView(wrap);

  wrap.addEventListener('click', e => {
    const c = e.target.closest('.vcard'); if (!c) return;
    const visible = $$('.rgroup:not(.is-hidden) .vcard', wrap);
    openLB(visible.map(el => {
      const v = D.videos.find(x => x.id === el.dataset.vid);
      return { type: 'video', id: v.id, title: v.brand, sub: `${v.title} · ${v.ratio} · ${v.dur}` };
    }), visible.indexOf(c));
  });
}

/* ══ 8a. FEATURED SHOWCASE ═════════════════════════════════
   Six films, one viewport each, stacked with position:sticky so each
   slides over the last. The work is the layout. */
const FEATURED = [
  ['w01', '향을 빛의 궤적으로 번역했다. 병을 찍지 않고, 향이 지나간 자리를 찍는다.'],
  ['w18', '소리를 볼 수 있게 만드는 일. 손이 닿는 순간 퍼지는 파동이 이 필름의 주인공이다.'],
  ['w22', '칼은 날로 말한다. 절삭의 물리를 슬로우로 늘려 촉감을 화면에 옮겼다.'],
];

function featured () {
  const stack = $('#featStack');
  if (!stack) return;
  const items = FEATURED
    .map(([id, line]) => [D.videos.find(v => v.id === id), line])
    .filter(([v]) => v);

  stack.innerHTML = items.map(([v, line], i) => `
    <article class="fpanel" data-vid="${v.id}">
      <div class="fpanel__media">
        <img src="${POST(v.id)}" alt="${v.brand}" loading="lazy" decoding="async">
        <video muted loop playsinline preload="none" data-src="${VID(v.id)}"></video>
      </div>
      <div class="fpanel__scrim"></div>
      <div class="fpanel__type">
        <span class="fpanel__no">${String(i + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}</span>
        <h3 class="fpanel__brand">${v.brand}</h3>
        <p class="fpanel__line">${line}</p>
        <div class="fpanel__meta"><span>${v.title}</span><span>${v.ratio}</span><span>${v.dur}</span></div>
      </div>
      <button class="fpanel__play" aria-label="${v.brand} 재생" data-cursor="소리켜기">${PLAY_SVG}</button>
    </article>`).join('');

  /* only the panel on screen decodes */
  const io = new IntersectionObserver(ents => {
    ents.forEach(e => {
      const p = e.target, vid = $('video', p);
      if (e.isIntersecting && e.intersectionRatio > 0.35) {
        if (!vid.src) vid.src = vid.dataset.src;
        vid.play().then(() => p.classList.add('is-live')).catch(() => {});
      } else { vid.pause(); p.classList.remove('is-live'); }
    });
  }, { threshold: [0, 0.35, 0.7] });
  $$('.fpanel', stack).forEach(p => io.observe(p));

  stack.addEventListener('click', e => {
    const p = e.target.closest('.fpanel'); if (!p) return;
    const list = items.map(([v]) => ({
      type: 'video', id: v.id, title: v.brand, sub: `${v.title} · ${v.ratio} · ${v.dur}`
    }));
    openLB(list, $$('.fpanel', stack).indexOf(p));
  });
}

/* ══ 8b. AUTOPLAY IN VIEW ═══════════════════════════════════
   A studio reel that only moves on hover reads as a filing cabinet.
   Tiles play whenever they are on screen and pause the moment they
   leave, so nothing decodes off-screen. Touch plays one at a time. */
function autoplayInView (root) {
  if (RM) return;
  const budget = TOUCH ? 1 : 6;
  const live = new Set();

  const io = new IntersectionObserver(ents => {
    ents.forEach(e => {
      const card = e.target, v = $('video', card);
      if (e.isIntersecting && e.intersectionRatio > 0.45) {
        if (live.size >= budget && !live.has(card)) return;
        if (!v.src) v.src = v.dataset.src;
        v.play().then(() => { card.classList.add('is-playing'); live.add(card); })
                .catch(() => {});
      } else {
        v.pause(); card.classList.remove('is-playing'); live.delete(card);
      }
    });
  }, { threshold: [0, 0.45, 0.8] });

  $$('.vcard', root).forEach(c => io.observe(c));

  /* hover still wins: it jumps a tile to the front of the queue */
  if (!TOUCH) {
    root.addEventListener('mouseenter', e => {
      const card = e.target.closest?.('.vcard'); if (!card) return;
      const v = $('video', card);
      if (!v.src) v.src = v.dataset.src;
      v.play().then(() => card.classList.add('is-playing')).catch(() => {});
    }, true);
  }
}

/* ══ 8c. FILM BAND ═════════════════════════════════════════
   A full-bleed strip of moving work between the grids. */
function band () {
  const track = $('#bandTrack');
  if (!track) return;
  const pick = ['w22', 'w15', 'w20', 'w21', 'w16', 'w13', 'w11', 'w04', 'w19', 'w12'];
  const cell = id => {
    const v = D.videos.find(x => x.id === id);
    if (!v) return '';
    return `<div class="band__cell" data-vid="${id}">
      <img src="${POST(id)}" alt="${v.brand}" loading="lazy" decoding="async">
      <video muted loop playsinline preload="none" data-src="${VID(id)}"></video>
      <b>${v.brand}</b></div>`;
  };
  const html = pick.map(cell).join('');
  track.innerHTML = html + html;          // duplicated for a seamless wrap

  if (RM) return;

  const io = new IntersectionObserver(ents => {
    ents.forEach(e => {
      const c = e.target, v = $('video', c);
      if (e.isIntersecting) {
        if (!v.src) v.src = v.dataset.src;
        v.play().then(() => c.classList.add('is-live')).catch(() => {});
      } else { v.pause(); c.classList.remove('is-live'); }
    });
  }, { threshold: 0.3 });
  $$('.band__cell', track).forEach(c => io.observe(c));
  marquee($('#band'), track, 0.5);
}

/* ══ 9. WORK / BRAND CASES ═════════════════════════════════ */
function work () {
  const wall = $('#workGrid'), chips = $('#workChips');

  const card = b => `
    <button class="acell bcard" data-b="${b.key}" data-cat="${b.cat}" data-cursor="${b.name}">
      <img src="${IMG(b.cover)}" alt="${b.name} ${b.product}" loading="lazy" decoding="async">
      <span class="bcard__grad"></span>
      <span class="bcard__n">${b.shots.length}컷</span>
      <span class="bcard__body">
        <span class="bcard__cat">${b.cat}</span>
        <span class="bcard__name">${b.name}</span>
        <span class="bcard__prod">${b.product}</span>
      </span>
    </button>`;

  const half = Math.ceil(D.brands.length / 2);
  wall.innerHTML = [D.brands.slice(0, half), D.brands.slice(half)].map(list => {
    const cells = list.map(card).join('');
    return `<div class="hrow">${cells}${cells}</div>`;
  }).join('');
  $$('.hrow', wall).forEach((row, i) => marquee(wall, row, [0.34, -0.26][i]));

  const wcats = ['전체', ...D.cats.filter(c => c !== '전체' && D.brands.some(b => b.cat === c))];
  chips.innerHTML = wcats.map((c, i) =>
    `<button class="chip${i === 0 ? ' is-on' : ''}" data-f="${c}">${c}</button>`).join('');
  chips.addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    $$('.chip', chips).forEach(c => c.classList.toggle('is-on', c === b));
    const f = b.dataset.f;
    /* dim instead of remove: the row keeps its rhythm while filtering */
    $$('.bcard', wall).forEach(c =>
      c.classList.toggle('is-dim', f !== '전체' && c.dataset.cat !== f));
  });

  wall.addEventListener('click', e => {
    const c = e.target.closest('.bcard'); if (!c) return;
    openCase(BRAND[c.dataset.b]);
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
  const wall = $('#archGrid'), more = $('#archMore');
  const all = D.all;
  $('#archCount').textContent = all.length;

  const ROWS = 3, PER = 46;
  const rows = Array.from({ length: ROWS }, (_, r) =>
    all.filter((_, i) => i % ROWS === r).slice(0, PER));

  wall.innerHTML = rows.map(list => {
    const cells = list.map(m => {
      const name = BRAND[m.b]?.name || m.b;
      return `<button class="acell" data-id="${m.id}" data-cursor="${name}">
        <img src="${IMG(m.id)}" alt="${name} 커머스 컷" loading="lazy" decoding="async">
        <span class="acell__b">${name}</span></button>`;
    }).join('');
    return `<div class="hrow">${cells}${cells}</div>`;
  }).join('');
  $$('.hrow', wall).forEach((row, i) => marquee(wall, row, [0.42, -0.3, 0.55][i]));

  const list = () => all.map(m => ({
    type: 'image', id: m.id,
    title: BRAND[m.b]?.name || m.b,
    sub: BRAND[m.b]?.product || '커머스 비주얼',
  }));
  wall.addEventListener('click', e => {
    const c = e.target.closest('.acell'); if (!c) return;
    openLB(list(), Math.max(0, all.findIndex(m => m.id === c.dataset.id)));
  });
  more.addEventListener('click', () => openLB(list(), 0));
}

/* ══ 12. LIGHTBOX ══════════════════════════════════════════ */
const lb = $('#lb'), lbStage = $('#lbStage');
let items = [], idx = 0;

function paint () {
  const it = items[idx];
  lbStage.innerHTML = it.type === 'video'
    ? `<video src="${VID(it.id)}" poster="${POST(it.id)}" controls autoplay playsinline></video>`
    : `<img src="${it.src || IMGF(it.id)}" alt="${it.title} ${it.sub}">`;
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

/* ══ 12b. REACTIVE FIELD ═══════════════════════════════════
   Not a screensaver: the field only does anything because you move.
   Moving the pointer drags a wake of signal rings; clicking fires a burst.
   Same motif as the GOYO film the accent colour came from. */
function ambient () {
  const cv = $('#fx');
  if (!cv || RM) return;
  const ctx = cv.getContext('2d');
  let W, H, dpr;
  const fit = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  fit();
  addEventListener('resize', fit, { passive: true });

  let mx = -999, my = -999, pmx = 0, pmy = 0, speed = 0;
  let rings = [];      // expanding signal rings
  let trail = [];      // cursor wake

  addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    const d = Math.hypot(mx - pmx, my - pmy);
    speed += (Math.min(d, 60) - speed) * 0.25;
    pmx = mx; pmy = my;
    trail.push({ x: mx, y: my, life: 0, r: 3 + speed * 0.5 });
    if (trail.length > 34) trail.shift();
    /* fast movement sheds a ring */
    if (d > 26 && rings.length < 8) rings.push({ x: mx, y: my, r: 6, life: 0, max: 190, w: 1 });
  }, { passive: true });

  addEventListener('pointerdown', e => {
    for (let i = 0; i < 3; i++)
      rings.push({ x: e.clientX, y: e.clientY, r: 4 + i * 14, life: -i * 8, max: 300, w: 1.4 });
  }, { passive: true });

  let hidden = false;
  document.addEventListener('visibilitychange', () => { hidden = document.hidden; });

  const draw = () => {
    requestAnimationFrame(draw);
    if (hidden) return;
    ctx.clearRect(0, 0, W, H);
    speed *= 0.92;

    /* wake — a soft comet tail behind the cursor */
    trail.forEach((p, i) => {
      p.life += 1;
      const k = i / trail.length;
      const fade = k * (1 - p.life / 46);
      if (fade <= 0) return;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (1 + p.life * 0.05), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,90,31,${0.05 * fade})`;
      ctx.fill();
    });
    trail = trail.filter(p => p.life < 46);

    /* rings */
    rings.forEach(r => {
      r.life += 1;
      if (r.life < 0) return;
      r.r += 2.6;
      const fade = 1 - r.life / r.max;
      if (fade <= 0) return;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,90,31,${0.34 * fade})`;
      ctx.lineWidth = r.w;
      ctx.stroke();
    });
    rings = rings.filter(r => r.life < r.max);

    /* a lattice that only lights up near the pointer */
    if (mx > -900) {
      const G = 46, R = 190;
      const x0 = Math.max(0, mx - R), x1 = Math.min(W, mx + R);
      const y0 = Math.max(0, my - R), y1 = Math.min(H, my + R);
      for (let x = Math.floor(x0 / G) * G; x <= x1; x += G) {
        for (let y = Math.floor(y0 / G) * G; y <= y1; y += G) {
          const d = Math.hypot(x - mx, y - my);
          if (d > R) continue;
          const k = 1 - d / R;
          const push = k * 12;
          const ang = Math.atan2(y - my, x - mx);
          const px = x + Math.cos(ang) * push, py = y + Math.sin(ang) * push;
          ctx.beginPath();
          ctx.arc(px, py, 1 + k * 1.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${0.05 + k * 0.3})`;
          ctx.fill();
        }
      }
    }
  };
  requestAnimationFrame(draw);
  cv.classList.add('is-on');
}

/* ══ 12c. HOVER SCRUB ══════════════════════════════════════
   Mouse X walks the clip's timeline. One pass across a tile previews the
   entire ad — far more useful than waiting 15s for a loop. */
function scrub (root) {
  if (TOUCH || RM) return;
  root.addEventListener('mouseenter', e => {
    const card = e.target.closest?.('.vcard'); if (!card) return;
    card.classList.add('is-scrub');
  }, true);
  root.addEventListener('mouseleave', e => {
    const card = e.target.closest?.('.vcard'); if (!card) return;
    card.classList.remove('is-scrub');
    const v = $('video', card);
    if (v && v.src) v.play().catch(() => {});
  }, true);

  let queued = null;
  root.addEventListener('mousemove', e => {
    const card = e.target.closest?.('.vcard'); if (!card) return;
    queued = [card, e.clientX];
    if (queued.raf) return;
    requestAnimationFrame(() => {
      if (!queued) return;
      const [c, x] = queued; queued = null;
      const v = $('video', c); if (!v) return;
      if (!v.src) v.src = v.dataset.src;
      const r = c.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (x - r.left) / r.width));
      if (v.duration) {
        v.pause();
        v.currentTime = p * v.duration;
        const bar = $('.vcard__scrub i', c);
        if (bar) bar.style.width = (p * 100) + '%';
      }
    });
  }, true);
}

/* ══ 12d. MAGNETIC CONTROLS ════════════════════════════════ */
function magnetic () {
  if (TOUCH || RM) return;
  const targets = $$('.btn, .fpanel__play, .chip');
  targets.forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * 0.22}px, ${dy * 0.3}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

/* ══ 12e. HERO SPOTLIGHT ═══════════════════════════════════
   The scrim carries a hole that follows the pointer, so the footage is
   literally revealed by the reader. */
function spotlight () {
  if (TOUCH || RM) return;
  const hero = $('#hero'), scrim = $('.hero__scrim');
  if (!hero || !scrim) return;
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    scrim.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    scrim.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  }, { passive: true });
}

/* ══ 12f. ARCHIVE TILT ═════════════════════════════════════ */
function tilt (root) {
  if (TOUCH || RM) return;
  root.addEventListener('mousemove', e => {
    const c = e.target.closest?.('.acell'); if (!c) return;
    const r = c.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    c.style.transform = `scale(1.045) rotateY(${px * 11}deg) rotateX(${-py * 11}deg)`;
  }, true);
  root.addEventListener('mouseleave', e => {
    const c = e.target.closest?.('.acell'); if (!c) return;
    c.style.transform = '';
  }, true);
}

/* ══ 12g. DRAG ENGINE ══════════════════════════════════════
   Drag with inertia, idle drift, seamless wrap. Shared by the film band,
   the campaign wall and the archive wall. */
function marquee (host, track, speed) {
  if (RM) return;
  let x = 0, v = 0, down = false, sx = 0, sOff = 0, idle = true, moved = 0;
  const half = () => (track.scrollWidth / 2) || 1;
  const wrap = n => ((n % half()) + half()) % half();

  host.addEventListener('pointerdown', e => {
    down = true; idle = false; moved = 0; sx = e.clientX; sOff = x;
    host.classList.add('is-drag');
    try { host.setPointerCapture(e.pointerId); } catch {}
  });
  host.addEventListener('pointermove', e => {
    if (!down) return;
    moved = Math.abs(e.clientX - sx);
    const nx = sOff - (e.clientX - sx);
    v = nx - x; x = nx;
  });
  const up = () => { down = false; host.classList.remove('is-drag'); };
  host.addEventListener('pointerup', up);
  host.addEventListener('pointercancel', up);
  host.addEventListener('mouseenter', () => { idle = false; });
  host.addEventListener('mouseleave', () => { if (!down) idle = true; });
  host.addEventListener('click', e => {
    if (moved > 6) { e.stopPropagation(); e.preventDefault(); }   // drag isn't a click
  }, true);

  const step = () => {
    requestAnimationFrame(step);
    if (!down) {
      if (Math.abs(v) > 0.08) { x += v; v *= 0.94; }
      else if (idle) x += speed;
    }
    track.style.transform = `translateX(${-wrap(x)}px)`;
  };
  requestAnimationFrame(step);
}

/* ══ 12h. STICKY CTA ═══════════════════════════════════════
   The enquiry form is the point of the page, so the route to it rides with
   the reader instead of waiting at the bottom. Retracts once the form shows. */
function stickyCta () {
  const cta = $('#cta'), contact = $('#contact');
  if (!cta) return;
  const on = () => {
    const past = scrollY > innerHeight * 0.7;
    const atForm = contact && contact.getBoundingClientRect().top < innerHeight * 0.8;
    cta.classList.toggle('is-on', past && !atForm);
  };
  addEventListener('scroll', on, { passive: true });
  on();
}

/* ══ 13. FUNNEL FORMS ══════════════════════════════════════
   The site is static, so there is no server to post to. Set ENDPOINT to a
   Formspree/Basin/Getform URL and both forms POST there. Leave it empty and
   they fall back to a prefilled mail draft, so the funnel works on day one
   either way — it never silently swallows a lead. */
const FORM = {
  ENDPOINT: '',                               // ← paste your form endpoint here
  MAILTO:   'hello@pixellab.kr',              // ← and your real inbox here
  GUIDE:    'assets/guide/pixel-lab-audit.pdf',        // 01 자가진단
  GUIDE2:   'assets/guide/pixel-lab-brief.pdf',        // 02 기획서 템플릿
};

function forms () {
  const say = (el, kind, html) => {
    el.className = 'formmsg is-on is-' + kind;
    el.innerHTML = html;
  };
  const bad = (field, on) => field?.closest('.field, .check')?.classList.toggle('is-bad', on);

  const send = async (payload, subject) => {
    if (FORM.ENDPOINT) {
      const r = await fetch(FORM.ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error('endpoint ' + r.status);
      return 'sent';
    }
    const body = Object.entries(payload)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`).join('\n');
    location.href = `mailto:${FORM.MAILTO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return 'mail';
  };

  /* ── lead magnet ── */
  const lf = $('#leadForm'), lm = $('#leadMsg');
  if (lf) lf.addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('#leadEmail');
    const ok = email.value.trim() && email.checkValidity();
    bad(email, !ok);
    if (!ok) { say(lm, 'err', '이메일 주소를 확인해주세요.'); email.focus(); return; }

    const btn = $('button', lf);
    btn.disabled = true; btn.textContent = '보내는 중…';
    try {
      const how = await send({ form: '무료 자료 2종 신청', email: email.value.trim() },
                             '[Pixel Lab] 무료 자료 2종 신청');
      const links = `<a href="${FORM.GUIDE}" download>① 15컷 자가진단</a> · <a href="${FORM.GUIDE2}" download>② 영상 기획서 템플릿</a>`;
      say(lm, 'ok', how === 'sent'
        ? `신청 완료. 메일함을 확인해주세요.<br>바로 내려받기 — ${links}`
        : `메일 앱이 열립니다. 그대로 보내주세요.<br>지금 바로 내려받기 — ${links}`);
      lf.reset();
    } catch {
      say(lm, 'err', `전송에 실패했습니다. 직접 내려받으세요 — <a href="${FORM.GUIDE}" download>① 자가진단</a> · <a href="${FORM.GUIDE2}" download>② 기획서 템플릿</a>`);
    } finally { btn.disabled = false; btn.textContent = '2종 한 번에 받기'; }
  });

  /* ── enquiry ── */
  const cf = $('#contactForm'), cm = $('#contactMsg');
  if (cf) cf.addEventListener('submit', async e => {
    e.preventDefault();
    const req = [$('#cName'), $('#cEmail'), $('#cType'), $('#cAgree')];
    let firstBad = null;
    req.forEach(f => {
      const ok = f.type === 'checkbox' ? f.checked : (f.value.trim() && f.checkValidity());
      bad(f, !ok);
      if (!ok && !firstBad) firstBad = f;
    });
    if (firstBad) { say(cm, 'err', '표시된 항목을 확인해주세요.'); firstBad.focus(); return; }

    const btn = $('button[type=submit]', cf);
    btn.disabled = true; btn.textContent = '보내는 중…';
    try {
      const how = await send({
        form: '광고 문의',
        이름: $('#cName').value.trim(),
        회사: $('#cCompany').value.trim(),
        이메일: $('#cEmail').value.trim(),
        연락처: $('#cPhone').value.trim(),
        작업: $('#cType').value,
        예산: $('#cBudget').value,
        일정: $('#cWhen').value,
        상담방식: $('#cCall').value,
        내용: $('#cMsg').value.trim(),
      }, `[Pixel Lab] 광고 문의 — ${$('#cName').value.trim()}`);
      say(cm, 'ok', how === 'sent'
        ? '접수했습니다. 영업일 기준 24시간 안에 답장드리겠습니다.'
        : '메일 앱이 열립니다. 내용을 확인하고 그대로 보내주세요.');
      if (how === 'sent') cf.reset();
    } catch {
      say(cm, 'err', `전송에 실패했습니다. <a href="mailto:${FORM.MAILTO}">${FORM.MAILTO}</a> 로 보내주세요.`);
    } finally { btn.disabled = false; btn.textContent = '문의 보내기'; }
  });

  /* let them look inside before handing over an email — desire before ask */
  const stack = $('#leadStack');
  if (stack) stack.addEventListener('click', () => {
    const pages = [
      ...[1, 2, 3, 4].map(n => ({ src: `assets/guide/pages/audit${n}.webp`,
        title: '① 상품페이지 15컷 자가진단', sub: `${n} / 4쪽` })),
      ...[1, 2, 3, 4].map(n => ({ src: `assets/guide/pages/brief${n}.webp`,
        title: '② 제품영상 기획서 템플릿', sub: `${n} / 4쪽` })),
    ].map(o => ({ type: 'image', id: null, ...o }));
    openLB(pages, 0);
  });

  /* clear the error state as soon as the visitor fixes it */
  $$('.cform input, .cform select, .cform textarea, #leadForm input').forEach(f =>
    f.addEventListener('input', () => bad(f, false)));
}

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
awardFilm(); featured(); reel(); band(); work(); archive(); ambient(); forms(); deepLink();
scrub($('#reelGroups')); magnetic(); spotlight(); stickyCta();

})();
