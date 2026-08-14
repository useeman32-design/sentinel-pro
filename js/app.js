/* ============================================================
   SENTINEL AI — App core: state, router, shell
   ============================================================ */

const State = {
  user: JSON.parse(localStorage.getItem('sentinel_user') || 'null'),
  settings: JSON.parse(localStorage.getItem('sentinel_settings') || '{"theme":"dark","lang":"en"}'),
  unread: 2,
  pendingEmail: null,
  pendingSession: null,
};

const ROUTES = {
  login:        { auth: false, view: () => AuthViews.login(),      bind: () => AuthViews.bind('login') },
  register:     { auth: false, view: () => AuthViews.register(),   bind: () => AuthViews.bind('register') },
  forgot:       { auth: false, view: () => AuthViews.forgot(),     bind: () => AuthViews.bind('forgot') },
  verify:       { auth: false, view: () => AuthViews.verify(),     bind: () => AuthViews.bind('verify') },
  reset:        { auth: false, view: () => AuthViews.reset(),      bind: () => AuthViews.bind('reset') },

  dashboard:          { title: 'Dashboard', sub: 'Your security command center', view: () => DashboardView.render() },
  'link-scanner':     { title: 'Link Scanner', sub: 'AI-powered URL threat analysis', view: () => Scanners.link(), bind: () => Scanners.bindLink() },
  'email-scanner':    { title: 'Email Scanner', sub: 'Phishing & spoofing detection', view: () => Scanners.email(), bind: () => Scanners.bindEmail() },
  'sms-scanner':      { title: 'SMS Scanner', sub: 'Scam pattern detection', view: () => Scanners.sms(), bind: () => Scanners.bindSms() },
  'qr-scanner':       { title: 'QR Scanner', sub: 'Decode & verify before you visit', view: () => Scanners.qr(), bind: () => Scanners.bindQr() },
  'file-scanner':     { title: 'File Scanner', sub: 'Static malware analysis', view: () => Scanners.file(), bind: () => Scanners.bindFile() },
  'password-checker': { title: 'Password Checker', sub: 'Strength, entropy & crack time', view: () => Scanners.password(), bind: () => Scanners.bindPassword() },
  'breach-monitor':   { title: 'Breach Monitor', sub: 'Know when your data leaks', view: () => Scanners.breach(), bind: () => Scanners.bindBreach() },
  'threat-intel':     { title: 'Threat Intelligence', sub: 'Live threat landscape — Nigeria', view: () => IntelViews.intel(), bind: () => IntelViews.bindIntel() },
  reports:            { title: 'Reports', sub: 'Executive-ready security reporting', view: () => IntelViews.reports(), bind: () => IntelViews.bindReports() },
  training:           { title: 'Training', sub: 'Level up your security skills', view: () => IntelViews.training(), bind: () => IntelViews.bindTraining() },
  assistant:          { title: 'AI Security Assistant', sub: 'Ask anything about staying safe', view: () => AssistantView.render(), bind: () => AssistantView.bind() },
  notifications:      { title: 'Notifications', sub: 'Alerts & activity', view: () => MiscViews.notifications(), bind: () => MiscViews.bindNotifications() },
  settings:           { title: 'Settings', sub: 'Make Sentinel yours', view: () => MiscViews.settings(), bind: () => MiscViews.bindSettings() },
  profile:            { title: 'Profile', sub: 'Your account', view: () => MiscViews.profile(), bind: () => MiscViews.bindProfile() },
  more:               { title: 'More', sub: 'Everything else, one tap away', view: () => MiscViews.more() },
};

const NAV = [
  { group: 'Overview' },
  { route: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { group: 'Scanners' },
  { route: 'link-scanner', label: 'Link Scanner', icon: 'link' },
  { route: 'email-scanner', label: 'Email Scanner', icon: 'mail' },
  { route: 'sms-scanner', label: 'SMS Scanner', icon: 'sms' },
  { route: 'qr-scanner', label: 'QR Scanner', icon: 'qr' },
  { route: 'file-scanner', label: 'File Scanner', icon: 'file' },
  { group: 'Protection' },
  { route: 'password-checker', label: 'Password Checker', icon: 'key' },
  { route: 'breach-monitor', label: 'Breach Monitor', icon: 'eye' },
  { route: 'threat-intel', label: 'Threat Intelligence', icon: 'radar' },
  { group: 'Insights' },
  { route: 'reports', label: 'Reports', icon: 'report' },
  { route: 'training', label: 'Training', icon: 'grad' },
  { route: 'assistant', label: 'AI Assistant', icon: 'bot' },
  { group: 'Account' },
  { route: 'notifications', label: 'Notifications', icon: 'bell', badge: true },
  { route: 'settings', label: 'Settings', icon: 'settings' },
  { route: 'profile', label: 'Profile', icon: 'user' },
];

const BOTTOM_NAV = [
  { route: 'dashboard', label: 'Home', icon: 'dashboard' },
  { sheet: true, label: 'Scan', icon: 'scan' },
  { center: true },                                   // center: AI assistant
  { route: 'threat-intel', label: 'Threats', icon: 'radar' },
  { route: 'more', label: 'More', icon: 'more' },
];

const App = {
  currentRoute: 'dashboard',

  route() {
    const hash = (location.hash || '#/dashboard').replace(/^#\//, '').split('?')[0];
    return ROUTES[hash] ? hash : 'dashboard';
  },

  setSession(user, token) {
    State.user = user;
    localStorage.setItem('sentinel_user', JSON.stringify(user));
    localStorage.setItem('sentinel_token', token);
  },
  logout() {
    State.user = null;
    localStorage.removeItem('sentinel_user');
    localStorage.removeItem('sentinel_token');
    toast('Signed out. Stay safe out there. 🛡️', 'info');
    location.hash = '#/login';
  },
  saveSettings() { localStorage.setItem('sentinel_settings', JSON.stringify(State.settings)); },
  applyTheme() { document.documentElement.dataset.theme = State.settings.theme === 'light' ? 'light' : 'dark'; },

  /* ---------- shell ---------- */
  renderChrome() {
    const r = App.currentRoute;
    const u = State.user || { name: 'Guest User', plan: 'Free' };
    const initials = u.name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="shell">
        <div class="scrim" id="scrim"></div>
        <aside class="sidebar" id="sidebar">
          <div class="sidebar-head">${logoSVG(36)}<span class="brand">SENTINEL <em>AI</em></span></div>
          <nav class="sidebar-nav">
            ${NAV.map(n => n.group
              ? `<div class="nav-group">${n.group}</div>`
              : `<a class="nav-item ${n.route === r ? 'active' : ''}" href="#/${n.route}">${Icons[n.icon]}<span>${n.label}</span>${n.badge && State.unread ? `<span class="nav-badge">${State.unread}</span>` : ''}</a>`).join('')}
          </nav>
          <div class="sidebar-foot">
            <div class="side-user" onclick="location.hash='#/profile'">
              <div class="avatar">${initials}</div>
              <div style="flex:1;min-width:0"><div class="side-user-name">${esc(u.name)}</div><div class="side-user-plan">${esc(u.plan || 'Free')} Plan</div></div>
              <button class="icon-btn" style="width:34px;height:34px" title="Sign out" onclick="event.stopPropagation();App.logout()">${Icons.logout}</button>
            </div>
          </div>
        </aside>

        <main class="main">
          <div class="topbar">
            <button class="icon-btn burger" id="burger">${Icons.menu}</button>
            <div class="page-title">${ROUTES[r].title || ''}<div class="page-sub">${ROUTES[r].sub || ''}</div></div>
            <button class="icon-btn" title="Notifications" onclick="location.hash='#/notifications'">${Icons.bell}${State.unread ? '<span class="dot"></span>' : ''}</button>
            <button class="icon-btn" title="Toggle theme" id="theme-quick">${State.settings.theme === 'light' ? Icons.moon : Icons.sun}</button>
          </div>
          <div id="page"></div>
        </main>

        <nav class="bottom-nav"><div class="bn-row">
          ${BOTTOM_NAV.map(n => {
            if (n.center) return `<button class="bn-scan" id="bn-ai" title="AI Assistant">${Icons.bot}</button>`;
            if (n.sheet) return `<button class="bn-item" id="bn-scan-sheet">${Icons[n.icon]}<span>${n.label}</span></button>`;
            return `<a class="bn-item ${n.route === r ? 'active' : ''}" href="#/${n.route}">${Icons[n.icon]}<span>${n.label}</span>${n.badge && State.unread ? '<span class="dot"></span>' : ''}</a>`;
          }).join('')}
        </div></nav>

        <div class="sheet" id="scan-sheet">
          <div class="sheet-grab"></div>
          <h3>⚡ Quick Scan</h3>
          <div class="quick-grid">
            ${[['#/link-scanner', 'link', 'Link'], ['#/email-scanner', 'mail', 'Email'], ['#/sms-scanner', 'sms', 'SMS'], ['#/qr-scanner', 'qr', 'QR'],
               ['#/file-scanner', 'file', 'File'], ['#/password-checker', 'key', 'Password'], ['#/breach-monitor', 'eye', 'Breach'], ['#/assistant', 'bot', 'Ask AI']].map(([h, ic, l]) =>
              `<a class="quick-btn" href="${h}"><div class="qi" style="background:var(--green-dim);color:var(--green)">${Icons[ic]}</div><span>${l}</span></a>`).join('')}
          </div>
        </div>
      </div>`;

    /* chrome bindings */
    const sidebar = document.getElementById('sidebar');
    const scrim = document.getElementById('scrim');
    const sheet = document.getElementById('scan-sheet');
    const closeAll = () => { sidebar.classList.remove('open'); sheet.classList.remove('show'); scrim.classList.remove('show'); };
    document.getElementById('burger').addEventListener('click', () => { sidebar.classList.add('open'); scrim.classList.add('show'); });
    scrim.addEventListener('click', closeAll);
    document.getElementById('bn-scan-sheet').addEventListener('click', () => { sheet.classList.add('show'); scrim.classList.add('show'); });
    document.getElementById('bn-ai').addEventListener('click', () => { location.hash = '#/assistant'; });
    sheet.addEventListener('click', e => { if (e.target.closest('a')) closeAll(); });
    sidebar.addEventListener('click', e => { if (e.target.closest('a')) closeAll(); });
    document.getElementById('theme-quick').addEventListener('click', () => {
      State.settings.theme = State.settings.theme === 'light' ? 'dark' : 'light';
      App.saveSettings(); App.applyTheme(); App.renderChrome(); App.renderPage();
    });
  },

  refreshBadges() {
    document.querySelectorAll('.nav-badge, .icon-btn .dot, .bn-item .dot').forEach(el => { if (!State.unread) el.remove(); });
  },

  renderPage() {
    const r = App.currentRoute;
    const page = document.getElementById('page');
    page.innerHTML = ROUTES[r].view();
    window.scrollTo({ top: 0 });
    ROUTES[r].bind && ROUTES[r].bind();
  },

  render() {
    const r = App.route();
    App.currentRoute = r;
    const def = ROUTES[r];
    const isAuthPage = def.auth === false;

    if (!isAuthPage && !State.user) { location.hash = '#/login'; return; }
    if (isAuthPage && State.user && (r === 'login' || r === 'register')) { location.hash = '#/dashboard'; return; }

    const app = document.getElementById('app');
    if (isAuthPage) {
      app.innerHTML = def.view();
      def.bind && def.bind();
    } else {
      App.renderChrome();
      App.renderPage();
    }
  },

  init() {
    App.applyTheme();
    Charts.initTooltips();
    document.getElementById('splash-logo').innerHTML = logoSVG(84);
    window.addEventListener('hashchange', () => App.render());

    setTimeout(() => {
      document.getElementById('splash').classList.add('hide');
      document.getElementById('app').hidden = false;
      if (!location.hash) location.hash = State.user ? '#/dashboard' : '#/login';
      App.render();
    }, 1400);
  },
};

App.init();
