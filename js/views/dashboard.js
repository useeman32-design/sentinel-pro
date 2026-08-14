/* ============================================================
   SENTINEL AI — Dashboard
   ============================================================ */

const DashboardView = {
  render() {
    const days = ['Aug 8', 'Aug 9', 'Aug 10', 'Aug 11', 'Aug 12', 'Aug 13', 'Aug 14'];
    const threatsPerDay = days.map((l, i) => ({ l, v: [4, 7, 3, 9, 12, 6, 5][i] }));
    const scoreHistory = days.map((l, i) => ({ l, v: [71, 73, 72, 76, 79, 82, 84][i] }));
    const logins = days.map((l, i) => ({ l, v: [3, 2, 4, 1, 5, 2, 3][i] }));

    return `
      <div class="grid grid-4">
        <div class="card stat-card" style="--stat-glow:rgba(0,255,136,.12)">
          <div class="stat-label">${Icons.shieldCheck} SECURITY SCORE</div>
          <div class="stat-value" style="color:var(--green)">84<span style="font-size:15px;color:var(--text-dim)">/100</span></div>
          <span class="stat-delta up">${Icons.trendUp} +5 this week</span>
          ${Charts.spark([71, 73, 72, 76, 79, 82, 84], '#00FF88', 'line')}
        </div>
        <div class="card stat-card" style="--stat-glow:rgba(255,77,109,.12);animation-delay:.05s">
          <div class="stat-label">${Icons.alert} THREATS DETECTED</div>
          <div class="stat-value">46</div>
          <span class="stat-delta warn">${Icons.activity} 12 in last 24h</span>
          ${Charts.spark([4, 7, 3, 9, 12, 6, 5], '#FF4D6D', 'bars')}
        </div>
        <div class="card stat-card" style="--stat-glow:rgba(0,200,255,.12);animation-delay:.1s">
          <div class="stat-label">${Icons.zap} SCAMS BLOCKED</div>
          <div class="stat-value">31</div>
          <span class="stat-delta up">${Icons.check} 100% block rate</span>
          ${Charts.spark([2, 5, 3, 6, 8, 4, 3], '#00C8FF', 'bars')}
        </div>
        <div class="card stat-card" style="--stat-glow:rgba(255,176,32,.12);animation-delay:.15s">
          <div class="stat-label">${Icons.radar} RISK LEVEL</div>
          <div class="stat-value" style="color:var(--amber)">Low</div>
          <span class="stat-delta up">${Icons.trendUp} Improved from Medium</span>
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

      ${DashboardView.nigeriaMap()}

      <div class="section-gap grid grid-main">
        <div class="card">
          <div class="card-title">${Icons.activity} Threats Per Day<span class="spacer"></span><span class="pill info"><span class="pdot"></span>Last 7 days</span></div>
          ${Charts.bars(threatsPerDay, { unit: ' threats' })}
        </div>
        <div class="card">
          <div class="card-title">${Icons.radar} Threat Categories</div>
          ${Charts.donut([
            { l: 'Phishing', v: 18, c: '#FF4D6D' },
            { l: 'Scam SMS', v: 12, c: '#FFB020' },
            { l: 'Malware', v: 9, c: '#00C8FF' },
            { l: 'Breaches', v: 7, c: '#A78BFA' },
          ])}
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
          ${[
            ['red', Icons.link, 'gtb-secure-login.tk/verify', 'Link Scan · Dangerous — phishing site blocked', '22m ago', 'danger', 'DANGEROUS'],
            ['green', Icons.mail, 'Invoice from Paystack', 'Email Scan · Verified legitimate sender', '1h ago', 'safe', 'SAFE'],
            ['amber', Icons.sms, '"You have won ₦5,000,000…"', 'SMS Scan · Lottery scam pattern', '3h ago', 'danger', 'SCAM'],
            ['blue', Icons.file, 'Q3-financials.xlsx', 'File Scan · No macros or threats found', '5h ago', 'safe', 'CLEAN'],
            ['green', Icons.qr, 'payment-qr.png', 'QR Scan · Destination verified', '1d ago', 'safe', 'SAFE'],
          ].map(([col, ic, t, s, time, pill, pillText]) => `
            <div class="list-item">
              <div class="list-icon ${col}">${ic}</div>
              <div class="list-body"><div class="list-title">${esc(t)}</div><div class="list-sub">${esc(s)}</div></div>
              <div class="list-end"><span class="pill ${pill}">${pillText}</span><div style="margin-top:4px">${time}</div></div>
            </div>`).join('')}
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

  /* ---------- Neon Nigeria threat map ----------
     Real national boundary traced from Nigeria GeoJSON border data,
     cities placed by projecting their true lat/lon coordinates. */
  nigeriaMap() {
    const outline = 'M176.3 268.1L147.6 278.1L137.2 276.6L126.6 282.8L104.5 282.2L89.7 264.9L80.6 245L61.1 226.8L40.4 227.1L16 227.1L17.6 182.6L16.9 165.1L22.1 147.7L30.6 139.2L44 122.1L41.1 114.7L46.5 103.6L40.3 87.2L41.4 78.1L43.3 53.4L51.2 42.3L55.1 26.4L62.3 20.5L91.9 17.2L119.6 27.5L129.9 37.9L144 38.4L157.1 31.6L190.5 45.9L204.6 45.2L220.9 33.4L237 34.3L245 30.4L259.8 32L281.2 40.1L302.8 24.6L309.3 25.7L327.9 55.9L333.1 55.3L344 66.3L341 71.3L339.5 80.5L316.3 101.8L309 119.4L305.1 133.8L299.2 139.9L293.7 159.3L278.9 170.6L274.6 184.6L268.4 195.7L265.9 207.2L246.9 216.5L231.4 205.1L220.9 205.6L204.5 221.7L196.5 222L183.4 248.6L176.3 268.1Z';
    const nodes = [
      { x: 35.3, y: 221.8, c: '#00FF88', city: 'Lagos', n: 214 },
      { x: 148.4, y: 149.8, c: '#00C8FF', city: 'Abuja', n: 158 },
      { x: 176.8, y: 68.7, c: '#FF4D6D', city: 'Kano', n: 96 },
      { x: 135.2, y: 266.8, c: '#FFB020', city: 'Port Harcourt', n: 74 },
      { x: 49.3, y: 196.2, c: '#A78BFA', city: 'Ibadan', n: 52 },
      { x: 149, y: 222.1, c: '#00C8FF', city: 'Enugu', n: 43 },
      { x: 147, y: 109.5, c: '#FF4D6D', city: 'Kaduna', n: 38 },
      { x: 304.9, y: 72.8, c: '#FFB020', city: 'Maiduguri', n: 29 },
      { x: 96.8, y: 224.9, c: '#00FF88', city: 'Benin City', n: 24 },
    ];
    return `<div class="section-gap card glass ng-map-card">
      <div class="card-title">${Icons.globe} Live Threat Map — Nigeria<span class="spacer"></span><span class="pill danger"><span class="pdot"></span>LIVE</span></div>
      <div class="ng-map-wrap"><div class="chart-box"><svg viewBox="0 0 360 300">
        <defs>
          <linearGradient id="ngGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#00FF88"/><stop offset="1" stop-color="#00C8FF"/>
          </linearGradient>
          <clipPath id="ngClip"><path d="${outline}"/></clipPath>
        </defs>
        <g class="ng-grid" clip-path="url(#ngClip)">
          ${Array.from({ length: 12 }, (_, i) => `<line x1="${15 + i * 30}" y1="10" x2="${15 + i * 30}" y2="292"/>`).join('')}
          ${Array.from({ length: 10 }, (_, i) => `<line x1="10" y1="${15 + i * 30}" x2="350" y2="${15 + i * 30}"/>`).join('')}
        </g>
        <path class="ng-outline" d="${outline}"/>
        ${nodes.map(nd => `<g class="ng-node hit" data-tip-label="${nd.city}" data-tip-value="${nd.n} threats blocked" data-tip-color="${nd.c}">
          <circle class="pulse" cx="${nd.x}" cy="${nd.y}" r="7" fill="none" stroke="${nd.c}" stroke-width="1.5"/>
          <circle cx="${nd.x}" cy="${nd.y}" r="13" fill="transparent"/>
          <circle cx="${nd.x}" cy="${nd.y}" r="4" fill="${nd.c}" style="filter:drop-shadow(0 0 5px ${nd.c})"/>
        </g>`).join('')}
      </svg></div></div>
      <div class="ng-stats">
        <div class="ng-stat"><div class="n" style="color:var(--green)">675</div><div class="l">Blocked Today</div></div>
        <div class="ng-stat"><div class="n" style="color:var(--red)">7</div><div class="l">Active Hotspots</div></div>
        <div class="ng-stat"><div class="n" style="color:var(--blue)">36</div><div class="l">States Covered</div></div>
      </div>
      <p class="hint" style="text-align:center;margin-top:10px">Tap a glowing node to see live threat activity in that city.</p>
    </div>`;
  },
};
