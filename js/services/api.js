/* ============================================================
   SENTINEL AI — API Service Layer (REAL BACKEND)
   ------------------------------------------------------------
   Talks to the PHP + MySQL/SQLite backend at /api/*.
   All scanning is performed server-side by the real engine
   (live DNS/TLS probes, signature DB, magic-byte file analysis).
   ============================================================ */

const API = {
  BASE: '/api',

  token() { return localStorage.getItem('sentinel_token'); },

  async request(path, { method = 'GET', body, form } = {}) {
    const headers = {};
    if (!form) headers['Content-Type'] = 'application/json';
    if (API.token()) headers['Authorization'] = 'Bearer ' + API.token();
    let res;
    try {
      res = await fetch(API.BASE + path, { method, headers, body: form ? form : (body ? JSON.stringify(body) : undefined) });
    } catch (e) {
      throw new Error('Cannot reach the Sentinel API. Is the server running?');
    }
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && path !== '/login') { App.logout(true); throw new Error('Session expired — please sign in again.'); }
    if (!res.ok) throw new Error(data.error || 'Request failed (' + res.status + ')');
    return data;
  },

  /* ---------- AUTH ---------- */
  login: (email, password) => API.request('/login', { method: 'POST', body: { email, password } }),
  register: (name, email, password) => API.request('/register', { method: 'POST', body: { name, email, password } }),
  forgotPassword: (email) => API.request('/forgot-password', { method: 'POST', body: { email } }),
  verifyEmail: (code) => API.request('/verify-email', { method: 'POST', body: { code } }),
  me: () => API.request('/me'),
  updateProfile: (name, company) => API.request('/profile', { method: 'PUT', body: { name, company } }),

  /* ---------- SCANNERS (server-side real analysis) ---------- */
  linkScan: (url) => API.request('/link-scan', { method: 'POST', body: { url } }),
  emailScan: (content) => API.request('/email-scan', { method: 'POST', body: { content } }),
  smsScan: (content) => API.request('/sms-scan', { method: 'POST', body: { content } }),
  qrScan: (decoded) => API.request('/qr-scan', { method: 'POST', body: { decoded } }),
  fileScan: (file) => {
    const form = new FormData();
    form.append('file', file);
    return API.request('/file-scan', { method: 'POST', form });
  },
  breachCheck: (email) => API.request('/breach-check', { method: 'POST', body: { email } }),

  /* Password strength stays 100% local by design — never transmitted. */
  passwordCheck: (password) => Promise.resolve(PasswordLocal.check(password)),

  /* ---------- DATA ---------- */
  chat: (message, history, session_id) => API.request('/chat', { method: 'POST', body: { message, history, session_id } }),
  getDashboard: () => API.request('/dashboard'),
  getThreatIntel: () => API.request('/threat-intel'),
  getNotifications: () => API.request('/notifications'),
  markNotificationsRead: () => API.request('/notifications/read', { method: 'POST' }),
  getReports: () => API.request('/reports'),
  createReport: () => API.request('/reports', { method: 'POST' }),

  /* ---------- ADMIN ---------- */
  admin: {
    stats: () => API.request('/admin/stats'),
    users: () => API.request('/admin/users'),
    updateUser: (id, patch) => API.request('/admin/users/' + id, { method: 'PUT', body: patch }),
    signatures: () => API.request('/admin/signatures'),
    addSignature: (s) => API.request('/admin/signatures', { method: 'POST', body: s }),
    toggleSignature: (id, enabled) => API.request('/admin/signatures/' + id, { method: 'PUT', body: { enabled: enabled ? 1 : 0 } }),
    deleteSignature: (id) => API.request('/admin/signatures/' + id, { method: 'DELETE' }),
    blocklist: () => API.request('/admin/blocklist'),
    addBlock: (b) => API.request('/admin/blocklist', { method: 'POST', body: b }),
    deleteBlock: (id) => API.request('/admin/blocklist/' + id, { method: 'DELETE' }),
    addIntel: (t) => API.request('/admin/intel', { method: 'POST', body: t }),
    toggleIntel: (id, active) => API.request('/admin/intel/' + id, { method: 'PUT', body: { active: active ? 1 : 0 } }),
    settings: () => API.request('/admin/settings'),
    saveSettings: (s) => API.request('/admin/settings', { method: 'POST', body: s }),
    broadcast: (n) => API.request('/admin/broadcast', { method: 'POST', body: n }),
  },
};

/* ============================================================
   PasswordLocal — client-side strength analysis (by design:
   passwords must never leave the user's device).
   ============================================================ */
const PasswordLocal = {
  check(pw) {
    const len = pw.length;
    const sets = [/[a-z]/.test(pw), /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^a-zA-Z0-9]/.test(pw)];
    const pool = (sets[0] ? 26 : 0) + (sets[1] ? 26 : 0) + (sets[2] ? 10 : 0) + (sets[3] ? 32 : 0);
    const entropy = len ? +(len * Math.log2(pool || 1)).toFixed(1) : 0;
    const common = ['password', '123456', 'qwerty', 'admin', 'letmein', 'welcome', 'abc123', 'password1', '12345678', 'iloveyou'];
    const isCommon = common.includes(pw.toLowerCase());
    let score = Math.min(100, Math.round(entropy * 1.1));
    if (isCommon) score = 4;
    const seconds = Math.pow(2, entropy) / 1e10;
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
};

/* Back-compat shim: a few views referenced Sim.passwordCheck directly. */
const Sim = { passwordCheck: PasswordLocal.check };
