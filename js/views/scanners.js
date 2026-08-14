/* ============================================================
   SENTINEL AI — Scanner modules
   Link · Email · SMS · QR · File · Password · Breach
   ============================================================ */

const Scanners = {
  /* ---------- shared result renderer ---------- */
  resultHTML(r) {
    const map = { safe: ['safe', Icons.shieldCheck, 'Safe'], warn: ['warn', Icons.alert, 'Suspicious'], danger: ['danger', Icons.x, 'Dangerous'] };
    const [cls, icon, label] = map[r.verdict] || map.warn;
    return `<div class="card result-card">
      <div class="verdict">
        <div class="verdict-icon ${cls}">${icon}</div>
        <div><div class="verdict-title">${label}</div><div class="verdict-sub">${esc(r.subject || '')}</div></div>
        <div class="verdict-score"><div class="vs-num" style="color:var(--${cls === 'safe' ? 'green' : cls === 'warn' ? 'amber' : 'red'})">${r.risk}</div><div class="vs-cap">Risk /100</div></div>
      </div>
      <div class="result-rows">
        ${r.decoded ? `<div class="result-row"><div class="rk">Decoded URL</div><div class="rv" style="font-family:monospace;font-size:12.5px">${esc(r.decoded)}</div></div>` : ''}
        <div class="result-row"><div class="rk">Threat Type</div><div class="rv"><span class="pill ${cls}">${esc(r.threatType)}</span></div></div>
        <div class="result-row"><div class="rk">Explanation</div><div class="rv">${esc(r.explanation)}</div></div>
        <div class="result-row"><div class="rk">Recommendation</div><div class="rv">${esc(r.recommendation)}</div></div>
      </div>
      <div class="divider"></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" onclick="toast('Added to your reports.','ok')">${Icons.report} Save to Reports</button>
        <button class="btn btn-ghost btn-sm" onclick="toast('Thanks — this improves detection for everyone.','ok')">${Icons.alert} Report False Result</button>
      </div>
    </div>`;
  },

  progressHTML(steps) {
    return `<div class="scan-progress" id="scan-progress">
      <div class="radar"><div class="radar-ring"></div><div class="radar-ring"></div><div class="radar-ring"></div><div class="radar-sweep"></div></div>
      <div class="sp-text">AI analysis in progress…</div>
      <div class="sp-step" id="scan-step">${steps[0]}</div>
    </div>`;
  },

  async runScan(container, steps, apiCall) {
    container.innerHTML = Scanners.progressHTML(steps);
    let i = 0;
    const stepEl = () => document.getElementById('scan-step');
    const iv = setInterval(() => { i = (i + 1) % steps.length; if (stepEl()) stepEl().textContent = steps[i]; }, 620);
    try {
      const result = await apiCall();
      clearInterval(iv);
      container.innerHTML = Scanners.resultHTML(result);
      container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (e) {
      clearInterval(iv);
      container.innerHTML = '';
      toast('Scan failed. Please try again.', 'err');
    }
  },

  hero(icon, title, sub) {
    return `<div class="scan-hero"><div class="hero-icon">${icon}</div><h2>${title}</h2><p>${sub}</p></div>`;
  },

  /* ---------- LINK SCANNER ---------- */
  link() {
    return `${Scanners.hero(Icons.link, 'AI Link Scanner', 'Paste any URL and Sentinel AI will analyze it for phishing, brand impersonation, malicious infrastructure, and deceptive patterns.')}
      <div class="scan-form card glass">
        <div class="scan-input-row">
          <input class="input" id="link-input" type="url" placeholder="https://suspicious-link.example.com/verify" inputmode="url">
          <button class="btn btn-primary" style="width:auto;flex:none" id="link-btn">${Icons.scan} Scan URL</button>
        </div>
        <p class="hint" style="margin-top:10px">Try a demo: paste <span class="kbd">http://gtbank-verify.tk/login</span> or any real link.</p>
      </div>
      <div id="scan-out"></div>`;
  },
  bindLink() {
    const go = () => {
      const url = document.getElementById('link-input').value.trim();
      if (!url) return toast('Please paste a URL first.', 'err');
      Scanners.runScan(document.getElementById('scan-out'),
        ['Resolving domain & TLS certificate…', 'Checking global blocklists…', 'Analyzing URL structure with AI…', 'Comparing against Nigerian phishing kits…', 'Computing risk score…'],
        () => API.linkScan(url));
    };
    document.getElementById('link-btn').addEventListener('click', go);
    document.getElementById('link-input').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  },

  /* ---------- EMAIL SCANNER ---------- */
  email() {
    return `${Scanners.hero(Icons.mail, 'Email Phishing Detector', 'Paste the full email content, upload a .eml file, or upload a screenshot. Our AI detects urgency traps, spoofing, and credential-harvesting attempts.')}
      <div class="scan-form">
        <div class="tabs" id="email-tabs">
          <button class="tab active" data-t="paste">Paste Email</button>
          <button class="tab" data-t="eml">Upload .eml</button>
          <button class="tab" data-t="shot">Screenshot</button>
        </div>
        <div class="card glass section-gap" id="email-pane-paste">
          <textarea class="input" id="email-input" placeholder="Paste the full email content here — including subject and sender if possible…"></textarea>
          <button class="btn btn-primary section-gap" id="email-btn">${Icons.scan} Analyze Email</button>
        </div>
        <div class="card glass section-gap" id="email-pane-eml" hidden>
          <div class="drop-zone" data-drop="eml">${Icons.upload}<div class="dz-title">Drop your .eml file here</div><div class="dz-sub">or tap to browse · max 10 MB</div>
            <input type="file" accept=".eml,message/rfc822" hidden></div>
        </div>
        <div class="card glass section-gap" id="email-pane-shot" hidden>
          <div class="drop-zone" data-drop="shot">${Icons.upload}<div class="dz-title">Drop email screenshot here</div><div class="dz-sub">PNG or JPG · OCR + AI analysis</div>
            <input type="file" accept="image/*" hidden></div>
        </div>
      </div>
      <div id="scan-out"></div>`;
  },
  bindEmail() {
    const tabs = document.getElementById('email-tabs');
    tabs.addEventListener('click', e => {
      const t = e.target.closest('.tab'); if (!t) return;
      tabs.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      ['paste', 'eml', 'shot'].forEach(k => document.getElementById('email-pane-' + k).hidden = k !== t.dataset.t);
    });
    const steps = ['Parsing headers & sender identity…', 'Checking SPF / DKIM alignment…', 'AI language analysis for urgency & pressure…', 'Extracting and validating links…', 'Computing phishing probability…'];
    document.getElementById('email-btn').addEventListener('click', () => {
      const v = document.getElementById('email-input').value.trim();
      if (v.length < 20) return toast('Paste more of the email content for accurate analysis.', 'err');
      Scanners.runScan(document.getElementById('scan-out'), steps, () => API.emailScan(v));
    });
    Scanners.bindDrops(file => {
      Scanners.runScan(document.getElementById('scan-out'), steps, () => API.emailScan('uploaded:' + file.name + ' dear customer verify your account urgent'));
    });
  },

  /* ---------- SMS SCANNER ---------- */
  sms() {
    return `${Scanners.hero(Icons.sms, 'SMS Scam Detector', 'Paste any SMS and Sentinel AI will match it against lottery, bank, investment, WhatsApp, and crypto scam patterns active in Nigeria.')}
      <div class="scan-form card glass">
        <textarea class="input" id="sms-input" placeholder='e.g. "Congratulations! Your number has won ₦5,000,000 in the MTN promo. Click bit.ly/claim-now to receive your prize…"'></textarea>
        <button class="btn btn-primary section-gap" id="sms-btn">${Icons.scan} Detect Scam</button>
      </div>
      <div id="scan-out"></div>`;
  },
  bindSms() {
    document.getElementById('sms-btn').addEventListener('click', () => {
      const v = document.getElementById('sms-input').value.trim();
      if (v.length < 10) return toast('Paste the SMS text first.', 'err');
      Scanners.runScan(document.getElementById('scan-out'),
        ['Tokenizing message content…', 'Matching against 40k+ Nigerian scam signatures…', 'AI intent classification…', 'Scoring risk level…'],
        () => API.smsScan(v));
    });
  },

  /* ---------- QR SCANNER ---------- */
  qr() {
    return `${Scanners.hero(Icons.qr, 'QR Code Scanner', 'Upload a photo of any QR code. Sentinel AI decodes the destination and verifies it before you ever visit — stopping QRishing attacks cold.')}
      <div class="scan-form card glass">
        <div class="drop-zone" data-drop="qr">${Icons.upload}<div class="dz-title">Drop QR image here</div><div class="dz-sub">or tap to browse · PNG / JPG</div>
          <input type="file" accept="image/*" hidden></div>
      </div>
      <div id="scan-out"></div>`;
  },
  bindQr() {
    Scanners.bindDrops(file => {
      Scanners.runScan(document.getElementById('scan-out'),
        ['Decoding QR matrix…', 'Extracting destination URL…', 'Following redirect chain safely…', 'AI destination analysis…'],
        () => API.qrScan(file.name));
    });
  },

  /* ---------- FILE SCANNER ---------- */
  file() {
    return `${Scanners.hero(Icons.file, 'File Scanner', 'Upload PDFs, Word documents, ZIP archives, images, or executables. Static AI analysis flags macros, exploits, and known-malware signatures before you open anything.')}
      <div class="scan-form card glass">
        <div class="drop-zone" data-drop="file">${Icons.upload}<div class="dz-title">Drop any file here</div><div class="dz-sub">PDF · DOCX · ZIP · Images · EXE — max 50 MB</div>
          <input type="file" hidden></div>
      </div>
      <div id="scan-out"></div>`;
  },
  bindFile() {
    Scanners.bindDrops(file => {
      Scanners.runScan(document.getElementById('scan-out'),
        ['Hashing file (SHA-256)…', 'Checking global malware databases…', 'Static structure analysis…', 'Scanning for embedded macros & scripts…', 'AI heuristic verdict…'],
        () => API.fileScan(file.name, file.size));
    });
  },

  /* ---------- drop zone helper ---------- */
  bindDrops(onFile) {
    document.querySelectorAll('.drop-zone').forEach(dz => {
      const input = dz.querySelector('input[type=file]');
      dz.addEventListener('click', () => input.click());
      input.addEventListener('change', () => { if (input.files[0]) onFile(input.files[0]); });
      dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag'); });
      dz.addEventListener('dragleave', () => dz.classList.remove('drag'));
      dz.addEventListener('drop', e => {
        e.preventDefault(); dz.classList.remove('drag');
        if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]);
      });
    });
  },

  /* ---------- PASSWORD CHECKER ---------- */
  password() {
    return `${Scanners.hero(Icons.key, 'Password Security Checker', 'Test password strength with entropy analysis and estimated crack time. Analysis runs 100% on your device — nothing is ever transmitted.')}
      <div class="scan-form card glass">
        <div class="input-row">
          <input class="input" type="password" id="pw-input" placeholder="Type a password to analyze…" autocomplete="off">
          <button type="button" class="input-eye" data-eye>${Icons.eye}</button>
        </div>
        <div id="pw-out" class="section-gap"></div>
      </div>`;
  },
  bindPassword() {
    const input = document.getElementById('pw-input');
    const eyeBtn = document.querySelector('[data-eye]');
    eyeBtn.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      eyeBtn.innerHTML = show ? Icons.eyeOff : Icons.eye;
    });
    input.addEventListener('input', () => {
      const out = document.getElementById('pw-out');
      if (!input.value) { out.innerHTML = ''; return; }
      const r = Sim.passwordCheck(input.value);
      const col = r.score >= 75 ? 'var(--green)' : r.score >= 50 ? 'var(--blue)' : r.score >= 25 ? 'var(--amber)' : 'var(--red)';
      out.innerHTML = `
        <div class="meter-row"><div class="m-head"><b style="color:${col}">${r.label} — ${r.score}/100</b><span>Entropy: ${r.entropy} bits</span></div>
          <div class="meter-track"><div class="meter-fill" style="width:${r.score}%;background:${col}"></div></div></div>
        <div class="grid grid-2" style="gap:10px;margin-top:14px">
          <div class="card" style="padding:14px"><div class="stat-label">${Icons.clock} CRACK TIME</div><div style="font-weight:700;font-size:17px;margin-top:6px;color:${col}">${r.crackTime}</div></div>
          <div class="card" style="padding:14px"><div class="stat-label">${Icons.key} LENGTH</div><div style="font-weight:700;font-size:17px;margin-top:6px">${r.length} characters</div></div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
          ${['lowercase', 'UPPERCASE', 'Numbers', 'Symbols'].map((n, i) =>
            `<span class="pill ${r.sets[i] ? 'safe' : 'danger'}">${r.sets[i] ? '✓' : '✗'} ${n}</span>`).join('')}
        </div>
        <div class="divider"></div>
        <div class="card-title" style="margin-bottom:8px">${Icons.info} Suggestions</div>
        ${r.suggestions.map(s => `<div class="list-item" style="padding:7px 0"><div class="list-icon blue" style="width:28px;height:28px;border-radius:8px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:13px"><path d="M20 6 9 17l-5-5"/></svg></div><div class="list-sub" style="white-space:normal;color:var(--text)">${s}</div></div>`).join('')}`;
    });
  },

  /* ---------- BREACH MONITOR ---------- */
  breach() {
    return `${Scanners.hero(Icons.eye, 'Breach Monitor', 'Check whether your email address has appeared in known public data breaches, and get a remediation plan.')}
      <div class="scan-form card glass">
        <div class="scan-input-row">
          <input class="input" type="email" id="breach-input" placeholder="you@company.com" inputmode="email">
          <button class="btn btn-primary" style="width:auto;flex:none" id="breach-btn">${Icons.search} Check Exposure</button>
        </div>
      </div>
      <div id="scan-out"></div>`;
  },
  bindBreach() {
    const go = async () => {
      const email = document.getElementById('breach-input').value.trim();
      if (!/.+@.+\..+/.test(email)) return toast('Enter a valid email address.', 'err');
      const out = document.getElementById('scan-out');
      out.innerHTML = Scanners.progressHTML(['Hashing email (k-anonymity)…', 'Querying breach corpus…', 'Cross-referencing paste sites…', 'Compiling exposure report…']);
      const r = await API.breachCheck(email);
      out.innerHTML = `<div class="card result-card">
        <div class="verdict">
          <div class="verdict-icon ${r.breached ? 'danger' : 'safe'}">${r.breached ? Icons.alert : Icons.shieldCheck}</div>
          <div><div class="verdict-title">${r.breached ? `Found in ${r.breaches.length} breach${r.breaches.length > 1 ? 'es' : ''}` : 'No exposure found'}</div>
          <div class="verdict-sub">${esc(r.email)}</div></div>
        </div>
        ${r.breached ? `<div class="table-wrap"><table class="tbl"><thead><tr><th>Breach</th><th>Date</th><th>Exposed Data</th><th>Records</th></tr></thead>
          <tbody>${r.breaches.map(b => `<tr><td><b>${esc(b.name)}</b></td><td>${b.date}</td><td>${esc(b.data)}</td><td>${b.records}</td></tr>`).join('')}</tbody></table></div><div class="divider"></div>` : ''}
        <div class="result-row"><div class="rk">Recommendation</div><div class="rv">${esc(r.recommendation)}</div></div>
      </div>`;
    };
    document.getElementById('breach-btn').addEventListener('click', go);
    document.getElementById('breach-input').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  },
};
