/* ============================================================
   SENTINEL AI — Shared components: icons, logo, toasts, charts
   ============================================================ */

const Icons = {
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  shieldCheck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
  scan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  sms: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  qr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM21 14v.01M14 21v.01M17 21h4"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
  key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="4.5"/><path d="m11 12 9-9M17 6l3 3M14 9l2 2"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',
  radar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/><path d="m12 12 6-6.5"/></svg>',
  report: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>',
  grad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/></svg>',
  bot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4M8 4h8"/><circle cx="9" cy="13.5" r="1"/><circle cx="15" cy="13.5" r="1"/><path d="M9 17h6"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="15" y2="18"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></svg>',
  activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
  trendUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m23 6-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>',
  zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
  google: '<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>',
};

function logoSVG(size) {
  return `<svg viewBox="0 0 64 64" width="${size||42}" height="${size||42}" fill="none">
    <defs><linearGradient id="lg${size||''}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#00FF88"/><stop offset="1" stop-color="#00C8FF"/>
    </linearGradient></defs>
    <path d="M32 4 8 13v16c0 14.5 10.2 27.4 24 31 13.8-3.6 24-16.5 24-31V13L32 4z" stroke="url(#lg${size||''})" stroke-width="3.5" fill="rgba(0,255,136,0.06)"/>
    <circle cx="32" cy="30" r="4" fill="url(#lg${size||''})"/>
    <path d="M32 34v10M32 26v-8M26 30h-8M46 30h-8M25 23l-4-4M43 37l4 4M39 23l4-4M21 41l4-4" stroke="url(#lg${size||''})" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="32" cy="44" r="2.2" fill="#00C8FF"/><circle cx="32" cy="18" r="2.2" fill="#00FF88"/>
    <circle cx="18" cy="30" r="2.2" fill="#00C8FF"/><circle cx="46" cy="30" r="2.2" fill="#00FF88"/>
  </svg>`;
}

/* ---------- Toasts ---------- */
function toast(msg, type = 'info', ms = 3200) {
  const root = document.getElementById('toast-root');
  const el = document.createElement('div');
  el.className = `toast ${type === 'ok' ? 'ok' : type === 'err' ? 'err' : 'info'}`;
  const ico = type === 'ok' ? Icons.check : type === 'err' ? Icons.alert : Icons.info;
  el.innerHTML = `<span class="t-ico">${ico}</span><span>${msg}</span>`;
  root.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 260); }, ms);
}

/* ---------- Helpers ---------- */
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}

/* ---------- SVG Charts (no external libs) ---------- */
const Charts = {
  line(points, opts = {}) {
    const W = 560, H = 190, P = 26;
    const max = Math.max(...points.map(p => p.v)) * 1.15 || 1;
    const step = (W - P * 2) / (points.length - 1);
    const xy = points.map((p, i) => [P + i * step, H - P - (p.v / max) * (H - P * 2)]);
    const path = xy.map((c, i) => (i ? 'L' : 'M') + c[0].toFixed(1) + ' ' + c[1].toFixed(1)).join(' ');
    const area = path + ` L ${xy[xy.length - 1][0]} ${H - P} L ${xy[0][0]} ${H - P} Z`;
    const gid = 'ag' + Math.random().toString(36).slice(2, 7);
    return `<div class="chart-box line-anim"><svg viewBox="0 0 ${W} ${H}">
      <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${opts.color || '#00FF88'}" stop-opacity=".28"/>
        <stop offset="1" stop-color="${opts.color || '#00FF88'}" stop-opacity="0"/>
      </linearGradient></defs>
      ${[0.25, 0.5, 0.75].map(f => `<line x1="${P}" y1="${P + (H - 2 * P) * f}" x2="${W - P}" y2="${P + (H - 2 * P) * f}" stroke="rgba(148,163,184,.1)" stroke-dasharray="4 5"/>`).join('')}
      <path d="${area}" fill="url(#${gid})"/>
      <path class="line" d="${path}" fill="none" stroke="${opts.color || '#00FF88'}" stroke-width="2.5" stroke-linecap="round"/>
      ${xy.map((c, i) => `<circle cx="${c[0]}" cy="${c[1]}" r="3.2" fill="${opts.color || '#00FF88'}"><title>${esc(points[i].l)}: ${points[i].v}</title></circle>`).join('')}
      ${xy.map((c, i) => i % Math.ceil(points.length / 7) === 0 ? `<text x="${c[0]}" y="${H - 7}" font-size="10" fill="#5A667D" text-anchor="middle">${esc(points[i].l)}</text>` : '').join('')}
    </svg></div>`;
  },

  bars(points, opts = {}) {
    const W = 560, H = 190, P = 26;
    const max = Math.max(...points.map(p => p.v)) * 1.15 || 1;
    const n = points.length;
    const bw = Math.min(30, (W - 2 * P) / n * 0.55);
    const step = (W - 2 * P) / n;
    return `<div class="chart-box bar-anim"><svg viewBox="0 0 ${W} ${H}">
      <defs><linearGradient id="bgrad" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#00C8FF"/><stop offset="1" stop-color="#00FF88"/>
      </linearGradient></defs>
      ${points.map((p, i) => {
        const h = (p.v / max) * (H - 2 * P);
        const x = P + i * step + (step - bw) / 2;
        return `<rect x="${x.toFixed(1)}" y="${(H - P - h).toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" rx="5" fill="url(#bgrad)" style="animation-delay:${i * 60}ms"><title>${esc(p.l)}: ${p.v}</title></rect>
        <text x="${(x + bw / 2).toFixed(1)}" y="${H - 7}" font-size="10" fill="#5A667D" text-anchor="middle">${esc(p.l)}</text>`;
      }).join('')}
    </svg></div>`;
  },

  donut(items) {
    const total = items.reduce((a, b) => a + b.v, 0) || 1;
    const R = 70, C = 2 * Math.PI * R;
    let off = 0;
    const segs = items.map(it => {
      const frac = it.v / total;
      const seg = `<circle class="donut-seg" cx="95" cy="95" r="${R}" fill="none" stroke="${it.c}" stroke-width="26"
        stroke-dasharray="${(frac * C - 2).toFixed(1)} ${(C - frac * C + 2).toFixed(1)}"
        stroke-dashoffset="${(-off * C).toFixed(1)}" transform="rotate(-90 95 95)"><title>${esc(it.l)}: ${it.v} (${Math.round(frac * 100)}%)</title></circle>`;
      off += frac;
      return seg;
    }).join('');
    return `<div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:center">
      <div class="chart-box" style="width:190px;flex:none"><svg viewBox="0 0 190 190">${segs}
        <text x="95" y="90" text-anchor="middle" font-size="26" font-weight="700" fill="var(--text)" font-family="Poppins">${total}</text>
        <text x="95" y="110" text-anchor="middle" font-size="10" fill="#5A667D" letter-spacing="1">TOTAL</text>
      </svg></div>
      <div class="legend" style="flex-direction:column;gap:9px;align-items:flex-start">
        ${items.map(it => `<div class="legend-item"><span class="legend-dot" style="background:${it.c}"></span>${esc(it.l)} <b style="color:var(--text)">&nbsp;${it.v}</b></div>`).join('')}
      </div></div>`;
  },

  scoreRing(score, size = 128) {
    const R = 54, C = 2 * Math.PI * R;
    const off = C - (score / 100) * C;
    return `<div class="ring" style="width:${size}px;height:${size}px">
      <svg viewBox="0 0 128 128" width="${size}" height="${size}">
        <defs><linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#00FF88"/><stop offset="1" stop-color="#00C8FF"/>
        </linearGradient></defs>
        <circle class="track" cx="64" cy="64" r="${R}" fill="none" stroke-width="11"/>
        <circle class="meter" cx="64" cy="64" r="${R}" fill="none" stroke-width="11"
          stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/>
      </svg>
      <div class="ring-center"><div class="ring-score">${score}</div><div class="ring-label">Score</div></div>
    </div>`;
  }
};
