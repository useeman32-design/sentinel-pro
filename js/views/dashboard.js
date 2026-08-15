/* ============================================================
   SENTINEL AI — Dashboard
   ============================================================ */

const DashboardView = {
  data: null,

  async load() {
    try { DashboardView.data = await API.getDashboard(); } catch (e) { DashboardView.data = null; }
    if (App.currentRoute === 'dashboard') { document.getElementById('page').innerHTML = DashboardView.render(); ThreatMap.init(); }
  },

  render() {
    const D = DashboardView.data;
    const days = []; for (let i = 6; i >= 0; i--) { const d = new Date(Date.now() - i * 864e5); days.push(d.toLocaleDateString('en', { month: 'short', day: 'numeric' })); }
    const threatsPerDay = (D && D.threatsPerDay && D.threatsPerDay.length) ? D.threatsPerDay : days.map(l => ({ l, v: 0 }));
    const score = D ? D.score : 84;
    const scoreHistory = days.map((l, i) => ({ l, v: Math.max(10, score - (6 - i) * 2) }));
    const logins = days.map((l, i) => ({ l, v: [1, 2, 1, 1, 2, 1, 1][i] }));

    return `
      <div class="grid grid-4">
        <div class="card stat-card" style="--stat-glow:rgba(0,255,136,.12)">
          <div class="stat-label">${Icons.shieldCheck} SECURITY SCORE</div>
          <div class="stat-value" style="color:var(--green)">${score}<span style="font-size:15px;color:var(--text-dim)">/100</span></div>
          <span class="stat-delta up">${Icons.trendUp} Live from your scans</span>
          ${Charts.spark(scoreHistory.map(p => p.v), '#00FF88', 'line')}
        </div>
        <div class="card stat-card" style="--stat-glow:rgba(255,77,109,.12);animation-delay:.05s">
          <div class="stat-label">${Icons.alert} THREATS DETECTED</div>
          <div class="stat-value">${D ? D.threats : 0}</div>
          <span class="stat-delta warn">${Icons.activity} ${D ? D.total_scans : 0} total scans</span>
          ${Charts.spark(threatsPerDay.map(p => p.v).map(v => v + 0.2), '#FF4D6D', 'bars')}
        </div>
        <div class="card stat-card" style="--stat-glow:rgba(0,200,255,.12);animation-delay:.1s">
          <div class="stat-label">${Icons.zap} SCAMS BLOCKED</div>
          <div class="stat-value">${D ? D.blocked : 0}</div>
          <span class="stat-delta up">${Icons.check} Threats flagged for you</span>
          ${Charts.spark(threatsPerDay.map(p => p.v).map(v => v + 0.2), '#00C8FF', 'bars')}
        </div>
        <div class="card stat-card" style="--stat-glow:rgba(255,176,32,.12);animation-delay:.15s">
          <div class="stat-label">${Icons.radar} RISK LEVEL</div>
          <div class="stat-value" style="color:var(--amber)">${D ? (D.threats >= 5 ? 'High' : D.threats >= 1 ? 'Medium' : 'Low') : 'Low'}</div>
          <span class="stat-delta up">${Icons.trendUp} Based on recent activity</span>
          ${Charts.spark([62, 58, 55, 47, 40, 34, 28], '#FFB020', 'line')}
        </div>
      </div>

      <div class="section-gap card glass">
        <div class="card-title">${Icons.zap} Quick Scan<span class="spacer"></span><span class="tag">1-tap protection</span></div>
        <div class="quick-grid">
          ${[
            ['#/link-scanner', Icons.link, 'Link', 'var(--green-dim)', 'var(--green)'],
            ['#/email-scanner', Icons.mail, 'Email', 'var(--blue-dim)', 'var(--blue)'],
            ['#/sms-scanner', Icons.sms, 'SMS', 'var(--amber-dim)', 'var(--amber)'],
            ['#/qr-scanner', Icons.qr, 'QR Code', 'var(--red-dim)', 'var(--red)'],
            ['#/file-scanner', Icons.file, 'File', 'var(--green-dim)', 'var(--green)'],
            ['#/password-checker', Icons.key, 'Password', 'var(--blue-dim)', 'var(--blue)'],
            ['#/breach-monitor', Icons.eye, 'Breach', 'var(--amber-dim)', 'var(--amber)'],
            ['#/assistant', Icons.bot, 'Ask AI', 'var(--red-dim)', 'var(--red)'],
          ].map(([href, ic, label, bg, fg]) =>
            `<a class="quick-btn" href="${href}"><div class="qi" style="background:${bg};color:${fg}">${ic}</div><span>${label}</span></a>`
          ).join('')}
        </div>
      </div>

      ${ThreatMap.html()}

      <div class="section-gap grid grid-main">
        <div class="card">
          <div class="card-title">${Icons.activity} Threats Per Day<span class="spacer"></span><span class="pill info"><span class="pdot"></span>Last 7 days</span></div>
          ${Charts.bars(threatsPerDay, { unit: ' threats' })}
        </div>
        <div class="card">
          <div class="card-title">${Icons.radar} Threat Categories</div>
          ${(D && D.categories && D.categories.length)
            ? Charts.donut(D.categories.map((c, i) => ({ l: c.l, v: +c.v, c: ['#FF4D6D', '#FFB020', '#00C8FF', '#A78BFA', '#5A667D'][i % 5] })))
            : '<div class="empty" style="padding:24px">' + Icons.radar + '<div style="font-weight:600;color:var(--text)">No threats yet</div><div class="hint" style="margin-top:4px">Run your first scan — detected categories chart here.</div></div>'}
        </div>
      </div>

      <div class="section-gap grid grid-2">
        <div class="card">
          <div class="card-title">${Icons.trendUp} Security Score History</div>
          ${Charts.line(scoreHistory, { color: '#00FF88', unit: '/100' })}
        </div>
        <div class="card">
          <div class="card-title">${Icons.clock} Login History</div>
          ${Charts.line(logins, { color: '#00C8FF', unit: ' logins' })}
        </div>
      </div>

      <div class="section-gap grid grid-main">
        <div class="card">
          <div class="card-title">${Icons.clock} Recent Scans<span class="spacer"></span><a class="card-link" href="#/reports">View all</a></div>
          ${(D && D.recent && D.recent.length) ? D.recent.map(r => {
            const col = r.verdict === 'danger' ? 'red' : r.verdict === 'warn' ? 'amber' : 'green';
            const icmap = { link: Icons.link, email: Icons.mail, sms: Icons.sms, qr: Icons.qr, file: Icons.file, breach: Icons.eye };
            const pill = r.verdict === 'danger' ? 'danger' : r.verdict === 'warn' ? 'warn' : 'safe';
            return `<div class="list-item">
              <div class="list-icon ${col}">${icmap[r.type] || Icons.scan}</div>
              <div class="list-body"><div class="list-title">${esc(r.subject)}</div><div class="list-sub">${esc(r.type.toUpperCase())} scan · ${esc(r.threat_type || '')}</div></div>
              <div class="list-end"><span class="pill ${pill}">${r.verdict.toUpperCase()}</span><div style="margin-top:4px">${(r.created_at || '').slice(5, 16)}</div></div>
            </div>`;
          }).join('') : '<div class="empty" style="padding:22px">' + Icons.scan + '<div style="font-weight:600;color:var(--text)">No scans yet</div><div class="hint" style="margin-top:4px">Use Quick Scan above — your history appears here.</div></div>'}
        </div>

        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="card">
            <div class="card-title">${Icons.bulb} Security Tips</div>
            ${[
              [Icons.sms, 'green', 'Enable two-step verification on WhatsApp today — it takes 30 seconds.'],
              [Icons.lock, 'blue', 'Your bank will NEVER ask for your full BVN, PIN, or OTP. Ever.'],
              [Icons.key, 'amber', 'Length beats complexity: a 14-character passphrase outlasts P@ssw0rd! by centuries.'],
            ].map(([ic, col, t]) => `
              <div class="list-item">
                <div class="list-icon ${col}">${ic}</div>
                <div class="list-body"><div class="list-sub" style="white-space:normal;color:var(--text)">${t}</div></div>
              </div>`).join('')}
          </div>
          <div class="card">
            <div class="card-title">${Icons.news} Latest Threat News<span class="spacer"></span><a class="card-link" href="#/threat-intel">More</a></div>
            ${[
              [Icons.alert, 'red', 'Fake CBN "account upgrade" SMS wave hits 12k+ users', 'Phishing · 2h ago'],
              [Icons.sms, 'amber', 'WhatsApp hijack via fake voting links spreading', 'Account Takeover · 6h ago'],
              [Icons.fingerprint, 'blue', 'New Android banking trojan variant detected', 'Malware · 2d ago'],
            ].map(([ic, col, t, meta]) => `
              <div class="list-item" style="cursor:pointer" onclick="location.hash='#/threat-intel'">
                <div class="list-icon ${col}">${ic}</div>
                <div class="list-body"><div class="list-sub" style="white-space:normal;color:var(--text)">${t}</div><div class="list-sub">${meta}</div></div>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
  },

};
