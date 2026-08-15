/* ============================================================
   SENTINEL AI — Notifications · Settings · Profile
   ============================================================ */

const MiscViews = {
  /* ---------- NOTIFICATIONS ---------- */
  notifications() {
    return `<div id="notif-root">${'<div class="skel" style="height:74px;margin-bottom:10px"></div>'.repeat(4)}</div>`;
  },
  async bindNotifications() {
    let items;
    try {
      const res = await API.getNotifications();
      items = res.items.map(n => ({ type: n.type, title: n.title, text: n.body || '', unread: !n.read_at,
        time: n.created_at ? new Date(n.created_at.replace(' ', 'T') + 'Z').getTime() : Date.now() }));
    } catch (e) { toast(e.message, 'err'); return; }
    const root = document.getElementById('notif-root');
    if (!root) return;
    State.unread = 0;
    App.refreshBadges();
    const iconFor = t => t === 'danger' ? ['red', Icons.alert] : t === 'warn' ? ['amber', Icons.key] : t === 'ok' ? ['green', Icons.check] : ['blue', Icons.info];
    root.innerHTML = `
      <div style="display:flex;justify-content:flex-end;margin-bottom:12px">
        <button class="btn btn-ghost btn-sm" onclick="API.markNotificationsRead().then(()=>{toast('All notifications marked as read.','ok');App.renderPage();})">Mark all read</button></div>
      ${items.map((n, i) => {
        const [col, ic] = iconFor(n.type);
        return `<div class="notif-item ${n.unread ? 'unread' : ''}" style="animation-delay:${i * 60}ms">
          <div class="list-icon ${col}">${ic}</div>
          <div class="notif-body">
            <div class="notif-title">${esc(n.title)}</div>
            <div class="notif-text">${esc(n.text)}</div>
            <div class="notif-time">${timeAgo(n.time)}</div>
          </div></div>`;
      }).join('')}`;
  },

  /* ---------- SETTINGS ---------- */
  settings() {
    const s = State.settings;
    return `
      <div class="card">
        <div class="card-title">${Icons.settings} Appearance</div>
        <div class="set-row"><div class="set-body"><div class="set-title">Theme</div><div class="set-sub">Dark is the Sentinel default. Light mode available for bright environments.</div></div>
          <div class="tabs" style="flex:none;padding:4px">
            <button class="tab ${s.theme !== 'light' ? 'active' : ''}" data-theme-btn="dark">🌙 Dark</button>
            <button class="tab ${s.theme === 'light' ? 'active' : ''}" data-theme-btn="light">☀️ Light</button>
          </div></div>
        <div class="set-row"><div class="set-body"><div class="set-title">Language</div><div class="set-sub">Interface language</div></div>
          <select class="input" id="set-lang" style="width:auto">
            <option ${s.lang === 'en' ? 'selected' : ''} value="en">English</option>
            <option ${s.lang === 'ha' ? 'selected' : ''} value="ha">Hausa</option>
            <option ${s.lang === 'yo' ? 'selected' : ''} value="yo">Yorùbá</option>
            <option ${s.lang === 'ig' ? 'selected' : ''} value="ig">Igbo</option>
            <option ${s.lang === 'pcm' ? 'selected' : ''} value="pcm">Nigerian Pidgin</option>
          </select></div>
      </div>

      <div class="section-gap card">
        <div class="card-title">${Icons.bell} Notifications</div>
        ${[['notifThreats', 'High-risk threat alerts', 'Immediate alerts when a scan detects danger'],
           ['notifWeekly', 'Weekly security digest', 'Summary report every Monday morning'],
           ['notifNews', 'Threat intelligence news', 'Trending scams and campaigns in Nigeria']].map(([k, t, sub]) => `
          <div class="set-row"><div class="set-body"><div class="set-title">${t}</div><div class="set-sub">${sub}</div></div>
            <label class="toggle"><input type="checkbox" data-set="${k}" ${s[k] !== false ? 'checked' : ''}><span class="tk"></span></label></div>`).join('')}
      </div>

      <div class="section-gap card">
        <div class="card-title">${Icons.key} API Keys</div>
        <div class="set-row"><div class="set-body"><div class="set-title">Gemini API Key</div>
          <div class="set-sub">Powers live AI answers in the Security Assistant. Stored only in this browser. For production, route through the PHP backend instead.</div>
          <div class="input-row" style="margin-top:10px;max-width:440px">
            <input class="input" type="password" id="gemini-key" placeholder="AIza..." value="${esc(AI.apiKey())}">
            <button type="button" class="input-eye" data-eye>${Icons.eye}</button>
          </div></div></div>
        <button class="btn btn-primary btn-sm" style="width:auto" id="save-key-btn">Save Key</button>
      </div>

      <div class="section-gap card">
        <div class="card-title">${Icons.lock} Privacy &amp; Security</div>
        ${[['twoFA', 'Two-factor authentication', 'Require an OTP at every sign-in (backend: /api/2fa)'],
           ['anonTelemetry', 'Anonymous threat telemetry', 'Share anonymized scan verdicts to improve detection for all Nigerians'],
           ['localOnly', 'Local-only password analysis', 'Passwords are never transmitted — always on']].map(([k, t, sub], i) => `
          <div class="set-row"><div class="set-body"><div class="set-title">${t}</div><div class="set-sub">${sub}</div></div>
            <label class="toggle"><input type="checkbox" data-set="${k}" ${(k === 'localOnly' || s[k]) ? 'checked' : ''} ${k === 'localOnly' ? 'disabled' : ''}><span class="tk"></span></label></div>`).join('')}
      </div>

      <div class="section-gap card">
        <div class="card-title">${Icons.user} Account</div>
        <div class="set-row"><div class="set-body"><div class="set-title">Change password</div><div class="set-sub">Update your sign-in credentials</div></div>
          <button class="btn btn-ghost btn-sm" onclick="location.hash='#/reset'">Change</button></div>
        <div class="set-row"><div class="set-body"><div class="set-title">Export my data</div><div class="set-sub">Download all scans and reports (backend: /api/export)</div></div>
          <button class="btn btn-ghost btn-sm" onclick="toast('Export queued — you\\'ll get an email when ready.','ok')">Export</button></div>
        <div class="set-row"><div class="set-body"><div class="set-title">Delete account</div><div class="set-sub">Permanently remove your account and data</div></div>
          <button class="btn btn-danger btn-sm" onclick="toast('Account deletion requires email confirmation.','info')">Delete</button></div>
      </div>`;
  },
  bindSettings() {
    document.querySelectorAll('[data-theme-btn]').forEach(b => b.addEventListener('click', () => {
      State.settings.theme = b.dataset.themeBtn;
      App.saveSettings(); App.applyTheme();
      document.querySelectorAll('[data-theme-btn]').forEach(x => x.classList.toggle('active', x === b));
      toast(`Switched to ${b.dataset.themeBtn} mode.`, 'ok');
    }));
    document.getElementById('set-lang').addEventListener('change', e => {
      State.settings.lang = e.target.value; App.saveSettings();
      toast('Language preference saved. Full translations arrive with the backend.', 'ok');
    });
    document.querySelectorAll('[data-set]').forEach(t => t.addEventListener('change', () => {
      State.settings[t.dataset.set] = t.checked; App.saveSettings();
    }));
    const eye = document.querySelector('#gemini-key + .input-eye, .input-row [data-eye]');
    if (eye) eye.addEventListener('click', () => {
      const inp = document.getElementById('gemini-key');
      const show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      eye.innerHTML = show ? Icons.eyeOff : Icons.eye;
    });
    document.getElementById('save-key-btn').addEventListener('click', () => {
      const v = document.getElementById('gemini-key').value.trim();
      if (v) { localStorage.setItem('sentinel_gemini_key', v); toast('Gemini key saved — the Assistant is now live-AI powered. 🔥', 'ok'); }
      else { localStorage.removeItem('sentinel_gemini_key'); toast('Gemini key removed. Assistant reverts to built-in knowledge.', 'info'); }
    });
  },

  /* ---------- MORE (mobile hub) ---------- */
  more() {
    const u = State.user || { name: 'Guest User', email: 'guest@sentinel.ai', plan: 'Free' };
    const initials = u.name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
    const tile = (href, icon, bg, fg, name, sub) => `
      <a class="more-tile" href="${href}">
        <div class="mt-icon" style="background:${bg};color:${fg}">${icon}</div>
        <div class="mt-name">${name}</div><div class="mt-sub">${sub}</div>
      </a>`;
    return `
      <a class="card glass" href="#/profile" style="display:flex;align-items:center;gap:14px;text-decoration:none;color:var(--text)">
        <div class="avatar" style="width:52px;height:52px;font-size:18px">${initials}</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:15px">${esc(u.name)}</div>
          <div class="hint">${esc(u.email)}</div>
        </div>
        <span class="pill info">${esc(u.plan || 'Free')}</span>
      </a>

      <div class="nav-group" style="padding-left:2px">Tools &amp; Insights</div>
      <div class="more-grid">
        ${tile('#/profile', Icons.user, 'var(--green-dim)', 'var(--green)', 'Profile', 'Account & subscription')}
        ${tile('#/reports', Icons.report, 'var(--blue-dim)', 'var(--blue)', 'Reports', 'Export security PDFs')}
        ${tile('#/training', Icons.grad, 'var(--amber-dim)', 'var(--amber)', 'Cyber Academy', 'Courses & certificates')}
        ${tile('#/assistant', Icons.bot, 'var(--red-dim)', 'var(--red)', 'AI Assistant', 'Ask security questions')}
      </div>

      <div class="nav-group" style="padding-left:2px">Protection</div>
      <div class="more-grid">
        ${tile('#/password-checker', Icons.key, 'var(--blue-dim)', 'var(--blue)', 'Password Checker', 'Strength & crack time')}
        ${tile('#/breach-monitor', Icons.eye, 'var(--amber-dim)', 'var(--amber)', 'Breach Monitor', 'Email exposure check')}
        ${tile('#/notifications', Icons.bell, 'var(--red-dim)', 'var(--red)', 'Notifications', 'Alerts & activity')}
        ${tile('#/settings', Icons.settings, 'var(--green-dim)', 'var(--green)', 'Settings', 'Theme, language, keys')}
      </div>

      <div class="section-gap card" style="text-align:center">
        <div style="display:flex;justify-content:center;margin-bottom:8px">${logoSVG(34)}</div>
        <div style="font-family:var(--font-display);font-weight:700;font-size:14px">SENTINEL <span style="color:var(--green)">AI</span></div>
        <div class="hint" style="margin-top:3px">Detect. Protect. Prevent. · v1.0</div>
        <button class="btn btn-danger btn-sm" style="width:auto;margin-top:14px" onclick="App.logout()">${Icons.logout} Sign Out</button>
      </div>`;
  },

  /* ---------- PROFILE ---------- */
  profile() {
    const u = State.user || { name: 'Guest User', email: 'guest@sentinel.ai', plan: 'Free', role: 'Member' };
    const initials = u.name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
    return `
      <div class="card glass">
        <div class="profile-head">
          <div class="avatar">${initials}</div>
          <div style="flex:1;min-width:0">
            <div class="profile-name">${esc(u.name)}</div>
            <div class="profile-mail">${esc(u.email)}</div>
            <div style="display:flex;gap:8px;margin-top:9px;flex-wrap:wrap;justify-content:inherit">
              <span class="pill safe"><span class="pdot"></span>Active</span>
              <span class="pill info">${esc(u.plan || 'Free')} Plan</span>
              <span class="tag">${esc(u.role || 'Member')}</span>
            </div>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="toast('Photo upload arrives with the PHP backend (/api/profile/photo).','info')">Change Photo</button>
        </div>
      </div>

      <div class="section-gap grid grid-2">
        <div class="card">
          <div class="card-title">${Icons.user} Personal Information</div>
          <form id="profile-form">
            <div class="field"><label>Full name</label><input class="input" name="name" value="${esc(u.name)}"></div>
            <div class="field"><label>Email</label><input class="input" name="email" value="${esc(u.email)}" disabled></div>
            <div class="field"><label>Company</label><input class="input" name="company" value="${esc(u.company || '')}" placeholder="Company or organization"></div>
            <div class="field"><label>Role</label><input class="input" name="role" value="${esc(u.role || 'Member')}"></div>
            <button class="btn btn-primary btn-sm" style="width:auto">Save Changes</button>
          </form>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="card">
            <div class="card-title">${Icons.shieldCheck} Subscription</div>
            <div class="stat-value" style="font-size:22px">${esc(u.plan || 'Free')} Plan</div>
            <p class="hint" style="margin:6px 0 14px">Free: 25 scans/day · Pro: unlimited scans, breach monitoring, API access, priority support.</p>
            <button class="btn btn-primary btn-sm" style="width:auto" onclick="toast('Billing integration (Paystack) ships with the backend.','info')">⚡ Upgrade to Pro</button>
          </div>
          <div class="card">
            <div class="card-title">${Icons.activity} Account Activity</div>
            ${[['Signed in', 'Abuja, NG · Chrome on Windows', 'Today, 09:12'],
               ['Link scan performed', 'gtb-secure-login.tk flagged', 'Today, 08:47'],
               ['Password changed', 'Via account settings', 'Aug 10, 14:03']].map(([t, s, time]) => `
              <div class="list-item"><div class="list-icon blue">${Icons.clock}</div>
                <div class="list-body"><div class="list-title">${t}</div><div class="list-sub">${s}</div></div>
                <div class="list-end">${time}</div></div>`).join('')}
          </div>
        </div>
      </div>`;
  },
  bindProfile() {
    document.getElementById('profile-form').addEventListener('submit', async e => {
      e.preventDefault();
      const f = new FormData(e.target);
      try {
        await API.updateProfile(f.get('name'), f.get('company'));
        if (State.user) {
          State.user.name = f.get('name');
          State.user.company = f.get('company');
          localStorage.setItem('sentinel_user', JSON.stringify(State.user));
        }
        toast('Profile updated.', 'ok');
        App.renderChrome();
      } catch (e) { toast(e.message, 'err'); }
    });
  },
};
