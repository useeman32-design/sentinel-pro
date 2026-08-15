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

      ${ThreatMap.html()}

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

};
