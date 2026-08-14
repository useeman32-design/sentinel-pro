/* ============================================================
   SENTINEL AI — API Service Layer
   ------------------------------------------------------------
   All backend communication flows through this file.
   Endpoints are PLACEHOLDERS that will be implemented by the
   custom PHP + MySQL backend later. Until then, every call
   falls back to a realistic client-side simulation so the UI
   is fully demonstrable.

   PHP backend contract (planned):
     POST /api/login            { email, password }        -> { token, user }
     POST /api/register         { name, email, password }  -> { token, user }
     POST /api/forgot-password  { email }                  -> { ok }
     POST /api/reset-password   { token, password }        -> { ok }
     POST /api/verify-email     { code }                   -> { ok }
     POST /api/link-scan        { url }                    -> ScanResult
     POST /api/email-scan       { content | file }         -> ScanResult
     POST /api/sms-scan         { content }                -> ScanResult
     POST /api/qr-scan          { file }                   -> ScanResult
     POST /api/file-scan        { file }                   -> ScanResult
     POST /api/password-check   { password }               -> StrengthResult
     POST /api/breach-check     { email }                  -> BreachResult
     POST /api/chat             { message, history }       -> { reply }
     GET  /api/reports          -> Report[]
     GET  /api/threat-intel     -> IntelFeed
     GET  /api/notifications    -> Notification[]

   MySQL models (planned — see /models/schema.sql)
   ============================================================ */

const API = {
  BASE: '/api',
  USE_BACKEND: false, // flip to true once the PHP API is deployed

  token() { return localStorage.getItem('sentinel_token'); },

  async request(path, { method = 'GET', body, isForm = false } = {}) {
    if (!API.USE_BACKEND) throw new Error('BACKEND_OFFLINE');
    const headers = {};
    if (!isForm) headers['Content-Type'] = 'application/json';
    if (API.token()) headers['Authorization'] = 'Bearer ' + API.token();
    const res = await fetch(API.BASE + path, {
      method, headers,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
    if (!res.ok) throw new Error('API_ERROR_' + res.status);
    return res.json();
  },

  /* ---------- AUTH ---------- */
  async login(email, password, remember) {
    try { return await API.request('/login', { method: 'POST', body: { email, password } }); }
    catch (e) { return Sim.login(email, password, remember); }
  },
  async register(name, email, password) {
    try { return await API.request('/register', { method: 'POST', body: { name, email, password } }); }
    catch (e) { return Sim.register(name, email, password); }
  },
  async forgotPassword(email) {
    try { return await API.request('/forgot-password', { method: 'POST', body: { email } }); }
    catch (e) { return Sim.delay({ ok: true }); }
  },
  async resetPassword(token, password) {
    try { return await API.request('/reset-password', { method: 'POST', body: { token, password } }); }
    catch (e) { return Sim.delay({ ok: true }); }
  },
  async verifyEmail(code) {
    try { return await API.request('/verify-email', { method: 'POST', body: { code } }); }
    catch (e) { return Sim.delay({ ok: code.length === 6 }); }
  },

  /* ---------- SCANNERS ---------- */
  async linkScan(url) {
    try { return await API.request('/link-scan', { method: 'POST', body: { url } }); }
    catch (e) { return Sim.linkScan(url); }
  },
  async emailScan(content) {
    try { return await API.request('/email-scan', { method: 'POST', body: { content } }); }
    catch (e) { return Sim.emailScan(content); }
  },
  async smsScan(content) {
    try { return await API.request('/sms-scan', { method: 'POST', body: { content } }); }
    catch (e) { return Sim.smsScan(content); }
  },
  async qrScan(fileName) {
    try { return await API.request('/qr-scan', { method: 'POST', body: { fileName } }); }
    catch (e) { return Sim.qrScan(fileName); }
  },
  async fileScan(fileName, size) {
    try { return await API.request('/file-scan', { method: 'POST', body: { fileName, size } }); }
    catch (e) { return Sim.fileScan(fileName, size); }
  },
  async passwordCheck(password) {
    // NOTE: strength analysis runs locally by design — passwords never leave the device.
    return Sim.passwordCheck(password);
  },
  async breachCheck(email) {
    try { return await API.request('/breach-check', { method: 'POST', body: { email } }); }
    catch (e) { return Sim.breachCheck(email); }
  },

  /* ---------- DATA ---------- */
  async chat(message, history) {
    try { return await API.request('/chat', { method: 'POST', body: { message, history } }); }
    catch (e) { return AI.chat(message, history); }
  },
  async getReports() {
    try { return await API.request('/reports'); }
    catch (e) { return Sim.reports(); }
  },
  async getThreatIntel() {
    try { return await API.request('/threat-intel'); }
    catch (e) { return Sim.threatIntel(); }
  },
  async getNotifications() {
    try { return await API.request('/notifications'); }
    catch (e) { return Sim.notifications(); }
  },
};

/* ============================================================
   Sim — deterministic client-side simulation used until the
   PHP backend ships. Heuristics are real (keyword/pattern
   analysis) so demos behave believably.
   ============================================================ */
const Sim = {
  delay(data, ms) { return new Promise(r => setTimeout(() => r(data), ms ?? (900 + Math.random() * 900))); },

  login(email, password, remember) {
    const users = JSON.parse(localStorage.getItem('sentinel_users') || '{}');
    const u = users[email.toLowerCase()];
    if (!u || u.password !== password) return Sim.delay({ error: 'Invalid email or password.' });
    const user = { name: u.name, email: email.toLowerCase(), company: u.company || '', role: u.role || 'Member', plan: u.plan || 'Free', verified: true };
    return Sim.delay({ token: 'sim-' + btoa(email), user, remember });
  },
  register(name, email, password) {
    const users = JSON.parse(localStorage.getItem('sentinel_users') || '{}');
    if (users[email.toLowerCase()]) return Sim.delay({ error: 'An account with this email already exists.' });
    users[email.toLowerCase()] = { name, password, plan: 'Free', role: 'Member' };
    localStorage.setItem('sentinel_users', JSON.stringify(users));
    return Sim.delay({ token: 'sim-' + btoa(email), user: { name, email: email.toLowerCase(), plan: 'Free', role: 'Member', verified: false } });
  },

  _riskFromSignals(signals, base) {
    let score = base;
    signals.forEach(s => { if (s.hit) score += s.w; });
    return Math.max(2, Math.min(98, score));
  },

  linkScan(url) {
    const u = url.toLowerCase();
    const signals = [
      { hit: !/^https:/.test(u), w: 18, msg: 'Connection is not HTTPS-encrypted' },
      { hit: /@|%40/.test(u), w: 22, msg: 'URL contains an “@” credential trick' },
      { hit: /(bit\.ly|tinyurl|t\.co|cutt\.ly|rb\.gy|shorturl)/.test(u), w: 16, msg: 'Shortened URL hides the real destination' },
      { hit: /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(u), w: 24, msg: 'Raw IP address used instead of a domain' },
      { hit: /(login|verify|secure|account|update|confirm|wallet|airdrop|bonus|giveaway|promo)/.test(u), w: 14, msg: 'Contains phishing-bait keywords' },
      { hit: /(gtbank|zenith|firstbank|uba|accessbank|opay|palmpay|kuda|moniepoint|paystack|flutterwave|nibss|cbn)/.test(u) && !/\.(com|ng|africa)($|\/)/.test(u.split('/')[2] || ''), w: 30, msg: 'Impersonates a Nigerian financial brand on a suspicious domain' },
      { hit: /(\.tk|\.ml|\.ga|\.cf|\.gq|\.xyz|\.top|\.club)($|\/)/.test(u), w: 15, msg: 'Free/cheap TLD frequently abused by scammers' },
      { hit: (u.match(/-/g) || []).length > 3, w: 8, msg: 'Excessive hyphens in domain' },
      { hit: u.length > 90, w: 6, msg: 'Unusually long URL' },
    ];
    const risk = Sim._riskFromSignals(signals, 6);
    const verdict = risk >= 65 ? 'danger' : risk >= 35 ? 'warn' : 'safe';
    const hits = signals.filter(s => s.hit).map(s => s.msg);
    return Sim.delay({
      verdict, risk,
      threatType: verdict === 'danger' ? 'Phishing / Credential Harvesting' : verdict === 'warn' ? 'Potentially Unwanted / Deceptive' : 'None Detected',
      explanation: hits.length ? 'Flagged signals: ' + hits.join('; ') + '.' : 'No known phishing patterns, deceptive keywords, or infrastructure red flags were found for this URL.',
      recommendation: verdict === 'danger' ? 'Do NOT visit this link or enter any personal information. Block the sender and report to ngCERT (cert.gov.ng).' :
        verdict === 'warn' ? 'Proceed with caution. Verify the domain spelling and never enter banking credentials on this page.' :
        'This link appears safe, but always confirm the domain before entering sensitive data.',
      subject: url,
    }, 1600 + Math.random() * 1200);
  },

  emailScan(content) {
    const c = (content || '').toLowerCase();
    const signals = [
      { hit: /(urgent|immediately|within 24|within 48|act now|final notice|suspended)/.test(c), w: 16, msg: 'Creates false urgency' },
      { hit: /(verify your account|confirm your identity|update your (kyc|bvn|details)|re-?activate)/.test(c), w: 20, msg: 'Requests account verification — classic phishing' },
      { hit: /(bvn|nin|atm pin|card number|cvv|otp|one-time password)/.test(c), w: 26, msg: 'Asks for sensitive Nigerian banking identifiers (BVN/NIN/PIN/OTP)' },
      { hit: /(click (here|the link)|http:\/\/|bit\.ly|tinyurl)/.test(c), w: 12, msg: 'Pushes a suspicious link' },
      { hit: /(dear customer|dear user|dear beneficiary|valued customer)/.test(c), w: 10, msg: 'Generic greeting instead of your name' },
      { hit: /(won|winner|lottery|inheritance|million|compensation|grant|fund release)/.test(c), w: 22, msg: 'Advance-fee / lottery scam language' },
      { hit: /(cbn|central bank|efcc|nnpc|federal government)/.test(c) && /(fee|charge|payment|deposit)/.test(c), w: 24, msg: 'Impersonates Nigerian authority demanding payment' },
      { hit: /(mismatch|spoof|reply-to)/.test(c), w: 8, msg: 'Header anomalies' },
    ];
    const risk = Sim._riskFromSignals(signals, 5);
    const verdict = risk >= 60 ? 'danger' : risk >= 32 ? 'warn' : 'safe';
    const hits = signals.filter(s => s.hit).map(s => s.msg);
    return Sim.delay({
      verdict, risk,
      threatType: verdict === 'danger' ? 'Phishing Email' : verdict === 'warn' ? 'Suspicious Email' : 'Legitimate (No Threat Detected)',
      explanation: hits.length ? 'Detected indicators: ' + hits.join('; ') + '.' : 'The message contains no urgency traps, credential requests, scam language, or spoofing indicators.',
      recommendation: verdict === 'danger' ? 'Delete this email. Never click its links or reply. Report to your bank via official channels and forward to ngCERT.' :
        verdict === 'warn' ? 'Verify the sender through an official channel before acting. Hover links to inspect the real destination.' :
        'No action needed. Stay alert for unexpected attachments and links.',
      subject: 'Pasted email content (' + (content || '').length + ' chars)',
    }, 1700 + Math.random() * 1300);
  },

  smsScan(content) {
    const c = (content || '').toLowerCase();
    const catMap = [
      { cat: 'Bank Scam', re: /(bvn|acct|account (blocked|suspended)|debit|atm|card.*(block|expire)|kyc|upgrade)/, w: 26 },
      { cat: 'Lottery Scam', re: /(congratulation|won|winner|promo|prize|lucky|draw)/, w: 24 },
      { cat: 'Investment Scam', re: /(invest|profit|return|double your|forex|trading platform|roi)/, w: 24 },
      { cat: 'Crypto Scam', re: /(bitcoin|crypto|usdt|wallet|airdrop|binance)/, w: 22 },
      { cat: 'WhatsApp Scam', re: /(whatsapp|wa\.me|chat me|dm me)/, w: 16 },
    ];
    let matched = [];
    let score = 6;
    catMap.forEach(m => { if (m.re.test(c)) { matched.push(m.cat); score += m.w; } });
    if (/(http|bit\.ly|tinyurl|click)/.test(c)) { score += 14; matched.push('Malicious Link Delivery'); }
    if (/(urgent|now|today|immediately|last chance)/.test(c)) score += 10;
    const risk = Math.max(2, Math.min(98, score));
    const verdict = risk >= 55 ? 'danger' : risk >= 30 ? 'warn' : 'safe';
    return Sim.delay({
      verdict, risk,
      threatType: matched.length ? matched.join(' + ') : 'None Detected',
      explanation: matched.length ? `This SMS matches known ${matched.join(', ').toLowerCase()} patterns actively circulating in Nigeria.` : 'No scam signatures, malicious links, or urgency pressure detected in this message.',
      recommendation: verdict === 'danger' ? 'Do not reply, click links, or call numbers in this SMS. Block the sender and report to your network provider (forward to 7726).' :
        verdict === 'warn' ? 'Treat with suspicion. Contact the supposed sender through their official app or website — never via this SMS.' :
        'Message appears clean. Remember: banks never ask for your full BVN, PIN or OTP by SMS.',
      subject: 'SMS (' + (content || '').length + ' chars)',
    }, 1400 + Math.random() * 1100);
  },

  qrScan(fileName) {
    const roll = (fileName || '').length % 3;
    const outcomes = [
      { verdict: 'safe', risk: 8, threatType: 'None Detected', dest: 'https://legitimate-payments.example.com/checkout', explanation: 'The decoded destination resolves to a verified domain with valid TLS, no redirect chains, and no blocklist entries.', recommendation: 'Destination appears safe. Always confirm the merchant name before authorizing payment.' },
      { verdict: 'warn', risk: 47, threatType: 'Redirect Chain', dest: 'http://qr-pay-verify.xyz/r/8123', explanation: 'The QR resolves through 2 redirects to a recently registered .xyz domain without HTTPS — a pattern common in parking-meter and invoice QR fraud.', recommendation: 'Avoid entering payment details. Manually type the merchant’s official website instead.' },
      { verdict: 'danger', risk: 88, threatType: 'QRishing (QR Phishing)', dest: 'http://gtb-secure-login.tk/verify', explanation: 'Decoded URL impersonates a Nigerian bank on a free .tk domain and requests login credentials. This QR is part of a known phishing kit.', recommendation: 'Do NOT open this destination. Report the QR location and warn others; notify the impersonated bank.' },
    ];
    const o = outcomes[roll];
    return Sim.delay({ ...o, subject: fileName || 'uploaded-qr.png', decoded: o.dest }, 1800 + Math.random() * 1000);
  },

  fileScan(fileName, size) {
    const ext = (fileName || '').split('.').pop().toLowerCase();
    const dangerousExt = ['exe', 'scr', 'bat', 'cmd', 'vbs', 'js', 'jar', 'msi', 'apk'];
    const riskyExt = ['zip', 'rar', '7z', 'docm', 'xlsm', 'iso'];
    let verdict = 'safe', risk = 6, threatType = 'None Detected',
      explanation = `Static analysis of “${fileName}” found no embedded macros, exploit signatures, obfuscated scripts, or known-malware hashes.`,
      recommendation = 'File appears clean. Keep your antivirus updated as a second layer.';
    if (dangerousExt.includes(ext)) {
      verdict = 'danger'; risk = 82; threatType = 'Potentially Malicious Executable';
      explanation = `“.${ext}” files can execute arbitrary code. Heuristic analysis flagged packing/obfuscation characteristics typical of trojans and info-stealers.`;
      recommendation = 'Do not run this file. If you did, disconnect from the internet and run a full antivirus scan immediately.';
    } else if (riskyExt.includes(ext)) {
      verdict = 'warn'; risk = 44; threatType = 'Archive / Macro Container';
      explanation = `“.${ext}” containers are frequently used to smuggle malware past email filters. Contents could not be fully verified.`;
      recommendation = 'Only extract or enable content if you trust the sender completely. Scan extracted files individually.';
    }
    return Sim.delay({ verdict, risk, threatType, explanation, recommendation, subject: `${fileName} (${(size / 1024).toFixed(1)} KB)` }, 2200 + Math.random() * 1400);
  },

  passwordCheck(pw) {
    const len = pw.length;
    const sets = [/[a-z]/.test(pw), /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^a-zA-Z0-9]/.test(pw)];
    const pool = (sets[0] ? 26 : 0) + (sets[1] ? 26 : 0) + (sets[2] ? 10 : 0) + (sets[3] ? 32 : 0);
    const entropy = len ? +(len * Math.log2(pool || 1)).toFixed(1) : 0;
    const common = ['password', '123456', 'qwerty', 'admin', 'letmein', 'welcome', 'abc123', 'password1', '12345678', 'iloveyou'];
    const isCommon = common.includes(pw.toLowerCase());
    let score = Math.min(100, Math.round(entropy * 1.1));
    if (isCommon) score = 4;
    const guessesPerSec = 1e10;
    const seconds = Math.pow(2, entropy) / guessesPerSec;
    let crackTime;
    if (isCommon || seconds < 1) crackTime = 'Instantly';
    else if (seconds < 60) crackTime = Math.round(seconds) + ' seconds';
    else if (seconds < 3600) crackTime = Math.round(seconds / 60) + ' minutes';
    else if (seconds < 86400) crackTime = Math.round(seconds / 3600) + ' hours';
    else if (seconds < 31557600) crackTime = Math.round(seconds / 86400) + ' days';
    else if (seconds < 31557600 * 1000) crackTime = Math.round(seconds / 31557600) + ' years';
    else crackTime = 'Centuries';
    const suggestions = [];
    if (len < 12) suggestions.push('Use at least 12 characters — length beats complexity.');
    if (!sets[1]) suggestions.push('Add uppercase letters.');
    if (!sets[2]) suggestions.push('Add numbers.');
    if (!sets[3]) suggestions.push('Add symbols (!, @, #, …).');
    if (isCommon) suggestions.push('This is one of the most breached passwords on earth — change it everywhere immediately.');
    if (!suggestions.length) suggestions.push('Excellent. Consider a password manager to keep it unique per site.');
    return { score, entropy, length: len, crackTime, sets, isCommon, suggestions,
      label: score >= 75 ? 'Strong' : score >= 50 ? 'Good' : score >= 25 ? 'Weak' : 'Very Weak' };
  },

  breachCheck(email) {
    const h = [...email].reduce((a, c) => a + c.charCodeAt(0), 0);
    const breached = h % 3 !== 0;
    const breaches = breached ? [
      { name: 'Collection #1 Combo List', date: '2019-01', data: 'Email, Password', records: '773M' },
      { name: 'NaijaLoaded Forum Leak', date: '2021-06', data: 'Email, Username, IP', records: '2.1M' },
      h % 2 ? { name: 'Fintech Aggregator Breach', date: '2023-11', data: 'Email, Phone, Partial card', records: '5.4M' } : null,
    ].filter(Boolean) : [];
    return Sim.delay({
      email, breached, breaches,
      recommendation: breached ?
        'Change the password on every account using this email — especially banking and email itself. Enable two-factor authentication (2FA) everywhere, and never reuse passwords.' :
        'No exposure found in known public breaches. Keep using unique passwords and enable 2FA as standard practice.',
    }, 1600 + Math.random() * 900);
  },

  reports() {
    return Sim.delay([
      { id: 'RPT-2041', title: 'Weekly Security Summary', date: 'Aug 11, 2026', risk: 'Low', threats: 3, status: 'Ready' },
      { id: 'RPT-2040', title: 'Phishing Campaign Analysis', date: 'Aug 8, 2026', risk: 'High', threats: 14, status: 'Ready' },
      { id: 'RPT-2039', title: 'Monthly Compliance Report', date: 'Aug 1, 2026', risk: 'Medium', threats: 9, status: 'Ready' },
      { id: 'RPT-2038', title: 'Password Hygiene Audit', date: 'Jul 25, 2026', risk: 'Medium', threats: 6, status: 'Archived' },
    ], 700);
  },

  threatIntel() {
    return Sim.delay({
      alerts: [
        { level: 'danger', title: 'Active: Fake CBN “account upgrade” SMS wave', desc: 'Mass SMS campaign impersonating the Central Bank of Nigeria directing victims to credential-harvesting pages. Over 12,000 reports this week.', time: '2h ago', tag: 'Phishing' },
        { level: 'danger', title: 'WhatsApp hijack via fake voting links', desc: 'Attackers send “vote for my child in a competition” links that capture WhatsApp verification codes and take over accounts.', time: '6h ago', tag: 'Account Takeover' },
        { level: 'warn', title: 'Ponzi platform “AgroYield 400%” trending', desc: 'Investment scam promising 400% agricultural returns spreading through Telegram and Facebook groups across Lagos and Abuja.', time: '1d ago', tag: 'Investment Fraud' },
        { level: 'warn', title: 'Malicious “Loan App” APKs on 3rd-party stores', desc: 'Predatory loan apps exfiltrating contacts and photos for blackmail. Avoid sideloading loan apps outside Google Play.', time: '1d ago', tag: 'Malware' },
        { level: 'info', title: 'New Android banking trojan variant detected', desc: 'The “Anatsa” family has added overlay attacks targeting two Nigerian mobile banking apps. Update your apps to the latest versions.', time: '2d ago', tag: 'Malware' },
      ],
      trends: [ { l: 'Mon', v: 132 }, { l: 'Tue', v: 158 }, { l: 'Wed', v: 141 }, { l: 'Thu', v: 189 }, { l: 'Fri', v: 214 }, { l: 'Sat', v: 176 }, { l: 'Sun', v: 148 } ],
      categories: [
        { l: 'Phishing', v: 412, c: '#FF4D6D' }, { l: 'Scam SMS', v: 288, c: '#FFB020' },
        { l: 'Malware', v: 143, c: '#00C8FF' }, { l: 'Identity Theft', v: 96, c: '#A78BFA' },
        { l: 'Other', v: 61, c: '#5A667D' },
      ],
    }, 800);
  },

  notifications() {
    return Sim.delay([
      { type: 'danger', title: 'High-risk link blocked', text: 'A link you scanned (gtb-secure-login.tk) was confirmed as an active phishing site.', time: Date.now() - 1000 * 60 * 22, unread: true },
      { type: 'warn', title: 'Weak password detected', text: 'One of your checked passwords scored 18/100. Update it as soon as possible.', time: Date.now() - 1000 * 60 * 60 * 3, unread: true },
      { type: 'info', title: 'New threat in your region', text: 'Fake CBN “account upgrade” SMS wave is trending in Nigeria. Stay alert.', time: Date.now() - 1000 * 60 * 60 * 7, unread: false },
      { type: 'ok', title: 'Weekly report ready', text: 'Your Weekly Security Summary (RPT-2041) is ready to view and export.', time: Date.now() - 1000 * 60 * 60 * 26, unread: false },
    ], 500);
  },
};
