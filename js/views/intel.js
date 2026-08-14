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
    const data = await API.getThreatIntel();
    const root = document.getElementById('intel-root');
    if (!root) return;
    root.innerHTML = `
      <div class="grid grid-2">
        <div class="card"><div class="card-title">${Icons.activity} Threat Volume — Nigeria (7 days)</div>${Charts.line(data.trends, { color: '#FF4D6D' })}</div>
        <div class="card"><div class="card-title">${Icons.radar} Categories This Week</div>${Charts.donut(data.categories)}</div>
      </div>
      <div class="section-gap card">
        <div class="card-title">${Icons.globe} Live Security Alerts<span class="spacer"></span><span class="pill danger"><span class="pdot"></span>LIVE</span></div>
        ${data.alerts.map((a, i) => `
          <div class="list-item" style="animation:fadeUp .4s ease both;animation-delay:${i * 70}ms">
            <div class="list-icon ${a.level === 'danger' ? 'red' : a.level === 'warn' ? 'amber' : 'blue'}">${a.level === 'danger' ? Icons.alert : a.level === 'warn' ? Icons.zap : Icons.info}</div>
            <div class="list-body">
              <div class="list-title" style="white-space:normal">${esc(a.title)}</div>
              <div class="list-sub" style="white-space:normal;margin-top:4px">${esc(a.desc)}</div>
              <div style="margin-top:7px;display:flex;gap:8px;align-items:center"><span class="tag">${esc(a.tag)}</span><span class="hint">${a.time}</span></div>
            </div>
          </div>`).join('')}
      </div>`;
  },

  /* ---------- REPORTS ---------- */
  reports() {
    return `<div id="reports-root">
      <div class="card"><div class="card-title">${Icons.report} Security Reports</div>
      ${'<div class="skel" style="height:52px;margin-bottom:10px"></div>'.repeat(4)}</div></div>`;
  },
  async bindReports() {
    const rows = await API.getReports();
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
    document.getElementById('new-report-btn').addEventListener('click', () => toast('Compiling a fresh report from your latest scans… (backend endpoint: POST /api/reports)', 'info'));
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
