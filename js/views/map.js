/* ============================================================
   SENTINEL AI — Nigeria Threat Map
   Leaflet 1.9.4 (local, no basemap tiles) + real geoBoundaries
   ADM1 state polygons (37 features: 36 states + FCT).
   Choropleth = threat activity index per state, Sentinel theme.
   ============================================================ */

const ThreatMap = {
  map: null,
  layer: null,
  selected: null,
  geo: null,

  /* Live per-state data from /api/threat-map (geo-IP aggregated).
     Empty until real users scan from Nigerian networks. */
  DATA: {},
  totals: { total_today: 0, blocked_today: 0, covered: 0, geo_note: null },

  async loadLive() {
    try {
      const d = await API.request('/threat-map');
      ThreatMap.DATA = {};
      Object.entries(d.states || {}).forEach(([name, s]) => {
        ThreatMap.DATA[name] = { idx: s.idx, scans: s.scans, blocked: s.blocked, top: s.top };
      });
      ThreatMap.totals = { total_today: d.total_today, blocked_today: d.blocked_today, covered: d.covered, geo_note: d.geo_note };
    } catch (e) { ThreatMap.totals.geo_note = 'Could not load live map data.'; }
  },

  stateData(name) { return ThreatMap.DATA[name] || { idx: 0, scans: 0, blocked: 0, top: '—' }; },

  /* interpolate along Sentinel gradient: deep navy -> blue -> green */
  color(idx) {
    const stops = [
      [0,   [13, 32, 54]],    // deep navy
      [30,  [10, 61, 78]],
      [55,  [0, 104, 112]],
      [75,  [0, 160, 118]],
      [100, [0, 255, 136]],   // neon green
    ];
    let a = stops[0], b = stops[stops.length - 1];
    for (let i = 0; i < stops.length - 1; i++)
      if (idx >= stops[i][0] && idx <= stops[i + 1][0]) { a = stops[i]; b = stops[i + 1]; break; }
    const t = (idx - a[0]) / ((b[0] - a[0]) || 1);
    const c = a[1].map((v, i) => Math.round(v + (b[1][i] - v) * t));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  },

  html() {
    return `<div class="section-gap card glass ng-map-card">
      <div class="card-title">${Icons.globe} Live Threat Map — Nigeria<span class="spacer"></span><span class="pill danger"><span class="pdot"></span>LIVE</span></div>
      <div class="tmap-layout">
        <div class="tmap-box">
          <div id="ng-map"></div>
          <div class="tmap-legend"><span>LOW</span><div class="tmap-legend-bar"></div><span>HIGH</span></div>
        </div>
        <div class="tmap-panel" id="tmap-panel">${ThreatMap.panelDefault()}</div>
      </div>
    </div>`;
  },

  panelDefault() {
    const top = Object.entries(ThreatMap.DATA).sort((a, b) => b[1].idx - a[1].idx).slice(0, 5);
    const T = ThreatMap.totals;
    return `<div class="tmap-panel-inner">
      <div class="tmap-hint">${Icons.info}<span>Tap any state to see its live threat profile.</span></div>
      ${top.length ? `<div class="nav-group" style="padding:12px 0 6px">Top Hotspots (live)</div>
      ${top.map(([name, d], i) => `
        <div class="tmap-top-row" data-state="${esc(name)}">
          <span class="tmap-rank">${i + 1}</span>
          <span class="tmap-top-name">${esc(name)}</span>
          <div class="tmap-mini-track"><div class="tmap-mini-fill" style="width:${d.idx}%"></div></div>
          <b>${d.idx}</b>
        </div>`).join('')}`
      : `<div class="hint" style="padding:14px 4px;line-height:1.6">${esc(T.geo_note || 'No geo-located scan data yet.')}</div>`}
      <div class="ng-stats" style="margin-top:16px">
        <div class="ng-stat"><div class="n" style="color:var(--green)">${T.blocked_today}</div><div class="l">Blocked Today</div></div>
        <div class="ng-stat"><div class="n" style="color:var(--blue)">${T.total_today}</div><div class="l">Scans Today</div></div>
        <div class="ng-stat"><div class="n" style="color:var(--amber)">${T.covered}</div><div class="l">States Active</div></div>
      </div>
    </div>`;
  },

  panelState(name) {
    const d = ThreatMap.stateData(name);
    const vals = Object.values(ThreatMap.DATA);
    const peak = vals.length ? Math.max(...vals.map(x => x.idx)) : 1;
    const avg = vals.length ? Math.round(vals.reduce((a, x) => a + x.idx, 0) / vals.length) : 0;
    if (!ThreatMap.DATA[name]) {
      return `<div class="tmap-panel-inner">
        <div style="display:flex;align-items:center;gap:10px">
          <div class="list-icon green" style="flex:none">${Icons.radar}</div>
          <div style="flex:1;min-width:0"><div style="font-family:var(--font-display);font-weight:700;font-size:15px">${esc(name)}</div>
            <div class="hint">No scan activity recorded yet</div></div>
          <button class="modal-close" id="tmap-clear" title="Clear selection">${Icons.x}</button>
        </div>
        <p class="hint" style="margin-top:12px;line-height:1.6">This state has no geo-located scans yet. As users in ${esc(name)} run scans, live threat statistics will appear here.</p>
      </div>`;
    }
    return `<div class="tmap-panel-inner">
      <div style="display:flex;align-items:center;gap:10px">
        <div class="list-icon ${d.idx >= 60 ? 'red' : d.idx >= 30 ? 'amber' : 'green'}" style="flex:none">${Icons.radar}</div>
        <div style="flex:1;min-width:0">
          <div style="font-family:var(--font-display);font-weight:700;font-size:15px">${esc(name)}</div>
          <div class="hint">Threat activity profile</div>
        </div>
        <button class="modal-close" id="tmap-clear" title="Clear selection">${Icons.x}</button>
      </div>
      <div class="grid grid-2" style="gap:8px;margin-top:14px">
        <div class="tmap-stat"><div class="ts-n" style="color:${ThreatMap.color(d.idx)}">${d.idx}</div><div class="ts-l">Activity Index</div></div>
        <div class="tmap-stat"><div class="ts-n">${d.blocked}</div><div class="ts-l">Threats Found</div></div>
        <div class="tmap-stat"><div class="ts-n">${d.scans.toLocaleString()}</div><div class="ts-l">Total Scans</div></div>
        <div class="tmap-stat"><div class="ts-n" style="font-size:12px;line-height:1.3;padding-top:4px">${esc(d.top)}</div><div class="ts-l">Top Threat</div></div>
      </div>
      <div style="margin-top:14px">
        <div class="meter-row"><div class="m-head"><b>vs national peak (${peak})</b><span>${Math.round(d.idx / peak * 100)}%</span></div>
          <div class="meter-track"><div class="meter-fill" style="width:${d.idx / peak * 100}%"></div></div></div>
        <div class="meter-row"><div class="m-head"><b>vs national average (${avg})</b><span>${Math.round(d.idx / avg * 100)}%</span></div>
          <div class="meter-track"><div class="meter-fill" style="width:${Math.min(100, d.idx / avg * 100)}%;background:${d.idx > avg ? 'linear-gradient(90deg,var(--amber),var(--red))' : ''}"></div></div></div>
      </div>
      <button class="btn btn-ghost btn-sm btn-block" style="margin-top:6px" onclick="location.hash='#/threat-intel'">${Icons.radar} View Active Threats</button>
    </div>`;
  },

  async init() {
    const el = document.getElementById('ng-map');
    if (!el || typeof L === 'undefined') return;
    await ThreatMap.loadLive();
    const panel0 = document.getElementById('tmap-panel');
    if (panel0) panel0.innerHTML = ThreatMap.panelDefault();
    if (!ThreatMap.geo) {
      try {
        const res = await fetch('data/nigeria-states.geojson');
        ThreatMap.geo = await res.json();
      } catch (e) { el.innerHTML = '<div class="empty">Map data unavailable offline.</div>'; return; }
    }
    if (!document.getElementById('ng-map')) return; // user navigated away during fetch

    const map = L.map('ng-map', {
      zoomControl: true, attributionControl: false,
      scrollWheelZoom: false, dragging: !L.Browser.mobile, tap: true,
    });
    ThreatMap.map = map;
    ThreatMap.selected = null;

    const baseStyle = f => ({
      fillColor: ThreatMap.color(ThreatMap.stateData(f.properties.name).idx),
      fillOpacity: 0.85,
      color: 'rgba(11,18,32,.9)',
      weight: 1,
    });

    const layer = L.geoJSON(ThreatMap.geo, {
      style: baseStyle,
      onEachFeature: (f, lyr) => {
        const name = f.properties.name;
        const d = ThreatMap.stateData(name);
        lyr.bindTooltip(
          `<div class="tmap-tt"><b>${esc(name)}</b><span>Activity <em>${d.idx}</em> · Blocked <em>${d.blocked}</em></span><span>Top: ${esc(d.top)}</span></div>`,
          { sticky: true, direction: 'top', className: 'tmap-tooltip', opacity: 1 });
        lyr.on('mouseover', () => {
          if (ThreatMap.selected !== lyr) { lyr.setStyle({ color: '#00FF88', weight: 1.8 }); lyr.bringToFront(); }
        });
        lyr.on('mouseout', () => {
          if (ThreatMap.selected !== lyr) layer.resetStyle(lyr);
        });
        lyr.on('click', () => {
          if (ThreatMap.selected === lyr) { ThreatMap.clearSelection(); return; }
          if (ThreatMap.selected) layer.resetStyle(ThreatMap.selected);
          ThreatMap.selected = lyr;
          lyr.setStyle({ fillColor: '#00C8FF', fillOpacity: .9, color: '#00C8FF', weight: 2 });
          lyr.bringToFront();
          const panel = document.getElementById('tmap-panel');
          panel.innerHTML = ThreatMap.panelState(name);
          document.getElementById('tmap-clear')?.addEventListener('click', () => ThreatMap.clearSelection());
        });
      },
    }).addTo(map);
    ThreatMap.layer = layer;

    const bounds = layer.getBounds();
    map.fitBounds(bounds, { padding: [14, 14] });
    map.setMaxBounds(bounds.pad(0.25));
    map.setMinZoom(map.getZoom());

    // hotspot quick-select rows in default panel
    ThreatMap.bindPanelRows();
  },

  bindPanelRows() {
    document.querySelectorAll('.tmap-top-row').forEach(row => row.addEventListener('click', () => {
      const name = row.dataset.state;
      ThreatMap.layer?.eachLayer(lyr => {
        if (lyr.feature.properties.name === name) lyr.fire('click');
      });
    }));
  },

  clearSelection() {
    if (ThreatMap.selected && ThreatMap.layer) ThreatMap.layer.resetStyle(ThreatMap.selected);
    ThreatMap.selected = null;
    const panel = document.getElementById('tmap-panel');
    if (panel) { panel.innerHTML = ThreatMap.panelDefault(); ThreatMap.bindPanelRows(); }
    ThreatMap.map?.fitBounds(ThreatMap.layer.getBounds(), { padding: [14, 14] });
  },

  destroy() {
    if (ThreatMap.map) { ThreatMap.map.remove(); ThreatMap.map = null; ThreatMap.layer = null; ThreatMap.selected = null; }
  },
};
