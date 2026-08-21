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
    <article class="vcard${FLAGSHIP.has(v.id) ? ' vcard--wide' : ''}" data-vid="${v.id}" data-cursor="재생">
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
    </article>`;

  wrap.innerHTML = cats.map(c => {
    const list = D.videos.filter(v => v.cat === c);
    return `
    <section class="rgroup" data-cat="${c}">
      <header class="rgroup__head">
        <h3>${c}</h3><span>${list.length}편</span>
        <em>${BLURB[c] || ''}</em>
      </header>
      <div class="rgroup__grid">${list.map(card).join('')}</div>
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
  ['w15', '불꽃 하나로 방 전체의 온도를 만든다. 우드윅이 타는 소리까지 설계했다.'],
  ['w20', '주사위가 구르는 3초. 테이블탑이라는 취미의 설렘을 그 안에 담았다.'],
  ['w13', '반려동물이 실제로 다가와야 믿는다. 연출이 아니라 반응을 기다렸다.'],
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

  /* Drive the marquee from scroll position, not a timer: the strip only
     moves when the reader does, which reads as parallax rather than noise. */
  const half = () => track.scrollWidth / 2;
  let x = 0;
  const step = () => {
    x = (scrollY * 0.35) % half();
    track.style.transform = `translateX(${-x}px)`;
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);

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

  const wcats = ['전체', ...D.cats.filter(c => c !== '전체' && D.brands.some(b => b.cat === c))];
  chips.innerHTML = wcats.map((c, i) =>
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

  /* Tile size comes from the image's real aspect; every 9th gets a hero cell
     so the wall has a beat instead of an even hum. */
  const sizeOf = (m, i) => {
    const r = m.w / m.h;
    if (i % 9 === 4) return ' acell--big';
    if (r > 1.35)    return ' acell--wide';
    if (r < 0.75)    return ' acell--tall';
    return '';
  };

  const render = () => {
    const slice = all.slice(n, n + STEP);
    if (!slice.length) { more.style.display = 'none'; return; }
    grid.insertAdjacentHTML('beforeend', slice.map((m, k) => {
      const name = BRAND[m.b]?.name || m.b;
      return `
      <button class="acell${sizeOf(m, n + k)}" data-i="${n + k}" data-cursor="${name}">
        <img src="${IMG(m.id)}" alt="${name} 커머스 컷" loading="lazy" decoding="async">
        <span class="acell__b">${name}</span>
      </button>`;
    }).join(''));
    n += slice.length;
    if (n >= all.length) more.style.display = 'none';
  };

  render(); render();                 // two screens' worth up front

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

/* ══ 12b. AMBIENT FIELD ════════════════════════════════════
   Wireframe polygons drifting behind the content, plus rings that expand
   from a point the way the GOYO signal does. Deliberately faint — it is
   atmosphere, not decoration. Off entirely for reduced-motion. */
function ambient () {
  const cv = $('#fx');
  if (!cv || RM) return;
  const ctx = cv.getContext('2d', { alpha: true });
  let W = 0, H = 0, dpr = 1;

  const fit = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  fit();
  addEventListener('resize', fit, { passive: true });

  const rnd = (a, b) => a + Math.random() * (b - a);

  const shapes = Array.from({ length: 7 }, (_, i) => ({
    x: rnd(0, 1), y: rnd(0, 1),
    r: rnd(46, 150),
    sides: [3, 4, 6][i % 3],
    rot: rnd(0, Math.PI * 2),
    spin: rnd(-0.0016, 0.0016),
    vx: rnd(-0.00013, 0.00013),
    vy: rnd(-0.00010, 0.00010),
    hot: i % 3 === 0,
    depth: rnd(0.25, 1),
  }));

  /* rings emit on a slow cadence from a drifting origin */
  let rings = [];
  let nextRing = 0;

  let mx = -1, my = -1;
  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  let hidden = false;
  document.addEventListener('visibilitychange', () => { hidden = document.hidden; });

  const poly = (x, y, r, sides, rot) => {
    ctx.beginPath();
    for (let i = 0; i <= sides; i++) {
      const a = rot + (i / sides) * Math.PI * 2;
      const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
  };

  let t = 0;
  const draw = () => {
    requestAnimationFrame(draw);
    if (hidden) return;
    t += 1;
    ctx.clearRect(0, 0, W, H);

    const drift = scrollY * 0.02;

    shapes.forEach(s => {
      s.x += s.vx; s.y += s.vy; s.rot += s.spin;
      if (s.x < -0.25) s.x = 1.25; if (s.x > 1.25) s.x = -0.25;
      if (s.y < -0.25) s.y = 1.25; if (s.y > 1.25) s.y = -0.25;

      let px = s.x * W, py = s.y * H - (drift * s.depth) % (H + 400);
      if (py < -260) py += H + 400;

      /* a shape near the pointer leans toward it */
      if (mx > 0) {
        const dx = mx - px, dy = my - py;
        const d = Math.hypot(dx, dy);
        if (d < 320) { const k = (1 - d / 320) * 16; px += (dx / d) * k; py += (dy / d) * k; }
      }

      ctx.lineWidth = 1;
      ctx.strokeStyle = s.hot
        ? `rgba(255,90,31,${0.11 * s.depth})`
        : `rgba(255,255,255,${0.055 * s.depth})`;
      poly(px, py, s.r, s.sides, s.rot);
    });

    if (t > nextRing) {
      nextRing = t + rnd(150, 300);
      rings.push({ x: rnd(0.15, 0.85) * W, y: rnd(0.2, 0.8) * H, r: 0, life: 0 });
      if (rings.length > 4) rings.shift();
    }
    rings = rings.filter(r => r.life < 300);
    rings.forEach(r => {
      r.life += 1; r.r += 1.15;
      const fade = 1 - r.life / 300;
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r - k * 26, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,90,31,${0.09 * fade * (1 - k * 0.28)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  };
  requestAnimationFrame(draw);
  requestAnimationFrame(() => cv.classList.add('is-on'));
}

/* ══ 13. FUNNEL FORMS ══════════════════════════════════════
   The site is static, so there is no server to post to. Set ENDPOINT to a
   Formspree/Basin/Getform URL and both forms POST there. Leave it empty and
   they fall back to a prefilled mail draft, so the funnel works on day one
   either way — it never silently swallows a lead. */
const FORM = {
  ENDPOINT: '',                               // ← paste your form endpoint here
  MAILTO:   'hello@pixellab.kr',              // ← and your real inbox here
  GUIDE:    'assets/guide/pixel-lab-detail-page-guide.pdf',
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
      const how = await send({ form: '가이드 신청', email: email.value.trim() },
                             '[Pixel Lab] 상세페이지 가이드 신청');
      say(lm, 'ok', how === 'sent'
        ? `신청 완료. 메일함을 확인해주세요.<br><a href="${FORM.GUIDE}" download>바로 내려받기</a>`
        : `메일 앱이 열립니다. 그대로 보내주시면 가이드를 보내드립니다.<br><a href="${FORM.GUIDE}" download>지금 바로 내려받기</a>`);
      lf.reset();
    } catch {
      say(lm, 'err', `전송에 실패했습니다. <a href="${FORM.GUIDE}" download>가이드를 직접 내려받으세요.</a>`);
    } finally { btn.disabled = false; btn.textContent = '무료로 받기'; }
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

})();
