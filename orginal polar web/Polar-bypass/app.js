// ============================================================
//  Polar Bypass — app.js
//  Cheat product landing page scripts
// ============================================================

// ── Undetected streak timer ───────────────────────────────────
// Set the date your cheat was last detected (or start date).
// Format: 'YYYY-MM-DDTHH:MM:SSZ'
const STREAK_START = new Date('2026-07-04T00:00:00Z');

function updateStreak() {
  const now  = new Date();
  const diff = Math.max(0, now - STREAK_START);

  const totalSecs = Math.floor(diff / 1000);
  const secs  = totalSecs % 60;
  const mins  = Math.floor(totalSecs / 60) % 60;
  const hours = Math.floor(totalSecs / 3600) % 24;
  const days  = Math.floor(totalSecs / 86400);

  document.getElementById('sStreakDays').textContent = String(days).padStart(3, '0');
  document.getElementById('sDays').textContent        = String(days).padStart(3, '0');
  document.getElementById('sHours').textContent = String(hours).padStart(2, '0');
  document.getElementById('sMins').textContent  = String(mins).padStart(2, '0');
  document.getElementById('sSecs').textContent  = String(secs).padStart(2, '0');
}

updateStreak();
setInterval(updateStreak, 1000);

// ── FAQ accordion ─────────────────────────────────────────────
function toggleFaq(btn) {
  const item   = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

// ── Smooth scroll for nav links ───────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Header shrink on scroll ───────────────────────────────────
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── Cheat UI interactivity ────────────────────────────────────

// Toggles click on/off
document.querySelectorAll('.cui-toggle').forEach(toggle => {
  toggle.style.cursor = 'pointer';
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('on');
  });
});

// Dots removed — all options now use cui-toggle

// Sidebar nav — Visuals stays active, others don't switch
document.querySelectorAll('.cui-nav-item').forEach(item => {
  item.style.cursor = 'default';
});

// Draggable sliders
document.querySelectorAll('.cui-slider').forEach(slider => {
  slider.style.cursor = 'ew-resize';
  const fill = slider.querySelector('.cui-slider-fill');
  const row  = slider.closest('.cui-row');
  const val  = row ? row.querySelector('.cui-val') : null;

  let dragging = false;

  function setFromEvent(e) {
    const rect = slider.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let pct = (clientX - rect.left) / rect.width;
    pct = Math.max(0, Math.min(1, pct));
    fill.style.width = (pct * 100) + '%';

    // Update the value label if present
    if (val) {
      const currentText = val.textContent;
      // Detect if it's a decimal (1.0 style) or integer (300 m style)
      if (currentText.includes('m')) {
        val.textContent = Math.round(pct * 500) + ' m';
      } else if (currentText.includes('.')) {
        val.textContent = (pct * 5).toFixed(1);
      } else {
        val.textContent = Math.round(pct * 200).toFixed(1);
      }
    }
  }

  slider.addEventListener('mousedown', e => {
    dragging = true;
    setFromEvent(e);
    e.preventDefault();
  });

  slider.addEventListener('touchstart', e => {
    dragging = true;
    setFromEvent(e);
  }, { passive: true });

  window.addEventListener('mousemove', e => { if (dragging) setFromEvent(e); });
  window.addEventListener('touchmove', e => { if (dragging) setFromEvent(e); }, { passive: true });
  window.addEventListener('mouseup',  () => { dragging = false; });
  window.addEventListener('touchend', () => { dragging = false; });
});

// ── Proof gallery lightbox ────────────────────────────────────
function openLightbox(src) {
  const lb  = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');
  img.src = src;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

// Lightbox close listeners — set up once on load
(function () {
  const lb    = document.getElementById('lightbox');
  const close = document.getElementById('lightboxClose');
  if (!lb) return;

  close.addEventListener('click', e => { e.stopPropagation(); closeLightbox(); });
  lb.addEventListener('click', e => { if (e.target === lb || e.target === document.getElementById('lightboxImg') === false) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
})();

// Close with Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

// ── Particle system ───────────────────────────────────────────
(function () {
  const canvas = document.getElementById('particleCanvas');
  const ctx    = canvas.getContext('2d');

  let W, H, particles, mouse = { x: null, y: null };

  const CONFIG = {
    count:       110,
    minSize:     1,
    maxSize:     2.5,
    speed:       0.35,
    lineDistance: 130,
    mouseRadius:  120,
    color:       '255,255,255',
  };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function createParticle() {
    return {
      x:   rand(0, W),
      y:   rand(0, H),
      vx:  rand(-CONFIG.speed, CONFIG.speed),
      vy:  rand(-CONFIG.speed, CONFIG.speed),
      r:   rand(CONFIG.minSize, CONFIG.maxSize),
      a:   rand(0.2, 0.7),
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: CONFIG.count }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Update + draw dots
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off edges
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      // Mouse repel
      if (mouse.x !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.mouseRadius) {
          const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius * 0.04;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
          // Clamp speed
          const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (spd > CONFIG.speed * 4) {
            p.vx = (p.vx / spd) * CONFIG.speed * 4;
            p.vy = (p.vy / spd) * CONFIG.speed * 4;
          }
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CONFIG.color},${p.a})`;
      ctx.fill();

      // Draw connecting lines
      for (let j = i + 1; j < particles.length; j++) {
        const q    = particles[j];
        const dx   = p.x - q.x;
        const dy   = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.lineDistance) {
          const alpha = (1 - dist / CONFIG.lineDistance) * 0.18;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${CONFIG.color},${alpha})`;
          ctx.lineWidth   = 0.7;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); });
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  init();
  draw();
})();

// ── UI preview — fluid wave overlay ──────────────────────────
(function () {
  const canvas = document.getElementById('uiWaveCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width  = rect.width;
    H = canvas.height = rect.height;
  }

  // Fluid streamlines using layered sine-based flow field
  const LINES = 18;
  const lines = [];

  function initLines() {
    lines.length = 0;
    for (let i = 0; i < LINES; i++) {
      lines.push({
        points: [],
        offset: Math.random() * Math.PI * 2,
        speed:  0.004 + Math.random() * 0.006,
        amp1:   0.12 + Math.random() * 0.2,
        amp2:   0.06 + Math.random() * 0.12,
        freq1:  1.5  + Math.random() * 2,
        freq2:  2.5  + Math.random() * 3,
        yBase:  0.05 + (i / LINES) * 0.9,
        alpha:  0.06 + Math.random() * 0.12,
        width:  0.5  + Math.random() * 1.5,
      });
    }
  }

  let t = 0;

  function draw() {
    t += 0.01;
    ctx.clearRect(0, 0, W, H);

    for (const l of lines) {
      ctx.beginPath();
      const steps = 120;
      for (let s = 0; s <= steps; s++) {
        const px = (s / steps) * W;
        const nx = s / steps;

        // Layered sine flow — creates organic looping curl
        const wave =
          Math.sin(nx * Math.PI * l.freq1 + t * 1.2 + l.offset) * l.amp1 * H +
          Math.sin(nx * Math.PI * l.freq2 - t * 0.8 + l.offset * 1.4) * l.amp2 * H +
          Math.sin(nx * Math.PI * 0.7 + t * 0.5) * 0.04 * H;

        const py = l.yBase * H + wave;

        s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }

      // Brightness varies with position for depth
      const bright = 180 + Math.round(Math.sin(t + l.offset) * 40);
      ctx.strokeStyle = `rgba(${bright},${bright},${bright},${l.alpha})`;
      ctx.lineWidth   = l.width;
      ctx.lineCap     = 'round';
      ctx.stroke();
    }

    requestAnimationFrame(draw);
  }

  resize(); initLines(); draw();
  window.addEventListener('resize', () => { resize(); initLines(); });
})();



// ── Scroll reveal ─────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Lamp / light mode toggle ──────────────────────────────────
(function () {
  const btn  = document.getElementById('lampBtn');
  const body = document.body;
  const KEY  = 'polar-lightmode';

  function setMode(light) {
    body.classList.toggle('light-mode', light);
    btn.classList.toggle('lit', light);
    localStorage.setItem(KEY, light ? '1' : '0');
  }

  // Restore saved preference
  if (localStorage.getItem(KEY) === '1') setMode(true);

  btn.addEventListener('click', () => setMode(!body.classList.contains('light-mode')));
})();

// ── Custom cursor ─────────────────────────────────────────────
// Using default browser cursor

// ── Floating nav lamp indicator ───────────────────────────────
(function () {
  const nav   = document.getElementById('floatNav');
  const lamp  = document.getElementById('fnLamp');
  const items = nav ? nav.querySelectorAll('.fn-item:not(.fn-cta)') : [];
  if (!nav || !lamp || !items.length) return;

  function moveLamp(el) {
    const navRect  = nav.getBoundingClientRect();
    const elRect   = el.getBoundingClientRect();
    lamp.style.left   = (elRect.left - navRect.left) + 'px';
    lamp.style.top    = (elRect.top  - navRect.top)  + 'px';
    lamp.style.width  = elRect.width  + 'px';
    lamp.style.height = elRect.height + 'px';
    lamp.style.opacity = '1';
    items.forEach(i => i.classList.remove('fn-active'));
    el.classList.add('fn-active');
  }

  // Set initial active on first item
  moveLamp(items[0]);

  items.forEach(item => {
    item.addEventListener('click', () => moveLamp(item));
  });

  // Scroll spy
  const sections = ['features','pricing','status','team','faq'];
  window.addEventListener('scroll', () => {
    let current = sections[0];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 200) current = id;
    });
    const match = Array.from(items).find(i => i.getAttribute('href') === '#' + current);
    if (match) moveLamp(match);
  }, { passive: true });
})();

// ── Coupon system ─────────────────────────────────────────────
(function () {
  // Auto-fill if a coupon was won from spin page
  const saved = localStorage.getItem('polar_coupon');
  if (saved) {
    try {
      const c = JSON.parse(saved);
      const age = Date.now() - c.ts;
      if (age < 86400000) { // valid 24h
        const input = document.getElementById('couponInput');
        if (input) input.value = c.code;
      }
    } catch(e) {}
  }
})();

function applyCoupon() {
  const input = document.getElementById('couponInput');
  const msg   = document.getElementById('couponMsg');
  const code  = input.value.trim().toUpperCase();
  if (!code) { msg.className='coupon-msg err'; msg.textContent='Enter a code first.'; return; }

  // Validate against saved coupon
  const saved = localStorage.getItem('polar_coupon');
  let discount = 0;
  if (saved) {
    try {
      const c = JSON.parse(saved);
      const age = Date.now() - c.ts;
      if (c.code === code && age < 86400000) {
        discount = c.discount;
      }
    } catch(e) {}
  }

  // Also accept static codes for manual use
  if (!discount) {
    if (code.startsWith('POLAR2')) discount = 2;
    else if (code.startsWith('POLAR3')) discount = 3;
    else if (code.startsWith('POLAR4')) discount = 4;
  }

  if (!discount) {
    msg.className = 'coupon-msg err';
    msg.textContent = 'Invalid or expired code.';
    document.getElementById('disc3m').style.display = 'none';
    document.getElementById('discLt').style.display = 'none';
    return;
  }

  const price3m = (80 * (1 - discount / 100)).toFixed(2);
  const priceLt = (100 * (1 - discount / 100)).toFixed(2);

  document.getElementById('disc3m').style.display = 'block';
  document.getElementById('disc3m').textContent = `→ $${price3m} with ${discount}% off`;
  document.getElementById('discLt').style.display = 'block';
  document.getElementById('discLt').textContent = `→ $${priceLt} with ${discount}% off`;

  msg.className = 'coupon-msg ok';
  msg.textContent = `✓ ${discount}% discount applied! Show this code in Discord when purchasing.`;
}

// ── Persistent Pill ───────────────────────────────────────────
(function () {
  const pill = document.getElementById('itPill');
  if (!pill) return;
  pill.addEventListener('click', () => openKeySelector());
})();

// ── Intro Toast ───────────────────────────────────────────────
(function () {
  const wrap    = document.getElementById('itWrap');
  const dismiss = document.getElementById('itDismiss');
  const skip    = document.getElementById('itSkip');
  const cta     = document.getElementById('itCta');
  const canvas  = document.getElementById('itCanvas');
  if (!wrap) return;

  function hideToast() {
    wrap.classList.add('it-gone');
    wrap.addEventListener('animationend', () => { wrap.style.display = 'none'; }, { once: true });
  }

  const autoTimer = setTimeout(hideToast, 8000);

  function closeSoon() {
    clearTimeout(autoTimer);
    hideToast();
  }

  dismiss.addEventListener('click', closeSoon);
  skip.addEventListener('click', closeSoon);
  cta.addEventListener('click', e => {
    e.preventDefault();
    closeSoon();
    openKeySelector();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSoon(); });

  // Background canvas
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width = wrap.offsetWidth; canvas.height = wrap.offsetHeight; }
  resize();
  new ResizeObserver(resize).observe(wrap);
  let t = 0;
  function draw() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const spacing = 28, offset = (t * 0.4) % spacing;
    ctx.lineWidth = 0.5;
    for (let x = -spacing + offset; x < W + spacing; x += spacing) {
      const a = 0.04 + 0.02 * Math.sin(t * 0.5 + x * 0.04);
      ctx.strokeStyle = `rgba(255,255,255,${a.toFixed(3)})`;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + H * 0.3, H); ctx.stroke();
    }
    const sy = ((Math.sin(t * 0.4) + 1) / 2) * H;
    const sg = ctx.createLinearGradient(0, sy - 10, 0, sy + 10);
    sg.addColorStop(0, 'rgba(255,255,255,0)');
    sg.addColorStop(0.5, 'rgba(255,255,255,0.06)');
    sg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sg; ctx.fillRect(0, sy - 10, W, 20);
    t++; requestAnimationFrame(draw);
  }
  draw();
})();

// ── Key Selector Panel ────────────────────────────────────────
function openKeySelector() {
  const overlay = document.getElementById('ksOverlay');
  if (!overlay) return;
  overlay.classList.add('ks-open');
  document.body.style.overflow = 'hidden';
  runTerminal();
  syncUptime();
}

function closeKeySelector() {
  const overlay = document.getElementById('ksOverlay');
  if (!overlay) return;
  overlay.classList.remove('ks-open');
  document.body.style.overflow = '';
}

(function () {
  const overlay  = document.getElementById('ksOverlay');
  const closeBtn = document.getElementById('ksClose');
  if (!overlay) return;

  closeBtn.addEventListener('click', closeKeySelector);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeKeySelector(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeKeySelector(); });

  // Plan selection
  const cards = overlay.querySelectorAll('.ks-card');
  const plans = {
    '3m': { name: '3 Months', price: '$80' },
    'lt': { name: 'Lifetime', price: '$100' },
  };

  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('ks-card-selected'));
      card.classList.add('ks-card-selected');
      const p = plans[card.dataset.plan];
      document.getElementById('ksSumPlan').textContent  = p.name;
      document.getElementById('ksSumPrice').textContent = p.price;
      runTerminal(card.dataset.plan);
    });
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') card.click(); });
  });

  // bg canvas
  (function () {
    const canvas = document.getElementById('ksBgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, t = 0;

    function resize() {
      const r = canvas.parentElement.getBoundingClientRect();
      W = canvas.width  = r.width;
      H = canvas.height = r.height;
    }
    resize();
    new ResizeObserver(resize).observe(canvas.parentElement);

    function draw() {
      if (!W || !H) { requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, W, H);

      // Radial pulse from centre
      const cx = W * 0.72, cy = H * 0.4;
      const maxR = Math.max(W, H) * 0.7;
      for (let i = 3; i >= 0; i--) {
        const phase = (t * 0.008 + i * 0.25) % 1;
        const r  = phase * maxR;
        const a  = (1 - phase) * 0.06;
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grd.addColorStop(0,   `rgba(255,255,255,0)`);
        grd.addColorStop(0.8, `rgba(255,255,255,${(a * 0.3).toFixed(3)})`);
        grd.addColorStop(1,   `rgba(255,255,255,${a.toFixed(3)})`);
        ctx.strokeStyle = `rgba(255,255,255,${a.toFixed(3)})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      t++;
      requestAnimationFrame(draw);
    }
    draw();
  })();
})();

// Terminal typewriter for key selector
let termTimer = null;
function runTerminal(plan) {
  const screen = document.getElementById('ksTermScreen');
  if (!screen) return;
  if (termTimer) clearTimeout(termTimer);
  screen.innerHTML = '';

  const planLabel = plan === 'lt' ? 'lifetime' : '3-month';
  const lines = [
    { text: '> polar --connect kernel', cls: 'ks-dim' },
    { text: '  connecting to ring-0 layer...', cls: '' },
    { text: '  bypass status: ACTIVE', cls: 'ks-green' },
    { text: '> polar --check detections', cls: 'ks-dim' },
    { text: '  scanning 7/7 anti-cheats...', cls: '' },
    { text: '  result: 0 flags · all clean', cls: 'ks-green' },
    { text: `> polar --plan ${planLabel}`, cls: 'ks-dim' },
    { text: '  plan loaded · key ready on purchase', cls: 'ks-white' },
    { text: '  delivery: instant · discord dm', cls: 'ks-green' },
    { text: '> _', cls: '' },
  ];

  let i = 0;
  function next() {
    if (i >= lines.length) return;
    const l = lines[i++];
    const span = document.createElement('span');
    span.className = `ks-term-line ${l.cls}`;

    if (l.text === '> _') {
      // cursor line
      span.innerHTML = '> <span class="ks-term-cursor"></span>';
      screen.appendChild(span);
      return;
    }

    span.textContent = l.text;
    span.style.opacity = '0';
    screen.appendChild(span);
    requestAnimationFrame(() => {
      span.style.transition = 'opacity 0.2s';
      span.style.opacity = '1';
    });

    termTimer = setTimeout(next, 140 + Math.random() * 80);
  }
  next();
}

function syncUptime() {
  const el = document.getElementById('ksUptime');
  if (!el) return;
  const diff = Date.now() - new Date('2026-07-04T00:00:00Z').getTime();
  el.textContent = String(Math.floor(diff / 86400000)).padStart(3, '0');
}
