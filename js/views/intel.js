/* ============================================================
   SENTINEL AI — Threat Intelligence · Reports · Training
   ============================================================ */

const IntelViews = {
  /* ---------- THREAT INTELLIGENCE ---------- */
  intel() {
    return `<div id="intel-root">
      <div class="grid grid-2">
        <div class="card"><div class="card-title">${Icons.activity} Threat Volume — Nigeria (7 days)</div><div class="skel" style="height:190px"></div></div>
        <div class="card"><div class="card-title">${Icons.radar} Categories This Week</div><div class="skel" style="height:190px"></div></div>
      </div>
      <div class="section-gap card"><div class="card-title">${Icons.globe} Live Security Alerts</div>
        ${'<div class="skel" style="height:64px;margin-bottom:10px"></div>'.repeat(3)}
      </div></div>`;
  },
  async bindIntel() {
    let data;
    try { data = await API.getThreatIntel(); } catch (e) { toast(e.message, 'err'); return; }
    // normalize backend rows
    IntelViews._alerts = (data.alerts || []).map(a => ({
      level: a.level, title: a.title, desc: a.desc || a.descr || '', tag: a.tag || a.category || 'General',
      time: a.time || (a.created_at ? a.created_at.slice(0, 10) : ''),
      detail: a.detail || (a.detail_json ? JSON.parse(a.detail_json) : null),
    }));
    data.trends = data.trends || [ { l:'Mon',v:132 },{ l:'Tue',v:158 },{ l:'Wed',v:141 },{ l:'Thu',v:189 },{ l:'Fri',v:214 },{ l:'Sat',v:176 },{ l:'Sun',v:148 } ];
    data.categories = data.categories || [
      { l:'Phishing', v:412, c:'#FF4D6D' },{ l:'Scam SMS', v:288, c:'#FFB020' },
      { l:'Malware', v:143, c:'#00C8FF' },{ l:'Identity Theft', v:96, c:'#A78BFA' },{ l:'Other', v:61, c:'#5A667D' }];
    const root = document.getElementById('intel-root');
    if (!root) return;
    root.innerHTML = `
      <div class="grid grid-2">
        <div class="card"><div class="card-title">${Icons.activity} Threat Volume — Nigeria (7 days)</div>${Charts.line(data.trends, { color: '#FF4D6D', unit: ' threats' })}</div>
        <div class="card"><div class="card-title">${Icons.radar} Categories This Week</div>${Charts.donut(data.categories)}</div>
      </div>
      <div class="section-gap card">
        <div class="card-title">${Icons.globe} Live Security Alerts<span class="spacer"></span><span class="pill danger"><span class="pdot"></span>LIVE</span></div>
        <div class="search-bar" style="margin-bottom:12px">${Icons.search}
          <input class="input" id="intel-search" placeholder="Search threats — e.g. WhatsApp, CBN, loan app…"></div>
        <div id="intel-list"></div>
      </div>`;
    IntelViews.renderAlerts('');
    document.getElementById('intel-search').addEventListener('input', e => IntelViews.renderAlerts(e.target.value));
  },

  renderAlerts(query) {
    const list = document.getElementById('intel-list');
    if (!list) return;
    const q = query.trim().toLowerCase();
    const items = IntelViews._alerts.filter(a => !q || (a.title + ' ' + a.desc + ' ' + a.tag).toLowerCase().includes(q));
    if (!items.length) {
      list.innerHTML = `<div class="empty">${Icons.search}<div style="font-weight:600;color:var(--text)">No threats match “${esc(query)}”</div><div class="hint" style="margin-top:5px">Try a different keyword — or good news, that threat isn't active.</div></div>`;
      return;
    }
    list.innerHTML = items.map((a, i) => `
      <div class="list-item intel-row" data-idx="${IntelViews._alerts.indexOf(a)}" style="animation:fadeUp .4s ease both;animation-delay:${i * 60}ms;cursor:pointer">
        <div class="list-icon ${a.level === 'danger' ? 'red' : a.level === 'warn' ? 'amber' : 'blue'}">${a.level === 'danger' ? Icons.alert : a.level === 'warn' ? Icons.zap : Icons.info}</div>
        <div class="list-body">
          <div class="list-title" style="white-space:normal">${esc(a.title)}</div>
          <div class="list-sub" style="white-space:normal;margin-top:4px">${esc(a.desc)}</div>
          <div style="margin-top:7px;display:flex;gap:8px;align-items:center"><span class="tag">${esc(a.tag)}</span><span class="hint">${a.time}</span><span class="card-link" style="margin-left:auto">Details →</span></div>
        </div>
      </div>`).join('');
    list.querySelectorAll('.intel-row').forEach(row =>
      row.addEventListener('click', () => IntelViews.openThreat(+row.dataset.idx)));
  },

  /* ---------- Threat detail modal ---------- */
  openThreat(idx) {
    const a = IntelViews._alerts[idx];
    if (!a) return;
    const d = a.detail || {};
    const scrim = document.createElement('div');
    scrim.className = 'modal-scrim';
    scrim.innerHTML = `<div class="modal">
      <div class="modal-head">
        <div class="list-icon ${a.level === 'danger' ? 'red' : a.level === 'warn' ? 'amber' : 'blue'}" style="flex:none">${a.level === 'danger' ? Icons.alert : a.level === 'warn' ? Icons.zap : Icons.info}</div>
        <h3>${esc(a.title)}<div style="margin-top:6px;display:flex;gap:8px;align-items:center"><span class="tag">${esc(a.tag)}</span><span class="hint">${a.time}</span><span class="pill ${a.level === 'danger' ? 'danger' : a.level === 'warn' ? 'warn' : 'info'}"><span class="pdot"></span>${a.level === 'danger' ? 'ACTIVE' : a.level === 'warn' ? 'SPREADING' : 'MONITORING'}</span></div></h3>
        <button class="modal-close">${Icons.x}</button>
      </div>
      <div class="modal-body">
        ${d.illus ? `<div class="modal-illus">${d.illus}</div>` : ''}
        <h4>${Icons.info} What's happening</h4>
        <p>${esc(d.what || a.desc)}</p>
        <h4>${Icons.radar} How the attack works</h4>
        <ul>${(d.how || ['Attackers contact victims through a trusted-looking channel.', 'A convincing pretext creates urgency or excitement.', 'The victim is directed to a malicious link or asked for sensitive data.']).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        <h4>${Icons.eye} Warning signs</h4>
        <ul>${(d.signs || ['Unsolicited message with urgent language', 'Links to unfamiliar domains', 'Requests for OTP, PIN, BVN or passwords']).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        <h4>${Icons.shieldCheck} How to protect yourself</h4>
        <ul>${(d.protect || ['Never click links from unexpected messages', 'Verify through official apps/websites only', 'Enable two-factor authentication', 'Report to ngCERT (cert.gov.ng) and your bank']).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        <div class="divider"></div>
        <div class="modal-actions">
          <button class="btn btn-primary" onclick="location.hash='#/assistant';this.closest('.modal-scrim').remove()">${Icons.bot} Ask AI</button>
          <button class="btn btn-ghost" onclick="toast('Alert shared to your team feed.','ok')">Share</button>
        </div>
      </div>
    </div>`;
    const close = () => scrim.remove();
    scrim.addEventListener('click', e => { if (e.target === scrim) close(); });
    scrim.querySelector('.modal-close').addEventListener('click', close);
    document.body.appendChild(scrim);
  },

  /* ---------- REPORTS ---------- */
  reports() {
    return `<div id="reports-root">
      <div class="card"><div class="card-title">${Icons.report} Security Reports</div>
      ${'<div class="skel" style="height:52px;margin-bottom:10px"></div>'.repeat(4)}</div></div>`;
  },
  async bindReports() {
    let rows;
    try { rows = (await API.getReports()).items.map(r => ({ ...r, status: 'Ready', date: (r.date||'').slice(0,10), risk: r.risk || 'Low' })); }
    catch (e) { toast(e.message, 'err'); return; }
    const root = document.getElementById('reports-root');
    if (!root) return;
    const riskPill = r => r === 'High' ? 'danger' : r === 'Medium' ? 'warn' : 'safe';
    root.innerHTML = `
      <div class="card">
        <div class="card-title">${Icons.report} Security Reports<span class="spacer"></span>
          <button class="btn btn-primary btn-sm" style="width:auto" id="new-report-btn">+ Generate Report</button></div>
        <div class="table-wrap"><table class="tbl">
          <thead><tr><th>ID</th><th>Report</th><th>Date</th><th>Threats</th><th>Risk Level</th><th>Status</th><th></th></tr></thead>
          <tbody>${rows.map(r => `<tr>
            <td style="color:var(--text-faint)">${r.id}</td>
            <td><b>${esc(r.title)}</b></td>
            <td>${r.date}</td>
            <td>${r.threats}</td>
            <td><span class="pill ${riskPill(r.risk)}">${r.risk}</span></td>
            <td>${r.status}</td>
            <td><button class="btn btn-ghost btn-sm pdf-btn" data-id="${r.id}" data-title="${esc(r.title)}" data-date="${r.date}" data-risk="${r.risk}" data-threats="${r.threats}">${Icons.download} PDF</button></td>
          </tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="section-gap card glass">
        <div class="card-title">${Icons.info} About Reports</div>
        <p class="hint" style="font-size:13px">Reports aggregate your scans, detected threats, and risk posture into an executive summary with recommendations — ready to share with your team, management, or auditors. PDF generation will be finalized on the PHP backend (<span class="kbd">GET /api/reports/:id/pdf</span>); the button below produces a print-ready version in the meantime.</p>
      </div>`;
    document.getElementById('new-report-btn').addEventListener('click', async () => {
      try { const r = await API.createReport(); toast('Report ' + r.ref + ' generated from your real scan history.', 'ok'); IntelViews.bindReports(); }
      catch (e) { toast(e.message, 'err'); }
    });
    root.querySelectorAll('.pdf-btn').forEach(b => b.addEventListener('click', () => IntelViews.exportPDF(b.dataset)));
  },

  exportPDF(d) {
    const w = window.open('', '_blank');
    if (!w) return toast('Allow popups to export the PDF.', 'err');
    w.document.write(`<!DOCTYPE html><html><head><title>${esc(d.title)} — Sentinel AI</title>
      <style>
        body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:48px;line-height:1.55}
        .head{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #00C864;padding-bottom:14px}
        h1{font-size:20px;margin:0}.brand{font-weight:800;letter-spacing:1px}
        .brand span{color:#00A857}.meta{color:#555;font-size:13px;margin-top:20px}
        table{width:100%;border-collapse:collapse;margin-top:24px;font-size:14px}
        td,th{border:1px solid #ddd;padding:10px;text-align:left}th{background:#f4f7f5}
        .risk{display:inline-block;padding:3px 12px;border-radius:12px;font-weight:700;font-size:12px;
          background:${d.risk === 'High' ? '#fde8ec;color:#c0264b' : d.risk === 'Medium' ? '#fdf3e0;color:#b07708' : '#e6f9ef;color:#0a7d45'}}
        .rec{margin-top:24px;background:#f8faf9;border-left:4px solid #00C864;padding:14px 18px;font-size:14px}
        .foot{margin-top:44px;font-size:11px;color:#999;border-top:1px solid #eee;padding-top:12px}
      </style></head><body>
      <div class="head"><div><div class="brand">SENTINEL <span>AI</span></div><h1>${esc(d.title)}</h1></div>
        <div style="text-align:right;font-size:13px;color:#555">Report ${d.id}<br>${d.date}</div></div>
      <p class="meta">Generated by Sentinel AI — Detect. Protect. Prevent.</p>
      <table>
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Threats analyzed</td><td>${d.threats}</td></tr>
        <tr><td>Overall risk level</td><td><span class="risk">${d.risk}</span></td></tr>
        <tr><td>Scans included</td><td>Link · Email · SMS · QR · File · Breach</td></tr>
        <tr><td>Coverage window</td><td>7 days ending ${d.date}</td></tr>
      </table>
      <div class="rec"><b>Key recommendations</b><br>
        1. Enable two-factor authentication on all critical accounts.<br>
        2. Address flagged high-risk links before they recirculate internally.<br>
        3. Schedule the pending password hygiene remediations.<br>
        4. Brief staff on this week's active phishing campaigns.</div>
      <div class="foot">Confidential — generated by Sentinel AI for the account holder. © 2026 Sentinel AI.</div>
      <script>window.print()<\/script></body></html>`);
    w.document.close();
  },

  /* ---------- TRAINING ---------- */
  training() {
    const store = JSON.parse(localStorage.getItem('sentinel_training') || '{"beginner":35,"intermediate":10,"advanced":0}');
    const courses = [
      { id: 'beginner', title: 'Cybersecurity Fundamentals', level: 'Beginner', lessons: 8, videos: 6, mins: 90, grad: 'linear-gradient(135deg,#059669,#00C8FF)', desc: 'Passwords, phishing, safe browsing, and protecting your phone — the essentials everyone needs.' },
      { id: 'intermediate', title: 'Defending Against Fraud & Scams', level: 'Intermediate', lessons: 10, videos: 8, mins: 140, grad: 'linear-gradient(135deg,#2563EB,#7C3AED)', desc: 'Deep-dive into Nigerian fraud patterns: SIM swap, BVN scams, business email compromise, and social engineering.' },
      { id: 'advanced', title: 'Enterprise Threat Defense', level: 'Advanced', lessons: 12, videos: 10, mins: 200, grad: 'linear-gradient(135deg,#DC2626,#F59E0B)', desc: 'Incident response, threat hunting, ransomware playbooks, and building a security-first organization.' },
    ];
    return `
      <div class="grid grid-3">
        ${courses.map((c, i) => {
          const p = store[c.id] || 0;
          return `<div class="card course-card" style="animation-delay:${i * 80}ms">
          <div class="course-banner" style="background:${c.grad}">${Icons.grad}</div>
          <div class="course-body">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span class="pill ${c.id === 'beginner' ? 'safe' : c.id === 'intermediate' ? 'info' : 'danger'}">${c.level}</span>
              <span class="hint">${c.mins} min</span></div>
            <div class="course-title">${c.title}</div>
            <p class="hint" style="font-size:12.5px">${c.desc}</p>
            <div class="course-meta"><span>📚 ${c.lessons} lessons</span><span>🎬 ${c.videos} videos</span><span>📝 Quiz</span></div>
            <div class="meter-row" style="margin:4px 0 2px"><div class="m-head"><b>Progress</b><span>${p}%</span></div>
              <div class="meter-track"><div class="meter-fill" style="width:${p}%"></div></div></div>
            <button class="btn ${p > 0 ? 'btn-ghost' : 'btn-primary'} btn-sm course-btn" data-c="${c.id}">${p >= 100 ? '🏆 View Certificate' : p > 0 ? '▶ Continue Course' : '▶ Start Course'}</button>
          </div></div>`;
        }).join('')}
      </div>
      <div class="section-gap card glass">
        <div class="card-title">${Icons.grad} Certificates</div>
        <p class="hint" style="font-size:13px">Complete all lessons and pass the quiz (70%+) to earn a verifiable Sentinel AI certificate — sharable on LinkedIn and downloadable as PDF. Certificate issuance is handled by the backend (<span class="kbd">POST /api/training/certificate</span>).</p>
      </div>`;
  },
  bindTraining() {
    document.querySelectorAll('.course-btn').forEach(b => b.addEventListener('click', () => {
      const store = JSON.parse(localStorage.getItem('sentinel_training') || '{"beginner":35,"intermediate":10,"advanced":0}');
      const id = b.dataset.c;
      store[id] = Math.min(100, (store[id] || 0) + 15);
      localStorage.setItem('sentinel_training', JSON.stringify(store));
      toast(store[id] >= 100 ? '🏆 Course complete! Certificate unlocked.' : `Lesson complete — ${store[id]}% done. Keep going!`, 'ok');
      App.render();
    }));
  },
};
